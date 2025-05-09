import React from 'react'
import { Platform } from 'react-native'
import { XStack, Button, Text, isWeb } from 'tamagui'

export interface ProjectExampleChipProps {
  title: string
  onPress: () => void
  isDark?: boolean
  index: number
}

export const ProjectExampleChip: React.FC<ProjectExampleChipProps> = ({ 
  title, 
  onPress, 
  isDark = false,
  index
}) => {
  const getChipStyle = () => {
    const styles = [
      {
        backgroundColor: "rgba(16, 185, 129, 0.09)", // green
        borderColor: "rgba(16, 185, 129, 0.3)",
        textColor: "#10b981"
      },
      {
        backgroundColor: "rgba(59, 130, 246, 0.15)", // blue
        borderColor: "rgba(59, 130, 246, 0.3)",
        textColor: "#3b82f6"
      },
      {
        backgroundColor: "rgba(240, 98, 10, 0.14)", // amber/orange
        borderColor: "rgba(245, 116, 11, 0.59)",
        textColor: "rgba(252, 144, 81, 0.95)"
      },
      {
        backgroundColor: "rgba(234, 179, 8, 0.15)", // yellow
        borderColor: "rgba(234, 178, 8, 0.73)",
        textColor: "rgba(153, 133, 19, 0.89)"
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