import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { YStack, Text, XStack, Stack, isWeb } from "tamagui";
import Animated, { FadeIn} from "react-native-reanimated";
import { useWeatherStore, WeatherPeriod } from "@/store/WeatherStore";
import { getTemperatureColor } from "@/services/weatherServices";
import AnimatedCloud from '@/components/weather/AnimatedCloud';
import WeatherCardAnimations from '@/components/weather/WeatherCardAnimations';
import { isIpad } from "@/utils";
import { getCardBackground, getTextColorForBackground, parseWindSpeed, getWeatherIcon } from "@/components/weather/styleUtils";
import HourlyCarousel from '@/components/weather/HourlyCarousel';

type TodayForecastProps = {
  isDark: boolean;
  todayPrecipitation: number;
};

export default function TodayForecast({ isDark, todayPrecipitation }: TodayForecastProps) {
  const forecastPeriods = useWeatherStore((s) => s.forecast);
  const todayForecast = forecastPeriods && forecastPeriods.length > 0 ? forecastPeriods[0] : null;

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
          <Text fontSize={18} fontWeight="500" color={isDark ? "$gray200" : "$gray800"} fontFamily="$body">
            Loading weather forecast...
          </Text>
        </Animated.View>
      </Stack>
    );
  }
  const todayForecastLower = todayForecast.shortForecast.toLowerCase();
  const todayIsCloudy = todayForecastLower.includes('cloudy');
  const todayIsSunny = todayForecastLower.includes('sunny') || todayForecastLower.includes('clear');
  const todayWindValue = parseWindSpeed(todayForecast.windSpeed);
  const currentHour = new Date().getHours();
  const isLateNightOrEarlyMorning = currentHour >= 22 || currentHour < 5;

  let cardBg = getCardBackground(
    todayForecast.shortForecast,
    isDark,
    todayPrecipitation,
    todayForecast.temperature ?? 0
  );
  let textColor = getTextColorForBackground(cardBg);

  if (isLateNightOrEarlyMorning) {
    cardBg = isDark ? '#181926' : '#2c3e50'; 
    textColor = '#f5f6fa'; 
  }
  
  const shadowColor = isDark ? '#000' : '#b0b0b0'; 

  return (
    <Animated.View entering={FadeIn.duration(500)}>
      <YStack
        marginHorizontal={isWeb ? 0 : (isIpad() ? 16 : 16)}
        borderRadius={16}
        backgroundColor={cardBg}
        overflow="hidden"
        shadowColor={shadowColor}
        shadowOffset={{ width: 0, height: 6 }}
        shadowOpacity={isDark ? 0.45 : 0.18}
        shadowRadius={12}
        elevation={6}
        maxWidth={isWeb ? "100%" : (isIpad() ? 800 : 400)}
        paddingHorizontal={isWeb ? 0 : 0}
        minWidth={isWeb ? "100%" : (isIpad() ? 600 : "90%")}
        width={isWeb ? "100%" : "auto"}
        alignSelf="center"
        pt={isIpad() ? 0 : 0}
        mb={isIpad() ? 2 : 0}
        gap={0}
      >
        <YStack 
          paddingHorizontal={isWeb ? 20 : isIpad() ? 32 : 16}
          pt={isIpad() ? 10 : 16}>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <WeatherCardAnimations shortForecast={todayForecast.shortForecast} precipitation={todayPrecipitation} windValue={todayWindValue} isDark={isDark} />
            {[...Array(todayIsCloudy ? 5 : (todayIsSunny ? 2 : 3))].map((_, i) => (
              <AnimatedCloud key={`today-cloud-${i}`} isDark={isDark} index={i} sizeMultiplier={todayIsSunny ? 0.7 : 1.1} opacityMultiplier={todayIsSunny ? 0.7 : 1} />
            ))}
          </View>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(20,22,40,0.18)' : 'rgba(255,255,255,0.18)' }]} />
          <XStack px={0} pt={0} alignItems="center" gap={isIpad() ? 18 : 8} mb={isIpad() ? 8 : 0}>
            <Text fontSize={isIpad() ? 44 : 34} style={{ marginRight: isIpad() ? 10 : 6 }} fontFamily="$body">
              {isNight ? '🌙' : getWeatherIcon(todayForecast.shortForecast)}
            </Text>
            <YStack flex={1}>
              <XStack alignItems="center" justifyContent="flex-start" ml={isIpad() ? -10 : -10} gap={isIpad() ? 10 : 6}>
                <Text color={textColor} fontSize={isIpad() ? 28 : 22} fontWeight="700" fontFamily="$body">
                  Today
                </Text>
              </XStack>
            </YStack>
            <XStack paddingHorizontal={isWeb ? 12 : 5} alignItems="center" gap={4} style={{ backgroundColor: isDark ? 'rgba(40,40,60,0.7)' : 'rgba(255,255,255,0.7)', borderRadius: 12, paddingVertical: 2, marginLeft: 8 }}>
              <Text fontSize={isWeb ? 15 : isIpad() ? 15 : 13} color={textColor} fontWeight="500" style={{ marginRight: 2 }} fontFamily="$body">
                Now
              </Text>
              <Text fontSize={isIpad() ? 22 : 18} fontWeight="600" color={getTemperatureColor(todayForecast.temperature ?? 0, isDark)} style={{ minWidth: 38, textAlign: 'right', letterSpacing: -1 }} fontFamily="$body">
                {todayForecast.temperature !== null ? `${todayForecast.temperature}°` : 'N/A'}
              </Text>
            </XStack>
          </XStack>
          <XStack paddingHorizontal={0} pt={isIpad() ? 8 : 4} justifyContent="space-between" alignItems="center" mb={isIpad() ? 8 : 4}>
            <XStack alignItems="center" justifyContent="center" gap={isIpad() ? 18 : 10}>
              <Text fontSize={isIpad() ? 18 : 15} color={textColor} fontWeight="500" fontFamily="$body">💨 {todayForecast.windSpeed}</Text>
              <Text fontSize={isIpad() ? 18 : 15} color={textColor} fontWeight="500" fontFamily="$body">💧 {todayPrecipitation}%</Text>
            </XStack>
          </XStack>
          <XStack paddingHorizontal={6} pt={isIpad() ? 8 : 4} justifyContent="space-between" alignItems="center" mb={isIpad() ? 8 : 8}>
            <Text color={textColor} fontSize={isIpad() ? 18 : 15} fontWeight="600" style={{ opacity: 0.8, marginTop: 2 }} fontFamily="$body">
              {todayForecast.shortForecast}
            </Text>
          </XStack>
        </YStack>
        <XStack height={isWeb ? 110 : isIpad() ? 110 : 90} mb={isIpad() ? -12 : -8} overflow="hidden" backgroundColor={isDark ? 'rgba(20,22,40,0.10)' : 'rgba(255,255,255,0.13)'}>
          <HourlyCarousel />
        </XStack>
      </YStack>
    </Animated.View>
  )
}
