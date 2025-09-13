import { useState, useEffect, useRef } from 'react';
import { useNetworkStore } from '@/store';
import { getWifiDetails } from '@/services';

const CHECK_INTERVAL = 1000 * 60; 
const CONNECTION_TEST_TIMEOUT = 10000; // Increased timeout for larger download 

export function useNetworkSpeed() {
  const { details, isLoading, fetchNetworkInfo, startNetworkListener } = useNetworkStore();
  const [networkState, setNetworkState] = useState({speed: null as string | null, isPingLoading: false});
  const lastCheckRef = useRef<number>(0);
  const retryCountRef = useRef(0);
  const wifiDetails = getWifiDetails(details);
  const isConnected = details?.isConnected ?? false;
  const isWifi = details?.type === 'wifi';

  const measureLatency = async (): Promise<number> => {
    const testFileUrl = 'https://www.cloudflare.com/cdn-cgi/trace';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
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

  const measureThroughput = async (): Promise<number> => {
    // Use a larger test file for throughput measurement
    const testFileUrl = 'https://speed.cloudflare.com/__down?bytes=10485760'; // 10MB test file
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
      
      // Get content length from headers or use known size
      const contentLength = response.headers.get('content-length');
      const fileSizeBytes = contentLength ? parseInt(contentLength, 10) : 10485760; // Default 10MB
      
      // Download the file
      const data = await response.arrayBuffer();
      clearTimeout(timeoutId);
      const endTime = Date.now();
      
      // Calculate throughput in Mbps
      const durationMs = endTime - startTime;
      const durationSeconds = durationMs / 1000;
      const fileSizeBits = fileSizeBytes * 8;
      const throughputMbps = (fileSizeBits / durationSeconds) / 1000000; // Convert to Mbps
      
      return throughputMbps;
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
      const measuredThroughput = await measureThroughput();
      const speedDisplay = `${Math.round(measuredThroughput)} Mbps`;
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
