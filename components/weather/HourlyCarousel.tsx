import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, Text } from 'tamagui';
import { useWeatherStore } from '@/store/WeatherStore';
import { getWeatherIcon } from '@/components/weather/weatherUtils';
import { getTemperatureColor } from '@/services/weatherServices';
import { useColorScheme } from 'react-native';
import { isIpad } from '@/utils/deviceUtils';

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
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, paddingVertical: 10 }}>
      {items.map(period => {
        const date = new Date(period.startTime);
        const hour = date.getHours();
        const label = `${hour % 12 || 12}${hour < 12 ? 'AM' : 'PM'}`;
        const icon = getWeatherIcon(period.shortForecast);
        const temp = period.temperature;
        const tempColor = getTemperatureColor(temp, isDark);

        return (
          <YStack key={period.startTime} alignItems="center" p="$2" mt={-6}> 
            <Text color={isDark ? '$white' : '$black'} mb={1} fontSize={isIpad() ? 14 : 12}>
              {label}
            </Text>
            <Text mb={1} fontSize={isIpad() ? 23 : 20}>
              {icon}
            </Text>
            <Text mt={1} color={tempColor} fontSize={isIpad() ? 15 : 14} fontWeight="600">
              {`${temp}°`}
            </Text>
          </YStack>
        );
      })}
    </ScrollView>
  );
};

export default HourlyCarousel; 