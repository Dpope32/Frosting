import React, { forwardRef, useEffect, useState } from 'react'
import { TextInput } from 'react-native'
import { Input } from 'tamagui'
import { DebouncedInputProps } from '@/types/debounce'  
import { useColorScheme } from '@/hooks/useColorScheme'

export const DebouncedInput = React.forwardRef<any, DebouncedInputProps>(
    ({ value, onDebouncedChange, ...props }, ref) => {
      const [text, setText] = useState(value)
      const colorScheme = useColorScheme();
      const isDark = colorScheme === 'dark';
      useEffect(() => {
        const handler = setTimeout(() => onDebouncedChange(text), 500)
        return () => clearTimeout(handler)
      }, [text, onDebouncedChange])
  
      useEffect(() => {
        setText(value)
      }, [value])
  
      return (
        <Input 
          ref={ref} 
          {...props} 
          value={text} 
          onChangeText={setText}
          {...props}
          theme={isDark ? "dark" : "light"}
          backgroundColor={isDark ? "$gray2" : "white"}
          borderColor={isDark ? "$gray7" : "$gray4"}
          fontFamily="$body"
        />
      )
    }
  )

  export  const DateDebouncedInput = forwardRef<TextInput, DebouncedInputProps>(
    (
      { value, onDebouncedChange, delay = 300, ...props },
      ref: React.Ref<TextInput>
    ) => {
      const colorScheme = useColorScheme()
      const isDark = colorScheme === 'dark'
      const [text, setText] = useState<string>(value)
      
      useEffect(() => {
        const handler = setTimeout(() => {
          if (text !== value) {
            onDebouncedChange(text)
          }
        }, delay)
        return () => clearTimeout(handler)
      }, [text, onDebouncedChange, value])
      
      const formatDateWithSlashes = (input: string): string => {
        // Remove any non-numeric characters
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
          {...props}
          value={text}
          onChangeText={handleDateChange}
          theme={isDark ? "dark" : "light"}
          backgroundColor={isDark ? "$gray2" : "white"}
          borderColor={isDark ? "$gray7" : "$gray4"}
          fontFamily="$body"
        />
      )
    }
  )
