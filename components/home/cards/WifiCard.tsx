import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Stack, Spinner, isWeb } from 'tamagui';
import { useNetworkSpeed } from '@/hooks/useNetworkSpeed';

export function WifiCard() {
  const { speed, isLoading, isConnected  } = useNetworkSpeed();
  const [signalStrength, setSignalStrength] = useState<number>(0);

  useEffect(() => {
    setSignalStrength(calculateSignalStrength(speed)); 
  }, [speed, isConnected, isLoading]);

  const calculateSignalStrength = (speedValue: string | null): number => {
    if (!isConnected) {
      return 0;
    }

    if (!speedValue || speedValue === 'Offline' || speedValue === 'N/A') {
      return 1; 
    }

    // Handle Mbps format (e.g. "100 Mbps") - This case is unlikely with the current hook implementation
    if (speedValue.includes('Mbps')) {
      const mbpsMatch = speedValue.match(/(\d+)\s*Mbps/i); // Keep only one declaration
      const speedNum = mbpsMatch ? parseInt(mbpsMatch[1]) : 0;
      
      if (speedNum >= 500) return 4;
      if (speedNum >= 100) return 3;
      if (speedNum >= 50) return 2;
      if (speedNum >= 10) return 1;
      return 1; // Return 1 if connected but speed is very low Mbps
    }

    // Handle ping format (e.g. "50 ms")
    const pingMatch = speedValue.match(/(\d+)\s*ms/);
    if (pingMatch) {
      const ping = parseInt(pingMatch[1]);
      if (ping < 50) return 4;  // 4 bars for < 50ms
      if (ping < 150) return 3; // 3 bars for 50ms to 149ms
      if (ping < 300) return 2; // 2 bars for 150ms to 299ms
      return 1;                 // 1 bar for >= 300ms
    }


    const rawNumberMatch = speedValue.match(/^\d+$/);
    if (rawNumberMatch) {
      const speedNum = parseInt(rawNumberMatch[0]);
      if (speedNum >= 500) return 4;
      if (speedNum >= 100) return 3;
      if (speedNum >= 50) return 2;
      if (speedNum >= 10) return 1;
      return 1; 
    }

    return 3;
  };

  const getActiveBarColor = (): string => {
    switch (signalStrength) {
      case 1: return '#f97316'; // Orange (Weak but connected)
      case 2: return '#eab308'; // Yellow (Okay)
      case 3: return '#22c55e'; // Green (Good)
      case 4: return '#15803d'; // Dark green (Excellent)
      default: return 'rgba(0, 224, 15, 0.2)'; // Grey (Disconnected or error state before calculation)
    }
  };

  return (
    <Stack
      backgroundColor="rgba(0, 0, 0, 0.3)"
      br={12}
      padding="$3" 
      borderWidth={1}
      borderColor="rgba(255, 255, 255, 0.1)"
      minWidth={70}
      height={isWeb ? 60 : 40}   
      alignItems="center"
      justifyContent="center"
      style={Platform.OS === 'web' ? { cursor: 'pointer' } : undefined}
    >
      {isLoading ? (
        <Spinner size="small" color="white" />
      ) : (
        <Stack flexDirection="row" alignItems="flex-end" height={20} gap="$1">
          {[1, 2, 3, 4].map((barLevel) => (
            <Stack
              key={barLevel}
              width={6}
              height={5 + (barLevel - 1) * 5}
              backgroundColor={barLevel <= signalStrength ? getActiveBarColor() : 'rgba(255, 255, 255, 0.2)'}
              borderRadius={1}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
