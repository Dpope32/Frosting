import React from 'react';
import { XStack, Button, useTheme, Text, isWeb } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

interface FormattingToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onBullet: () => void;
  onAttachImage: () => void;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  onBold,
  onItalic,
  onBullet,
  onAttachImage,
}) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? "#ccc" : "#ccc";

  return (
    <XStack gap="$6" marginBottom={isWeb ? 0 : -10} >
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
    </XStack>
  );
}; 