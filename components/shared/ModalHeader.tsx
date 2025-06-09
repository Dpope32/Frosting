import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { Text, XStack, isWeb } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { isIpad } from '@/utils'
import { debouncedBack } from '@/utils'

interface ModalHeaderProps {
  title: string
  isDark: boolean
  onBack?: () => void
}

export function ModalHeader({ title, isDark, onBack = debouncedBack }: ModalHeaderProps) {
  return (
    <XStack alignItems="center" justifyContent="center" position="relative">
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={22} color={isDark ? '#fff' : '#000'} />
      </TouchableOpacity>
      <Text
        fontSize={isWeb ? 24 : isIpad() ? 22 : 20}
        fontWeight="700"
        color={isDark ? '#fff' : '#000'}
        style={{ textAlign: 'center', flex: 1 }}
        fontFamily="$body"
      >
        {title}
      </Text>
    </XStack>
  )
}

const styles = StyleSheet.create({
  backButton: { position: 'absolute', left: 0, padding: 8, zIndex: 1 },
})
