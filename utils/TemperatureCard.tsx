// src/utils/TemperatureCard.tsx
import { Stack, Text } from 'tamagui';
import React from 'react';
import Constants from 'expo-constants';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/store/UserStore';

export function TemperatureCard() {
  const zipCode = useUserStore(s => s.preferences.zipCode);
  
  const { data, isLoading } = useQuery({
    queryKey: ['weather', zipCode],
    queryFn: async () => {
      const apiKey = Constants.expoConfig?.extra?.openWeatherApiKey?.[__DEV__ ? 'development' : 'production'];
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},us&appid=${apiKey}&units=imperial`
      );
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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
        color="#4CAF50"
        fontSize={11}
        opacity={0.9}
        marginBottom="$0.5"
      >
        Temp
      </Text>
      <Text
        color="white"
        fontSize={14}
        fontWeight="bold"
      >
        {isLoading ? '...' : `${Math.round(data?.main?.temp ?? 0)}°F`}
      </Text>
    </Stack>
  );
}
