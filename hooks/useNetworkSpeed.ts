import { useState, useEffect, useRef } from 'react';
import { useNetworkStore } from '@/store/NetworkStore';
import { getWifiDetails } from '@/services';

const CHECK_INTERVAL = 1000 * 60; 
const CONNECTION_TEST_TIMEOUT = 5000; 

export function useNetworkSpeed() {
  const { details, isLoading, fetchNetworkInfo, startNetworkListener } = useNetworkStore();
  const [networkState, setNetworkState] = useState({speed: null as string | null, isPingLoading: false});
  const lastCheckRef = useRef<number>(0);
  const retryCountRef = useRef(0);
  const wifiDetails = getWifiDetails(details);
  const isConnected = details?.isConnected ?? false;
  const isWifi = details?.type === 'wifi';

  const measureNetworkSpeed = async (): Promise<number> => {
    const testFileUrl = 'https://www.cloudflare.com/cdn-cgi/trace';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TEST_TIMEOUT);
    try {
      const startTime = Date.now();
      const response = await fetch(testFileUrl, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.text();
      clearTimeout(timeoutId);
      const endTime = Date.now();
      const duration = endTime - startTime;
      if (duration < 10 && data.length < 1000) {
        return duration;
      }
    
      return duration;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  const checkConnection = async (isMounted: boolean) => {
    if (!isMounted) return;
    if (!isConnected) {
      if (isMounted) {
        setNetworkState(prev => ({ ...prev, speed: 'Offline', isPingLoading: false }));
      }
      return;
    }
    const now = Date.now();
    if (now - lastCheckRef.current < CHECK_INTERVAL && networkState.speed !== null && networkState.speed !== 'Offline') {
      return; 
    }
    if (isMounted) {
      setNetworkState(prev => ({ ...prev, isPingLoading: true }));
    } else {
      return; 
    }
    try {
      const measuredDuration = await measureNetworkSpeed();
      const speedDisplay = `${measuredDuration} ms`;
      if (isMounted) {
        setNetworkState({
          speed: speedDisplay,
          isPingLoading: false
        });
        lastCheckRef.current = now;
        retryCountRef.current = 0; 
      }
    } catch (error) {
      const fallbackDisplay = 'N/A'; 
      if (isMounted) {
        setNetworkState({
          speed: fallbackDisplay, 
          isPingLoading: false
        });
        lastCheckRef.current = now; 
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    let checkTimer: NodeJS.Timeout | null = null;
    const initializeAndCheck = async () => {await fetchNetworkInfo()};
    initializeAndCheck();
    checkTimer = setInterval(() => {
      if (isMounted && isConnected) { 
        checkConnection(isMounted);
      } else if (isMounted && !isConnected) {
         setNetworkState(prev => ({ ...prev, speed: 'Offline', isPingLoading: false }));
      }
    }, CHECK_INTERVAL);
    const unsubscribeNetwork = startNetworkListener();
    return () => {
      isMounted = false;
      if (checkTimer) clearInterval(checkTimer);
      unsubscribeNetwork();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isConnected && !isLoading) {
      checkConnection(isMounted);
    } else if (!isConnected && isMounted) {
       setNetworkState(prev => ({ ...prev, speed: 'Offline', isPingLoading: false }));
    }
    return () => {
      isMounted = false;
    };
  }, [isConnected, isLoading]);

  return {
    speed: networkState.speed,
    isLoading: isLoading || networkState.isPingLoading,
    isConnected,
    isWifi,
    wifiDetails
  };
}
