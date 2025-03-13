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

  // Process forecast data - only use daytime forecasts for consistency
  const allForecastDays = []
  let dayCount = 0
  
  for (let i = 0; i < forecast.length; i++) {
    const period = forecast[i]
    // Only include daytime periods for the forecast cards
    if (period && period.isDaytime) {
      // Find the corresponding night period for low temp
      const nightPeriod = forecast.find(p => 
        !p.isDaytime && p.name.includes(period.name.replace('This', '').trim())
      )
      
      allForecastDays.push({
        day: period.name.replace('This', '').trim(),
        high: period.temperature,
        low: nightPeriod ? nightPeriod.temperature : null,
        unit: period.temperatureUnit,
        shortForecast: period.shortForecast,
        precipitation: period.probabilityOfPrecipitation?.value || 0,
        windSpeed: period.windSpeed,
        windDirection: period.windDirection,
        windValue: parseWindSpeed(period.windSpeed),
      })
      
      dayCount++
      if (dayCount >= 5) break // Show 5 days total (today + 4 more)
    }
  }
  
  // Separate today's forecast from the rest
  const todayForecast = allForecastDays.length > 0 ? allForecastDays[0] : null
  const nextDays = allForecastDays.slice(1) // All days after today (up to 4)

  return (
    <BaseCardAnimated open={open} onOpenChange={onOpenChange} title="Weather">
      <ScrollView>
        <YStack gap="$4" paddingBottom="$4">
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
                
                <XStack alignSelf="stretch" padding="$2" borderRadius={8} backgroundColor={isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.5)"} justifyContent="space-between" alignItems="center" marginTop="$2">
                  <YStack>
                    <Text fontFamily="$body" fontSize={10} color={isDark ? "#ccc" : "#666"}>Low</Text>
                    <Text fontFamily="$body" fontSize={12} fontWeight="700" color={getTemperatureColor(todayForecast.low ?? 0, isDark)}>
                      {todayForecast.low !== null ? `${todayForecast.low}°` : 'N/A'}
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
          
          {/* Forecast Days - Vertical Layout */}
          <YStack marginTop="$3" gap="$3">
            {nextDays.map((period, idx) => {
              // Determine wind intensity for visualization
              const windIntensity = period.windValue;
              const hasHighWind = windIntensity > 10;
              const hasVeryHighWind = windIntensity > 20;
              
              return (
                <Animated.View
                  key={period.day}
                  entering={FadeIn.delay(idx * 100).duration(500)}
                  style={{ width: '100%' }}
                >
                  <XStack
                    height={Platform.OS === 'web' ? 100 : 90}
                    width="100%"
                    borderRadius={12}
                    overflow="hidden"
                    borderWidth={1}
                    borderColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                    backgroundColor={getCardBackground(period.shortForecast, isDark)}
                    padding="$3"
                    position="relative"
                  >
                    {/* Wind indicator */}
                    {hasHighWind && (
                      <XStack
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        opacity={0.2}
                      >
                        {/* Simple wind streaks */}
                        <XStack 
                          position="absolute" 
                          top={10} 
                          left={55} 
                          height={2} 
                          width={15} 
                          backgroundColor={isDark ? "#fff" : "#000"}
                          opacity={0.5}
                        />
                        <XStack 
                          position="absolute" 
                          top={20} 
                          left={30} 
                          height={2} 
                          width={hasVeryHighWind ? 30 : 20} 
                          backgroundColor={isDark ? "#fff" : "#000"}
                          opacity={0.5}
                        />
                        <XStack 
                          position="absolute" 
                          top={40} 
                          left={70} 
                          height={2} 
                          width={hasVeryHighWind ? 25 : 15} 
                          backgroundColor={isDark ? "#fff" : "#000"}
                          opacity={0.5}
                        />
                        {hasVeryHighWind && (
                          <>
                            <XStack 
                              position="absolute" 
                              top={60} 
                              left={40} 
                              height={2} 
                              width={35} 
                              backgroundColor={isDark ? "#fff" : "#000"}
                              opacity={0.5}
                            />
                            <XStack 
                              position="absolute" 
                              top={30} 
                              left={60} 
                              height={2} 
                              width={20} 
                              backgroundColor={isDark ? "#fff" : "#000"}
                              opacity={0.5}
                            />
                          </>
                        )}
                      </XStack>
                    )}
                  
                    {/* Main content */}
                    <YStack flex={1} justifyContent="center" gap="$1">
                      <XStack alignItems="center" gap="$2">
                        <Text fontSize={28} fontFamily="$body">
                          {getWeatherIcon(period.shortForecast)}
                        </Text>
                        <YStack>
                          <Text fontFamily="$body" color={isDark ? "#fff" : "#000"} fontSize={16} fontWeight="600">
                            {period.day}
                          </Text>
                          <Text color={isDark ? "#ccc" : "#444"} fontSize={12} numberOfLines={1} fontFamily="$body" ellipsizeMode="tail">
                            {period.shortForecast}
                          </Text>
                        </YStack>
                      </XStack>
                      
                      {/* Wind info underneath */}
                      <XStack alignItems="center" gap="$1" marginLeft="$8" marginTop="$1">
                        <Text fontFamily="$body" fontSize={12}>💨</Text>
                        <Text fontFamily="$body" color={isDark ? "#a1a1aa" : "#52525b"} fontSize={12}>
                          {period.windSpeed} {period.windDirection}
                        </Text>
                      </XStack>
                      
                      {period.precipitation > 0 && (
                        <XStack alignItems="center" gap="$1" marginLeft="$8">
                          <Text fontFamily="$body" fontSize={12}>💧</Text>
                          <Text fontFamily="$body" color={isDark ? "#7cb3ff" : "#1d4ed8"} fontSize={12}>
                            {period.precipitation}%
                          </Text>
                        </XStack>
                      )}
                    </YStack>
                    
                    {/* Temperature */}
                    <XStack 
                      padding="$2" 
                      borderRadius={8} 
                      backgroundColor={isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.5)"}
                      alignItems="center"
                      justifyContent="space-between"
                      alignSelf="stretch"
                      height={60}
                      width={70}
                    >
                      <YStack>
                        <Text fontFamily="$body" fontSize={12} color={isDark ? "#ccc" : "#666"}>Low</Text>
                        <Text fontFamily="$body" fontSize={16} fontWeight="700" color={getTemperatureColor(period.low ?? 0, isDark)}>
                          {period.low !== null ? `${period.low}°` : 'N/A'}
                        </Text>
                      </YStack>
                      <YStack>
                        <Text fontFamily="$body" fontSize={12} color={isDark ? "#ccc" : "#666"}>High</Text>
                        <Text fontFamily="$body" fontSize={16} fontWeight="700" color={getTemperatureColor(period.high, isDark)}>
                          {period.high}°
                        </Text>
                      </YStack>
                    </XStack>
                  </XStack>
                </Animated.View>
              );
            })}
          </YStack>
        </YStack>
      </ScrollView>
    </BaseCardAnimated>
  )
}

// Helper function to parse wind speed from string like "10 to 15 mph"
function parseWindSpeed(windSpeedStr: string): number {
  const matches = windSpeedStr.match(/(\d+)/g)
  if (!matches || matches.length === 0) return 0
  
  // If range like "10 to 15 mph", take the higher number
  return Math.max(...matches.map(m => parseInt(m, 10)))
}