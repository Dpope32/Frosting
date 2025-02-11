import { useEffect, useState } from 'react';
import { Stack, Text, YStack, Spinner } from 'tamagui';
import { WifiModal } from '@/components/cardModals/WifiModal';
import { getValueColor } from '@/constants/valueHelper';
import { useNetworkStore } from '@/store/NetworkStore';
import { getWifiDetails } from '@/services/wifiServices';

export function WifiCard() {
  const { details, isLoading, fetchNetworkInfo, startNetworkListener } = useNetworkStore();
  const [ping, setPing] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPingLoading, setIsPingLoading] = useState(false);
  const wifiDetails = getWifiDetails(details);
  const isConnected = details?.isConnected ?? false;
  const isWifi = details?.type === 'wifi';

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsPingLoading(true);
        const startTime = Date.now();
        if (isConnected) {
          const response = await fetch('https://8.8.8.8', { 
            mode: 'no-cors',
            cache: 'no-cache'
          });
          const endTime = Date.now();
          const latency = endTime - startTime;
          setPing(latency);
        }
      } catch (error) {
        console.error('Network error:', error);
        setPing(null);
      } finally {
        setIsPingLoading(false);
      }
    };

    fetchNetworkInfo();
    if (!isLoading) {
      checkConnection();
    }

    const unsubscribeNetwork = startNetworkListener();
    const interval = setInterval(() => {
      fetchNetworkInfo();
      checkConnection();
    }, 10000);

    return () => {
      clearInterval(interval);
      unsubscribeNetwork();
    };
  }, []);

  const getSpeedDisplay = () => {
    if (isLoading || isPingLoading) return '...';
    if (!isConnected) return 'Offline';
    if (isWifi) {
      if (!wifiDetails?.linkSpeed) return '...';
      return `${wifiDetails.linkSpeed} Mbps`;
    }
    if (!ping) return '...';
    return `${ping} ms`;
  };

  const getSpeedColor = () => {
    if (!isConnected) return 'white';
    if (isWifi) {
      if (!wifiDetails?.linkSpeed) return 'white';
      if (wifiDetails.linkSpeed >= 1000) return '#2E7D32';
      if (wifiDetails.linkSpeed >= 300) return '#4CAF50';
      if (wifiDetails.linkSpeed >= 100) return '#FFEB3B';
      return '#FF9800';
    }
    if (!ping) return 'white';
    return getValueColor('wifi', ping, '');
  };

  return (
    <>
      <Stack
        backgroundColor="rgba(0, 0, 0, 0.3)"
        borderRadius={12}
        padding="$3"
        borderWidth={1}
        borderColor="rgba(255, 255, 255, 0.1)"
        minWidth={100}
        alignItems="center"
        justifyContent="center"
        pressStyle={{ opacity: 0.8 }}
        onPress={() => setModalOpen(true)}
      >
      <YStack alignItems="center">
        {isLoading || isPingLoading ? (
          <Spinner size="small" color="$gray10" />
        ) : (
          <Text
            color={getSpeedColor()}
            fontSize={14}
            fontWeight="500"
            fontFamily="$body"
          >
            {getSpeedDisplay()}
          </Text>
        )}
      </YStack>
      </Stack>
      <WifiModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        speed={getSpeedDisplay()} 
      />
    </>
  );
}
