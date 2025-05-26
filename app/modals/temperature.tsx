import React from "react";
import { useRouter } from "expo-router";
import { ScrollView, Platform, View, StyleSheet, useColorScheme } from "react-native";
import { YStack, Text, XStack, Stack, Button, isWeb } from "tamagui";
import Animated, { FadeIn} from "react-native-reanimated";
import { useWeatherStore } from "@/store/WeatherStore";
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isIpad } from "@/utils";
import TodayForecast from '@/components/weather/todayForecast';
import DailyForecasts from '@/components/weather/dailyForecasts';
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
export default function TemperatureScreen() {
  const router = useRouter();
  const forecastPeriods = useWeatherStore((s) => s.forecast);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
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

  const todayPrecipitation = todayForecast.probabilityOfPrecipitation?.value ?? 0;

  return (
    <Stack flex={1} backgroundColor={isDark ? "$gray950" : "$gray100"}>
      <ScrollView 
        contentContainerStyle={{ 
          paddingBottom: insets.bottom + 20,
          paddingTop: isWeb ? insets.top + 30 : isIpad() ? insets.top + 50: insets.top
        }}
        showsVerticalScrollIndicator={false}
      >
        <YStack gap="$2" paddingVertical="$1">
          <XStack paddingHorizontal="$4" alignItems="center" justifyContent="center" position="relative" marginBottom="$3">
            <Button
              icon={<MaterialIcons name="chevron-left" size={isIpad() ? 24 : 20} color={isDark ? "#b8b3ba" : "#708090"} />}
              onPress={() => {
                if (isWeb) {
                  router.dismiss();
                } else {
                  router.back();
                }
              }}
              circular
              size="$4"
              elevation="$1"
              backgroundColor={isDark ? "transparent" : "transparent"}
              pressStyle={{ backgroundColor: isDark ? "$gray700" : "$gray300" }}
              position="absolute"
              left="$4"
            />
            <Text fontSize={isWeb ? 24 : 20} pb="$1" fontFamily="$body" fontWeight="600" color={isDark ? "$gray100" : "$gray900"}>
              Weather Forecast
            </Text>
          </XStack>

          {todayForecast && (
            <TodayForecast isDark={isDark} todayPrecipitation={todayPrecipitation} />
          )}

          <YStack mt="$3" gap="$3" paddingHorizontal={isWeb ? 200 : "$4"}>
            <DailyForecasts isDark={isDark} />
          </YStack>
        </YStack>
      </ScrollView>
    </Stack>
  );
}
