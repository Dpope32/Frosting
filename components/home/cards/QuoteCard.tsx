import React from 'react'
import { Platform } from 'react-native'
import { Stack, Spinner } from 'tamagui'
import { MessageSquareQuote } from '@tamagui/lucide-icons'
import { useStoicQuote } from '@/hooks/useStoicQuote'
import { useUserStore } from '@/store/UserStore'
import { isIpad } from '@/utils/deviceUtils'

const isWeb = Platform.OS === 'web';

interface QuoteCardProps {
  isHome?: boolean;
  isDark?: boolean;
}

export function QuoteCard({ isHome, isDark }: QuoteCardProps) {
  const { data, isLoading } = useStoicQuote()
  const { preferences } = useUserStore()
  
  if (preferences.quoteEnabled === false) {
    return null
  }

  return (
    <>
    <Stack
      backgroundColor={isHome ? 'transparent' : isDark ? "rgba(198, 198, 198, 0.05)" : "rgba(0, 0, 0, 0.3)"}
      br={isIpad() ? 18 : 12} p="$3"  
      borderWidth={isHome ? 0 : 1}
      borderColor={isHome ? 'transparent' : "rgba(255, 255, 255, 0.1)"}
      minWidth={isIpad() ? 70 : 60}
      height={isWeb ? 60 : isIpad() ? 60 : 48}    
      alignItems="center"
      jc="center"
      style={Platform.OS === 'web' ? { cursor: 'pointer' } : undefined}
    >
        {isLoading ? (
          <Spinner size="small" color="#dbd0c6" />
        ) : (
          <MessageSquareQuote size={isWeb ? 28 : isIpad() ? 24 : 20} color="#dbd0c6" />
        )}
      </Stack>
    </>
  )
}