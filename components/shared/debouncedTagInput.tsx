import React, {  useEffect, useState, useImperativeHandle, useRef } from 'react'
import { TextInput, Platform } from 'react-native'
import { Input} from 'tamagui'
import { DebouncedInputProps } from '@/types'
import { useColorScheme } from '@/hooks'

// Define the handle type
export interface DebouncedTagInputHandle {
  setValue: (newValue: string) => void;
  blur: () => void;
  focus: () => void;
  clear: () => void;
}

// Custom version of DebouncedInput that doesn't render its own X icon
export const DebouncedTagInput = React.forwardRef<DebouncedTagInputHandle, DebouncedInputProps>(
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
        spellCheck={false}
        maxFontSizeMultiplier={1.4}
        clearButtonMode="never" 
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
        autoCapitalize={props.autoCapitalize || 'none'}
      />
    )
  }
)
