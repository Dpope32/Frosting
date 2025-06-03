import React from 'react';
import { XStack, Button, Text, isWeb, View } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { isIpad } from '@/utils';

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
  const iconColor = "#bbb";

  return (
    <XStack width="100%" marginLeft={-8} gap={isIpad() ? "$1.5" : "$0"} marginBottom={isIpad() ? 16 : 0} flexWrap="nowrap" alignItems="center" justifyContent="space-between" alignSelf="center">
      <Button
        size="$4"
        circular
        icon={<Text style={{ fontWeight: 'bold', color: iconColor, fontSize: 18 }}>B</Text>} 
        onPress={onBold}
        backgroundColor="transparent"
        pressStyle={{ opacity: 0.7 }}
      />
      <View style={{ width: 1, height: 24, backgroundColor: '#222', opacity: 0.4, marginHorizontal: 1 }} />
      <Button
        size="$4"
        circular
        icon={<Text style={{ fontStyle: 'italic', color: iconColor, fontSize: 18 }}>I</Text>} 
        onPress={onItalic}
        backgroundColor="transparent"
        pressStyle={{ opacity: 0.7 }}
      />
      <View style={{ width: 1, height: 24, backgroundColor: '#222', opacity: 0.4, marginHorizontal: 1 }} />
      <Button
        size="$4"
        circular
        icon={<Text style={{ textDecorationLine: 'underline', color: iconColor, fontSize: 18 }}>U</Text>} 
        onPress={onUnderline} 
        backgroundColor="transparent"
        pressStyle={{ opacity: 0.7 }}
      />
      <View style={{ width: 1, height: 24, backgroundColor: '#222', opacity: 0.4, marginHorizontal: 1 }} />
      <Button
        size="$4"
        circular
        icon={<Ionicons name="list" size={22} color={iconColor} />}
        onPress={onBullet}
        backgroundColor="transparent"
        pressStyle={{ opacity: 0.7 }}
      />
      <View style={{ width: 1, height: 24, backgroundColor: '#222', opacity: 0.4, marginHorizontal: 1 }} />
      <Button
        size="$4"
        circular
        icon={<Ionicons name="attach" size={22} color={iconColor} />}
        onPress={onAttachImage}
        backgroundColor="transparent"
        pressStyle={{ opacity: 0.7 }}
      />
      <View style={{ width: 1, height: 24, backgroundColor: '#222', opacity: 0.4, marginHorizontal: 1 }} />
      <Button
        size="$4"
        circular
        icon={<Text style={{ fontFamily: '$body', color: iconColor, fontSize: 16 }}>{'<>'}</Text>}
        onPress={onCode}
        backgroundColor="transparent"
        pressStyle={{ opacity: 0.7 }}
      />
      <View style={{ width: 1, height: 24, backgroundColor: '#222', opacity: 0.4, marginHorizontal: 1 }} />
      <Button
        size="$4"
        circular
        icon={<Ionicons name="checkbox-outline" size={22} color={iconColor} />}
        onPress={onCheckbox}
        backgroundColor="transparent"
        pressStyle={{ opacity: 0.7 }}
      />
      <View style={{ width: 1, height: 24, backgroundColor: '#222', opacity: 0.4, marginHorizontal: 1 }} />
      <Button
        size="$4"
        circular
        icon={<Ionicons name="chevron-down" size={22} color={iconColor} />}
        onPress={onCloseKeyboard}
        backgroundColor="transparent"
        pressStyle={{ opacity: 0.7 }}
      />
    </XStack>
  );
};
