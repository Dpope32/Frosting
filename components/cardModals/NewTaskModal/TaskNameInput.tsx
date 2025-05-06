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
    }, 1000)

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
      width={'99%'}
      maxLength={100}
      br={12}
      fontFamily="$body"
      px="$2.5"
      height={isIpad() ? 50 : 42}
      fontSize={isIpad() ? 17 : 15}
      fontWeight="500"
      borderColor={isDark ? "#090909" : "rgba(240, 240, 240, 0.9)"}
      borderRadius={12}
      shadowColor={isDark ? "#090909" : "rgba(240, 240, 240, 0.9)"}
      shadowOffset={{ width: 0, height: 1 }}
      shadowOpacity={0.1}
      shadowRadius={2}
      elevation={2}
      backgroundColor={isDark ? "#121212" : "rgba(240, 240, 240, 0.9)"}
    />
  )
} 