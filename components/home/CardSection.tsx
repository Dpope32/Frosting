import React from 'react'
import { Pressable } from 'react-native'
import { XStack, YStack, isWeb } from 'tamagui'
import { PortfolioCard } from '@/components/home/cards/PortfolioCard'
import { TemperatureCard } from '@/components/home/cards/TemperatureCard'
import { WifiCard } from '@/components/home/cards/WifiCard'
import { QuoteCard } from '@/components/home/cards/QuoteCard'
import { useUserStore } from '@/store/UserStore'
import { GreetingSection } from '@/components/home/GreetingSection'

interface CardSectionProps {
  onPortfolioPress?: () => void
  onTemperaturePress?: () => void
  onQuotePress?: () => void
  onWifiPress?: () => void
  isHome?: boolean
}

export function CardSection({
  onPortfolioPress,
  onTemperaturePress,
  onQuotePress,
  onWifiPress,
  isHome
}: CardSectionProps) {
  const { preferences } = useUserStore()
  const portfolioEnabled = preferences.portfolioEnabled ?? true
  const temperatureEnabled = preferences.temperatureEnabled ?? true
  const wifiEnabled = preferences.wifiEnabled ?? true
  const quoteEnabled = preferences.quoteEnabled ?? true
  const username = useUserStore(s => s.preferences.username);
  
  return (
    <YStack gap="$2">
      <GreetingSection username={username} />
    <XStack
      gap="$2"
      marginTop="$1"
      flexWrap={isWeb ? 'nowrap' : 'wrap'}
      justifyContent={isWeb ? 'flex-start' : 'flex-start'}
    >
      {portfolioEnabled && (
        <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1})} onPress={onPortfolioPress}>
          <PortfolioCard isHome={isHome} />
        </Pressable>
      )}
      {temperatureEnabled && (
        <Pressable onPress={onTemperaturePress} style={({ pressed }) => ({opacity: pressed ? 0.7 : 1})}>
          <TemperatureCard isHome={isHome} onPress={onTemperaturePress} />
        </Pressable>
      )}
      {wifiEnabled && (
        <Pressable onPress={onWifiPress} style={({ pressed }) => ({opacity: pressed ? 0.7 : 1})}>
          <WifiCard isHome={isHome} />
        </Pressable>
      )}
      {quoteEnabled && (
        <Pressable onPress={onQuotePress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1})}>
          <QuoteCard isHome={isHome} />
        </Pressable>
      )}
    </XStack>
    </YStack>
  )
}