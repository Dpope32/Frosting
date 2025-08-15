import React from 'react';
import { XStack, Button, Text, isWeb } from 'tamagui';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isIpad } from '@/utils';
import { useWindowDimensions } from 'react-native';
import { useColorScheme } from '@/hooks';

interface FormattingToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onBullet: () => void;
  onCode: () => void;
  onCheckbox: () => void;
  onAttachImage: () => void;
  onCloseKeyboard: () => void;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  onBold,
  onItalic,
  onUnderline,
  onBullet,
  onCode,
  onCheckbox,
  onAttachImage,
  onCloseKeyboard,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isLandscape = windowWidth > windowHeight;

  const iconColor = isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)";
  const toolbarBg = isDark 
    ? "rgba(20, 20, 20, 0.8)" 
    : "rgba(255, 255, 255, 0.9)";
  const buttonBg = isDark 
    ? "rgba(255, 255, 255, 0.1)" 
    : "rgba(0, 0, 0, 0.05)";
  const buttonBorder = isDark 
    ? "rgba(255, 255, 255, 0.2)" 
    : "rgba(0, 0, 0, 0.1)";
  const buttonPressedBg = isDark 
    ? "rgba(255, 255, 255, 0.2)" 
    : "rgba(0, 0, 0, 0.1)";

  return (
    <>
      <Button
        size="$4"
        circular
        icon={<Text style={{ fontWeight: 'bold', color: iconColor, fontSize: 18 }}>B</Text>} 
        onPress={onBold}
        backgroundColor="transparent"
        pressStyle={{ 
          opacity: 0.6,
          transform: [{ scale: 0.9 }]
        }}
        borderWidth={0}
      />
      <Button
        size="$4"
        circular
        icon={<Text style={{ fontStyle: 'italic', color: iconColor, fontSize: 18 }}>I</Text>} 
        onPress={onItalic}
        backgroundColor="transparent"
        pressStyle={{ 
          opacity: 0.6,
          transform: [{ scale: 0.9 }]
        }}
        borderWidth={0}
      />
      <Button
        size="$4"
        circular
        icon={<Text style={{ textDecorationLine: 'underline', color: iconColor, fontSize: 18 }}>U</Text>} 
        onPress={onUnderline} 
        backgroundColor="transparent"
        pressStyle={{ 
          opacity: 0.6,
          transform: [{ scale: 0.9 }]
        }}
        borderWidth={0}
      />
      <Button
        size="$4"
        circular
        icon={<Ionicons name="list" size={20} color={iconColor} />}
        onPress={onBullet}
        backgroundColor="transparent"
        pressStyle={{ 
          opacity: 0.6,
          transform: [{ scale: 0.9 }]
        }}
        borderWidth={0}
      />
      <Button
        size="$4"
        circular
        icon={<Ionicons name="attach" size={20} color={iconColor} />}
        onPress={onAttachImage}
        backgroundColor="transparent"
        pressStyle={{ 
          opacity: 0.6,
          transform: [{ scale: 0.9 }]
        }}
        borderWidth={0}
      />
      <Button
        size="$4"
        circular
        icon={<Text style={{ fontFamily: '$body', color: iconColor, fontSize: 16 }}>{'<>'}</Text>}
        onPress={onCode}
        backgroundColor="transparent"
        pressStyle={{ 
          opacity: 0.6,
          transform: [{ scale: 0.9 }]
        }}
        borderWidth={0}
      />
      <Button
        size="$4"
        circular
        icon={<Ionicons name="checkbox-outline" size={20} color={iconColor} />}
        onPress={onCheckbox}
        backgroundColor="transparent"
        pressStyle={{ 
          opacity: 0.6,
          transform: [{ scale: 0.9 }]
        }}
        borderWidth={0}
      />
      <Button
        size="$4"
        circular
        icon={<Ionicons name="chevron-down" size={20} color={iconColor} />}
        onPress={onCloseKeyboard}
        backgroundColor="transparent"
        pressStyle={{ 
          opacity: 0.6,
          transform: [{ scale: 0.9 }]
        }}
        borderWidth={0}
      />
    </>
  );
};
