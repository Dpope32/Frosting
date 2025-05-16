import React from 'react'
import { Platform } from 'react-native'
import { XStack, Button, Text, isWeb } from 'tamagui'

export interface NoteExampleChipProps {
  title: string
  onPress: () => void
  index: number
}

export const NoteExampleChip: React.FC<NoteExampleChipProps> = ({ 
  title, 
  onPress, 
  index,
}) => {
  const getChipStyle = () => {
    const styles = [
      {
        backgroundColor: "rgba(16, 185, 129, 0.15)", // green
        borderColor: "rgba(16, 185, 129, 0.3)",
        textColor: "#10b981"
      },
      {
        backgroundColor: "rgba(59, 130, 246, 0.15)", // blue
        borderColor: "rgba(59, 130, 246, 0.3)",
        textColor: "#3b82f6"
      },
      {
        backgroundColor: "rgba(139, 92, 246, 0.15)", // purple
        borderColor: "rgba(139, 92, 246, 0.3)",
        textColor: "#8b5cf6"
      },
      {
        backgroundColor: "rgba(239, 68, 68, 0.15)", // red
        borderColor: "rgba(239, 68, 68, 0.3)",
        textColor: "#ef4444"
      }
    ];

    return styles[index % styles.length];
  }

  const style = getChipStyle()

  return (
    <Button
      backgroundColor={style.backgroundColor}
      borderColor={style.borderColor}
      borderWidth={1}
      br={8}
      px={isWeb ? "$4" : "$4"}
      py="$1"
      fontFamily="$body"
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
      scale={1}
      minWidth={0}
      flex={Platform.OS === 'web' ? 1 : 0}
      width={Platform.OS === 'web' ? 'auto' : '48%'}
      marginBottom={Platform.OS === 'web' ? 0 : '$2'}
    >
      <XStack gap="$1" alignItems="center" justifyContent="center">
        <Text 
          color={style.textColor} 
          fontSize={12} 
          fontWeight="600"
          fontFamily="$body"
          numberOfLines={1}
        >
          {title}
        </Text>
      </XStack>
    </Button>
  )
} 