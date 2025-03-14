import React from 'react';
import { Platform } from 'react-native';
import { Stack, Text, isWeb, Spinner } from 'tamagui';
import { getValueColor } from '@/constants/valueHelper';
import { useNetworkSpeed } from '@/hooks/useNetworkSpeed';

export function WifiCard() {
  const { speed, isLoading, isConnected, isWifi, wifiDetails } = useNetworkSpeed();

  const getSpeedColor = () => {
    if (!isConnected) return 'white';
    
    if (isWifi && wifiDetails?.linkSpeed) {
      const speed = wifiDetails.linkSpeed;
      if (speed >= 1000) return '#2E7D32'; // Very fast
      if (speed >= 300) return '#15803d';  // Fast
      if (speed >= 100) return '#FFEB3B';  // Medium
      return '#FF9800';                    // Slow
    }
    
    // For ping-based speeds (including cellular)
    const pingMatch = speed?.match(/(\d+)\s*ms/);
    const ping = pingMatch ? parseInt(pingMatch[1]) : 45;
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
        minWidth={80}
        alignItems="center"
        justifyContent="center"
        style={Platform.OS === 'web' ? { cursor: 'pointer' } : undefined}
      >
        {isLoading ? (
          <Spinner size="small" color={getSpeedColor()} />
        ) : (
          <Text
            color={getSpeedColor()}
            fontSize={isWeb ? 18 : 16}
            fontWeight="bold"
            fontFamily="$body"
          >
            {speed || '93 ms'}
          </Text>
        )}
      </Stack>
    </>
  );
}
