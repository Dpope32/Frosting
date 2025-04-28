import React, { useRef, useEffect } from 'react'
import { useColorScheme, Platform } from 'react-native'
import { DebouncedInput } from '../../shared/debouncedInput'
import { isIpad } from '@/utils/deviceUtils'
import { useUserStore } from '@/store/UserStore'

interface TaskNameInputProps {
  value: string
  onChange: (text: string) => void
}

export function TaskNameInput({ value, onChange }: TaskNameInputProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const inputRef = useRef<any>(null)
  const username = useUserStore((state) => state.preferences.username)
  
  useEffect(() => {
    // Auto-focus after a short delay to allow animations to complete
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <DebouncedInput
      ref={inputRef}
      placeholder={`What do you need to do ${username}?`}
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
        textContentType: 'none',
        autoComplete: 'off'
      } : {
        textContentType: 'none',
        autoComplete: 'off'
      })}
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
      fontSize={isIpad() ? 17 : 15}
      fontWeight="400"
      backgroundColor={isDark ? "#121212" : "#fff"}
    />
  )
} 