// src/components/TemperatureCard.tsx
import { Stack, Text, Spinner, isWeb } from 'tamagui';
import React, { useEffect, useRef } from 'react';
import { useUserStore } from '@/store/UserStore';
import { useWeatherQuery, useWeatherStore } from '@/store/WeatherStore';
import { getValueColor } from '@/constants/valueHelper';
import { Pressable } from 'react-native';

const ONE_HOUR = 1000 * 60 * 60;

interface TemperatureCardProps {
  onPress?: () => void;
}

export function TemperatureCard({ onPress }: TemperatureCardProps) {
  const zipCode = useUserStore(s => s.preferences.zipCode);
  const lastFetchRef = useRef<number | null>(null);
  const { isLoading, refetch } = useWeatherQuery(zipCode);
  const currentTemp = useWeatherStore(s => s.currentTemp);
  const valueColor = currentTemp !== null ? getValueColor('temperature', currentTemp, '') : 'white';
  
  useEffect(() => {
    const now = Date.now();
    if (zipCode && (!lastFetchRef.current || now - lastFetchRef.current >= ONE_HOUR)) {
      lastFetchRef.current = now;
      refetch();
    }
  }, [zipCode, refetch]);
  
  // Log received prop immediately
  console.log("--- TemperatureCard: Received props ---", {
      onPress: typeof onPress, // Log type
      _onPressValue: onPress // Log value
  });

    const handlePress = () => {
    console.log("--- TemperatureCard: handlePress triggered ---");
    if (onPress) {
      onPress();
    } else {
      console.log("--- TemperatureCard: onPress is MISSING inside handlePress! ---");
    }
  };

  return (
    <Stack
      onPress={handlePress}
      backgroundColor="rgba(0, 0, 0, 0.3)"
      br={12}
      padding="$3"
      borderWidth={1}
      borderColor="rgba(255, 255, 255, 0.1)"
      minWidth={70}
      height={isWeb ? 60 : 50} 
      alignItems="center"
      justifyContent="center"
      hoverStyle={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      pressStyle={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      cursor="pointer"
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
