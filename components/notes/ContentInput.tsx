import React, { forwardRef, useState, useEffect } from 'react';
import { TextInput, Platform, StyleSheet, NativeSyntheticEvent, TextInputSelectionChangeEventData, View } from 'react-native';
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
  minHeight = 300
}, ref) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';
  const [isFocused, setIsFocused] = useState(false);
  const [contentHeight, setContentHeight] = useState(minHeight);
  
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Apply web-specific styles via CSS for better font rendering and text editing
  useEffect(() => {
    if (isWeb) {
      const styleTag = document.createElement('style');
      styleTag.innerHTML = `
        .content-input {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          outline: none !important;
          resize: none !important;
          overflow-y: auto !important;
          transition: border-color 0.2s ease-in-out !important;
          box-sizing: border-box !important;
          line-height: 1.6 !important;
          padding: 16px !important;
          border-radius: 8px !important;
          font-weight: 400 !important;
        }
        .content-input:focus {
          border-color: ${isDark ? '#4a8fff' : '#2271b1'} !important;
          box-shadow: 0 0 0 1px ${isDark ? 'rgba(74, 143, 255, 0.4)' : 'rgba(34, 113, 177, 0.25)'} !important;
        }
        .content-input:focus-visible {
          outline: none !important;
        }
        .content-input::placeholder {
          color: ${isDark ? '#555555' : '#888888'} !important;
          opacity: 0.8 !important;
        }
        /* Adjusts the scrollbar for Webkit browsers */
        .content-input::-webkit-scrollbar {
          width: 8px !important;
        }
        .content-input::-webkit-scrollbar-track {
          background: ${isDark ? '#1e1e1e' : '#f1f1f1'} !important;
          border-radius: 4px !important;
        }
        .content-input::-webkit-scrollbar-thumb {
          background: ${isDark ? '#444' : '#c1c1c1'} !important;
          border-radius: 4px !important;
        }
        .content-input::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? '#555' : '#a1a1a1'} !important;
        }
      `;
      document.head.appendChild(styleTag);
      
      return () => {
        document.head.removeChild(styleTag);
      };
    }
  }, [isWeb, isDark]);
  
  const handleChangeText = (text: string) => {
    setLocalValue(text);
    onChangeText(text);
  };
  
  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    setContentHeight(Math.max(minHeight, height));
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={ref}
        value={localValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        multiline
        autoCapitalize="sentences"
        spellCheck={true}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoCorrect={true}
        keyboardType="default"
        placeholderTextColor={isDark ? '#555555' : '#888888'}
        textAlignVertical="top"
        returnKeyType="default"
        enablesReturnKeyAutomatically={false}
        submitBehavior={isWeb ? 'submit' : 'blurAndSubmit'}
        onSelectionChange={onSelectionChange}
        onContentSizeChange={handleContentSizeChange}
        className={isWeb ? "content-input" : undefined}
        style={[
          styles.input,
          {
            color: isDark ? '#fcfcfc' : '#000000',
            backgroundColor: isDark ? '#1a1a1c' : '#ffffff',
            borderColor: isFocused 
              ? isDark ? '#4a8fff' : '#2271b1' 
              : isDark ? '#3a3a3c' : '#d1d1d6',
            height: isWeb ? minHeight : contentHeight,
            minHeight: minHeight,
            fontSize: isWeb ? 16 : 16,
            lineHeight: isWeb ? 24 : 22,
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
    </View>
  );
});

ContentInput.displayName = 'ContentInput';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  input: {
    width: '100%',
    fontSize: 16,
    fontFamily: Platform.select({
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      ios: 'System',
      android: 'Roboto',
      default: 'System'
    }),
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
    lineHeight: 22,
  }
});