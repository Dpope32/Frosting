import React, { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import { Stack, Text, YStack, Spinner } from 'tamagui';
import { WifiModal } from '@/components/cardModals/WifiModal';
import { getValueColor } from '@/constants/valueHelper';
import { useNetworkStore } from '@/store/NetworkStore';
import { getWifiDetails } from '@/services/wifiServices';
import ProxyServerManager from './ProxyServerManager';

const RETRY_DELAY = 5000; // 5 seconds
const CHECK_INTERVAL = 1000 * 60 * 5; // 5 minutes
const MAX_RETRIES = 3;

export function WifiCard() {
  const { details, isLoading, fetchNetworkInfo, startNetworkListener } = useNetworkStore();
  const [networkState, setNetworkState] = useState({ ping: null as number | null, isPingLoading: false });
  const [modalOpen, setModalOpen] = useState(false);
  const lastCheckRef = useRef<number>(0);
  const retryCountRef = useRef(0);
  const wifiDetails = getWifiDetails(details);
  const isConnected = details?.isConnected ?? false;
  const isWifi = details?.type === 'wifi';

  const checkConnection = async (isMounted: boolean) => {
    if (!isMounted || !isConnected) {
      console.log('[WifiCard] Not connected or component unmounted');
      setNetworkState(prev => ({ ...prev, ping: null }));
      return;
    }

    const now = Date.now();
    if (now - lastCheckRef.current < CHECK_INTERVAL && networkState.ping !== null) {
      console.log('[WifiCard] Using cached ping value:', networkState.ping);
      return; // Skip if checked recently and we have a value
    }

    setNetworkState(prev => ({ ...prev, isPingLoading: true }));
    
    try {
      // For web, use our proxy server's ping endpoint
      if (Platform.OS === 'web') {
        try {
          // Check if proxy server is running
          const isProxyRunning = await ProxyServerManager.isRunning();
          
          if (isProxyRunning) {
            const startTime = Date.now();
            const response = await fetch('http://localhost:3000/api/ping');
            const endTime = Date.now();
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const pingTime = endTime - startTime;
           // console.log('[WifiCard] Web ping successful:', pingTime, 'ms');
            
            if (isMounted) {
              setNetworkState({
                ping: pingTime,
                isPingLoading: false
              });
              lastCheckRef.current = now;
              retryCountRef.current = 0;
            }
          } else {
            // If proxy server isn't running, use mock data
            console.log('[WifiCard] Proxy server not running, using mock data');
            if (isMounted) {
              const mockPing = Math.floor(Math.random() * (200 - 20 + 1) + 20);
              setNetworkState({
                ping: mockPing,
                isPingLoading: false
              });
              lastCheckRef.current = now;
              retryCountRef.current = 0;
            }
          }
          return;
        } catch (error) {
          console.error('[WifiCard] Web ping error:', error);
          throw error; 
        }
      }
      
      // In development, return mock data
      if (__DEV__) {
        console.log('[WifiCard] Using mock data for development');
        await new Promise(resolve => setTimeout(resolve, 500));
        if (isMounted) {
          const mockPing = Math.floor(Math.random() * (200 - 20 + 1) + 100);
          console.log('[WifiCard] Mock ping value:', mockPing);
          setNetworkState({
            ping: mockPing,
            isPingLoading: false
          });
          lastCheckRef.current = now;
          retryCountRef.current = 0;
        }
        return;
      }

      // Production network check for native platforms
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const startTime = Date.now();
        await fetch('https://8.8.8.8', { 
          mode: 'no-cors',
          cache: 'no-cache',
          signal: controller.signal
        });
        const endTime = Date.now();
        clearTimeout(timeoutId);
        
        const pingTime = endTime - startTime;
        console.log('[WifiCard] Ping successful:', pingTime, 'ms');
        
        if (isMounted) {
          setNetworkState({
            ping: pingTime,
            isPingLoading: false
          });
          lastCheckRef.current = now;
          retryCountRef.current = 0;
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('[WifiCard] Ping error:', error);
        throw error; // Re-throw for retry logic
      }
    } catch (error) {
      console.error('[WifiCard] Error checking connection:', error);
      if (isMounted) {
        // Retry logic
        if (retryCountRef.current < MAX_RETRIES) {
          console.log(`[WifiCard] Retrying (${retryCountRef.current + 1}/${MAX_RETRIES}) in ${RETRY_DELAY}ms`);
          retryCountRef.current++;
          setTimeout(() => checkConnection(isMounted), RETRY_DELAY);
        } else {
          console.log('[WifiCard] Max retries reached, giving up');
          setNetworkState({
            ping: null,
            isPingLoading: false
          });
          retryCountRef.current = 0;
        }
      }
    }
  };

  // Effect to handle network state changes
  useEffect(() => {
    let isMounted = true;
    
    // Initial network info fetch
    fetchNetworkInfo();
    
    // Only check if connected and no recent check
    if (isConnected && !isLoading) {
      checkConnection(isMounted);
    }

    const unsubscribeNetwork = startNetworkListener();

    return () => {
      isMounted = false;
      unsubscribeNetwork();
    };
  }, [isConnected]); // Only re-run when connection status changes

  const getSpeedDisplay = () => {
    if (isLoading || networkState.isPingLoading) return '...';
    if (!isConnected) return 'Offline';
    
    // For web, provide a fallback value instead of showing "..."
    if (Platform.OS === 'web' && !networkState.ping) {
      return '45 ms'; // Fallback value for web
    }
    
    if (isWifi) {
      if (!wifiDetails?.linkSpeed || Platform.OS === 'ios') {
        return networkState.ping ? `${networkState.ping} ms` : '...';
      }
      return `${wifiDetails.linkSpeed} Mbps`;
    }
    
    return networkState.ping ? `${networkState.ping} ms` : '...';
  };

  const getSpeedColor = () => {
    if (!isConnected) return 'white';
    if (isWifi) {
      if (!wifiDetails?.linkSpeed || Platform.OS === 'ios') {
        return networkState.ping ? getValueColor('wifi', networkState.ping, '') : 'white';
      }
      if (wifiDetails.linkSpeed >= 1000) return '#2E7D32';
      if (wifiDetails.linkSpeed >= 300) return '#4CAF50';
      if (wifiDetails.linkSpeed >= 100) return '#FFEB3B';
      return '#FF9800';
    }
    if (!networkState.ping) return 'white';
    return getValueColor('wifi', networkState.ping, '');
  };

  return (
    <>
      <Stack
        backgroundColor="rgba(0, 0, 0, 0.3)"
        borderRadius={12}
        padding="$3"
        borderWidth={1}
        borderColor="rgba(255, 255, 255, 0.1)"
        minWidth={90}
        alignItems="center"
        justifyContent="center"
        pressStyle={{ opacity: 0.8 }}
        onPress={() => setModalOpen(true)}
        style={Platform.OS === 'web' ? { cursor: 'pointer' } : undefined}
      >
        {isLoading || networkState.isPingLoading ? (
          <Spinner size="small" color={getSpeedColor()} />
        ) : (
          <Text
            color={getSpeedColor()}
            fontSize={18}
            fontWeight="bold"
            fontFamily="$body"
          >
            {getSpeedDisplay()}
          </Text>
        )}
      </Stack>
      <WifiModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        speed={getSpeedDisplay()} 
      />
    </>
  );
}
