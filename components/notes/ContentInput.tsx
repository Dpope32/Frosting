import React, { forwardRef, useState, useEffect } from 'react';
import { TextInput, Platform, StyleSheet, NativeSyntheticEvent, TextInputSelectionChangeEventData } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ContentInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSelectionChange?: (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => void;
  numberOfLines?: number;
  minHeight?: number;
}

export const ContentInput = forwardRef<TextInput, ContentInputProps>(({
  value,
  onChangeText,
  placeholder = "Note content",
  onSelectionChange,
  numberOfLines = 10,
  minHeight = 150
}, ref) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isIOS = Platform.OS === 'ios';
  
  // Track content height for auto-expanding
  const [contentHeight, setContentHeight] = useState(minHeight);
  
  // Local state for the input value
  const [localValue, setLocalValue] = useState(value);
  
  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Handle text changes with local state
  const handleChangeText = (text: string) => {
    setLocalValue(text);
    onChangeText(text);
  };
  
  // Calculate content height
  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    setContentHeight(Math.max(minHeight, height));
  };

  return (
    <TextInput
      ref={ref}
      value={localValue}
      onChangeText={handleChangeText}
      placeholder={placeholder}
      multiline
      autoCapitalize="sentences"
      spellCheck={true}
      autoCorrect={true}
      keyboardType="default"
      textAlignVertical="top"
      returnKeyType="default"
      enablesReturnKeyAutomatically={false}
      blurOnSubmit={false}
      onSelectionChange={onSelectionChange}
      onContentSizeChange={handleContentSizeChange}
      style={[
        styles.input,
        {
          color: isDark ? '#ffffff' : '#000000',
          backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
          borderColor: isDark ? '#3a3a3c' : '#d1d1d6',
          height: contentHeight,
          minHeight: minHeight,
        }
      ]}
      // iOS specific properties for better keyboard experience
      {...(isIOS ? {
        keyboardAppearance: isDark ? 'dark' : 'light',
        scrollEnabled: true,
        contextMenuHidden: false,
        // These help reduce input lag on iOS
        disableFullscreenUI: true,
        maxLength: 100000, // Large enough for notes but prevents excessive entry
      } : {})}
      // Android specific properties
      {...(!isIOS ? {
        textBreakStrategy: 'simple',
      } : {})}
    />
  );
});

ContentInput.displayName = 'ContentInput';

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
  },
});