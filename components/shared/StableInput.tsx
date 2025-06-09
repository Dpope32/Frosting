import React from 'react'
import { TextInput, View } from 'react-native'
import { useColorScheme } from '@/hooks'
import { isIpad } from '@/utils'

interface StableInputProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  style?: any
  containerStyle?: any
  [key: string]: any
}

export const StableInput = React.forwardRef<TextInput, StableInputProps>(
  ({ value, onChangeText, placeholder, style, containerStyle, ...props }, ref) => {
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'
    
    return (
      <View
        style={[
          {
            minHeight: 44,
            borderWidth: 2,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.00)',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
          },
          containerStyle
        ]}
      >
        <TextInput
          ref={ref}
          placeholder={placeholder}
          placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
          value={value}
          onChangeText={onChangeText}
          style={[
            {
              fontSize: isIpad() ? 17 : 15,
              fontFamily: 'System',
              color: isDark ? '#fff' : '#000',
              minHeight: 20,
              textAlignVertical: 'center',
              padding: 0,
              margin: 0,
            },
            style
          ]}
          multiline={false}
          textContentType="none"
          autoComplete="off"
        />
      </View>
    )
  }
) 