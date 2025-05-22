import React from 'react'
import { XStack, Text, Input, useTheme } from 'tamagui'
import { useColorScheme, TextInput } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

interface StockQuantityInputProps {
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  isEditMode: boolean
  setIsEditMode: (value: boolean) => void
  inputRef: React.RefObject<TextInput>
  primaryColor: string
  isDark?: boolean
}

export function StockQuantityInput({
  value,
  onChange,
  onFocus,
  onBlur,
  isEditMode,
  setIsEditMode,
  inputRef,
  primaryColor,
  isDark = false
}: StockQuantityInputProps) {
  const colorScheme = useColorScheme()
  const isSystemDark = colorScheme === 'dark'
  const darkMode = isDark || isSystemDark
  const theme = useTheme()

  const inputStyle = {
    backgroundColor: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
    borderColor: darkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
    borderWidth: 1,
    color: "$color",
    fontSize: 16,
    height: 48,
    px: "$3",
    py: "$3",
    br: 12,
  }

  if (isEditMode) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChangeText={onChange}
        placeholder="Enter number of shares"
        placeholderTextColor={darkMode ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)"}
        keyboardType="numeric"
        fontFamily="$body"
        onFocus={onFocus}
        onBlur={onBlur}
        {...inputStyle}
      />
    )
  }

  return (
    <XStack 
      alignItems="center" 
      justifyContent="space-between"
      backgroundColor={darkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)"}
      borderColor={darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
      borderWidth={1}
      br={12}
      px="$3"
      py="$3"
      height={48}
      pressStyle={{ opacity: 0.8 }}
      onPress={() => {
        setIsEditMode(true)
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
      }}
    >
      <Text 
        color={value ? "$color" : (darkMode ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)")}
        fontSize={16} 
        fontFamily="$body"
      >
        {value ? `${value} shares` : 'Enter number of shares'}
      </Text>
      <MaterialIcons 
        name="edit" 
        size={20} 
        color={darkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"} 
      />
    </XStack>
  )
} 