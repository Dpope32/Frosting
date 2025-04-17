import React, { useEffect, useMemo } from "react";
import { useRouter } from "expo-router";
import { ScrollView, Platform, View, StyleSheet, useColorScheme } from "react-native";
import { YStack, Text, XStack, Stack, Button } from "tamagui";
import Animated, {
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  FadeIn,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useWeatherStore, WeatherPeriod } from "@/store/WeatherStore";
import { getTemperatureColor } from "@/services/weatherServices";
import { ChevronLeft } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AnimatedCloud from '@/components/weather/AnimatedCloud';
import WeatherCardAnimations from '@/components/weather/WeatherCardAnimations';

// Add global styles for web animations (only if not already added)
if (Platform.OS === 'web') {
  const styleId = 'weather-animations-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes rain {
        0% { transform: translateY(-10px) rotate(-30deg); }
        100% { transform: translateY(120px) rotate(-30deg); }
      }
      
      @keyframes lightRain {
        0% { transform: translateY(-10px) rotate(-20deg); }
        100% { transform: translateY(100px) rotate(-20deg); }
      }
      
      @keyframes heavyRain {
        0% { transform: translateY(-10px) rotate(-45deg); }
        100% { transform: translateY(140px) rotate(-45deg); }
      }
      
      @keyframes flash {
        0% { opacity: 0; }
        10% { opacity: 0.9; }
        20% { opacity: 0; }
        100% { opacity: 0; }
      }
      
      @keyframes lightningBolt {
        0% { opacity: 0; transform: scaleY(0.5); }
        5% { opacity: 1; transform: scaleY(1); }
        15% { opacity: 0.8; transform: scaleY(1); }
        20% { opacity: 0; transform: scaleY(1); }
        100% { opacity: 0; transform: scaleY(1); }
      }
      
      @keyframes windFloat {
        0% { transform: translateX(0); }
        50% { transform: translateX(10px); }
        100% { transform: translateX(0); }
      }
      
      @keyframes cloudFloat {
        0% { transform: translateX(0); }
        50% { transform: translateX(15px); }
        100% { transform: translateX(0); }
      }
      
      @keyframes cloudPulse {
        0% { opacity: 0.7; }
        50% { opacity: 0.9; }
        100% { opacity: 0.7; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Create an animated version of XStack
const AnimatedXStack = Animated.createAnimatedComponent(XStack);

// Helper functions moved to top for cleaner code organization
function getWeatherIcon(shortForecast: string): string {
  const forecast = shortForecast.toLowerCase();
  if (forecast.includes("thunderstorm")) return "⚡";
  if (forecast.includes("rain")) return "🌧";
  if (forecast.includes("cloud")) return "☁️";
  if (forecast.includes("sun")) return "☀️";
  if (forecast.includes("clear")) return "🌞";
  if (forecast.includes("snow")) return "❄️";
  if (forecast.includes("wind")) return "💨";
  return "🌡";
}

function getCardBackground(shortForecast: string, isDark: boolean, precipitation = 0): string {
  const forecast = shortForecast.toLowerCase();
  
  if (forecast.includes('thunderstorm')) {
    return isDark ? '#0C1836' : '#1E3A8A';
  }
  
  if (forecast.includes('rain') || forecast.includes('shower')) {
    const intensity = Math.min(1, (precipitation / 100) * 0.7 + 0.3);
    
    if (isDark) {
      const base = 30;
      const r = Math.floor(base * intensity * 0.7);
      const g = Math.floor(base * intensity * 0.8);
      const b = Math.floor(60 * intensity);
      return `rgb(${r},${g},${b})`;
    } else {
      const base = 180;
      const r = Math.floor(base - (base * intensity * 0.3));
      const g = Math.floor(base - (base * intensity * 0.2));
      const b = Math.floor(base - (base * intensity * 0.1));
      return `rgb(${r},${g},${b})`;
    }
  }
  
  if (forecast.includes('wind')) {
    return isDark ? '#193548' : '#BAE6FD';
  }
  
  if (forecast.includes('sun') || forecast.includes('clear')) {
    return isDark ? '#1E40AF' : '#60A5FA';
  }
  
  if (forecast.includes('snow')) {
    return isDark ? '#1E293B' : '#E0F2FE';
  }
  
  if (forecast.includes('cloud')) {
    return isDark ? '#374151' : '#F3F4F6';
  }
  
  return isDark ? 'rgba(30,41,59,0.9)' : 'rgba(243,244,246,0.9)';
}

function getTextColorForBackground(backgroundColor: string): string {
  'worklet';

  let r = 0, g = 0, b = 0;

  if (backgroundColor.startsWith('#')) {
    const hex = backgroundColor.replace('#', '');
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  } else if (backgroundColor.startsWith('rgb')) {
    const match = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (match) {
      r = parseInt(match[1], 10);
      g = parseInt(match[2], 10);
      b = parseInt(match[3], 10);
    }
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1f2937' : '#f9fafb';
}

function parseWindSpeed(speed: string | undefined): number {
  if (!speed) return 0;
  const match = speed.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

// Structure for the processed daily forecast
interface DailyForecast {
  dayName: string;
  dayPeriod: WeatherPeriod;
  nightPeriod?: WeatherPeriod;
  highTemp: number;
  lowTemp?: number;
}

export default function TemperatureScreen() {
  const router = useRouter();
  const forecastPeriods = useWeatherStore((s) => s.forecast);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  // Process forecast data to organize by day
  const dailyForecasts: DailyForecast[] = useMemo(() => {
    if (!forecastPeriods || forecastPeriods.length === 0) {
      return [];
    }

    const processed: DailyForecast[] = [];
    const getDayName = (name: string): string => name.split(" ")[0];

    for (let i = 0; i < forecastPeriods.length; i++) {
      const period = forecastPeriods[i];

      if (period.isDaytime) {
        const dayName = getDayName(period.name);
        const highTemp = period.temperature;
        let lowTemp: number | undefined = undefined;
        let nightPeriod: WeatherPeriod | undefined = undefined;

        if (i + 1 < forecastPeriods.length && !forecastPeriods[i + 1].isDaytime) {
          nightPeriod = forecastPeriods[i + 1];
          lowTemp = nightPeriod.temperature;
          i++;
        }

        processed.push({
          dayName,
          dayPeriod: period,
          nightPeriod,
          highTemp,
          lowTemp,
        });

        if (processed.length >= 7) { // Show a full week
          break;
        }
      }
    }
    return processed;
  }, [forecastPeriods]);

  // Get today's forecast (first raw period)
  const todayForecast = forecastPeriods && forecastPeriods.length > 0 ? forecastPeriods[0] : null;

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

  // Today card data
  const todayPrecipitation = todayForecast.probabilityOfPrecipitation?.value ?? 0;
  const todayCardBg = getCardBackground(todayForecast.shortForecast, isDark, todayPrecipitation);
  const todayTextColor = getTextColorForBackground(todayCardBg);
  const todayForecastLower = todayForecast.shortForecast.toLowerCase();
  const todayIsCloudy = todayForecastLower.includes('cloudy');
  const todayIsSunny = todayForecastLower.includes('sunny') || todayForecastLower.includes('clear');
  const todayWindValue = parseWindSpeed(todayForecast.windSpeed);

  return (
    <Stack flex={1} backgroundColor={isDark ? "$gray950" : "$gray100"}>
      <ScrollView 
        contentContainerStyle={{ 
          paddingBottom: insets.bottom + 20,
          paddingTop: insets.top 
        }}
        showsVerticalScrollIndicator={false}
      >
        <YStack gap="$2" paddingBottom="$2">
          <XStack paddingHorizontal="$4" alignItems="center" justifyContent="center" position="relative">
            <Button
              icon={ChevronLeft}
              onPress={() => router.back()}
              circular
              size="$4"
              elevation="$1"
              backgroundColor={isDark ? "transparent" : "transparent"}
              pressStyle={{ backgroundColor: isDark ? "$gray700" : "$gray300" }}
              position="absolute"
              left="$4"
            />
            <Text fontSize={22} fontFamily="$body" fontWeight="600" color={isDark ? "$gray100" : "$gray900"}>
              Weather Forecast
            </Text>
          </XStack>
          {todayForecast && (
            <Animated.View entering={FadeIn.duration(500)}>
              <XStack
                marginHorizontal="$4"
                padding="$4"
                borderRadius="$6"
                backgroundColor={todayCardBg}
                overflow="hidden"
                position="relative"
                shadowColor={isDark ? "#000" : "#555"}
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={isDark ? 0.4 : 0.15}
                shadowRadius={3}
                elevation={4}
              >
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  <WeatherCardAnimations
                    shortForecast={todayForecast.shortForecast}
                    precipitation={todayPrecipitation}
                    windValue={todayWindValue}
                    isDark={isDark}
                  />
                  {[...Array(todayIsCloudy ? 5 : (todayIsSunny ? 2 : 3))].map((_, i) => (
                    <AnimatedCloud
                      key={`today-cloud-${i}`}
                      isDark={isDark}
                      index={i}
                      sizeMultiplier={todayIsSunny ? 0.7 : 1.1}
                      opacityMultiplier={todayIsSunny ? 0.7 : 1}
                    />
                  ))}
                </View>

                <YStack flex={1} justifyContent="space-between" gap="$2" zIndex={1}>
                  <XStack alignItems="center" gap="$3">
                    <Text fontSize={36} fontFamily="$body">
                      {getWeatherIcon(todayForecast.shortForecast)}
                    </Text>
                    <YStack flex={1} alignItems="flex-start">
                      <Text fontFamily="$body" color={todayTextColor} fontSize={22} fontWeight="600">
                        Today
                      </Text>
                      <Text color={todayTextColor} fontSize={16} numberOfLines={1} fontFamily="$body" ellipsizeMode="tail">
                        {todayForecast.shortForecast}
                      </Text>
                    </YStack>
                  </XStack>
                  <XStack justifyContent="space-between" alignItems="flex-end" mt="$3">
                    <YStack gap="$2">
                      <XStack alignItems="center" gap="$2">
                        <Text fontFamily="$body" fontSize={16}>💨</Text>
                        <Text fontFamily="$body" color={todayTextColor} fontSize={15}>
                          {todayForecast.windSpeed} {todayForecast.windDirection}
                        </Text>
                      </XStack>
                      <XStack alignItems="center" gap="$2">
                        <Text fontFamily="$body" fontSize={16}>💧</Text>
                        <Text fontFamily="$body" color={todayTextColor} fontSize={15}>
                          {todayPrecipitation}%
                        </Text>
                      </XStack>
                    </YStack>
                    <XStack
                      paddingVertical="$2"
                      paddingHorizontal="$3"
                      borderRadius={10}
                      backgroundColor={isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.5)"}
                      gap="$3"
                    >
                      <YStack alignItems="center">
                        <Text fontFamily="$body" fontSize={13} color={todayTextColor}>
                          Now
                        </Text>
                        <Text 
                          fontFamily="$body" 
                          fontSize={20} 
                          fontWeight="700" 
                          color={getTemperatureColor(todayForecast.temperature ?? 0, isDark)}
                        >
                          {todayForecast.temperature !== null ? `${todayForecast.temperature}°` : 'N/A'}
                        </Text>
                      </YStack>
                    </XStack>
                  </XStack>
                </YStack>
              </XStack>
            </Animated.View>
          )}

          {/* Week Forecast */}
          <YStack mt="$4" gap="$3" paddingHorizontal="$4">
            {dailyForecasts.map((daily: DailyForecast, idx) => {
              if (idx === 0) return null; // Skip today's forecast as it's already shown above
              
              const dayPeriod = daily.dayPeriod;
              const precipitationValue = dayPeriod.probabilityOfPrecipitation?.value ?? 0;
              const cardBg = getCardBackground(dayPeriod.shortForecast, isDark, precipitationValue);
              const textColor = getTextColorForBackground(cardBg);
              const forecastLower = dayPeriod.shortForecast.toLowerCase();
              const isCloudy = forecastLower.includes('cloudy');
              const isSunny = forecastLower.includes('sunny') || forecastLower.includes('clear');
              const windValue = parseWindSpeed(dayPeriod.windSpeed);
              const highTemp = daily.highTemp;
              const lowTemp = daily.lowTemp;

              return (
                <Animated.View
                  key={dayPeriod.number ?? (daily.dayName + idx)}
                  entering={FadeIn.duration(500).delay(100 * idx)}
                >
                  <XStack
                    padding="$3.5"
                    borderRadius="$5"
                    backgroundColor={cardBg}
                    overflow="hidden"
                    position="relative"
                    shadowColor={isDark ? "#000" : "#555"}
                    shadowOffset={{ width: 0, height: 1 }}
                    shadowOpacity={isDark ? 0.3 : 0.1}
                    shadowRadius={2}
                    elevation={3}
                  >
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                      <WeatherCardAnimations
                        shortForecast={dayPeriod.shortForecast}
                        precipitation={precipitationValue}
                        windValue={windValue}
                        isDark={isDark}
                      />
                      {[...Array(isCloudy ? 4 : (isSunny ? 2 : 3))].map((_, i) => (
                        <AnimatedCloud
                          key={`forecast-cloud-${idx}-${i}`}
                          isDark={isDark}
                          index={i}
                          sizeMultiplier={isSunny ? 0.7 : 1.1}
                          opacityMultiplier={isSunny ? 0.7 : 1}
                        />
                      ))}
                    </View>

                    <YStack flex={1} justifyContent="space-between" gap="$1" zIndex={1}>
                      <XStack alignItems="center" gap="$2.5">
                        <Text fontSize={30} fontFamily="$body">
                          {getWeatherIcon(dayPeriod.shortForecast)}
                        </Text>
                        <YStack flex={1} alignItems="flex-start">
                          <Text fontFamily="$body" color={textColor} fontSize={18} fontWeight="600">
                            {daily.dayName}
                          </Text>
                          <Text color={textColor} fontSize={14} numberOfLines={1} fontFamily="$body" ellipsizeMode="tail">
                            {dayPeriod.shortForecast}
                          </Text>
                        </YStack>
                      </XStack>
                      <XStack justifyContent="space-between" alignItems="flex-end" mt="$2">
                        <YStack gap="$2">
                          <XStack alignItems="center" gap="$1.5">
                            <Text fontFamily="$body" fontSize={14}>💨</Text>
                            <Text fontFamily="$body" color={textColor} fontSize={14}>
                              {dayPeriod.windSpeed} {dayPeriod.windDirection}
                            </Text>
                          </XStack>
                          <XStack alignItems="center" gap="$1.5">
                            <Text fontFamily="$body" fontSize={14}>💧</Text>
                            <Text fontFamily="$body" color={textColor} fontSize={14}>
                              {precipitationValue}%
                            </Text>
                          </XStack>
                        </YStack>
                        <XStack
                          paddingVertical="$1.5"
                          paddingHorizontal="$2.5"
                          borderRadius={8}
                          backgroundColor={isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.5)"}
                          gap="$3"
                        >
                          {lowTemp !== undefined && (
                            <YStack alignItems="center">
                              <Text fontFamily="$body" fontSize={12} color={textColor}>
                                Low
                              </Text>
                              <Text 
                                fontFamily="$body" 
                                fontSize={16} 
                                fontWeight="700" 
                                color={getTemperatureColor(lowTemp, isDark)}
                              >
                                {`${lowTemp}°`}
                              </Text>
                            </YStack>
                          )}
                          <YStack alignItems="center">
                            <Text fontFamily="$body" fontSize={12} color={textColor}>
                              High
                            </Text>
                            <Text 
                              fontFamily="$body" 
                              fontSize={16} 
                              fontWeight="700" 
                              color={getTemperatureColor(highTemp, isDark)}
                            >
                              {`${highTemp}°`}
                            </Text>
                          </YStack>
                        </XStack>
                      </XStack>
                    </YStack>
                  </XStack>
                </Animated.View>
              );
            })}
          </YStack>
        </YStack>
      </ScrollView>
    </Stack>
  );
}
