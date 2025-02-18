import { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import { Stack, Text, YStack, Spinner } from 'tamagui';
import { WifiModal } from '@/components/cardModals/WifiModal';
import { getValueColor } from '@/constants/valueHelper';
import { useNetworkStore } from '@/store/NetworkStore';
import { getWifiDetails } from '@/services/wifiServices';

const RETRY_DELAY = 5000; // 5 seconds
const CHECK_INTERVAL = 1000 * 60 * 5; // 5 minutes
const MAX_RETRIES = 3;

export function WifiCard() {
  const { details, isLoading, fetchNetworkInfo, startNetworkListener } = useNetworkStore();
  const [networkState, setNetworkState] = useState({
    ping: null as number | null,
    isPingLoading: false,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const lastCheckRef = useRef<number>(0);
  const retryCountRef = useRef(0);
  
  // Derive these values, they don't need to be state since they're computed from props
  const wifiDetails = getWifiDetails(details);
  const isConnected = details?.isConnected ?? false;
  const isWifi = details?.type === 'wifi';

  const checkConnection = async (isMounted: boolean) => {
    if (!isMounted || !isConnected) {
      setNetworkState(prev => ({ ...prev, ping: null }));
      return;
    }

    const now = Date.now();
    if (now - lastCheckRef.current < CHECK_INTERVAL && networkState.ping !== null) {
      return; // Skip if checked recently and we have a value
    }

    setNetworkState(prev => ({ ...prev, isPingLoading: true }));
    
    try {
      // In development/simulator, return mock data
      if (__DEV__) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (isMounted) {
          setNetworkState({
            ping: Math.floor(Math.random() * (200 - 20 + 1) + 20),
            isPingLoading: false
          });
          lastCheckRef.current = now;
          retryCountRef.current = 0;
        }
        return;
      }

      // Production network check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const startTime = Date.now();
        const response = await fetch('https://8.8.8.8', { 
          mode: 'no-cors',
          cache: 'no-cache',
          signal: controller.signal
        });
        const endTime = Date.now();
        clearTimeout(timeoutId);
        
        if (isMounted) {
          setNetworkState({
            ping: endTime - startTime,
            isPingLoading: false
          });
          lastCheckRef.current = now;
          retryCountRef.current = 0;
        }
      } catch (error) {
        clearTimeout(timeoutId);
        throw error; // Re-throw for retry logic
      }
    } catch (error) {
      if (isMounted) {
        // Retry logic
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          setTimeout(() => checkConnection(isMounted), RETRY_DELAY);
        } else {
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
