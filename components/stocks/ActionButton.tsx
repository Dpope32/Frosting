import React from 'react'
import { Button, Text, XStack } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'

interface ActionButtonProps {
  onPress: () => void
  label: string
  icon?: string
  isValid?: boolean
  isLoading?: boolean
  primaryColor: string
  isDark?: boolean
  loadingText?: string
}

export function ActionButton({
  onPress,
  label,
  icon,
  isValid = true,
  isLoading = false,
  primaryColor,
  isDark = false,
  loadingText = 'Loading...'
}: ActionButtonProps) {
  return (
    <Button
      backgroundColor={isValid ? primaryColor : (isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)")}
      height={48}
      flex={1}
      br={12}
      disabled={!isValid || isLoading}
      pressStyle={{ opacity: 0.8, scale: 0.98 }}
      onPress={onPress}
      borderWidth={isValid ? 0 : 1}
      borderColor={isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"}
    >
      <XStack alignItems="center" justifyContent="center" gap="$2">
        {isLoading ? (
          <>
            <MaterialIcons name="hourglass-empty" size={18} color="white" />
            <Text color="white" fontFamily="$body" fontSize={16} fontWeight="600">
              {loadingText}
            </Text>
          </>
        ) : (
          <>
            {icon && (
              <MaterialIcons 
                name={icon as any} 
                size={18} 
                color={isValid ? "white" : (isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)")} 
              />
            )}
            <Text 
              color={isValid ? "white" : (isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)")} 
              fontWeight="600" 
              fontSize={16}
              fontFamily="$body"
            >
              {label}
            </Text>
          </>
        )}
      </XStack>
    </Button>
  )
} 