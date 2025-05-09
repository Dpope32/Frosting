import React, { useEffect  } from 'react'
import { useColorScheme } from 'react-native'
import { YStack, Text, Spinner } from 'tamagui'
import { BaseCardAnimated } from '../baseModals/BaseCardAnimated'
import { useStoicQuote, useRefreshStoicQuote } from '@/hooks/useStoicQuote'
import { Ionicons } from '@expo/vector-icons'
import { Pressable } from 'react-native'
import Animated, { FadeIn, useSharedValue, withTiming, Easing } from 'react-native-reanimated'

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
  const opacity = useSharedValue(0)
  
  useEffect(() => {
    if (open && !isLoading) {
      opacity.value = 0
      opacity.value = withTiming(1, { 
        duration: 600,
        easing: Easing.out(Easing.cubic)
      })
    }
  }, [open, isLoading])

  return (
    <BaseCardAnimated
      onClose={() => onOpenChange(false)} 
      title="Daily Quote"
    >
      <YStack gap="$4" opacity={isLoading ? 0.7 : 1}>
        <Animated.View entering={FadeIn.duration(600).delay(0)} >
          <YStack
            backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
            br={12}
            padding="$4"
            borderWidth={1}
            borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
          >
            <Text fontFamily="$body" color={isDark ? "#fff" : "#000"} fontSize={16} fontWeight="500">
              Quote of the Day
            </Text>
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
        </Animated.View>
        
        <Animated.View entering={FadeIn.duration(600).delay(200)}>
          <YStack br={12} alignItems="center">
            <Pressable 
              onPress={refreshQuote}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
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
        </Animated.View>
      </YStack>
    </BaseCardAnimated>
  )
}
