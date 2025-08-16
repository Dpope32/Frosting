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
  const backgroundColor = React.useMemo(() => isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.1)", [isDark])
  const backgroundColorWeb = React.useMemo(() => isDark ? "rgba(14, 14, 15, 0.9)" : "rgba(255, 255, 255, 0.0)", [isDark])
  const finalBackgroundColor = isWeb ? backgroundColorWeb : backgroundColor

  if (isLoading) {
    return (
      <YStack
        backgroundColor={finalBackgroundColor}
        borderRadius={24}
        padding={isWeb ? "$4" : isIpad() ? "$4" : "$3.5"}
        borderColor={isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.2)"} 
        borderWidth={1}
        marginBottom="$2"
        style={Platform.OS === 'web' ? {
          backdropFilter: 'blur(20px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
          boxShadow: isDark 
            ? '0px 8px 32px rgba(0, 0, 0, 0.6), inset 0px 1px 0px rgba(255, 255, 255, 0.15)'   
            : '0px 8px 32px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.3)'
        } : {
          shadowColor: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.2)",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 8
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
        backgroundColor={finalBackgroundColor}
        borderRadius={16}
        padding="$3"
        borderColor={isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.2)"}
        borderWidth={1}
        marginBottom="$2"
        style={Platform.OS === 'web' ? {
          backdropFilter: 'blur(20px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
          boxShadow: isDark 
            ? '0px 8px 32px rgba(0, 0, 0, 0.6), inset 0px 1px 0px rgba(255, 255, 255, 0.15)'   
            : '0px 8px 32px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.3)'
        } : {
          shadowColor: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.2)",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 8
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
        backgroundColor={finalBackgroundColor}
        borderRadius={24}
        padding={isWeb ? "$4" : isIpad() ? "$4" : "$3.5"}
        borderColor={isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.2)"}
        borderWidth={1}
        marginBottom="$2"
        style={Platform.OS === 'web' ? {
          backdropFilter: 'blur(20px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
          boxShadow: isDark 
            ? '0px 8px 32px rgba(0, 0, 0, 0.6), inset 0px 1px 0px rgba(255, 255, 255, 0.15)'   
            : '0px 8px 32px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.3)'
        } : {
          shadowColor: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.2)",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 8
        }}
      >

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
          <YStack gap="$2" alignItems="center">
            <Text 
              fontFamily="$body" 
              color={isDark ? "#fff" : "#fff"} 
              fontSize={isIpad() ? 16 : 15} 
              fontWeight="500"
              lineHeight={22}
              textAlign="center"
            >
              "{data.data.quote}"
            </Text>
            <Text 
              fontFamily="$body" 
              color={isDark ? "#a0a0a0" : "#d0d0d0"} 
              fontSize={isIpad() ? 14 : 13} 
              fontWeight="500"
              textAlign="center"
              mt="$2"
            >
              — {data.data.author?.length > 20 ? data.data.author?.slice(0, 20) + '...' : data.data.author}
            </Text>
          </YStack>
        )}
      </YStack>
    </Animated.View>
  )
} 