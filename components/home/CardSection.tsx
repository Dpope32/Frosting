import React, { useState } from 'react'
import { XStack, YStack, isWeb, Text } from 'tamagui'
import { PortfolioCard } from '@/components/home/cards/PortfolioCard'
import { TemperatureCard } from '@/components/home/cards/TemperatureCard'
import { WifiCard } from '@/components/home/cards/WifiCard'
import { QuoteCard } from '@/components/home/cards/QuoteCard'
import { SettingsCard } from '@/components/home/cards/SettingsCard'
import { useUserStore } from '@/store'
import { GreetingSection } from '@/components/home/GreetingSection'
import { isIpad } from '@/utils'
import { SettingsModal } from '@/components/cardModals/SettingsModal/SettingsModal'
import { ClockCard } from '@/components/home/cards/ClockCard'

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
   <YStack gap="$1" my={isIpad() ? "$3" : "$1"} alignSelf={isWeb? "flex-start" : isIpad() ? "center" : "center"} justifyContent={isWeb? "flex-start" : isIpad() ? "center" : "flex-start"} alignItems="center">
      {!isIpad() ? !isWeb && (
        <GreetingSection username={username} />
      ) : isIpad() ? (
        <Text
          fontFamily="$body"
          color={isDark ? "#dbd0c6" : "#dbd0c6"}
          fontSize={isWeb ? 23 : isIpad() ? 20 : 18}
          fontWeight="bold"
          textAlign="center"
        >
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
      ) : null}
      <XStack
        gap={isWeb ? "$7" : "$2"}
        marginTop={isIpad() ? "$4" : "$2"}
        flexWrap={'nowrap'}
        justifyContent={isWeb ? 'flex-start' : isIpad() ? 'center' : 'center'}
        alignItems="center"
      >
        {isWeb && (
          <GreetingSection username={username} />
        )}
        {portfolioEnabled && (
          <PortfolioCard isHome={isHome} isDark={isDark} onPress={onPortfolioPress} />
        )}
        {temperatureEnabled && (
          <TemperatureCard isHome={isHome} isDark={isDark} onPress={onTemperaturePress} />
        )}
        {isWeb && (
          <XStack>
            <SettingsCard
              isHome={isHome}
              isDark={isDark}
              onPress={() => setSettingsOpen(true)}
            />
            <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
            {(wifiEnabled || quoteEnabled) && (
              <YStack width={32} />
            )}
          </XStack>
        )}
        {wifiEnabled && (
          <WifiCard isHome={isHome} isDark={isDark} onPress={onWifiPress} />
        )}
        {quoteEnabled && (
          <QuoteCard isHome={isHome} isDark={isDark} onPress={onQuotePress} />
        )}
        {isIpad() && (
          <>
            <SettingsCard isHome={isHome} isDark={isDark} onPress={() => setSettingsOpen(true)} />
            <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
            <ClockCard isHome={isHome} isDark={isDark} />
          </>
        )}
      </XStack>
    </YStack>
  )
}