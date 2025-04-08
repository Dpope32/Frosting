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
  
  const [contentHeight, setContentHeight] = useState(minHeight);
  
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  const handleChangeText = (text: string) => {
    setLocalValue(text);
    onChangeText(text);
  };
  
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
      {...(isIOS ? {
        keyboardAppearance: isDark ? 'dark' : 'light',
        scrollEnabled: true,
        contextMenuHidden: false,
        disableFullscreenUI: true,
        maxLength: 100000,
      } : {})}
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