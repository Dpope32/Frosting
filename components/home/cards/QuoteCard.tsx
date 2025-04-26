import React from 'react'
import { Platform } from 'react-native'
import { Stack, Spinner } from 'tamagui'
import { MessageSquareQuote } from '@tamagui/lucide-icons'
import { useStoicQuote } from '@/hooks/useStoicQuote'
import { useUserStore } from '@/store/UserStore'

const isWeb = Platform.OS === 'web';

interface QuoteCardProps {
  isHome?: boolean;
}

export function QuoteCard({ isHome }: QuoteCardProps) {
  const { data, isLoading } = useStoicQuote()
  const { preferences } = useUserStore()
  
  if (preferences.quoteEnabled === false) {
    return null
  }

  return (
    <>
    <Stack
      backgroundColor={isHome ? 'transparent' : "rgba(0, 0, 0, 0.3)"}
      br={12}
      padding="$3"  
      borderWidth={isHome ? 0 : 1}
      borderColor={isHome ? 'transparent' : "rgba(255, 255, 255, 0.1)"}
      minWidth={60}
      height={isWeb ? 60 : 48}    
      alignItems="center"
      justifyContent="center"
      style={Platform.OS === 'web' ? { cursor: 'pointer' } : undefined}
    >
        {isLoading ? (
          <Spinner size="small" color="#dbd0c6" />
        ) : (
          <MessageSquareQuote size={isWeb ? 28 : 20} color="#dbd0c6" />
        )}
      </Stack>
    </>
  )
}