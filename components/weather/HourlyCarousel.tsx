import React from 'react';
import { ScrollView } from 'react-native';
import { XStack, YStack, Text } from 'tamagui';
import { useWeatherStore } from '@/store/WeatherStore';
import { getWeatherIcon } from '@/components/weather/weatherUtils';
import { getTemperatureColor } from '@/services/weatherServices';
import { useColorScheme } from 'react-native';

const HourlyCarousel: React.FC = () => {
  const hourly = useWeatherStore(s => s.hourlyForecast) || [];
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Filter only today's hourly periods
  const todayIso = new Date().toISOString().split('T')[0];
  const todaysHours = hourly.filter(p => p.startTime.startsWith(todayIso));

  // Limit to next 8 hours
  const items = todaysHours.slice(0, 8);

  // Render each hour
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
      {items.map(period => {
        const date = new Date(period.startTime);
        const hour = date.getHours();
        const label = `${hour % 12 || 12}${hour < 12 ? 'AM' : 'PM'}`;
        const icon = getWeatherIcon(period.shortForecast);
        const temp = period.temperature;
        const tempColor = getTemperatureColor(temp, isDark);

        return (
          <YStack key={period.startTime} alignItems="center" padding="$2">
            <Text color={isDark ? '$white' : '$black'} fontSize={12}>
              {label}
            </Text>
            <Text fontSize={20}>
              {icon}
            </Text>
            <Text color={tempColor} fontSize={14} fontWeight="600">
              {`${temp}°`}
            </Text>
          </YStack>
        );
      })}
    </ScrollView>
  );
};

export default HourlyCarousel; 