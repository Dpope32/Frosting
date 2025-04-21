import React, { forwardRef, useEffect, useState, useImperativeHandle, useRef } from 'react'
import { TextInput, Platform, ScrollView, Pressable, View } from 'react-native'
import { Input, XStack, YStack, Text } from 'tamagui'
import { DebouncedInputProps } from '@/types/debounce'
import { useColorScheme } from '@/hooks/useColorScheme'
import { TaskCategory } from '@/types/task'
import { getCategoryColor, withOpacity } from '@/utils/styleUtils'
import { Ionicons } from '@expo/vector-icons'

// Define the handle type
export interface DebouncedInputHandle {
  setValue: (newValue: string) => void;
  blur: () => void;
  focus: () => void;
  clear: () => void;
}

// Category selector props
export interface CategorySelectorProps {
  value: string;
  onChange: (category: string) => void;
  categories?: string[];
}

// Category selector component
export const CategorySelector = ({ value, onChange, categories = ['health', 'personal', 'work', 'wealth', 'family', 'bills', 'task'] }: CategorySelectorProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <YStack space="$2">
      <Text fontFamily="$body" fontSize={14}>Category</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
      >
        <XStack space="$2">
          {categories.map((category) => {
            const isSelected = value === category;
            const categoryColor = getCategoryColor(category as TaskCategory);
            
            return (
              <Pressable
                key={category}
                onPress={() => onChange(category)}
                style={{
                  marginRight: 8,
                }}
              >
                <XStack
                  alignItems="center"
                  backgroundColor={isSelected ? withOpacity(categoryColor, 0.2) : isDark ? '#333' : '#f0f0f0'}
                  borderWidth={1}
                  borderColor={isSelected ? categoryColor : isDark ? '#444' : '#ddd'}
                  px={12}
                  py={8}
                  borderRadius={8}
                >
                  <Ionicons
                    name="bookmark"
                    size={14}
                    color={categoryColor}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    fontFamily="$body"
                    color={isSelected ? categoryColor : isDark ? '#ccc' : '#666'}
                    fontSize={14}
                    fontWeight={isSelected ? "600" : "400"}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {category}
                  </Text>
                </XStack>
              </Pressable>
            );
          })}
        </XStack>
      </ScrollView>
    </YStack>
  );
};

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