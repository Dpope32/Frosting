import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { YStack, Text, XStack, Stack, isWeb } from "tamagui";
import Animated, { FadeIn} from "react-native-reanimated";
import { useWeatherStore, WeatherPeriod } from "@/store/WeatherStore";
import { getTemperatureColor } from "@/services/weatherServices";
import AnimatedCloud from '@/components/weather/AnimatedCloud';
import WeatherCardAnimations from '@/components/weather/WeatherCardAnimations';
import { isIpad } from "@/utils/deviceUtils";
import { getCardBackground, getTextColorForBackground, parseWindSpeed, getWeatherIcon } from "@/components/weather/styleUtils";
import HourlyCarousel from '@/components/weather/HourlyCarousel';

type TodayForecastProps = {
  isDark: boolean;
  todayPrecipitation: number;
};

export default function TodayForecast({ isDark, todayPrecipitation }: TodayForecastProps) {
  const forecastPeriods = useWeatherStore((s) => s.forecast);
  const todayForecast = forecastPeriods && forecastPeriods.length > 0 ? forecastPeriods[0] : null;

  // Night detection: between 8 PM and 4 AM
  const isNight = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 20 || hour < 4;
  }, []);

  if (!forecastPeriods || forecastPeriods.length === 0 || !todayForecast) {
    return (
      <Stack 
        flex={1} 
        justifyContent="center" 
        alignItems="center" 
        backgroundColor={isDark ? "$gray950" : "$gray100"}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <Text fontSize={18} fontWeight="500" color={isDark ? "$gray200" : "$gray800"}>
            Loading weather forecast...
          </Text>
        </Animated.View>
      </Stack>
    );
  }
  const todayCardBg = getCardBackground(todayForecast.shortForecast, isDark, todayPrecipitation, todayForecast.temperature ?? undefined);
  const todayTextColor = getTextColorForBackground(todayCardBg);
  const todayForecastLower = todayForecast.shortForecast.toLowerCase();
  const todayIsCloudy = todayForecastLower.includes('cloudy');
  const todayIsSunny = todayForecastLower.includes('sunny') || todayForecastLower.includes('clear');
  const todayWindValue = parseWindSpeed(todayForecast.windSpeed);

return (
  <Animated.View entering={FadeIn.duration(500)}>
    <YStack
       marginHorizontal="$4"
       borderRadius="$6"
       backgroundColor={todayCardBg}
       overflow="hidden"
       shadowColor={isDark ? "#000" : "#555"}
       shadowOffset={{ width: 0, height: 2 }}
       shadowOpacity={isDark ? 0.4 : 0.15}
       shadowRadius={3}
       elevation={4}
       height={isIpad() ? 190 : 180}
       justifyContent="space-between"
       gap={0}
    >
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <WeatherCardAnimations shortForecast={todayForecast.shortForecast} precipitation={todayPrecipitation} windValue={todayWindValue} isDark={isDark} />
        {[...Array(todayIsCloudy ? 5 : (todayIsSunny ? 2 : 3))].map((_, i) => (
        <AnimatedCloud key={`today-cloud-${i}`} isDark={isDark} index={i} sizeMultiplier={todayIsSunny ? 0.7 : 1.1} opacityMultiplier={todayIsSunny ? 0.7 : 1} />
        ))}
    </View>
    <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.3)' }]} />
    <XStack px="$4" pt="$3" alignItems="center" gap="$2">
        <Text fontSize={36}>
          {isNight ? '🌙' : getWeatherIcon(todayForecast.shortForecast)}
        </Text>
        <YStack flex={1}>
        <Text color={todayTextColor} fontSize={isWeb ? 22 : 18} fontWeight="600">Today</Text>
        <Text color={todayTextColor} fontSize={isWeb ? 18 : 16} numberOfLines={1} ellipsizeMode="tail">{todayForecast.shortForecast}</Text>
        </YStack>
    </XStack>

    <XStack paddingHorizontal="$4" pt="$2" justifyContent="space-between"  alignItems="center">
        <XStack alignItems="center" justifyContent="center"  gap="$3">
        <Text fontSize={16}>💨 {todayForecast.windSpeed}</Text>
        <Text fontSize={16}>💧 {todayPrecipitation}%</Text>
        </XStack>
        <XStack alignItems="center" gap="$2" padding="$2" borderRadius={10} style={{ minWidth: 70, flexShrink: 0, justifyContent: 'flex-end' }}>
        <Text fontSize={13} color={todayTextColor}>Now</Text>
        <Text fontSize={20} fontWeight="700" color={getTemperatureColor(todayForecast.temperature ?? 0, isDark)} style={{ minWidth: 36, textAlign: 'right' }}>
            {todayForecast.temperature !== null ? `${todayForecast.temperature}°` : 'N/A'}
        </Text>
        </XStack>
    </XStack>
    <XStack height={isIpad() ? 110 : 85} mb={14} overflow="hidden" backgroundColor={isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.3)'}>
        <HourlyCarousel />
    </XStack>
    </YStack>
  </Animated.View>
 )
}
