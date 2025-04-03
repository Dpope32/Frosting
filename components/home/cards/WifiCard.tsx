import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Stack, Spinner, isWeb } from 'tamagui';
import { useNetworkSpeed } from '@/hooks/useNetworkSpeed';

export function WifiCard() {
  const { speed, isLoading, isConnected  } = useNetworkSpeed();
  console.log('useNetworkSpeed values:', { speed, isLoading, isConnected });
  const [displaySpeed, setDisplaySpeed] = useState<string | null>(null);
  const [signalStrength, setSignalStrength] = useState<number>(0);

  useEffect(() => {
    console.log('useEffect triggered with speed:', speed, 'isLoading:', isLoading);
    if (speed) {
      console.log('Setting speed from network:', speed);
      setDisplaySpeed(speed);
      setSignalStrength(calculateSignalStrength(speed));
    } else if (!isLoading && !displaySpeed) {
      const defaultSpeed = __DEV__ ? '89 ms' : (Platform.OS === 'web' ? '80 ms' : '75 ms');
      console.log('Using default speed:', defaultSpeed);
      setDisplaySpeed(defaultSpeed);
      setSignalStrength(calculateSignalStrength(defaultSpeed));
    }
  }, [speed, isLoading]);

  const calculateSignalStrength = (speedValue: string): number => {
    console.log('Calculating signal strength for:', speedValue);
    if (!isConnected) {
      console.log('Not connected - returning 0');
      return 0;
    }
    if (!speedValue) {
      console.log('No speed value - returning 0');
      return 0;
    }

    // Handle Mbps format (e.g. "100 Mbps")
    if (speedValue.includes('Mbps')) {
      const mbpsMatch = speedValue.match(/(\d+)\s*Mbps/i);
      const speed = mbpsMatch ? parseInt(mbpsMatch[1]) : 0;
      console.log('Mbps speed detected:', speed);
      
      if (speed >= 500) return 4;
      if (speed >= 100) return 3;
      if (speed >= 50) return 2;
      if (speed >= 10) return 1;
      return 0;
    }

    // Handle ping format (e.g. "50 ms")
    const pingMatch = speedValue.match(/(\d+)\s*ms/);
    if (pingMatch) {
      const ping = parseInt(pingMatch[1]);
      console.log('Ping detected:', ping);
      if (ping < 20) return 4;
      if (ping < 50) return 3;
      if (ping < 100) return 2;
      if (ping < 200) return 1;
      return 0;
    }

    // Handle raw number format (e.g. "100")
    const rawNumberMatch = speedValue.match(/^\d+$/);
    if (rawNumberMatch) {
      const speed = parseInt(rawNumberMatch[0]);
      console.log('Raw number speed detected:', speed);
      if (speed >= 500) return 4;
      if (speed >= 100) return 3;
      if (speed >= 50) return 2;
      if (speed >= 10) return 1;
      return 0;
    }

    console.log('Unknown speed format - returning 0');
    return 0;
  };

  const getActiveBarColor = (): string => {
    if (!isConnected) return 'rgba(255, 255, 255, 0.2)';
    
    switch (signalStrength) {
      case 1: return '#f97316';   // Orange
      case 2: return '#eab308';   // Yellow
      case 3: return '#22c55e';   // Green
      case 4: return '#15803d';   // Dark green
      default: return 'rgba(255, 255, 255, 0.2)';
    }
  };

  return (
      <Stack
        backgroundColor="rgba(0, 0, 0, 0.3)"
        br={12}
        padding="$2.5"
        borderWidth={1}
        borderColor="rgba(255, 255, 255, 0.1)"
        minWidth={80}
        alignItems="center"
        justifyContent="center"
        style={Platform.OS === 'web' ? { cursor: 'pointer' } : undefined}
      >
      {isLoading && !displaySpeed ? (
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
