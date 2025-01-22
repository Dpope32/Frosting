// src/utils/WifiCard.tsx
import { Stack, Text } from 'tamagui';
import React, { useEffect, useState } from 'react';
import * as Network from 'expo-network';

export function WifiCard() {
  const [connectionType, setConnectionType] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        setConnectionType(networkState.type?.toString() ?? '');
        
        // Ping test
        const connected = networkState.isConnected;
        setIsConnected(connected ?? false);
      } catch (error) {
        console.error('Network error:', error);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const getConnectionDisplay = () => {
    if (!isConnected) return 'Offline';
    if (connectionType === Network.NetworkStateType.CELLULAR) return 'Cell';
    if (connectionType === Network.NetworkStateType.WIFI) return 'WiFi';
    return '...';
  };

  return (
    <Stack
      backgroundColor="rgba(0, 0, 0, 0.3)"
      borderRadius={8}
      padding="$2"
      borderWidth={1}
      borderColor="rgba(255, 255, 255, 0.5)"
      minWidth={70}
      alignItems="center"
      justifyContent="center"
    >
      <Text
        color="#2196F3"
        fontSize={11}
        opacity={0.9}
        marginBottom="$0.5"
      >
        Network
      </Text>
      <Text
        color="white"
        fontSize={14}
        fontWeight="bold"
      >
        {getConnectionDisplay()}
      </Text>
    </Stack>
  );
}