import React from 'react'
import { YStack, Text, XStack } from 'tamagui'
import { BaseCardModal } from './BaseCardModal'
import { useWeatherStore } from '@/store/WeatherStore'

interface TemperatureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  temperature?: string
}

export function TemperatureModal({ open, onOpenChange, temperature }: TemperatureModalProps) {
  const forecast = useWeatherStore(s => s.forecast)
  
  // Process forecast to pair day and night temperatures
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
          backgroundColor="rgba(45,45,45,0.8)"
          borderRadius={12}
          padding="$4"
          borderColor="rgba(85,85,85,0.5)"
          borderWidth={1}
        >
          <Text color="#fff" fontSize={16} fontWeight="500">Current Temperature</Text>
          <Text color="#a0a0a0" fontSize={32} marginTop="$2">
            {temperature || 'N/A'}
          </Text>
        </YStack>
        <YStack
          backgroundColor="rgba(45,45,45,0.8)"
          borderRadius={12}
          padding="$4"
          borderColor="rgba(85,85,85,0.5)"
          borderWidth={1}
        >
          <Text color="#fff" fontSize={16} fontWeight="500">5-Day Forecast</Text>
          <YStack gap="$2" marginTop="$2">
            {fiveDayForecast.map((period) => (
              <XStack 
                key={period.day}
                justifyContent="space-between"
                alignItems="center"
                backgroundColor="rgba(35,35,35,0.8)"
                padding="$3"
                borderRadius={8}
              >
                <YStack flex={1}>
                  <Text color="#fff" fontSize={14} fontWeight="500">
                    {period.day}
                  </Text>
                  <Text color="#a0a0a0" fontSize={12} numberOfLines={1}>
                    {period.shortForecast}
                  </Text>
                  <Text color="#7cb3ff" fontSize={12} marginTop="$1">
                    {period.precipitation}% chance of rain
                  </Text>
                </YStack>
                <YStack alignItems="flex-end" marginLeft="$2">
                  <Text color="#ff9b7c" fontSize={16} fontWeight="600">
                    {period.high}°{period.unit}
                  </Text>
                  <Text color="#7cb3ff" fontSize={14}>
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
