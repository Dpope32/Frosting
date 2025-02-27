import React from 'react'
import { Platform, Pressable } from 'react-native'
import { XStack } from 'tamagui'
import { PortfolioCard } from '@/utils/PortfolioCard'
import { TemperatureCard } from '@/utils/TemperatureCard'
import { WifiCard } from '@/utils/WifiCard'

interface CardSectionProps {
  onPortfolioPress: () => void
  onTemperaturePress: () => void
}
const isWeb = Platform.OS === 'web';

export const CardSection = ({ onPortfolioPress, onTemperaturePress }: CardSectionProps) => {
  return (
    <XStack marginTop="$3" gap={isWeb ? "$3" : "$2"} flexWrap="nowrap" marginLeft={isWeb ? 12 : 4}>
      <Pressable onPress={onPortfolioPress}>
        <PortfolioCard />
      </Pressable>
      <Pressable onPress={onTemperaturePress}>
        <TemperatureCard />
      </Pressable>
      <WifiCard />
    </XStack>
  )
}
