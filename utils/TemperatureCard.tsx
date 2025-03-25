// src/components/TemperatureCard.tsx
import { Stack, Text, Spinner, isWeb } from 'tamagui';
import React, { useEffect, useRef } from 'react';
import { useUserStore } from '@/store/UserStore';
import { useWeatherQuery, useWeatherStore } from '@/store/WeatherStore';
import { getValueColor } from '@/constants/valueHelper';

const ONE_HOUR = 1000 * 60 * 60;

export function TemperatureCard() {
  const zipCode = useUserStore(s => s.preferences.zipCode);
  const lastFetchRef = useRef<number | null>(null);
  const { isLoading, refetch } = useWeatherQuery(zipCode);
  const currentTemp = useWeatherStore(s => s.currentTemp);
  const valueColor = currentTemp !== null ?  getValueColor('temperature', currentTemp, '') :  'white';
  
  useEffect(() => {
    const now = Date.now();
    if (zipCode && (!lastFetchRef.current || now - lastFetchRef.current >= ONE_HOUR)) {
      lastFetchRef.current = now;
      refetch();
    }
  }, [zipCode, refetch]);
  
  
  return (
    <Stack
      backgroundColor="rgba(0, 0, 0, 0.3)"
      borderRadius={12}
      padding="$3"
      borderWidth={1}
      borderColor="rgba(255, 255, 255, 0.1)"
      minWidth={80}
      alignItems="center"
      justifyContent="center"
    >
      {isLoading ? (
        <Spinner
          color={valueColor}
          size="small"
        />
      ) : (
        <Text
          color={valueColor}
          fontSize={isWeb ? 18 : 16}
          fontWeight="bold"
          fontFamily="$body"
        >
          {currentTemp !== null ? `${currentTemp}°F` : 'N/A'}
        </Text>
      )}
    </Stack>
  );
}
