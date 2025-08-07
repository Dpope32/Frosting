// src/components/TemperatureCard.tsx
import { Stack, Text, Spinner, isWeb } from 'tamagui';
import React, { useEffect, useRef, useCallback } from 'react';
import { useUserStore, useWeatherQuery, useWeatherStore } from '@/store';
import { getValueColor } from '@/constants';    
import { isIpad } from '@/utils';
import { Platform } from 'react-native';
import { debounce } from 'lodash';

const ONE_HOUR = 1000 * 60 * 60;

interface TemperatureCardProps {
  onPress?: () => void;
  isHome?: boolean;
  isDark?: boolean;
}

export function TemperatureCard({ onPress, isHome, isDark }: TemperatureCardProps) {
  const zipCode = useUserStore(s => s.preferences.zipCode);
  const lastFetchRef = useRef<number | null>(null);
  const { isLoading, refetch } = useWeatherQuery(zipCode);
  const currentTemp = useWeatherStore(s => s.currentTemp);
  const valueColor = currentTemp !== null ? getValueColor('temperature', currentTemp, '', isDark ?? false) : 'white';
  
  useEffect(() => {
    const now = Date.now();
    if (zipCode && (!lastFetchRef.current || now - lastFetchRef.current >= ONE_HOUR)) {
      lastFetchRef.current = now;
      refetch();
    }
  }, [zipCode, refetch]);

  const debouncedPress = useCallback(
    debounce(() => {
      if (onPress) {
        onPress();
      }
    }, 300, {
      leading: true,
      trailing: false
    }),
    [onPress]
  );

  const handlePress = () => {
    debouncedPress();
  };

  return (
    <Stack
      onPress={handlePress}
      backgroundColor={isHome ? 'transparent' : isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.3)"}
      br={isIpad() ? 18 : 12}
      padding="$3"
      borderWidth={isHome ? 0 : 1}
      borderColor={isHome ? 'transparent' : "rgba(255, 255, 255, 0.3)"}
      minWidth={isIpad() ? 70 : 65}
      height={isWeb ? 60 : isIpad() ? 60 : 48} 
      alignItems="center"
      justifyContent="center"
      {...(isWeb && {
        hoverStyle: { backgroundColor: "rgba(0, 0, 0, 0.4)" }
      })}
      pressStyle={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      style={Platform.OS === 'web' ? { cursor: 'pointer' } : undefined}
    >
      {isLoading ? (
        <Spinner
          color={valueColor}
          size="small"
        />
      ) : (
        <Text
          color={valueColor}
          fontSize={isWeb ? 20 : isIpad() ? 19 : 17}
          fontWeight="bold"
          fontFamily="$body"
        >
          {currentTemp !== null ? `${currentTemp}°` : 'N/A'}
        </Text>
      )}
    </Stack>
  );
}