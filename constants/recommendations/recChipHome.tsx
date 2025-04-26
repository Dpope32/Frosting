import React from 'react'
import { Platform } from 'react-native'
import { XStack, Button, Text, isWeb } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import { isIpad } from '@/utils/deviceUtils'
import { RecommendationChipProps } from './TaskRecommendations'


export const RecommendationChipHome: React.FC<RecommendationChipProps> = ({ category, onPress, isDark = false, width }) => {
    const getChipStyle = () => {
      switch (category) {
        case 'Cleaning':
          return {
            backgroundColor: isDark ? "rgba(16, 185, 129, 0.10)" : "rgba(16, 185, 129, 0.50)", // green
            borderColor: "rgba(16, 185, 129, 0.5)",
            iconName: "water-outline" as const,
            iconColor: isDark ? "#4ade80" : "#047857", 
            textColor: isDark ? "#4ade80" : "#047857"  
          }
        case 'Wealth':
          return {
            backgroundColor: isDark ? "rgba(59, 130, 246, 0.10)" : "rgba(59, 130, 246, 0.50)", // blue
            borderColor: "rgba(59, 130, 246, 0.5)",
            iconName: "cash-outline" as const,
            iconColor: isDark ? "#60a5fa" : "#1e40af", 
            textColor: isDark ? "#60a5fa" : "#1e40af"  
          }
        case 'Gym':
          return {
            backgroundColor: isDark ? "rgba(239, 68, 68, 0.10)" : "rgba(239, 68, 68, 0.50)", // red
            borderColor: "rgba(239, 68, 68, 0.5)",
            iconName: "fitness-outline" as const,
            iconColor: isDark ? "#f87171" : "#b91c1c", 
            textColor: isDark ? "#f87171" : "#b91c1c"  
          }
        case 'Self-Care':
          return {
            backgroundColor: isDark ? "rgba(139, 92, 246, 0.10)" : "rgba(139, 92, 246, 0.50)", // purple
            borderColor: "rgba(139, 92, 246, 0.5)",
            iconName: "heart-outline" as const,
            iconColor: isDark ? "#a78bfa" : "#5b21b6", 
            textColor: isDark ? "#a78bfa" : "#5b21b6"  
          }
        default:
          return {
            backgroundColor: isDark ? "rgba(107, 114, 128, 0.10)" : "rgba(107, 114, 128, 0.50)", // gray
            borderColor: "rgba(107, 114, 128, 0.5)",
            iconName: "add-circle-outline" as const,
            iconColor: isDark ? "#d1d5db" : "#374151", 
            textColor: isDark ? "#d1d5db" : "#374151" 
          }
      }
    }
  
    const style = getChipStyle()
  
    return (
      <Button
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
        width={width || (isWeb ? 150 : isIpad() ? 130 : 122)}
        marginBottom={isWeb ? 0 : '$1'}
      >
        <XStack gap={isWeb ? '$2' : '$1'} alignItems="center" justifyContent="center" >
          <Ionicons name={style.iconName} size={14} color={style.iconColor} />
          <Text 
            color={style.textColor} 
            fontFamily="$body" 
            fontSize={isWeb ? 13 : 12}  
            fontWeight="500" 
            numberOfLines={1}
          > 
            {category}  
          </Text>
        </XStack>
      </Button>
    )
  }