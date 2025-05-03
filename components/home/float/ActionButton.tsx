import React from 'react'
import { Platform } from 'react-native'
import { XStack, Button, Text, isWeb } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { isIpad } from '@/utils/deviceUtils'

interface ActionButtonProps {
  onPress: () => void;
  isDark: boolean;
  primaryColor: string;
  icon: string;
  text: string;
}

const getActionStyle = (actionType: string, isDark: boolean) => {
  switch (actionType) {
    case 'Contact':
      return {
        backgroundColor: isDark ? "rgba(251,146,60,0.10)" : "rgba(251,146,60,0.9)",
        borderColor: "rgba(251,146,60,0.5)",
        iconColor: isDark ? "#fb923c" : "#fff",
        textColor: isDark ? "#fb923c" : "#fff"
      }
    case 'Password':
      return {
        backgroundColor: isDark ? "rgba(236,72,153,0.10)" : "rgba(236,72,153,0.9)",
        borderColor: "rgba(236,72,153,0.5)",
        iconColor: isDark ? "#ec4899" : "#fff",
        textColor: isDark ? "#ec4899" : "#fff"
      }
    case 'Stock':
      return {
        backgroundColor: isDark ? "rgba(34,197,94,0.10)" : "rgba(34,197,94,0.9)",
        borderColor: "rgba(34,197,94,0.5)",
        iconColor: isDark ? "#22c55e" : "#fff",
        textColor: isDark ? "#22c55e" : "#fff"
      }
    case 'Habit':
      return {
        backgroundColor: isDark ? "rgba(59, 130, 246, 0.10)" : "rgba(30, 64, 175, 0.9)",
        borderColor: "rgba(59, 130, 246, 0.5)",
        iconColor: isDark ? "#60a5fa" : "#fff",
        textColor: isDark ? "#60a5fa" : "#fff"
      }
    case 'Note':
      return {
        backgroundColor: isDark ? "rgba(234, 179, 8, 0.10)" : "rgba(133, 77, 14, 0.9)",
        borderColor: "rgba(234, 179, 8, 0.5)",
        iconColor: isDark ? "#facc15" : "#fff",
        textColor: isDark ? "#facc15" : "#fff"
      }
    case 'Bill':
      return {
        backgroundColor: isDark ? "rgba(239, 68, 68, 0.10)" : "rgba(153, 27, 27, 0.9)",
        borderColor: "rgba(239, 68, 68, 0.5)",
        iconColor: isDark ? "#f87171" : "#fff",
        textColor: isDark ? "#f87171" : "#fff"
      }
    case 'Event':
      return {
        backgroundColor: isDark ? "rgba(139, 92, 246, 0.10)" : "rgba(91, 33, 182, 0.9)",
        borderColor: "rgba(139, 92, 246, 0.5)",
        iconColor: isDark ? "#a78bfa" : "#fff",
        textColor: isDark ? "#a78bfa" : "#fff"
      }
    case 'ToDo':
      return {
        backgroundColor: isDark ? "rgba(6, 182, 212, 0.10)" : "rgba(14, 116, 144, 0.9)",
        borderColor: "rgba(6, 182, 212, 0.5)",
        iconColor: isDark ? "#22d3ee" : "#fff",
        textColor: isDark ? "#22d3ee" : "#fff"
      }
    default:
      return {
        backgroundColor: isDark ? "rgba(107, 114, 128, 0.10)" : "rgba(55, 65, 81, 0.9)",
        borderColor: "rgba(107, 114, 128, 0.5)",
        iconColor: isDark ? "#d1d5db" : "#fff",
        textColor: isDark ? "#d1d5db" : "#fff"
      }
  }
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  onPress, 
  isDark, 
  icon,
  text
}) => {
  const style = getActionStyle(text, isDark);
  
  return (
    <Button
      key={`action-${text}`}
      backgroundColor={style.backgroundColor}
      borderColor={style.borderColor}
      fontFamily="$body"
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
          fontFamily="$body" 
          fontSize={isWeb ? isIpad() ? 15 : 14 : 13}  
          fontWeight="500" 
          numberOfLines={1}
        > 
          {text}
        </Text>
      </XStack>
    </Button>
  )
} 