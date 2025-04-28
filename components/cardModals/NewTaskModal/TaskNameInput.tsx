import React, { useRef } from 'react'
import { useColorScheme, Platform } from 'react-native'
import { DebouncedInput } from '../../shared/debouncedInput'
import { isIpad } from '@/utils/deviceUtils'

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
      placeholder="What do you need to do?"
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
        autoCapitalize: 'words',
      } : {})}
      borderWidth={1}
      autoCapitalize="words"
      autoCorrect={true}
      spellCheck={true}
      multiline={false}
      width={'98%'}
      maxLength={100}
      br={12}
      fontFamily="$body"
      px="$2.5"
      height={isIpad() ? 50 : 45}
      fontSize={isIpad() ? 17 : 16}
      fontWeight="400"
      backgroundColor={isDark ? "#121212" : "#fff"}
    />
  )
} 