import React, { useEffect } from 'react'
import { useColorScheme, Platform, Dimensions, ScrollView } from 'react-native'
import { YStack, Text, XStack, Stack } from 'tamagui'
import Animated, {
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  FadeIn
} from 'react-native-reanimated'
import { BaseCardAnimated } from './BaseCardAnimated'
import { useWeatherStore } from '@/store/WeatherStore'
import { getTemperatureColor } from '@/services/weatherServices'

function getWeatherIcon(shortForecast: string) {
  const f = shortForecast.toLowerCase()
  if (f.includes('rain')) return '🌧'
  if (f.includes('cloud')) return '☁️'
  if (f.includes('sun')) return '☀️'
  if (f.includes('snow')) return '❄️'
  if (f.includes('wind')) return '💨'
  return '🌡'
}

function getCardBackground(shortForecast: string, isDark: boolean) {
  const f = shortForecast.toLowerCase()
  if (f.includes('wind')) return isDark ? '#1E3A5F' : '#CCE7F7'
  if (f.includes('rain')) return isDark ? '#1E293B' : '#A8D0E6'
  if (f.includes('sun')) return isDark ? '#2563EB' : '#3B82F6'
  if (f.includes('snow')) return isDark ? '#334155' : '#E0F2FE'
  if (f.includes('cloud')) return isDark ? '#374151' : '#E5E7EB'
  return isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)'
}

interface TemperatureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  temperature?: string
}

export function TemperatureModal({ open, onOpenChange }: TemperatureModalProps) {
  const forecast = useWeatherStore(s => s.forecast)
  const currentTemp = useWeatherStore(s => s.currentTemp)
  const progress = useSharedValue(0)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  useEffect(() => {
    if (open && currentTemp !== null) {
      progress.value = 0
      progress.value = withSpring(Math.min(currentTemp, 120) / 120, {
        mass: 1,
        damping: 15,
        stiffness: 90,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 2,
      })
    }
  }, [open, currentTemp])

  const progressStyle = useAnimatedStyle(() => {
    'worklet'
    return {
      width: `${progress.value * 100}%`,
      backgroundColor: getTemperatureColor(currentTemp || 0, isDark),
      height: 8,
      borderRadius: 4,
    }
  })

  // Process forecast data
  const allForecastDays = []
  for (let i = 0; i < forecast.length - 1; i += 2) {
    const dayPeriod = forecast[i]
    const nightPeriod = forecast[i + 1]
    if (dayPeriod && nightPeriod) {
      allForecastDays.push({
        day: dayPeriod.name,
        high: dayPeriod.temperature,
        low: nightPeriod.temperature,
        unit: dayPeriod.temperatureUnit,
        shortForecast: dayPeriod.shortForecast,
        precipitation: dayPeriod.probabilityOfPrecipitation?.value || 0,
        windSpeed: dayPeriod.windSpeed,
        windDirection: dayPeriod.windDirection
      })
    }
    if (allForecastDays.length === 5) break
  }
  
  // Separate today's forecast from the rest
  const todayForecast = allForecastDays.length > 0 ? allForecastDays[0] : null
  const remainingDays = allForecastDays.slice(1, 5)

  const screenWidth = Dimensions.get('window').width
  const totalHorizontalPadding = 32
  const availableWidth = screenWidth - totalHorizontalPadding
  const mobileCardWidth = availableWidth / 4 - 6 // 4 cards with small gap between

  return (
    <BaseCardAnimated open={open} onOpenChange={onOpenChange} title="Weather">
      <YStack gap="$4">
        <XStack gap="$3">
          {/* Current Temperature */}
          <YStack
            backgroundColor={isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)"}
            borderRadius={12}
            padding="$4"
            borderWidth={1}
            borderColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
            flex={1}
          >
            <Text color={isDark ? "#fff" : "#000"} fontSize={16} fontFamily="$body" fontWeight="500">
              Current Temperature
            </Text>
            <YStack gap="$3" marginTop="$2">
              <Animated.Text
                style={{
                  color: getTemperatureColor(currentTemp || 0, isDark),
                  fontSize: 32,
                  fontWeight: '600'
                }}
              >
                {currentTemp ? `${currentTemp}°F` : 'N/A'}
              </Animated.Text>
              <Stack
                backgroundColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                borderRadius={4}
                height={8}
                overflow="hidden"
              >
                <Animated.View style={progressStyle} />
              </Stack>
            </YStack>
          </YStack>
          
          {/* Today's Forecast */}
          {todayForecast && (
            <YStack
              backgroundColor={getCardBackground(todayForecast.shortForecast, isDark)}
              borderRadius={12}
              padding="$3"
              borderWidth={1}
              borderColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
              width={120}
              justifyContent="space-between"
            >
              <YStack alignItems="center">
                <Text fontFamily="$body" fontSize={14} fontWeight="600" color={isDark ? "#fff" : "#000"}>
                  Today
                </Text>
                <Text fontSize={28} marginTop="$1" fontFamily="$body">
                  {getWeatherIcon(todayForecast.shortForecast)}
                </Text>
              </YStack>
              
              <YStack gap="$1" marginTop="$2">
                {todayForecast.precipitation > 0 && (
                  <XStack alignItems="center" justifyContent="center" gap="$1">
                    <Text fontFamily="$body" fontSize={11}>💧</Text>
                    <Text fontFamily="$body" textAlign="center" color={isDark ? "#7cb3ff" : "#1d4ed8"} fontSize={11}>
                      {todayForecast.precipitation}%
                    </Text>
                  </XStack>
                )}
              </YStack>
              
              <XStack alignSelf="stretch" padding="$1" borderRadius={8} backgroundColor={isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.5)"} justifyContent="space-between" alignItems="center" marginTop="$2">
                <YStack>
                  <Text fontFamily="$body" fontSize={10} color={isDark ? "#ccc" : "#666"}>Low</Text>
                  <Text fontFamily="$body" fontSize={12} fontWeight="700" color={getTemperatureColor(todayForecast.low, isDark)}>
                    {todayForecast.low}°
                  </Text>
                </YStack>
                <YStack>
                  <Text fontFamily="$body" fontSize={10} color={isDark ? "#ccc" : "#666"}>High</Text>
                  <Text fontFamily="$body" fontSize={12} fontWeight="700" color={getTemperatureColor(todayForecast.high, isDark)}>
                    {todayForecast.high}°
                  </Text>
                </YStack>
              </XStack>
            </YStack>
          )}
        </XStack>
        {Platform.OS === 'web' ? (
          <XStack
            marginTop="$3"
            gap="$4"
            justifyContent="space-between"
            flexWrap="wrap"
          >
            {allForecastDays.map((period, idx) => (
              <Animated.View
                key={period.day}
                entering={FadeIn.delay(idx * 100).duration(500)}
                style={{ flexBasis: '18%', minWidth: 140 }}
              >
                <YStack
                  height={280}
                  width={"100%"}
                  borderRadius={12}
                  overflow="hidden"
                  borderWidth={1}
                  borderColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                  backgroundColor={getCardBackground(period.shortForecast, isDark)}
                  padding="$4"
                  gap="$2"
                  justifyContent="space-between"
                >
                  <Text fontSize={40} textAlign="center" marginTop="$1" fontFamily="$body">
                    {getWeatherIcon(period.shortForecast)}
                  </Text>
                  <YStack gap="$1" flex={1} justifyContent="center">
                    <Text textAlign="center" fontFamily="$body" color={isDark ? "#fff" : "#000"} fontSize={16} fontWeight="600">
                      {period.day}
                    </Text>
                    <Text textAlign="center" color={isDark ? "#ccc" : "#444"} fontSize={12} numberOfLines={2} fontFamily="$body" ellipsizeMode="tail">
                      {period.shortForecast}
                    </Text>
                  </YStack>
                  <YStack gap="$1" marginVertical="$2">
                    {period.precipitation > 0 && (
                      <XStack alignItems="center" justifyContent="center" gap="$1">
                        <Text fontFamily="$body" fontSize={12}>💧</Text>
                        <Text textAlign="center"fontFamily="$body"  color={isDark ? "#7cb3ff" : "#1d4ed8"} fontSize={12}>
                          {period.precipitation}%
                        </Text>
                      </XStack>
                    )}
                    {period.windSpeed && (
                      <XStack alignItems="center" justifyContent="center" gap="$1">
                        <Text fontFamily="$body"fontSize={12}>💨</Text>
                        <Text fontFamily="$body" textAlign="center" color={isDark ? "#a1a1aa" : "#52525b"} fontSize={12}>
                          {period.windSpeed} {period.windDirection}
                        </Text>
                      </XStack>
                    )}
                  </YStack>
                  <XStack alignSelf="stretch" padding="$2" borderRadius={8} backgroundColor={isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.5)"} justifyContent="space-between" alignItems="center">
                    <YStack>
                      <Text fontFamily="$body" fontSize={12} color={isDark ? "#ccc" : "#666"}>Low</Text>
                      <Text fontFamily="$body" fontSize={16} fontWeight="700" color={getTemperatureColor(period.low, isDark)}>
                        {period.low}°
                      </Text>
                    </YStack>
                    <YStack>
                      <Text fontFamily="$body"fontSize={12} color={isDark ? "#ccc" : "#666"}>High</Text>
                      <Text fontFamily="$body" fontSize={16} fontWeight="700" color={getTemperatureColor(period.high, isDark)}>
                        {period.high}°
                      </Text>
                    </YStack>
                  </XStack>
                </YStack>
              </Animated.View>
            ))}
          </XStack>
        ) : (
          <XStack marginTop="$3" justifyContent="space-between" gap="$1">
            {remainingDays.map((period, idx) => (
              <Animated.View
                key={period.day}
                entering={FadeIn.delay(idx * 100).duration(500)}
                style={{ width: mobileCardWidth }}
              >
                <YStack
                  height={170}
                  width="100%"
                  borderRadius={12}
                  overflow="hidden"
                  borderWidth={1}
                  borderColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                  backgroundColor={getCardBackground(period.shortForecast, isDark)}
                  padding="$2"
                  gap="$1"
                  justifyContent="space-between"
                >
                  <Text fontFamily="$body" fontSize={22} textAlign="center">
                    {getWeatherIcon(period.shortForecast)}
                  </Text>
                  <YStack gap="$0" flex={1} justifyContent="center">
                    <Text fontFamily="$body" textAlign="center" color={isDark ? "#fff" : "#000"} fontSize={12} fontWeight="600">
                      {period.day}
                    </Text>
                    <Text fontFamily="$body" textAlign="center" color={isDark ? "#ccc" : "#444"} fontSize={10} numberOfLines={1} ellipsizeMode="tail">
                      {period.shortForecast}
                    </Text>
                  </YStack>
                  <YStack gap="$1">
                    {period.precipitation > 0 && (
                      <XStack alignItems="center" justifyContent="center" gap="$0">
                        <Text fontFamily="$body" fontSize={10}>💧</Text>
                        <Text fontFamily="$body" textAlign="center" color={isDark ? "#7cb3ff" : "#1d4ed8"} fontSize={10}>
                          {period.precipitation}%
                        </Text>
                      </XStack>
                    )}
                    {period.windSpeed && (
                      <XStack alignItems="center" justifyContent="center" gap="$0">
                        <Text fontFamily="$body" fontSize={10}>💨</Text>
                        <Text fontFamily="$body" textAlign="center" color={isDark ? "#a1a1aa" : "#52525b"} fontSize={10}>
                          {period.windSpeed}
                        </Text>
                      </XStack>
                    )}
                  </YStack>
                  <XStack alignSelf="stretch" padding="$1" borderRadius={8} backgroundColor={isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.5)"} justifyContent="space-between" alignItems="center">
                    <YStack>
                      <Text fontFamily="$body" fontSize={10} color={isDark ? "#ccc" : "#666"}>Low</Text>
                      <Text fontFamily="$body" fontSize={12} fontWeight="700" color={getTemperatureColor(period.low, isDark)}>
                        {period.low}°
                      </Text>
                    </YStack>
                    <YStack>
                      <Text fontFamily="$body" fontSize={10} color={isDark ? "#ccc" : "#666"}>High</Text>
                      <Text fontFamily="$body" fontSize={12} fontWeight="700" color={getTemperatureColor(period.high, isDark)}>
                        {period.high}°
                      </Text>
                    </YStack>
                  </XStack>
                </YStack>
              </Animated.View>
            ))}
          </XStack>
        )}
      </YStack>
    </BaseCardAnimated>
  )
}
