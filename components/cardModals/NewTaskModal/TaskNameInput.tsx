import React, { useRef } from 'react'
import { useColorScheme, Platform } from 'react-native'
import { DebouncedInput } from '../../shared/debouncedInput'

interface TaskNameInputProps {
  value: string
  onChange: (text: string) => void
}

export function TaskNameInput({ value, onChange }: TaskNameInputProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const inputRef = useRef<any>(null)

  return (
    <DebouncedInput
      ref={inputRef}
      placeholder="Enter task name"
      value={value}
      onDebouncedChange={onChange}
      onFocus={(e) => {
        if (Platform.OS === 'web') {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      {...(Platform.OS === 'ios' ? {
        scrollEnabled: false,
        selection: undefined,
        contextMenuHidden: false,
        caretHidden: false,
        autoCapitalize: 'words'
      } : {})}
      borderWidth={1}
      autoCapitalize="words"
      autoCorrect={true}
      spellCheck={true}
      multiline={false}
      maxLength={100}
      br={12}
      fontFamily="$body"
      px="$3"
      height={50}
      fontSize={17}
      fontWeight="400"
    />
  )
} 