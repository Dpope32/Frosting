import React from 'react'
import { XStack, Text } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'

interface ErrorMessageProps {
  message: string
  visible: boolean
}

export function ErrorMessage({ message, visible }: ErrorMessageProps) {
  if (!visible || !message) return null
  
  return (
    <XStack
      backgroundColor="$red2"
      borderColor="$red6"
      borderWidth={1}
      br={8}
      px="$3"
      py="$2"
      alignItems="center"
      gap="$2"
    >
      <MaterialIcons name="error" size={18} color="$red10" />
      <Text color="$red10" fontSize={14} fontFamily="$body" flex={1}>
        {message}
      </Text>
    </XStack>
  )
} 