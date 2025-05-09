import React, { forwardRef, useState, useEffect } from 'react';
import { TextInput, Platform, StyleSheet, NativeSyntheticEvent, TextInputSelectionChangeEventData, View, Keyboard } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { isIpad } from '@/utils/deviceUtils';

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
  placeholder = "Start typing...",
  onSelectionChange,
  minHeight = isIpad() ? 500 : 300
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
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}' fill-opacity='1'/%3E%3C/svg%3E") !important;
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

  // Handle key press to ensure enter/return creates a new line
  const handleKeyPress = (event: any) => {
    // For web, we don't need to do anything special as enter/return naturally creates a new line
    if (isWeb) return;
    
    // For mobile, we need to ensure the keyboard doesn't dismiss on enter/return
    if (event.nativeEvent.key === 'Enter') {
      // Prevent default behavior which might dismiss the keyboard
      event.preventDefault();
    }
  };

  // Handle submit to prevent keyboard from dismissing
  const handleSubmitEditing = () => {
    // Prevent the keyboard from dismissing
    return false;
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={ref}
        value={localValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        multiline
        blurOnSubmit={false}
        autoCapitalize="sentences"
        spellCheck={true}
        enterKeyHint="next"
        onFocus={handleFocus}
        cursorColor={isDark ? '#4a8fff' : '#2271b1'}
        onBlur={handleBlur}
        autoCorrect={true}
        keyboardType="default"
        placeholderTextColor={isDark ? '#555555' : '#ccc'}
        textAlignVertical="top"
        {...(isWeb
          ? { returnKeyType: 'none', submitBehavior: 'submit' }
          : {}
        )}
        enablesReturnKeyAutomatically={false}
        onSubmitEditing={handleSubmitEditing}
        onSelectionChange={onSelectionChange}
        onContentSizeChange={handleContentSizeChange}
        onKeyPress={handleKeyPress}
        style={[
          styles.input,
          {
            color: isDark ? '#fcfcfc' : '#000000',
            borderColor: isFocused 
              ? isDark ? '#4a8fff' : '#2271b1' 
              : isDark ? '#3a3a3c' : '#d1d1d6',
            height: isWeb ? minHeight : contentHeight,
            minHeight: minHeight,
            fontSize: isWeb ? isIpad() ? 20 : 18 : 18,
            fontFamily: "$body",
            marginVertical: isIpad() ? 8 : 5,
          }
        ]}
        {...(isIOS ? {
          keyboardAppearance: isDark ? 'dark' : 'light',
          scrollEnabled: true,
          contextMenuHidden: false,
          disableFullscreenUI: true,
          maxLength: 100000,
          textContentType: 'none',
          caretColor: isDark ? '#4a8fff' : '#2271b1',
          selectionColor: isDark ? '#4a8fff' : '#2271b1',
          selectionHandleColor: isDark ? '#4a8fff' : '#2271b1',
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
    padding: 8,
    borderRadius: 8,
    marginVertical: 0,
    lineHeight: 22,
  }
});