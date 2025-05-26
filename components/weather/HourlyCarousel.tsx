import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, Text, isWeb } from 'tamagui';
import { useWeatherStore } from '@/store';
import { getWeatherIcon } from '@/components/weather/weatherUtils';
import { getTemperatureColor } from '@/services/weatherServices';
import { useColorScheme } from 'react-native';
import { isIpad } from '@/utils';

// Helper functions for sun/moon icon variation
const sunIcons = ['☀️', '🌤️', '🌞'];
const moonIcons = ['🌙', '🌚', '🌜'];
function getRandomIcon(arr: string[], seed: number): string {
  // Use hour as seed for deterministic variation
  return arr[seed % arr.length];
}

const HourlyCarousel: React.FC = () => {
  const hourly = useWeatherStore(s => s.hourlyForecast) || [];
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Include the period that started at the top of the current hour or later
  const now = new Date();
  const startOfHour = new Date(now);
  startOfHour.setMinutes(0, 0, 0);
  const upcoming = hourly
    .map(p => ({ ...p, date: new Date(p.startTime) }))
    .filter(p => p.date >= startOfHour)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const items = upcoming.slice(0, 23);

  // Render each hour
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={{ 
        flexGrow: 0, 
        paddingVertical: 10, 
        paddingBottom: 12,
        ...(isWeb ? { width: '100%' } : {})
      }} 
      contentContainerStyle={{ 
        paddingLeft: isWeb ? 0 : isIpad() ? 0 : 10, 
        paddingRight: isWeb ? 0 : isIpad() ? 0 : 10,
        ...(isWeb ? {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '100%'
        } : {})
      }}
    >
      {items.map(period => {
        const date = new Date(period.startTime);
        const hour = date.getHours();
        const label = `${hour % 12 || 12}${hour < 12 ? 'AM' : 'PM'}`;
        const isNightHour = hour >= 20 || hour < 4;
        let icon;
        if (isNightHour) {
          icon = getRandomIcon(moonIcons, hour);
        } else if (hour >= 6 && hour < 18) {
          icon = getRandomIcon(sunIcons, hour);
        } else {
          icon = getWeatherIcon(period.shortForecast);
        }
        const temp = period.temperature;
        const tempColor = getTemperatureColor(temp, isDark);
        const iconColor = isNightHour ? (isDark ? '#FFD700' : '#8B5CF6') : undefined;

        return (
          <YStack
            key={period.startTime}
            alignItems="center"
            justifyContent="center"
            px={isIpad() ? 10 : 7}
            py={isIpad() ? 8 : 4}
            mx={isWeb ? (isIpad() ? 6 : 4) : (isIpad() ? 4 : 2)}
            borderRadius={14}
            backgroundColor={isDark ? 'rgba(40,40,60,0.55)' : 'rgba(255,255,255,0.75)'}
            minWidth={isWeb ? (isIpad() ? 64 : 52) : (isIpad() ? 54 : 44)}
            style={{ shadowColor: isDark ? '#000' : '#bbb', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.13, shadowRadius: 3, elevation: 2 }}
          >
            <Text color={isDark ? '#e0e6f7' : '#23243a'} my={1} fontSize={isWeb ? 15 : isIpad() ? 15 : 13} fontWeight="600" fontFamily="$body">
              {label}
            </Text>
            <Text mb={1} fontSize={isIpad() ? 28 : 22} style={iconColor ? { color: iconColor } : {}} fontFamily="$body">
              {icon}
            </Text>
            <Text mt={1} color={tempColor} fontSize={isIpad() ? 19 : 16} fontWeight="800" style={{ marginBottom: 2, letterSpacing: -0.5 }} fontFamily="$body">
              {`${temp}°`}
            </Text>
          </YStack>
        );
      })}
    </ScrollView>
  );
};

export default HourlyCarousel; 