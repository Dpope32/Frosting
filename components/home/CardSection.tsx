import React from 'react'
import { Pressable } from 'react-native'
import { XStack, isWeb } from 'tamagui'
import { PortfolioCard } from '@/components/home/cards/PortfolioCard'
import { TemperatureCard } from '@/components/home/cards/TemperatureCard'
import { WifiCard } from '@/components/home/cards/WifiCard'
import { QuoteCard } from '@/components/home/cards/QuoteCard'
import { useUserStore } from '@/store/UserStore'

interface CardSectionProps {
  onPortfolioPress: () => void
  onTemperaturePress: () => void
  onQuotePress: () => void
  onWifiPress: () => void
}

export const CardSection = ({ onPortfolioPress, onTemperaturePress, onQuotePress, onWifiPress }: CardSectionProps) => {
  const { preferences } = useUserStore()
  const portfolioEnabled = preferences.portfolioEnabled ?? true
  const temperatureEnabled = preferences.temperatureEnabled ?? true
  const wifiEnabled = preferences.wifiEnabled ?? true
  const quoteEnabled = preferences.quoteEnabled ?? true
  
  return (
    <XStack ml="$2" gap={isWeb ? "$2" : "$0"} flexWrap="nowrap" justifyContent="flex-start" alignItems={isWeb ? "flex-start" : "center"}  paddingHorizontal={isWeb ? "$1" : "$0"}>
      {portfolioEnabled && (
        <Pressable onPress={onPortfolioPress}>
          <PortfolioCard roundToWholeNumber={true} />
        </Pressable>
      )}
      {temperatureEnabled && (
        <Pressable onPress={onTemperaturePress}>
          <TemperatureCard />
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
