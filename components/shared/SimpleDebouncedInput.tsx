import React, { useState, useEffect, useRef, useImperativeHandle } from 'react'
import { Input } from 'tamagui'
import { Platform } from 'react-native'

interface SimpleDebouncedInputProps {
  value: string
  onDebouncedChange: (value: string) => void
  delay?: number
  [key: string]: any
}

export const SimpleDebouncedInput = React.forwardRef<any, SimpleDebouncedInputProps>(
  ({ value, onDebouncedChange, delay = 300, ...props }, ref) => {
    const [localValue, setLocalValue] = useState(value)
    const inputRef = useRef<any>(null)
    
    // Sync external value changes
    useEffect(() => {
      setLocalValue(value)
    }, [value])
    
    // Debounce the callback
    useEffect(() => {
      const timer = setTimeout(() => {
        if (localValue !== value) {
          onDebouncedChange(localValue)
        }
      }, delay)
    }, [localValue, onDebouncedChange, delay])

    return (
      <Input
        ref={ref}
        value={localValue}
        onChangeText={(text) => setLocalValue(text)}
        {...props}
      />
    )
  }
) 