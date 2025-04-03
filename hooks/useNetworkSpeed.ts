import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useNetworkStore } from '@/store/NetworkStore';
import { getWifiDetails } from '@/services/wifiServices';

const RETRY_DELAY = 3000; // 3 seconds
const CHECK_INTERVAL = 1000 * 60; // 1 minute
const MAX_RETRIES = 2;
const CONNECTION_TEST_TIMEOUT = 5000; // 5 seconds

export function useNetworkSpeed() {
  const { details, isLoading, fetchNetworkInfo, startNetworkListener } = useNetworkStore();
  const [networkState, setNetworkState] = useState({ 
    speed: null as string | null, 
    isPingLoading: false 
  });
  const lastCheckRef = useRef<number>(0);
  const retryCountRef = useRef(0);
  const wifiDetails = getWifiDetails(details);
  const isConnected = details?.isConnected ?? false;
  const isWifi = details?.type === 'wifi';

  const measureNetworkSpeed = async (): Promise<number> => {
    console.log('Measuring network speed...');
    // Use a small file to test download speed
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
      
      // If data is very small and download was too quick, return approximate ping
      if (duration < 10 && data.length < 1000) {
        return duration;
      }
      
      // Return actual ping time (duration)
      return duration;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  const checkConnection = async (isMounted: boolean) => {
    console.log('Checking connection...', { isConnected, isWifi });

    if (!isMounted) return; // Prevent state updates on unmounted component

    if (!isConnected) {
      console.log('Not connected - setting offline state');
      // Check if component is still mounted before setting state
      if (isMounted) {
        setNetworkState(prev => ({ ...prev, speed: 'Offline', isPingLoading: false }));
      }
      return;
    }

    const now = Date.now();
    // Avoid checking too frequently only if we have a non-offline speed
    if (now - lastCheckRef.current < CHECK_INTERVAL && networkState.speed !== null && networkState.speed !== 'Offline') {
      console.log('Skipping check, checked recently.');
      return; 
    }

    console.log('Proceeding with network speed check.');
    // Check if component is still mounted before setting state
    if (isMounted) {
      setNetworkState(prev => ({ ...prev, isPingLoading: true }));
    } else {
      return; // Don't proceed if unmounted
    }
    
    try {
      // Actually measure the speed
      const measuredDuration = await measureNetworkSpeed();
      const speedDisplay = `${measuredDuration} ms`;
      
      console.log('Measured network speed:', speedDisplay);
      // Check if component is still mounted before setting state
      if (isMounted) {
        setNetworkState({
          speed: speedDisplay,
          isPingLoading: false
        });
        lastCheckRef.current = now;
        retryCountRef.current = 0; // Reset retries on success
      }
    } catch (error) {
      console.error('Error measuring network speed:', error);
      // Fallback or error indication
      const fallbackDisplay = 'N/A'; 
      // Check if component is still mounted before setting state
      if (isMounted) {
        setNetworkState({
          speed: fallbackDisplay, 
          isPingLoading: false
        });
        // Optionally implement retry logic here if needed, using retryCountRef
        lastCheckRef.current = now; // Update last check time even on error to prevent rapid retries
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    let checkTimer: NodeJS.Timeout | null = null;

    const initializeAndCheck = async () => {
      await fetchNetworkInfo(); 
    };

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
