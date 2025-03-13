import React from 'react'
import { Platform, Pressable } from 'react-native'
import { XStack } from 'tamagui'
import { PortfolioCard } from '@/utils/PortfolioCard'
import { TemperatureCard } from '@/utils/TemperatureCard'
import { WifiCard } from '@/utils/WifiCard'
import { QuoteCard } from '@/utils/QuoteCard'
import { useUserStore } from '@/store/UserStore'

interface CardSectionProps {
  onPortfolioPress: () => void
  onTemperaturePress: () => void
  onQuotePress: () => void
  onWifiPress: () => void
}
const isWeb = Platform.OS === 'web';

export const CardSection = ({ onPortfolioPress, onTemperaturePress, onQuotePress, onWifiPress }: CardSectionProps) => {
  const { preferences } = useUserStore()
  const quoteEnabled = preferences.quoteEnabled ?? true
  
  return (
    <XStack marginTop="$3" gap={isWeb ? "$2" : "$0"} flexWrap="nowrap" justifyContent={isWeb ? "flex-start" : "center"} alignItems={isWeb ? "flex-start" : "center"} paddingHorizontal={isWeb ? "$1" : "$0"}>
      <Pressable onPress={onPortfolioPress}>
        <PortfolioCard roundToWholeNumber={true} />
      </Pressable>
      <Pressable onPress={onTemperaturePress}>
        <TemperatureCard />
      </Pressable>
      <Pressable 
        onPress={onWifiPress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1
        })}
      >
        <WifiCard />
      </Pressable>
      {quoteEnabled && (
        <Pressable 
          onPress={onQuotePress}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1
          })}
        >
          <QuoteCard />
        </Pressable>
      )}
    </XStack>
  )
}
