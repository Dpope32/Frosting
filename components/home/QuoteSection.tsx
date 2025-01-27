import React from 'react'
import { Pressable, ActivityIndicator } from 'react-native'
import { YStack, Text, Stack, XStack } from 'tamagui'
import { useStoicQuote, useRefreshStoicQuote } from '@/hooks/useStoicQuote'
import { Ionicons } from '@expo/vector-icons'

export const QuoteSection = () => {
  const { data, isLoading, isError } = useStoicQuote()
  const refreshQuote = useRefreshStoicQuote()

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
            fontFamily="$SpaceMono"
            fontSize={14}
            color="#dbd0c6"
            opacity={0.7}
            textAlign="center"
          >
            Unable to load quote.{'\n'}Try again later.
          </Text>
        </Stack>
      )
    }

    return (
      <XStack alignItems="center" gap="$2">
        <YStack flex={1}>
          <Text
            fontFamily="$SpaceMono"
            fontSize={14}
            color="#dbd0c6"
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
            fontFamily="$SpaceMono"
            fontSize={12}
            color="#dbd0c6"
            opacity={0.9}
            marginTop="$1"
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
            marginTop: -38,
            opacity: pressed ? 0.7 : 1
          })}
        >
          <Ionicons name="refresh" size={14} color="#dbd0c6" />
        </Pressable>
      </XStack>
    )
  }

  return (
    <Stack marginTop="$0">
      {renderContent()}
    </Stack>
  )
}