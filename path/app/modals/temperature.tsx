import React, { useMemo, useEffect } from "react";
import { Platform, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import {
  YStack,
  XStack,
  Stack,
  Text,
  Button,
  ScrollView,
  isWeb,
} from "tamagui";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWeatherStore, WeatherPeriod } from "@/store/WeatherStore";
import { getTemperatureColor } from "@/services/weatherServices";
import AnimatedCloud from "@/components/weather/AnimatedCloud";
import WeatherCardAnimations from "@/components/weather/WeatherCardAnimations";
import { ChevronLeft } from "@tamagui/lucide-icons";

// … your helper functions (getWeatherIcon, getCardBackground, etc.) stay the same …

export default function TemperatureScreen() {
  const router = useRouter();
  const forecastPeriods = useWeatherStore((s) => s.forecast);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  // inject keyframes for web once
  useEffect(() => {
    if (isWeb && typeof document !== "undefined") {
      const styleId = "weather-animations-style";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          /* … your @keyframes here … */
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  const dailyForecasts = useMemo<DailyForecast[]>(() => {
    /* … same processing of forecastPeriods … */
  }, [forecastPeriods]);

  if (!forecastPeriods?.length) {
    return (
      <Stack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={isDark ? "$gray950" : "$gray100"}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <Text
            fontSize={18}
            fontWeight="500"
            color={isDark ? "$gray200" : "$gray800"}
          >
            Loading weather forecast...
          </Text>
        </Animated.View>
      </Stack>
    );
  }

  const today = forecastPeriods[0];
  const todayPrecip = today.probabilityOfPrecipitation?.value ?? 0;
  const todayBg = getCardBackground(today.shortForecast, isDark, todayPrecip);
  const todayTextColor = getTextColorForBackground(todayBg);

  return (
    <Stack flex={1} backgroundColor={isDark ? "$gray950" : "$gray100"}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={!isWeb}
      >
        {/* CENTER‑CONSTRAINED CONTAINER */}
        <YStack
          w="100%"
          maxWidth={isWeb ? 700 : "100%"}
          alignSelf={isWeb ? "center" : "stretch"}
          px={isWeb ? 0 : "$4"}
          gap="$2"
          py="$2"
        >
          {/* HEADER */}
          <XStack
            w="100%"
            alignItems="center"
            justifyContent="center"
            position="relative"
          >
            <Button
              icon={ChevronLeft}
              onPress={() => router.back()}
              circular
              size="$4"
              elevation="$1"
              backgroundColor="transparent"
              pressStyle={{
                backgroundColor: isDark ? "$gray700" : "$gray300",
              }}
              position="absolute"
              left="$4"
            />
            <Text
              fontSize={isWeb ? 24 : 20}
              fontFamily="$body"
              fontWeight="600"
              color={isDark ? "$gray100" : "$gray900"}
            >
              Weather Forecast
            </Text>
          </XStack>

          {/* TODAY CARD */}
          <Animated.View entering={FadeIn.duration(500)}>
            <XStack
              w="100%"
              p="$4"
              borderRadius="$6"
              backgroundColor={todayBg}
              overflow="hidden"
              position="relative"
              shadowColor={isDark ? "#000" : "#555"}
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={isDark ? 0.4 : 0.15}
              shadowRadius={3}
              elevation={4}
            >
              {/* … animations & clouds … */}
              <YStack flex={1} justifyContent="space-between" zIndex={1}>
                {/* … your Today content … */}
              </YStack>
            </XStack>
          </Animated.View>

          {/* NEXT DAYS */}
          <YStack mt="$4" gap="$3">
            {dailyForecasts.slice(1).map((daily, idx) => {
              const precip = daily.dayPeriod.probabilityOfPrecipitation?.value ?? 0;
              const bg = getCardBackground(
                daily.dayPeriod.shortForecast,
                isDark,
                precip
              );
              return (
                <Animated.View
                  key={daily.dayPeriod.number ?? idx}
                  entering={FadeIn.duration(500).delay(100 * idx)}
                >
                  <XStack
                    w="100%"
                    p="$3"
                    borderRadius="$5"
                    backgroundColor={bg}
                    overflow="hidden"
                    position="relative"
                    shadowColor={isDark ? "#000" : "#555"}
                    shadowOffset={{ width: 0, height: 1 }}
                    shadowOpacity={isDark ? 0.3 : 0.1}
                    shadowRadius={2}
                    elevation={3}
                  >
                    {/* … day content … */}
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