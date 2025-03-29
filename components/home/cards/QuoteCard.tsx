import React from 'react'
import { Platform } from 'react-native'
import { Stack, Text, Spinner } from 'tamagui'
import { useStoicQuote } from '@/hooks/useStoicQuote'
import { useUserStore } from '@/store/UserStore'

const isWeb = Platform.OS === 'web';

export function QuoteCard() {
  const { data, isLoading } = useStoicQuote()
  const { preferences } = useUserStore()
  
  // If quotes are disabled in preferences, don't render anything
  if (preferences.quoteEnabled === false) {
    return null
  }

  return (
    <>
      <Stack
        backgroundColor="rgba(0, 0, 0, 0.3)"
        br={12}
        py={isWeb ? "$3" : "$3"}
        px={isWeb ? "$3" : "$3"}
        borderWidth={1}
        borderColor="rgba(255, 255, 255, 0.1)"
        minWidth={80}
        alignItems="center"
        justifyContent="center"
        style={Platform.OS === 'web' ? { cursor: 'pointer' } : undefined}
      >
        {isLoading ? (
          <Spinner size="small" color="#dbd0c6" />
        ) : (
          <Text
            color="#dbd0c6"
            fontSize={isWeb ? 18 : 16}
            fontWeight="bold"
            fontFamily="$body"
            style={{
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2
            }}
          >
            Quote
          </Text>
        )}
      </Stack>
    </>
  )
}
