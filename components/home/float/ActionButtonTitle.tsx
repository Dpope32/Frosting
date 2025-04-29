import React from 'react'
import { Platform } from 'react-native'
import { XStack, Button, Text, isWeb } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { isIpad } from '@/utils/deviceUtils'

interface ActionButtonTitleProps {
  onPress: () => void;
  isDark: boolean;
  primaryColor: string;
  icon: string;
  text: string;
}

const getActionStyle = (actionType: string, isDark: boolean) => {
  switch (actionType) {
    default:
      return {
        backgroundColor: isDark ? "rgba(107, 114, 128, 0.10)" : "rgba(55, 65, 81, 0.9)",
        borderColor: "rgba(107, 114, 128, 0.5)",
        iconColor: isDark ? "#d1d5db" : "#fff",
        textColor: isDark ? "#d1d5db" : "#fff"
      }
  }
}

export const ActionButtonTitle: React.FC<ActionButtonTitleProps> = ({ 
  onPress, 
  isDark, 
  icon,
  text
}) => {
  const style = getActionStyle(text, isDark);
  
  return (
    <Button
      key={`action-${text}`}
      fontFamily="$body"
      backgroundColor="transparent"
      borderWidth={1}
      br={8}
      px={Platform.OS === 'web' ? '$2' : '$1'}
      py="$1"
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
      scale={1}
      minWidth={0}
      flex={isWeb ? 1 : 0}
      width={isWeb ? 150 : isIpad() ? 140 : 130}
      marginLeft={-32}
    >
      <XStack gap={isWeb ? '$2' : '$1'} alignItems="center" justifyContent="center">
        <MaterialIcons name={icon as any} size={isIpad() ? 26 : 20} color={style.iconColor} />
        <Text 
          color={style.textColor} 
          fontFamily="$heading" 
          fontSize={isWeb ? 24 : 20}  
          fontWeight="500" 
          numberOfLines={1}
        > 
          {text}
        </Text>
      </XStack>
    </Button>
  )
} 