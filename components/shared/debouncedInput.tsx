import React, { forwardRef, useEffect, useState, useImperativeHandle, useRef, useCallback } from 'react'
import { TextInput, Platform } from 'react-native'
import { Input} from 'tamagui'
import { DebouncedInputProps } from '@/types'
import { useColorScheme } from '@/hooks'
import { isIpad } from '@/utils'

// Define the handle type
export interface DebouncedInputHandle {
  setValue: (newValue: string) => void;
  blur: () => void;
  focus: () => void;
  clear: () => void;
}

export const DebouncedInput = React.forwardRef<DebouncedInputHandle, DebouncedInputProps>(
  ({ value, onDebouncedChange, delay = 500, onChangeText, ...props }, ref) => {
    const colorScheme = useColorScheme();
    const inputRef = useRef<TextInput>(null);
    const isDark = colorScheme === 'dark';
    
    // If delay is 0, render a simple controlled input with ZERO internal state
    if (delay === 0) {
      useImperativeHandle(ref, () => ({
        setValue: (newValue: string) => {
          onChangeText?.(newValue);
        },
        blur: () => {
          inputRef.current?.blur();
        },
        focus: () => {
          inputRef.current?.focus();
        },
        clear: () => {
          onChangeText?.('');
        }
      }));
      
      return (
        <Input
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          theme={isDark ? "dark" : "light"}
          backgroundColor={isDark ? "$gray0" : "white"}
          borderColor={isDark ? "$gray7" : "rgba(0, 0, 0, 0.15)"}
          borderWidth={1}
          fontFamily="$body"
          spellCheck={true}
          fontSize={isIpad() ? 17 : 15}
          maxFontSizeMultiplier={1.4}
          placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
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
          {...props}
          autoCapitalize={props.autoCapitalize || 'sentences'}
        />
      )
    }

    // For delay > 0, use debounced mode with internal state
    const [text, setText] = useState('')
    const timeoutRef = useRef<NodeJS.Timeout>();
    
    // Initialize once and never sync external value again
    useEffect(() => {
      setText(value || '');
    }, []) // Only on mount
    
    useEffect(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => onDebouncedChange(text), delay);
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [text, onDebouncedChange, delay])
    
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
        backgroundColor={isDark ? "$gray0" : "white"}
        borderColor={isDark ? "$gray7" : "rgba(0, 0, 0, 0.15)"}
        borderWidth={1}
        fontFamily="$body"
        spellCheck={true}
        fontSize={isIpad() ? 17 : 15}
        maxFontSizeMultiplier={1.4}
        placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
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
        {...props}
        autoCapitalize={props.autoCapitalize || 'sentences'}
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
    const [text, setText] = useState<string>('')
    const timeoutRef = useRef<NodeJS.Timeout>();
    
    useEffect(() => {
      setText(value || '');
    }, [])
    
    useEffect(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onDebouncedChange(text)
      }, delay);
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [text, onDebouncedChange, delay])
    
    const formatDateWithSlashes = (input: string): string => {
      const cleaned = input.replace(/\D/g, '')
      if (cleaned.length <= 2) {
        return cleaned
      } else if (cleaned.length <= 4) {
        return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
      } else {
        return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`
      }
    }
    
    const handleDateChange = useCallback((input: string) => {
      const formatted = formatDateWithSlashes(input)
      setText(formatted)
    }, [])
    
    return (
      <Input
        ref={ref}
        value={text}
        onChangeText={handleDateChange}
        theme={isDark ? "dark" : "light"}
        borderColor={isDark ? "#3c3c3c" : "#f9f9f9"}
        fontFamily="$body"
        fontSize={isIpad() ? 17 : 15}
        borderWidth={1}
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