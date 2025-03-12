import React from 'react'
import { useColorScheme, Platform } from 'react-native'
import { YStack, Text, Spinner, Stack } from 'tamagui'
import { BaseCardAnimated } from './BaseCardAnimated'
import { useStoicQuote, useRefreshStoicQuote } from '@/hooks/useStoicQuote'
import { Ionicons } from '@expo/vector-icons'
import { Pressable } from 'react-native'

interface QuoteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuoteModal({ open, onOpenChange }: QuoteModalProps) {
  const { data, isLoading, isError } = useStoicQuote()
  const refreshQuote = useRefreshStoicQuote()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'

  return (
    <BaseCardAnimated
      open={open}
      onOpenChange={onOpenChange}
      title="Daily Quote"
    >
      <YStack gap="$4" opacity={isLoading ? 0.7 : 1}>
        {/* Quote Card */}
        <YStack
          backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
          borderRadius={12}
          padding="$4"
          borderWidth={1}
          borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
        >
          <Text fontFamily="$body" color={isDark ? "#fff" : "#000"} fontSize={16} fontWeight="500">
            Quote of the Day
          </Text>
          {isLoading ? (
            <YStack alignItems="center" marginTop="$2">
              <Spinner size="small" color="$gray10" />
              <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14} marginTop="$2">
                Loading quote...
              </Text>
            </YStack>
          ) : isError || !data ? (
            <YStack alignItems="center" marginTop="$2">
              <Text fontFamily="$body" color="#ff6b6b" fontSize={14}>
                Unable to load quote. Try again later.
              </Text>
            </YStack>
          ) : (
            <YStack gap="$2" marginTop="$2">
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
                marginTop="$2"
              >
                — {data.data.author}
              </Text>
            </YStack>
          )}
        </YStack>
        
        {/* Refresh Button */}
        <YStack
          backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
          borderRadius={12}
          padding="$4"
          borderWidth={1}
          borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
          alignItems="center"
        >
          <Pressable 
            onPress={refreshQuote}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              padding: 12,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%'
            })}
          >
            <Ionicons name="refresh" size={16} color={isDark ? "#fff" : "#000"} />
            <Text 
              fontFamily="$body" 
              color={isDark ? "#fff" : "#000"} 
              fontSize={16} 
              fontWeight="500"
              marginLeft={8}
            >
              Get New Quote
            </Text>
          </Pressable>
        </YStack>
      </YStack>
    </BaseCardAnimated>
  )
}
