// TemperatureModal.tsx
import React, { useEffect } from 'react'
import { useColorScheme, Platform } from 'react-native'
import { YStack, Text, XStack, Stack } from 'tamagui'
import Animated, {
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  FadeIn
} from 'react-native-reanimated'
import { BaseCardModal } from './BaseCardModal'
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
  if (f.includes('sun')) return isDark ? '#2563EB' : '#3B82F6' // Bright blue for sunny
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
        precipitation: dayPeriod.probabilityOfPrecipitation?.value || 0,
        windSpeed: dayPeriod.windSpeed,
        windDirection: dayPeriod.windDirection
      })
    }
    if (fiveDayForecast.length === 5) break
  }

  return (
    <BaseCardModal open={open} onOpenChange={onOpenChange} title="Weather">
      <YStack gap="$4">
        <YStack
          backgroundColor={isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)"}
          borderRadius={12}
          padding="$4"
          borderWidth={1}
          borderColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
        >
          <Text color={isDark ? "#fff" : "#000"} fontSize={16} fontWeight="500">
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

        <YStack
          backgroundColor={isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)"}
          borderRadius={12}
          padding="$4"
          borderWidth={1}
          borderColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
        >
          <Text color={isDark ? "#fff" : "#000"} fontSize={16} fontWeight="500">
            5-Day Forecast
          </Text>

          <XStack
            marginTop="$3"
            gap="$4"
            {...(Platform.OS === 'web'
              ? { justifyContent: 'space-between', flexWrap: 'wrap' }
              : { flexDirection: 'column' }
            )}
          >
            {fiveDayForecast.map((period, idx) => (
              <Animated.View
                key={period.day}
                entering={FadeIn.delay(idx * 100).duration(500)}
                style={Platform.OS === 'web' ? { flexBasis: '18%', minWidth: 140 } : {}}
              >
                <YStack
                  height={280}
                  width="100%"
                  borderRadius={12}
                  overflow="hidden"
                  borderWidth={1}
                  borderColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                  backgroundColor={getCardBackground(period.shortForecast, isDark)}
                  padding="$4"
                  gap="$2"
                  justifyContent="space-between"
                >
                  {/* Weather Icon */}
                  <Text fontSize={40} textAlign="center" marginTop="$1">
                    {getWeatherIcon(period.shortForecast)}
                  </Text>
                  
                  {/* Day and Forecast */}
                  <YStack gap="$1" flex={1} justifyContent="center">
                    <Text
                      textAlign="center"
                      color={isDark ? "#fff" : "#000"}
                      fontSize={16}
                      fontWeight="600"
                    >
                      {period.day}
                    </Text>
                    <Text
                      textAlign="center"
                      color={isDark ? "#ccc" : "#444"}
                      fontSize={12}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {period.shortForecast}
                    </Text>
                  </YStack>
                  
                  {/* Weather Details */}
                  <YStack gap="$1" marginVertical="$2">
                    {period.precipitation > 0 && (
                      <XStack 
                        alignItems="center" 
                        justifyContent="center"
                        gap="$1"
                      >
                        <Text fontSize={12}>💧</Text>
                        <Text
                          textAlign="center"
                          color={isDark ? "#7cb3ff" : "#1d4ed8"}
                          fontSize={12}
                        >
                          {period.precipitation}%
                        </Text>
                      </XStack>
                    )}
                    {period.windSpeed && (
                      <XStack 
                        alignItems="center" 
                        justifyContent="center"
                        gap="$1"
                      >
                        <Text fontSize={12}>💨</Text>
                        <Text
                          textAlign="center"
                          color={isDark ? "#a1a1aa" : "#52525b"}
                          fontSize={12}
                        >
                          {period.windSpeed} {period.windDirection}
                        </Text>
                      </XStack>
                    )}
                  </YStack>
                  
                  {/* Temperature */}
                  <XStack
                    alignSelf="stretch"
                    padding="$2"
                    borderRadius={8}
                    backgroundColor={isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.5)"}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <YStack>
                      <Text fontSize={12} color={isDark ? "#ccc" : "#666"}>High</Text>
                      <Text
                        fontSize={18}
                        fontWeight="700"
                        color={getTemperatureColor(period.high, isDark)}
                      >
                        {period.high}°
                      </Text>
                    </YStack>
                    <YStack>
                      <Text fontSize={12} color={isDark ? "#ccc" : "#666"}>Low</Text>
                      <Text
                        fontSize={18}
                        fontWeight="700"
                        color={getTemperatureColor(period.low, isDark)}
                      >
                        {period.low}°
                      </Text>
                    </YStack>
                  </XStack>
                </YStack>
              </Animated.View>
            ))}
          </XStack>
        </YStack>
      </YStack>
    </BaseCardModal>
  )
}
