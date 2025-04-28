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
            backgroundColor: isDark ? "rgba(16, 185, 129, 0.10)" : "rgba(6, 95, 70, 0.9)", // emerald-800, 90% transparent
            borderColor: "rgba(16, 185, 129, 0.5)",
            iconName: "water-outline" as const,
            iconColor: isDark ? "#4ade80" : "#fff", 
            textColor: isDark ? "#4ade80" : "#fff"  
          }
        case 'Wealth':
          return {
            backgroundColor: isDark ? "rgba(59, 130, 246, 0.10)" : "rgba(30, 64, 175, 0.9)", // blue-800, 90% transparent
            borderColor: "rgba(59, 130, 246, 0.5)",
            iconName: "cash-outline" as const,
            iconColor: isDark ? "#60a5fa" : "#fff", 
            textColor: isDark ? "#60a5fa" : "#fff"  
          }
        case 'Gym':
          return {
            backgroundColor: isDark ? "rgba(239, 68, 68, 0.10)" : "rgba(153, 27, 27, 0.9)", // red-800, 90% transparent
            borderColor: "rgba(239, 68, 68, 0.5)",
            iconName: "fitness-outline" as const,
            iconColor: isDark ? "#f87171" : "#fff", 
            textColor: isDark ? "#f87171" : "#fff"  
          }
        case 'Self-Care':
          return {
            backgroundColor: isDark ? "rgba(139, 92, 246, 0.10)" : "rgba(91, 33, 182, 0.9)", // purple-800, 90% transparent
            borderColor: "rgba(139, 92, 246, 0.5)",
            iconName: "heart-outline" as const,
            iconColor: isDark ? "#a78bfa" : "#fff", 
            textColor: isDark ? "#a78bfa" : "#fff"  
          }
        default:
          return {
            backgroundColor: isDark ? "rgba(107, 114, 128, 0.10)" : "rgba(55, 65, 81, 0.9)", // gray-700, 90% transparent
            borderColor: "rgba(107, 114, 128, 0.5)",
            iconName: "add-circle-outline" as const,
            iconColor: isDark ? "#d1d5db" : "#fff", 
            textColor: isDark ? "#d1d5db" : "#fff" 
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
        width={width || (isWeb ? 150 : isIpad() ? 140 : 130)}
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