import React, { useState } from 'react'
import { Pressable } from 'react-native'
import { XStack, YStack, isWeb, Text } from 'tamagui'
import { PortfolioCard } from '@/components/home/cards/PortfolioCard'
import { TemperatureCard } from '@/components/home/cards/TemperatureCard'
import { WifiCard } from '@/components/home/cards/WifiCard'
import { QuoteCard } from '@/components/home/cards/QuoteCard'
import { SettingsCard } from '@/components/home/cards/SettingsCard'
import { useUserStore } from '@/store/UserStore'
import { GreetingSection } from '@/components/home/GreetingSection'
import { isIpad } from '@/utils/deviceUtils'
import { SettingsModal } from '@/components/cardModals/SettingsModal'

interface CardSectionProps {
  onPortfolioPress?: () => void
  onTemperaturePress?: () => void
  onQuotePress?: () => void
  onWifiPress?: () => void
  isHome?: boolean
  isDark?: boolean
}

export function CardSection({
  onPortfolioPress,
  onTemperaturePress,
  onQuotePress,
  onWifiPress,
  isHome,
  isDark
}: CardSectionProps) {
  const { preferences } = useUserStore()
  const portfolioEnabled = preferences.portfolioEnabled ?? true
  const temperatureEnabled = preferences.temperatureEnabled ?? true
  const wifiEnabled = preferences.wifiEnabled ?? true
  const quoteEnabled = preferences.quoteEnabled ?? true
  const username = useUserStore(s => s.preferences.username);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  return (
    <YStack gap="$1" mt="$1" ml={isIpad() ? 0: "$0"} alignSelf={isWeb? "flex-start" : isIpad() ? "center" : "center"} justifyContent={isWeb? "flex-start" : isIpad() ? "center" : "flex-start"} alignItems="center">
      {!isIpad() ? (
        <GreetingSection username={username} />
      ) : (
        <Text
          fontFamily="$body"
          color={isDark ? "#dbd0c6" : "#dbd0c6"}
          fontSize={20}
          fontWeight="bold"
          textAlign="center"
        >
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
      )}
      <XStack
        gap="$2"
        marginTop="$2"
        flexWrap={'nowrap'}
        justifyContent={isWeb ? 'flex-start' : isIpad() ? 'center' : 'center'}
      >
        {portfolioEnabled && (
          <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1})} onPress={onPortfolioPress}>
            <PortfolioCard isHome={isHome} isDark={isDark} />
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
        {isIpad() && (
          <>
            <SettingsCard isHome={isHome} isDark={isDark} onPress={() => setSettingsOpen(true)} />
            <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
          </>
        )}
      </XStack>
    </YStack>
  )
}