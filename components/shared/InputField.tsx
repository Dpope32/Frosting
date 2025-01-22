import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { View, TextInput, Text, StyleSheet, Keyboard, Platform } from 'react-native';
import Colors from '@/constants/Colors';

interface InputFieldProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  containerStyle?: any;
  inputStyle?: any;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  returnKeyType?: 'done' | 'next' | 'search' | 'send' | 'go';
  onSubmitEditing?: () => void;
  onFocus?: () => void;
  label?: string;
  isEmail?: boolean;
}

export type InputFieldRef = {
  focus: () => void;
  blur: () => void;
};

const InputField = forwardRef<InputFieldRef, InputFieldProps>(({
  placeholder,
  value,
  onChangeText,
  containerStyle,
  inputStyle,
  error,
  disabled,
  secureTextEntry,
  autoCapitalize = 'none',
  autoCorrect = false,
  keyboardType = 'default',
  returnKeyType,
  onSubmitEditing,
  onFocus,
  label,
  isEmail
}, ref) => {
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur()
  }));

  const handleChangeText = (text: string) => {
    if (isEmail) {
      onChangeText(text.trim());
    } else {
      onChangeText(text);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[
          styles.label,
          disabled && styles.disabledLabel
        ]}>
          {label}
        </Text>
      )}
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          inputStyle,
          error && styles.inputError,
          disabled && styles.inputDisabled
        ]}
        placeholder={placeholder}
        placeholderTextColor={Colors.placeholder}
        value={value}
        onChangeText={handleChangeText}
        editable={!disabled}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        onFocus={onFocus}
        blurOnSubmit={returnKeyType === 'done'}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: Colors.light,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  disabledLabel: {
    color: Colors.placeholder,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    color: Colors.light,
    borderColor: Colors.inputBorder,
    borderWidth: 2,
    borderRadius: 10,
    padding: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    width: '100%',
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputDisabled: {
    backgroundColor: Colors.disabled,
    borderColor: Colors.inputBorder,
    color: Colors.placeholder,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 4,
  },
});

export default InputField;
