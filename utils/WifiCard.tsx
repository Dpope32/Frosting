import { useEffect, useState } from 'react';
import * as Network from 'expo-network';
import { StatusCard } from '@/components/status/StatusCard';
import { getValueColor } from '@/constants/valueHelper';

export function WifiCard() {
  const [connectionType, setConnectionType] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [ping, setPing] = useState<number | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        setConnectionType(networkState.type?.toString() ?? '');
        
        // Ping test to Google's DNS
        const startTime = Date.now();
        const connected = networkState.isConnected;
        setIsConnected(connected ?? false);
        if (connected) {
          const response = await fetch('https://8.8.8.8', { 
            mode: 'no-cors',
            cache: 'no-cache'
          });
          const endTime = Date.now();
          setPing(endTime - startTime);
        }
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
    if (ping === null) return '...';
    return `${ping}ms`;
  };

  const valueColor = ping !== null ? getValueColor('wifi', ping, '') : 'white';

  return (
    <StatusCard
      label={connectionType === Network.NetworkStateType.CELLULAR ? 'Cell' : 'WiFi'}
      value={getConnectionDisplay()}
      color="#2196F3"
      valueColor={valueColor}
    />
  );
}
