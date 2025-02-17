import React from 'react'
import { useColorScheme } from 'react-native'
import { YStack, Text, XStack, Stack } from 'tamagui'
import { BaseCardModal } from './BaseCardModal'
import { useWeatherStore } from '@/store/WeatherStore'
import { useEffect } from 'react'
import Animated, { 
  withSpring, 
  useAnimatedStyle, 
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

const getTemperatureColor = (temp: number, isDark: boolean): string => {
  'worklet'
  if (isDark) {
    if (temp <= 8) return '#a1a1aa'    // zinc-400
    if (temp <= 16) return '#93c5fd'   // blue-300
    if (temp <= 24) return '#60a5fa'   // blue-400
    if (temp <= 32) return '#3b82f6'   // blue-500
    if (temp <= 40) return '#eab308'   // yellow-500
    if (temp <= 48) return '#facc15'   // yellow-400
    if (temp <= 56) return '#84cc16'   // lime-500
    if (temp <= 64) return '#22c55e'   // green-500
    if (temp <= 72) return '#15803d'   // green-700
    if (temp <= 81) return '#fb923c'   // orange-400
    if (temp <= 91) return '#f97316'   // orange-500
    if (temp <= 100) return '#ef4444'  // red-500
    return '#dc2626'                    // red-600
  } else {
    if (temp <= 8) return '#18181b'    // zinc-900
    if (temp <= 16) return '#1d4ed8'   // blue-700
    if (temp <= 24) return '#2563eb'   // blue-600
    if (temp <= 32) return '#3b82f6'   // blue-500
    if (temp <= 40) return '#ca8a04'   // yellow-600
    if (temp <= 48) return '#eab308'   // yellow-500
    if (temp <= 56) return '#65a30d'   // lime-600
    if (temp <= 64) return '#16a34a'   // green-600
    if (temp <= 72) return '#15803d'   // green-700
    if (temp <= 81) return '#ea580c'   // orange-600
    if (temp <= 91) return '#c2410c'   // orange-700
    if (temp <= 100) return '#dc2626'  // red-600
    return '#b91c1c'                    // red-700
  }
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
  
  const fiveDayForecast = []
  for (let i = 0; i < forecast.length - 1; i += 2) {
    const dayPeriod = forecast[i]
    const nightPeriod = forecast[i + 1]
    if (dayPeriod && nightPeriod) {
      fiveDayForecast.push({
        day: dayPeriod.name,
        high: dayPeriod.temperature,
        low: nightPeriod.temperature,
        unit: dayPeriod.temperatureUnit,
        shortForecast: dayPeriod.shortForecast,
        precipitation: dayPeriod.probabilityOfPrecipitation?.value || 0
      })
    }
    if (fiveDayForecast.length === 5) break
  }

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Temperature Details"
    >
      <YStack gap="$4">
        <YStack
          backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
          borderRadius={12}
          padding="$4"
          borderWidth={1}
          borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
        >
          <Text color={isDark ? "#fff" : "#000"} fontSize={16} fontWeight="500">Current Temperature</Text>
          <YStack gap="$2" marginTop="$2">
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
              backgroundColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
              borderRadius={4}
              height={8}
              overflow="hidden"
            >
              <Animated.View style={progressStyle} />
            </Stack>
          </YStack>
        </YStack>
        <YStack
          backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
          borderRadius={12}
          padding="$4"
          borderWidth={1}
          borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
        >
          <Text color={isDark ? "#fff" : "#000"} fontSize={16} fontWeight="500">5-Day Forecast</Text>
          <YStack gap="$2" marginTop="$2">
            {fiveDayForecast.map((period) => (
              <XStack 
                key={period.day}
                justifyContent="space-between"
                alignItems="center"
                backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.6)"}
                padding="$3"
                borderRadius={8}
                borderWidth={1}
                borderColor={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}
              >
                <YStack flex={1}>
                  <Text color={isDark ? "#fff" : "#000"} fontSize={14} fontWeight="500">
                    {period.day}
                  </Text>
                  <Text color={isDark ? "#a0a0a0" : "#666666"} fontSize={12} numberOfLines={1}>
                    {period.shortForecast}
                  </Text>
                  <Text 
                    color={isDark ? "#7cb3ff" : "#1d4ed8"} 
                    fontSize={12} 
                    marginTop="$1"
                  >
                    {period.precipitation}% chance of rain
                  </Text>
                </YStack>
                <YStack alignItems="flex-end" marginLeft="$2">
                  <Text 
                    color={getTemperatureColor(period.high, isDark)} 
                    fontSize={16} 
                    fontWeight="600"
                  >
                    {period.high}°{period.unit}
                  </Text>
                  <Text 
                    color={getTemperatureColor(period.low, isDark)} 
                    fontSize={14}
                  >
                    {period.low}°{period.unit}
                  </Text>
                </YStack>
              </XStack>
            ))}
          </YStack>
        </YStack>
      </YStack>
    </BaseCardModal>
  )
}