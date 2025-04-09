import React, { forwardRef, useEffect, useState, useImperativeHandle, useRef } from 'react'
import { TextInput, Platform } from 'react-native'
import { Input } from 'tamagui'
import { DebouncedInputProps } from '@/types/debounce'
import { useColorScheme } from '@/hooks/useColorScheme'

// Define the handle type
export interface DebouncedInputHandle {
  setValue: (newValue: string) => void;
  blur: () => void;
  focus: () => void;
  clear: () => void;
}

export const DebouncedInput = React.forwardRef<DebouncedInputHandle, DebouncedInputProps>(
  ({ value, onDebouncedChange, ...props }, ref) => {
    const [text, setText] = useState(value || '')
    const colorScheme = useColorScheme();
    const inputRef = useRef<TextInput>(null);
    const isDark = colorScheme === 'dark';
    
    useEffect(() => {
      const handler = setTimeout(() => onDebouncedChange(text), 500)
      return () => clearTimeout(handler)
    }, [text, onDebouncedChange])
    
    useEffect(() => {
      setText(value || '')
    }, [value])
    
    // Expose methods via useImperativeHandle
    useImperativeHandle(ref, () => ({
      setValue: (newValue: string) => {
        setText(newValue);
      },
      blur: () => {
        inputRef.current?.blur();
      },
      focus: () => {
        inputRef.current?.focus();
      },
      clear: () => {
        setText('');
      }
    }));
    
    return (
      <Input
        ref={inputRef}
        value={text}
        onChangeText={setText}
        theme={isDark ? "dark" : "light"}
        backgroundColor={isDark ? "$gray2" : "white"}
        borderColor={isDark ? "$gray7" : "$gray4"}
        fontFamily="$body"
        textContentType="none"
        autoComplete="off"
        spellCheck={false}
        maxFontSizeMultiplier={1.4}
        {...(Platform.OS === 'ios' ? {
          scrollEnabled: false,
          selection: undefined,
          contextMenuHidden: false,
          caretHidden: false
        } : {})}
        {...props}
      />
    )
  }
)

export const DateDebouncedInput = forwardRef<TextInput, DebouncedInputProps>(
  (
    { value, onDebouncedChange, delay = 300, ...props },
    ref: React.Ref<TextInput>
  ) => {
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'
    const [text, setText] = useState<string>(value || '')
    
    useEffect(() => {
      const handler = setTimeout(() => {
        if (text !== value) {
          onDebouncedChange(text)
        }
      }, delay)
      return () => clearTimeout(handler)
    }, [text, onDebouncedChange, value])
    
    const formatDateWithSlashes = (input: string): string => {
      const cleaned = input.replace(/\D/g, '')
      // Format with slashes
      if (cleaned.length <= 2) {
        return cleaned
      } else if (cleaned.length <= 4) {
        return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
      } else {
        return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`
      }
    }
    
    const handleDateChange = (input: string) => {
      const formatted = formatDateWithSlashes(input)
      setText(formatted)
    }
    
    return (
      <Input
        ref={ref}
        value={text}
        onChangeText={handleDateChange}
        theme={isDark ? "dark" : "light"}
        backgroundColor={isDark ? "$gray2" : "white"}
        borderColor={isDark ? "$gray7" : "$gray4"}
        fontFamily="$body"
        textContentType="none"
        autoComplete="off"
        spellCheck={false}
        maxFontSizeMultiplier={1.4}
        {...(Platform.OS === 'ios' ? {
          scrollEnabled: false,
          selection: undefined,
          contextMenuHidden: false,
          caretHidden: false
        } : {})}
        {...props}
      />
    )
  }
)