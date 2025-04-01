// TemperatureModal.tsx
import React, { useEffect, useMemo } from 'react'
import { useColorScheme, Platform, Dimensions, ScrollView, View, StyleSheet } from 'react-native'
import { YStack, Text, XStack, Stack } from 'tamagui'
import Animated, {
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  FadeIn,
  withTiming,
  withRepeat,
  withSequence,
  Easing
} from 'react-native-reanimated'
import { BaseCardAnimated } from './BaseCardAnimated'
import { useWeatherStore } from '@/store/WeatherStore'
import { getTemperatureColor } from '@/services/weatherServices'

// Add global styles for web animations
if (Platform.OS === 'web') {
  const style = document.createElement('style');
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

function getWeatherIcon(shortForecast: string) {
  const f = shortForecast.toLowerCase()
  if (f.includes('rain')) return '🌧'
  if (f.includes('cloud')) return '☁️'
  if (f.includes('sun')) return '☀️'
  if (f.includes('snow')) return '❄️'
  if (f.includes('wind')) return '💨'
  return '🌡'
}

function getCardBackground(shortForecast: string, isDark: boolean, precipitation = 0) {
  const f = shortForecast.toLowerCase()
  
  // Enhanced weather backgrounds with intensity levels and more variety
  if (f.includes('thunderstorm')) {
    // Dark blue/purple for thunderstorms
    return isDark ? '#0C1836' : '#1E3A8A'
  }
  
  if (f.includes('rain') || f.includes('shower')) {
    // Scale darkness with precipitation %
    const intensity = Math.min(1, precipitation / 100 * 0.7 + 0.3)
    
    if (isDark) {
      // Darker blue for rain in dark mode
      const base = 30
      const r = Math.floor(base * intensity * 0.7)
      const g = Math.floor(base * intensity * 0.8)
      const b = Math.floor(60 * intensity)
      return `rgb(${r},${g},${b})`
    } else {
      // Grayish blue for rain in light mode
      const base = 180
      const r = Math.floor(base - (base * intensity * 0.3))
      const g = Math.floor(base - (base * intensity * 0.2))
      const b = Math.floor(base - (base * intensity * 0.1))
      return `rgb(${r},${g},${b})`
    }
  }
  
  if (f.includes('wind')) {
    // Teal/blue for windy conditions
    return isDark ? '#193548' : '#BAE6FD'
  }
  
  if (f.includes('sun') || f.includes('clear')) {
    // Brighter blue for sunny days
    return isDark ? '#1E40AF' : '#60A5FA'
  }
  
  if (f.includes('snow')) {
    // Light blue for snow
    return isDark ? '#1E293B' : '#E0F2FE'
  }
  
  if (f.includes('cloud')) {
    // Gray for cloudy conditions
    return isDark ? '#374151' : '#F3F4F6'
  }
  
  // Default fallback
  return isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)'
}

interface TemperatureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  temperature?: string
}

export function TemperatureModal({ open, onOpenChange }: TemperatureModalProps) {
  // If not open, render nothing
  if (!open) {
    return null;
  }

  const forecast = useWeatherStore(s => s.forecast)
  const currentTemp = useWeatherStore(s => s.currentTemp)
  const progress = useSharedValue(0)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  
  // For lightning animation (mobile)
  const flashOpacity = useSharedValue(0)

  useEffect(() => {
    if (open && currentTemp !== null) {
      // Reset and trigger the animation when modal opens
      progress.value = 0
      progress.value = withSpring(Math.min(currentTemp, 120) / 120, {
        mass: 1,
        damping: 15,
        stiffness: 90,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 2,
      })
      
      // Trigger lightning animations for mobile
      if (Platform.OS !== 'web') {
        const startFlash = () => {
          flashOpacity.value = withSequence(
            withTiming(0.8, { duration: 100 }),
            withTiming(0, { duration: 100 }),
            withTiming(0, { duration: Math.random() * 3000 + 2000 })
          );
          
          // Schedule the next flash
          setTimeout(startFlash, Math.random() * 3000 + 2000);
        }
        
        startFlash();
      }
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
  
  const flashStyle = useAnimatedStyle(() => {
    'worklet'
    return {
      opacity: flashOpacity.value,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'white',
    }
  })

  const allForecastDays = []
  let dayCount = 0
  
  for (let i = 0; i < forecast.length; i++) {
    const period = forecast[i]
    if (period && period.isDaytime) {
      const nightPeriod = forecast.find(p => 
        !p.isDaytime && p.name.includes(period.name.replace('This', '').trim())
      )
      
      const precipitation = period.probabilityOfPrecipitation?.value || 0
      const isThunderstorm = period.shortForecast.toLowerCase().includes('thunder')
      
      allForecastDays.push({
        day: period.name.replace('This', '').trim(),
        high: period.temperature,
        low: nightPeriod ? nightPeriod.temperature : null,
        unit: period.temperatureUnit,
        shortForecast: period.shortForecast,
        precipitation,
        windSpeed: period.windSpeed,
        windDirection: period.windDirection,
        windValue: parseWindSpeed(period.windSpeed),
        isThunderstorm,
        feelsLike: calculateFeelsLike(
          period.temperature,
          parseWindSpeed(period.windSpeed),
          precipitation
        )
      })
      
      dayCount++
      if (dayCount >= 5) break
    }
  }
  
  const todayForecast = allForecastDays.length > 0 ? allForecastDays[0] : null
  const nextDays = allForecastDays.slice(1)

  return (
    <BaseCardAnimated onClose={() => onOpenChange(false)} title="Weather">
      <ScrollView>
        <YStack gap="$1" paddingBottom="$1">
          <XStack gap="$3">
            <YStack
              backgroundColor={isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)"}
              br={12}
              padding="$4"
              borderWidth={1}
              borderColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
              flex={1}
            >
              <Text color={isDark ? "#fff" : "#000"} fontSize={16} fontFamily="$body" fontWeight="500">
                Current Temperature
              </Text>
              <YStack gap="$3" mt="$2">
                <Animated.Text
                  style={{
                    color: getTemperatureColor(currentTemp || 0, isDark),
                    fontSize: 32,
                    fontWeight: '600'
                  }}
                  entering={FadeIn.duration(800)}
                >
                  {currentTemp ? `${currentTemp}°F` : 'N/A'}
                </Animated.Text>
                <Stack
                  backgroundColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                  br={4}
                  height={8}
                  overflow="hidden"
                >
                  <Animated.View style={progressStyle} />
                </Stack>
              </YStack>
            </YStack>
            {todayForecast && (
              <YStack
                backgroundColor={getCardBackground(todayForecast.shortForecast, isDark)}
                br={12}
                padding="$3"
                borderWidth={1}
                borderColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                width={120}
                justifyContent="space-between"
                position="relative"
                overflow="hidden"
              >
                {todayForecast.isThunderstorm && Platform.OS !== 'web' && (
                  <Animated.View style={flashStyle} />
                )}
                <YStack alignItems="center">
                  <Text fontFamily="$body" fontSize={14} fontWeight="600" color={isDark ? "#fff" : "#000"}>
                    Today
                  </Text>
                  <Animated.Text 
                    style={{
                      fontSize: 28,
                      marginTop: 4,
                      fontFamily: 'System',
                    }}
                    entering={FadeIn.duration(800)}
                  >
                    {getWeatherIcon(todayForecast.shortForecast)}
                  </Animated.Text>
                </YStack>
                <YStack gap="$1" mt="$2">
                  {todayForecast.precipitation > 0 && (
                    <XStack alignItems="center" justifyContent="center" gap="$1">
                      <Text fontFamily="$body" fontSize={11}>💧</Text>
                      <Text fontFamily="$body" textAlign="center" color={isDark ? "#7cb3ff" : "#1d4ed8"} fontSize={11}>
                        {todayForecast.precipitation}%
                      </Text>
                    </XStack>
                  )}
                </YStack>
                <XStack alignSelf="stretch" padding="$2" br={8} backgroundColor={isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.5)"} justifyContent="space-between" alignItems="center" mt="$2">
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
          <YStack mt="$3" gap="$3">
            {nextDays.map((period, idx) => {
              const windIntensity = period.windValue;
              const hasHighWind = windIntensity > 10;
              const hasVeryHighWind = windIntensity > 20;
              
              return (
                <Animated.View
                  key={period.day}
                  entering={FadeIn.delay(idx * 150).duration(500)}
                  style={{ width: '100%' }}
                >
                  <XStack
                    height={Platform.OS === 'web' ? 100 : 90}
                    width="100%"
                    br={12}
                    overflow="hidden"
                    borderWidth={1}
                    borderColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                    backgroundColor={getCardBackground(period.shortForecast, isDark)}
                    padding="$3"
                    position="relative"
                  >
                    {/* Rain effect that varies based on forecast and precipitation level */}
                    {period.precipitation > 10 && (
                      <XStack
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        opacity={Math.min(0.8, period.precipitation/100)}
                        pointerEvents="none"
                      >
                        {/* Generate varied rain drops based on precipitation intensity */}
                        {[...Array(Math.floor(period.precipitation/4))].map((_, i) => {
                          // Determine if it's a light, medium, or heavy raindrop
                          const isHeavy = i % 5 === 0 && period.precipitation > 60;
                          const isLight = i % 3 === 0 || period.precipitation < 40;
                          const animationType = isHeavy ? 'heavyRain' : isLight ? 'lightRain' : 'rain';
                          const dropSpeed = isHeavy ? 0.6 + Math.random() * 0.2 : isLight ? 1.2 + Math.random() * 0.3 : 0.8 + Math.random() * 0.3;
                          const dropWidth = isHeavy ? 1.5 : isLight ? 0.8 : 1.2;
                          const dropHeight = isHeavy ? 14 : isLight ? 6 : 9;
                          
                          return (
                            <XStack
                              key={`rain-${i}`}
                              position="absolute"
                              top={-10}
                              left={`${Math.random() * 100}%`}
                              height={dropHeight}
                              width={dropWidth}
                              backgroundColor={isDark ? "#7cb3ff" : "#1d4ed8"}
                              opacity={0.4 + Math.random() * 0.3}
                              style={Platform.OS === 'web' ? {
                                animation: `${animationType} ${dropSpeed}s linear infinite`,
                                animationDelay: `${Math.random() * 1.5}s`,
                                willChange: 'transform'
                              } : {}}
                            />
                          );
                        })}
                      </XStack>
                    )}
                    
                    {/* Cloud effect for cloudy days */}
                    {period.shortForecast.toLowerCase().includes('cloud') && !period.shortForecast.toLowerCase().includes('rain') && (
                      <XStack
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        pointerEvents="none"
                      >
                        {[...Array(4)].map((_, i) => {
                          const size = 20 + Math.random() * 20;
                          return (
                            <XStack
                              key={`cloud-${i}`}
                              position="absolute"
                              top={15 + (i * 15)}
                              left={10 + (i * 20)}
                              height={size}
                              width={size * 1.5}
                              br={size}
                              backgroundColor={isDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.6)"}
                              style={Platform.OS === 'web' ? {
                                animation: `cloudFloat ${7 + i}s ease-in-out infinite, cloudPulse ${5 + i}s ease-in-out infinite`,
                                animationDelay: `${i * 0.5}s`,
                                willChange: 'transform'
                              } : {}}
                            />
                          );
                        })}
                      </XStack>
                    )}
                    
                    {/* Thunderstorm effect with random lightning flashes */}
                    {period.isThunderstorm && Platform.OS === 'web' && (
                      <XStack
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                      >
                        {/* Full screen flash */}
                        <XStack
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          backgroundColor="#fff"
                          opacity={0}
                          style={{
                            animation: `flash ${10 + Math.random() * 5}s infinite`,
                            animationDelay: `${Math.random() * 3}s`
                          }}
                        />
                        
                        {/* Lightning bolt 1 */}
                        <XStack
                          position="absolute"
                          top={10}
                          left={25 + (Math.random() * 20)}
                          height={30}
                          width={2}
                          backgroundColor="#fff"
                          opacity={0}
                          style={{
                            animation: `lightningBolt ${15 + Math.random() * 10}s infinite`,
                            animationDelay: `${Math.random() * 5}s`,
                            transform: 'rotate(-5deg)'
                          }}
                        />
                        
                        {/* Lightning branch */}
                        <XStack
                          position="absolute"
                          top={25}
                          left={20}
                          height={2}
                          width={12}
                          backgroundColor="#fff"
                          opacity={0}
                          style={{
                            animation: `lightningBolt ${15 + Math.random() * 10}s infinite`,
                            animationDelay: `${Math.random() * 5}s`,
                            transform: 'rotate(-30deg)'
                          }}
                        />
                        
                        {/* Lightning bolt 2 */}
                        <XStack
                          position="absolute"
                          top={5}
                          right={35}
                          height={40}
                          width={1.5}
                          backgroundColor="#fff"
                          opacity={0}
                          style={{
                            animation: `lightningBolt ${20 + Math.random() * 5}s infinite`,
                            animationDelay: `${Math.random() * 7 + 3}s`,
                            transform: 'rotate(10deg)'
                          }}
                        />
                      </XStack>
                    )}
                    {/* Wind effect with varied intensities */}
                    {hasHighWind && (
                      <XStack
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        opacity={hasVeryHighWind ? 0.4 : 0.2}
                        pointerEvents="none"
                      >
                        {/* Create multiple wind streaks with varying animation speeds */}
                        {[...Array(hasVeryHighWind ? 10 : 6)].map((_, i) => {
                          // Calculate positions with some randomization
                          const top = 10 + (i * 8) + (Math.random() * 5);
                          const left = 20 + (i * 6) + (Math.random() * 30);
                          const width = hasVeryHighWind ? 
                            15 + (Math.random() * 25) : 
                            10 + (Math.random() * 15);
                          const height = 1 + (Math.random() * 0.5);
                          const speed = hasVeryHighWind ? 
                            2 + (Math.random() * 1.5) : 
                            3 + (Math.random() * 2);
                          const delay = Math.random() * 2;
                          
                          return (
                            <XStack 
                              key={`wind-${i}`}
                              position="absolute" 
                              top={top}
                              left={left}
                              height={height}
                              width={width}
                              backgroundColor={isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.4)"}
                              opacity={0.3 + (Math.random() * 0.4)}
                              style={Platform.OS === 'web' ? {
                                animation: `windFloat ${speed}s ease-in-out infinite`,
                                animationDelay: `${delay}s`,
                                willChange: 'transform',
                                transform: `rotate(${Math.random() * 10 - 5}deg)`
                              } : {}}
                            />
                          );
                        })}
                        
                        {/* Add some leaves/debris for very high wind */}
                        {hasVeryHighWind && (
                          <>
                            {[...Array(3)].map((_, i) => {
                              const size = 3 + (Math.random() * 2);
                              const top = 15 + (i * 25) + (Math.random() * 20);
                              const speed = 1.5 + (Math.random() * 1);
                              
                              return (
                                <XStack 
                                  key={`debris-${i}`}
                                  position="absolute" 
                                  top={top}
                                  left={40 + (i * 30)}
                                  height={size}
                                  width={size}
                                  br={size}
                                  backgroundColor={isDark ? "rgba(210,180,140,0.7)" : "rgba(139,69,19,0.6)"}
                                  opacity={0.6}
                                  style={Platform.OS === 'web' ? {
                                    animation: `windFloat ${speed}s linear infinite`,
                                    animationDelay: `${Math.random()}s`,
                                    willChange: 'transform'
                                  } : {}}
                                />
                              );
                            })}
                          </>
                        )}
                      </XStack>
                    )}
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
                      <XStack alignItems="center" gap="$1" marginLeft="$8" mt="$1">
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
                    <XStack 
                      padding="$2" 
                      br={8} 
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

function parseWindSpeed(windSpeedStr: string): number {
  const matches = windSpeedStr.match(/(\d+)/g)
  if (!matches || matches.length === 0) return 0
  return Math.max(...matches.map(m => parseInt(m, 10)))
}

function calculateFeelsLike(temp: number, windSpeed: number, precipitation: number): number {
  // Simple wind chill calculation
  if (temp <= 50 && windSpeed > 3) {
    return 35.74 + 0.6215 * temp - 35.75 * Math.pow(windSpeed, 0.16) + 0.4275 * temp * Math.pow(windSpeed, 0.16)
  }
  // Account for rain making it feel colder
  if (precipitation > 50 && temp < 70) {
    return temp - (precipitation / 100 * 5)
  }
  return temp
}