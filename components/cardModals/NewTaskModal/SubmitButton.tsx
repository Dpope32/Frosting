import React from 'react'
import { Button, Text } from 'tamagui'
import { isIpad } from '@/utils'

interface SubmitButtonProps {
  isSubmitting: boolean
  preferences: any
  isDark: boolean
  onPress: () => void
}

export const SubmitButton = React.forwardRef<any, SubmitButtonProps>(({ isSubmitting, preferences, onPress, isDark }, ref) => {

  const adjustColor = (color: string, amount: number) => {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
    return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`
  }

  return (
    <Button
      ref={ref}
      backgroundColor={isDark ? `${preferences.primaryColor}25` : `${adjustColor(preferences.primaryColor, 20)}40`}
      height={40}
      pressStyle={{ opacity: 0.8, scale: 0.98 }}
      br={8}
      m={isIpad() ? 20 : 0}
      mt={isIpad() ? 20 : 10}
      alignSelf="center"
      width={isIpad() ? '100%' : 150}
      disabled={isSubmitting}
      opacity={isSubmitting ? 0.5 : 1}
      onPress={onPress}
      borderWidth={2}
      borderColor={isDark ? `${preferences.primaryColor}70` : `${adjustColor(preferences.primaryColor, 50)}80`}
    >
      <Text color={isDark ? "#f7f7f7" : adjustColor(preferences.primaryColor,50)} fontWeight="600" fontSize={14}>
        {isSubmitting ? 'Adding...' : 'Save'}
      </Text>
    </Button>
  )
}) 