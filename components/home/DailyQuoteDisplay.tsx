import React from 'react'
import { useColorScheme, Platform } from 'react-native'
import { YStack, Text, Spinner, isWeb, XStack } from 'tamagui'
import { useStoicQuote } from '@/hooks/useStoicQuote'
import Animated, { FadeIn } from 'react-native-reanimated'
import { isIpad } from '@/utils'

export function DailyQuoteDisplay() {
  const { data, isLoading, isError } = useStoicQuote()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const backgroundColor = React.useMemo(() => 
    isDark ? "rgba(14, 14, 15, 0.95)" : "rgba(0, 0, 0, 0.45)", 
    [isDark]
  )

  if (isLoading) {
    return (
      <YStack
        backgroundColor={backgroundColor}
        borderRadius={16}
        padding="$3"
        borderColor={isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.0)"}
        borderWidth={1}
        marginBottom="$2"
        style={Platform.OS === 'web' ? {
          backdropFilter: 'blur(12px)',
          boxShadow: isDark 
            ? '0px 4px 24px rgba(0, 0, 0, 0.45), inset 0px 0px 1px rgba(255, 255, 255, 0.12)'   
            : '0px 4px 24px rgba(0, 0, 0, 0.15), inset 0px 0px 1px rgba(255, 255, 255, 0.2)'
        } : {
          shadowColor: isDark ? "#000" : "rgba(0, 0, 0, 0.15)",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 12
        }}
        alignItems="center"
        justifyContent="center"
        minHeight={80}
      >
        <Spinner size="small" color="$gray10" />
        <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14} mt="$2">
          Loading quote...
        </Text>
      </YStack>
    )
  }

  if (isError || !data || !data.data) {
    return (
      <YStack
        backgroundColor={backgroundColor}
        borderRadius={16}
        padding="$3"
        borderColor={isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.0)"}
        borderWidth={1}
        marginBottom="$2"
        style={Platform.OS === 'web' ? {
          backdropFilter: 'blur(12px)',
          boxShadow: isDark 
            ? '0px 4px 24px rgba(0, 0, 0, 0.45), inset 0px 0px 1px rgba(255, 255, 255, 0.12)'   
            : '0px 4px 24px rgba(0, 0, 0, 0.15), inset 0px 0px 1px rgba(255, 255, 255, 0.2)'
        } : {
          shadowColor: isDark ? "#000" : "rgba(0, 0, 0, 0.15)",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 12
        }}
        alignItems="center"
        justifyContent="center"
        minHeight={80}
      >
        <Text fontFamily="$body" color="#ff6b6b" fontSize={14} textAlign="center">
          Unable to load daily quote
        </Text>
      </YStack>
    )
  }

  return (
    <Animated.View entering={FadeIn.duration(600)}>
      <YStack
        backgroundColor={backgroundColor}
        borderRadius={16}
        padding="$4"
        borderColor={isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.0)"}
        borderWidth={1}
        marginBottom="$2"
        style={Platform.OS === 'web' ? {
          backdropFilter: 'blur(12px)',
          boxShadow: isDark 
            ? '0px 4px 24px rgba(0, 0, 0, 0.45), inset 0px 0px 1px rgba(255, 255, 255, 0.12)'   
            : '0px 4px 24px rgba(0, 0, 0, 0.15), inset 0px 0px 1px rgba(255, 255, 255, 0.2)'
        } : {
          shadowColor: isDark ? "#000" : "rgba(0, 0, 0, 0.15)",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 12
        }}
      >
        
        {/* Web layout: Quote and author on same line */}
        {isWeb ? (
          <XStack gap="$2" alignItems="flex-end" justifyContent="space-between" flexWrap="wrap">
            <Text 
              fontFamily="$body" 
              color={isDark ? "#fff" : "#fff"} 
              fontSize={16} 
              fontWeight="500"
              lineHeight={22}
              textAlign="left"
              flex={1}
              minWidth={200}
            >
              "{data.data.quote}"
            </Text>
            <Text 
              fontFamily="$body" 
              color={isDark ? "#a0a0a0" : "#d0d0d0"} 
              fontSize={14} 
              fontWeight="500"
              textAlign="right"
              flexShrink={0}
            >
              — {data.data.author}
            </Text>
          </XStack>
        ) : (
          /* Mobile/iPad layout: Author below quote */
          <YStack gap="$2" alignItems="center">
            <Text 
              fontFamily="$body" 
              color={isDark ? "#fff" : "#fff"} 
              fontSize={isIpad() ? 15 : 14} 
              fontWeight="500"
              lineHeight={22}
              textAlign="center"
            >
              "{data.data.quote}"
            </Text>
            <Text 
              fontFamily="$body" 
              color={isDark ? "#a0a0a0" : "#d0d0d0"} 
              fontSize={isIpad() ? 13 : 12} 
              fontWeight="500"
              textAlign="center"
              mt="$2"
            >
              — {data.data.author}
            </Text>
          </YStack>
        )}
      </YStack>
    </Animated.View>
  )
} 