import React, { useMemo } from "react";
import {  View, StyleSheet} from "react-native";
import { YStack, Text, XStack } from "tamagui";
import Animated, { FadeIn} from "react-native-reanimated";
import { useWeatherStore, WeatherPeriod } from "@/store/WeatherStore";
import { getTemperatureColor } from "@/services/weatherServices";
import AnimatedCloud from '@/components/weather/AnimatedCloud';
import WeatherCardAnimations from '@/components/weather/WeatherCardAnimations';
import { getCardBackground, getTextColorForBackground, parseWindSpeed, getWeatherIcon, getCloudCount, getSunIntensity, getPrecipitationColor } from "@/components/weather/styleUtils";
import LowHighBar from '@/components/weather/LowHighBar';

interface DailyForecast {
    dayName: string;
    dayPeriod: WeatherPeriod;
    nightPeriod?: WeatherPeriod;
    highTemp: number;
    lowTemp?: number;
  }
  
interface DailyForecastProps {
  isDark: boolean;
}

export default function DailyForecasts({ isDark }: DailyForecastProps) {
const todayDateString = new Date().toDateString();
  const forecastPeriods = useWeatherStore((s) => s.forecast);

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

        if (processed.length >= 7) {
          break;
        }
      }
    }
    return processed;
  }, [forecastPeriods]);

return (
    <>
    {dailyForecasts.map((daily: DailyForecast, idx) => {
        const periodDateString = new Date(daily.dayPeriod.startTime).toDateString();
        if (periodDateString === todayDateString) {
        return null;
        }
        const dayPeriod = daily.dayPeriod;
        const precipitationValue = dayPeriod.probabilityOfPrecipitation?.value ?? 0;
        const cardBg = getCardBackground(
        dayPeriod.shortForecast,
        isDark,
        precipitationValue,
        daily.highTemp
        );
        const textColor = getTextColorForBackground(cardBg);
        // More refined weather condition detection
        const forecastLower = dayPeriod.shortForecast.toLowerCase();
        
        // Parse weather conditions more precisely
        const isRainy = forecastLower.includes('rain') || forecastLower.includes('showers');
        const isStorm = forecastLower.includes('thunderstorm');
        const isFoggy = forecastLower.includes('fog');
        const windValue = parseWindSpeed(dayPeriod.windSpeed);
        
        // Get temperature values
        const highTemp = daily.highTemp;
        const lowTemp = daily.lowTemp;

        // --- FEELS LIKE calculation ---
        // Log the period for future extension
        console.log('WeatherPeriod for', daily.dayName, dayPeriod);
        // Parse wind speed (mph)
        let windMph = 0;
        const windMatch = dayPeriod.windSpeed.match(/(\d+)/);
        if (windMatch) windMph = parseInt(windMatch[1], 10);
        // Wind Chill formula only applies if temp <= 50°F and wind >= 3 mph
        let feelsLike = highTemp;
        if (highTemp <= 50 && windMph >= 3) {
          // Wind Chill (°F) = 35.74 + 0.6215T - 35.75(V^0.16) + 0.4275T(V^0.16)
          feelsLike = Math.round(35.74 + 0.6215 * highTemp - 35.75 * Math.pow(windMph, 0.16) + 0.4275 * highTemp * Math.pow(windMph, 0.16));
        }
        // --- END FEELS LIKE ---

        // Get cloud conditions based on forecast description
        const cloudCount = getCloudCount(dayPeriod.shortForecast);
        const sunIntensity = getSunIntensity(dayPeriod.shortForecast, highTemp);
        
        // Determine cloud type based on precip and storm conditions
        let cloudType: 'light' | 'medium' | 'dark' | 'storm' = 'medium';
        if (isStorm) {
          cloudType = 'storm';
        } else if (precipitationValue > 60 || isRainy) {
          cloudType = 'dark';
        } else if (cloudCount <= 2) {
          cloudType = 'light';
        }
        
        const useDarkerClouds = precipitationValue > 40 || isRainy || isStorm;
        const isTextLight = textColor === '#f9fafb' || textColor === '#FFFFFF' || textColor.toLowerCase() === 'white';
        const overlayColor = isTextLight
          ? 'rgba(0,0,0,0.38)'
          : (isDark ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)');

        return (
        <Animated.View
            key={dayPeriod.number ?? (daily.dayName + idx)}
            entering={FadeIn.duration(500).delay(100 * idx)}
        >
            <XStack
            padding="$3"
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
                {[...Array(cloudCount)].map((_, i) => (
                <AnimatedCloud
                    key={`forecast-cloud-${idx}-${i}`}
                    isDark={isDark}
                    index={i}
                    cloudType={cloudType}
                    sizeMultiplier={
                      isStorm ? 1.2 : 
                      (cloudCount <= 2 ? 0.7 : 
                      (cloudCount <= 4 ? 0.9 : 1.1))
                    }
                    opacityMultiplier={
                      isStorm ? 1.1 : 
                      (cloudCount <= 2 ? 0.6 : 
                      (cloudCount <= 4 ? 0.8 : 1))
                    }
                    useDarkerShade={useDarkerClouds}
                />
                ))}
            </View>
            <View 
                style={[
                StyleSheet.absoluteFill, 
                { 
                    backgroundColor: overlayColor,
                    pointerEvents: 'none'
                }
                ]} 
            />

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
                    <Text 
                      fontFamily="$body" 
                      fontSize={14}
                      color={precipitationValue > 0 ? getPrecipitationColor(precipitationValue, isDark) : textColor}
                      fontWeight={precipitationValue > 30 ? '600' : '400'}
                    >
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
                    alignItems="flex-end"
                >
                    {lowTemp !== undefined && (
                    <YStack alignItems="center">
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
                    {lowTemp !== undefined && (
                    <LowHighBar low={lowTemp} high={highTemp} isDark={isDark} />
                    )}
                    <YStack alignItems="center">
                    <Text
                        fontFamily="$body"
                        fontSize={16}
                        fontWeight="700"
                        color={getTemperatureColor(highTemp, isDark)}
                    >
                        {`${highTemp}°`}
                    </Text>
                    {/* Feels like display */}
                    <Text fontFamily="$body" fontSize={13} color={textColor}>
                      🌡️ Feels like {feelsLike}°
                    </Text>
                    </YStack>
                </XStack>
                </XStack>
            </YStack>
            </XStack>
        </Animated.View>
        );
    })}
 </>
);
}
