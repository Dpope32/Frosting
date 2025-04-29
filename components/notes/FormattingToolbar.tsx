import React from 'react';
import { XStack, Button, Text, isWeb } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

interface FormattingToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onBullet: () => void;
  onCode: () => void;
  onAttachImage: () => void;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  onBold,
  onItalic,
  onUnderline,
  onBullet,
  onCode,
  onAttachImage,
}) => {
  const colorScheme = useColorScheme();
  const iconColor = "#bbb";

  return (
    <XStack gap="$2" marginBottom={isWeb ? 0 : -16} flexWrap="wrap" >
      <Button
        size="$4"
        circular
        icon={<Text style={{ fontWeight: 'bold', color: iconColor, fontSize: 18 }}>B</Text>} 
        onPress={onBold}
        backgroundColor="transparent"
        pressStyle={{ opacity: 0.7 }}
      />
      <Button
        size="$4"
        circular
        icon={<Text style={{ fontStyle: 'italic', color: iconColor, fontSize: 18 }}>I</Text>} 
        onPress={onItalic}
        backgroundColor="transparent"
        pressStyle={{ opacity: 0.7 }}
      />
      <Button
        size="$4"
        circular
        icon={<Text style={{ textDecorationLine: 'underline', color: iconColor, fontSize: 18 }}>U</Text>} 
        onPress={onUnderline} 
        backgroundColor="transparent"
        pressStyle={{ opacity: 0.7 }}
      />
      <Button
        size="$4"
        circular
        icon={<Ionicons name="list" size={22} color={iconColor} />}
        onPress={onBullet}
        backgroundColor="transparent"
        pressStyle={{ opacity: 0.7 }}
      />
      <Button
        size="$4"
        circular
        icon={<Ionicons name="attach" size={22} color={iconColor} />}
        onPress={onAttachImage}
        backgroundColor="transparent"
        pressStyle={{ opacity: 0.7 }}
      />
      <Button
        size="$4"
        circular
        icon={<Text style={{ fontFamily: '$body', color: iconColor, fontSize: 16 }}>{'<>'}</Text>}
        onPress={onCode}
        backgroundColor="transparent"
        pressStyle={{ opacity: 0.7 }}
      />
    </XStack>
  );
};
