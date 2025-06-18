import React from 'react'
import { Platform } from 'react-native'
import { Stack, Spinner } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { useStoicQuote } from '@/hooks/useStoicQuote'
import { useUserStore } from '@/store'
import { isIpad } from '@/utils'

const isWeb = Platform.OS === 'web';

interface QuoteCardProps {
  isHome?: boolean;
  isDark?: boolean;
  onPress?: () => void;
}

export function QuoteCard({ isHome, isDark, onPress }: QuoteCardProps) {
  const { data, isLoading } = useStoicQuote()
  const { preferences } = useUserStore()
  
  if (preferences.quoteEnabled === false) {
    return null
  }

  return (
    <>
    <Stack
      onPress={onPress}
      backgroundColor={isHome ? 'transparent' : isDark ? "rgba(198, 198, 198, 0.05)" : "rgba(0, 0, 0, 0.3)"}
      br={isIpad() ? 18 : 12} p="$3"  
      borderWidth={isHome ? 0 : 1}
      borderColor={isHome ? 'transparent' : "rgba(255, 255, 255, 0.3)"}
      minWidth={isIpad() ? 70 : 60}
      height={isWeb ? 60 : isIpad() ? 60 : 48}    
      alignItems="center"
      jc="center"
      style={Platform.OS === 'web' ? { cursor: 'pointer' } : undefined}
      {...(isWeb && {
        hoverStyle: { 
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          transform: [{ scale: 1.02 }],
          shadowColor: "#dbd0c6",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        }
      })}
      pressStyle={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
        {isLoading ? (
          <Spinner size="small" color="#dbd0c6" />
        ) : (
          <MaterialIcons name="format-quote" size={isWeb ? 28 : isIpad() ? 24 : 20} color="#dbd0c6" />
        )}
      </Stack>
    </>
  )
}