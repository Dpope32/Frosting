import React from 'react'
import { Pressable } from 'react-native'
import { XStack, isWeb } from 'tamagui'
import { PortfolioCard } from '@/components/home/cards/PortfolioCard'
import { TemperatureCard } from '@/components/home/cards/TemperatureCard'
import { WifiCard } from '@/components/home/cards/WifiCard'
import { QuoteCard } from '@/components/home/cards/QuoteCard'
import { useUserStore } from '@/store/UserStore'
import { useRouter } from 'expo-router'

interface CardSectionProps {
  onPortfolioPress?: () => void
  onTemperaturePress?: () => void
  onQuotePress?: () => void
  onWifiPress?: () => void
}

export function CardSection({
  onPortfolioPress,
  onTemperaturePress,
  onQuotePress,
  onWifiPress
}: CardSectionProps) {
  const { preferences } = useUserStore()
  const portfolioEnabled = preferences.portfolioEnabled ?? true
  const temperatureEnabled = preferences.temperatureEnabled ?? true
  const wifiEnabled = preferences.wifiEnabled ?? true
  const quoteEnabled = preferences.quoteEnabled ?? true
  const router = useRouter();

  return (
    <XStack
      gap="$2"
      marginTop="$1"
      flexWrap={isWeb ? 'nowrap' : 'wrap'}
      justifyContent={isWeb ? 'flex-start' : 'flex-start'}
    >
      {portfolioEnabled && (
        <Pressable onPress={onPortfolioPress}>
          <PortfolioCard />
        </Pressable>
      )}
      {temperatureEnabled && (
        <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1})}>
          <TemperatureCard onPress={onTemperaturePress} />
        </Pressable>
      )}
      {wifiEnabled && (
        <Pressable  onPress={onWifiPress} style={({ pressed }) => ({opacity: pressed ? 0.7 : 1})}>
          <WifiCard />
        </Pressable>
      )}
      {quoteEnabled && (
        <Pressable  onPress={onQuotePress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1})}>
          <QuoteCard />
        </Pressable>
      )}
    </XStack>
  )
}
