import React from 'react'
import { useColorScheme } from 'react-native'
import { YStack, Text, Spinner, XStack, Switch, Label } from 'tamagui'
import { DailyQuoteBCA } from './float/dailyQuoteBCA'
import { useStoicQuote, useRefreshStoicQuote } from '@/hooks/useStoicQuote'
import { Ionicons } from '@expo/vector-icons'
import { Pressable } from 'react-native'
import { useUserStore } from '@/store'

interface QuoteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuoteModal({ open, onOpenChange }: QuoteModalProps) {
  if (!open) {
    return null;
  }

  const { data, isLoading, isError } = useStoicQuote()
  const refreshQuote = useRefreshStoicQuote()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const showQuoteOnHome = useUserStore(s => s.preferences.showQuoteOnHome || false)
  const setPreferences = useUserStore(s => s.setPreferences)

  const handleToggleQuoteOnHome = (checked: boolean) => {
    setPreferences({ showQuoteOnHome: checked })
  }

  return (
    <DailyQuoteBCA
      onClose={() => onOpenChange(false)} 
      title="Quote of the Day"
      showCloseButton={true}
    >
      <YStack gap="$2" >
        <YStack
          backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
          br={12}
          padding="$4"
          borderWidth={1}
          borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
        >
          <XStack alignItems="center" gap="$3" >
        <Pressable 
            onPress={refreshQuote}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              padding: 6,
              borderRadius: 6,
            })}
          >
            <Ionicons name="refresh" size={12} color={isDark ? "#fff" : "#000"} />
          </Pressable>
          <Text fontFamily="$body" color={isDark ? "#ccc" : "#ccc"} fontSize={16} fontWeight="500">
            Quote of the Day
          </Text>
          </XStack>
          {isLoading ? (
            <YStack alignItems="center" mt="$2">
              <Spinner size="small" color="$gray10" />
              <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14} mt="$2">
                Loading quote...
              </Text>
            </YStack>
          ) : isError || !data || !data.data ? (
            <YStack alignItems="center" mt="$2">
              <Text fontFamily="$body" color="#ff6b6b" fontSize={14}>
                Unable to load quote. Try again later.
              </Text>
            </YStack>
          ) : (
            <YStack gap="$2" mt="$2">
              <Text 
                fontFamily="$body" 
                color={isDark ? "#fff" : "#000"} 
                fontSize={18} 
                fontWeight="500"
                lineHeight={24}
              >
                "{data.data.quote}"
              </Text>
              <Text 
                fontFamily="$body" 
                color={isDark ? "#a0a0a0" : "#666666"} 
                fontSize={16} 
                fontWeight="500"
                mt="$2"
              >
                — {data.data.author}
              </Text>
            </YStack>
          )}
        </YStack>
        
        <YStack
          backgroundColor={isDark ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.6)"}
          br={12}
          padding="$3"
          borderWidth={1}
          borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
        >
          <XStack alignItems="center" justifyContent="space-between">
            <Label htmlFor="quote-toggle" fontFamily="$body" color={isDark ? "#fff" : "#000"} fontSize={16}>
              Show on Home Screen
            </Label>
            <Switch
              id="quote-toggle"
              size="$3"
              checked={showQuoteOnHome}
              onCheckedChange={handleToggleQuoteOnHome}
              backgroundColor={showQuoteOnHome ? "$green10" : isDark ? "$gray6" : "$gray4"}
            >
              <Switch.Thumb backgroundColor="white" />
            </Switch>
          </XStack>
        </YStack>
      </YStack>
    </DailyQuoteBCA>
  )
}
