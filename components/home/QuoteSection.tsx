import React, { useState } from 'react'
import { Pressable, ActivityIndicator, Platform } from 'react-native'
import { YStack, Text, Stack, XStack } from 'tamagui'
import { useStoicQuote, useRefreshStoicQuote } from '@/hooks/useStoicQuote'
import { Ionicons } from '@expo/vector-icons'
import { useUserStore } from '@/store/UserStore'


const isWeb = Platform.OS === 'web';

export const QuoteSection = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data, isLoading, isError } = useStoicQuote()
  const refreshQuote = useRefreshStoicQuote()
  const { preferences } = useUserStore()
  
  // If quotes are disabled in preferences, don't render anything
  if (preferences.quoteEnabled === false) {
    return null
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <Stack height={80} alignItems="center" justifyContent="center">
          <ActivityIndicator color="#dbd0c6" />
        </Stack>
      )
    }

    if (isError || !data) {
      return (
        <Stack height={80} alignItems="center" justifyContent="center">
          <Text
            fontFamily="$body"
            fontSize={14}
            color="#dbd0c6"
            opacity={0.7}
            textAlign="center"
            style={{
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
            }}
          >
            Unable to load quote.{'\n'}Try again later.
          </Text>
        </Stack>
      )
    }

    return (
      <XStack alignItems="center" gap={isWeb ? "$3" : "$3"} >
        <YStack flex={1} >
          <Text
            fontFamily="$body"
            fontSize={14}
            color="#dbd0c6"
            mt={isWeb ? 0 : 0}
            fontWeight="600"
            style={{
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {data.data.quote}
          </Text>
          <Text
            fontFamily="$body"
            fontSize={12}
            color="#dbd0c6"
            opacity={0.9}
            mt={isWeb ? "$1" : "$1"}
            style={{
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
            }}
          >
            - {data.data.author}
          </Text>
        </YStack>
        <Pressable 
          onPress={refreshQuote} 
          style={({ pressed }) => ({
            mt: 24,
            opacity: pressed ? 0.7 : 1
          })}
        >
          <Ionicons name="refresh" size={14} color="#dbd0c6" />
        </Pressable>
      </XStack>
    )
  }

  return (
    <Stack>
      <Pressable onPress={toggleExpanded}>
        <XStack alignItems="center" justifyContent="flex-end" py="$2"mt={isWeb ? -20 : 0}>
          <Text
            fontFamily="$body"
            fontSize={14}
            px="$2"
            color="#dbd0c6"
            opacity={0.9}
            style={{
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
            }}
          >
            Daily Quote
          </Text>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#dbd0c6" 
          />
        </XStack>
      </Pressable>
      {isExpanded && renderContent()}
    </Stack>
  )
}
