import { Stack, Text } from 'tamagui';
import React, { useEffect } from 'react';
import { useUserStore } from '@/store/UserStore';
import { useWeatherQuery, useWeatherStore } from '@/store/WeatherStore';
import { getValueColor } from '@/constants/valueHelper';

export function TemperatureCard() {
 const zipCode = useUserStore(s => s.preferences.zipCode);
 console.log('[TemperatureCard] Rendering with ZIP:', zipCode);
 
 const { isLoading, refetch } = useWeatherQuery(zipCode);
 const currentTemp = useWeatherStore(s => s.currentTemp);
 
 useEffect(() => {
   console.log('[TemperatureCard] Component mounted or ZIP changed, forcing refetch');
   if (zipCode) {
     refetch();
   }
 }, [zipCode, refetch]);

 console.log('[TemperatureCard] Current state:', { isLoading, currentTemp, zipCode });

 const displayTemp = isLoading ? '...' : 
   currentTemp !== null ? `${currentTemp}°F` : 'N/A';

 const valueColor = currentTemp !== null ? 
   getValueColor('temperature', currentTemp, '') : 
   'white';

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
       color="white"
       fontSize={11}
       opacity={0.9}
       marginBottom="$0.5"
     >
       Temp
     </Text>
     <Text
       color={valueColor}
       fontSize={14}
       fontWeight="bold"
     >
       {displayTemp}
     </Text>
   </Stack>
 );
}