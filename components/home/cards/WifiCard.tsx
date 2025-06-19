import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Stack, Spinner, isWeb } from 'tamagui';
import { useNetworkSpeed } from '@/hooks/useNetworkSpeed';
import { getActiveBarColor } from '@/utils/styleUtils';
import { isIpad } from '@/utils';

interface WifiCardProps {
  isHome?: boolean;
  isDark?: boolean;
  onPress?: () => void;
}

export function WifiCard({ isHome, isDark, onPress }: WifiCardProps) {
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
      return 3; 
    }

    if (speedValue.includes('Mbps')) {
      const mbpsMatch = speedValue.match(/(\d+)\s*Mbps/i); 
      const speedNum = mbpsMatch ? parseInt(mbpsMatch[1]) : 0;
      
      if (speedNum >= 500) return 4;
      if (speedNum >= 100) return 3;
      if (speedNum >= 50) return 2;
      if (speedNum >= 10) return 1;
      return 3; 
    }

    const pingMatch = speedValue.match(/(\d+)\s*ms/);
    if (pingMatch) {
      const ping = parseInt(pingMatch[1]);
      if (ping < 50) return 4; 
      if (ping < 150) return 3; 
      if (ping < 300) return 2;
      return 1;                 
    }


    const rawNumberMatch = speedValue.match(/^\d+$/);
    if (rawNumberMatch) {
      const speedNum = parseInt(rawNumberMatch[0]);
      if (speedNum >= 500) return 4;
      if (speedNum >= 100) return 3;
      if (speedNum >= 50) return 2;
      if (speedNum >= 10) return 1;
      return 3; 
    }

    return 3;
  };

  return (
    <Stack
      onPress={onPress}
      backgroundColor={isHome ? 'transparent' : isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.3)"}
      br={isIpad() ? 18 : 12}
      padding="$2" 
      borderWidth={isHome ? 0 : 1}
      borderColor={isHome ? 'transparent' : "rgba(255, 255, 255, 0.3)"}
      minWidth={isIpad() ? 75 : 60}
      height={isWeb ? 60 : isIpad() ? 60 : 48}   
      alignItems="center"
      justifyContent="center"
      style={Platform.OS === 'web' ? { cursor: 'pointer' } : undefined}
      {...(isWeb && {
        hoverStyle: { 
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          transform: [{ scale: 1.02 }],
          shadowColor: "#dbd0c6",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        }
      })}
      pressStyle={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      {isLoading ? (
        <Spinner size="small" color="white" />
      ) : (
        <Stack flexDirection="row" alignItems="flex-end" justifyContent="center" height={isIpad() ? 24 : 20} gap="$0.5">
          {[1, 2, 3, 4].map((barLevel) => (
            <Stack
              key={barLevel}
              width={isIpad() ? 8 : 6}
              height={isIpad() ? 8 + (barLevel - 1) * 6 : 6 + (barLevel - 1) * 5} 
              backgroundColor={barLevel <= signalStrength ? getActiveBarColor(signalStrength) : 'rgba(255, 255, 255, 0.2)'}
              borderRadius={1}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}