import React from 'react'
import { Platform } from 'react-native'
import { XStack, Button, Text, isWeb } from 'tamagui'

export interface RecommendedBill {
  name: string
  amount?: number
  dueDate?: number
}

export type BillRecommendationCategory = 'Housing' | 'Transportation' | 'Subscriptions' | 'Insurance'

export interface BillRecommendationChipProps {
  category: BillRecommendationCategory
  onPress: () => void
  isDark?: boolean
}

export const getRecommendedBills = (category: BillRecommendationCategory): RecommendedBill[] => {
  switch (category) {
    case 'Housing':
      return [
        { name: 'Rent/Mortgage' },
        { name: 'Electricity' },
        { name: 'Water' },
        { name: 'Gas' },
        { name: 'Internet' },
        { name: 'TV' },
        { name: 'Property Tax' },
        { name: 'Lawn Care' },
        { name: 'Pest Control' }
      ]
    case 'Transportation':
      return [
        { name: 'Car Payment' },
        { name: 'Car Insurance' },
        { name: 'Gas' },
        { name: 'Oil Change' },
        { name: 'Maintenance' },
        { name: 'Parking' },
        { name: 'Car Wash' }
      ]
    case 'Subscriptions':
      return [
        { name: 'Netflix' },
        { name: 'Hulu' },
        { name: 'Disney+' },
        { name: 'HBO Max' },
        { name: 'Amazon Prime' },
        { name: 'Spotify' },
        { name: 'Apple Music' },
        { name: 'YouTube' },
        { name: 'DoorDash' },
        { name: 'Uber' },
        { name: 'Gym' },
        { name: 'PlayStation Plus' },
        { name: 'Xbox Game Pass' }
      ]
    case 'Insurance':
      return [
        { name: 'Health Insurance' },
        { name: 'Dental Insurance' },
        { name: 'Vision Insurance' },
        { name: 'Life Insurance' },
        { name: 'Car Insurance' },
        { name: 'Home/Renters Insurance' },
      ]
    default:
      return []
  }
}

export const BillRecommendationChip: React.FC<BillRecommendationChipProps> = ({ category, onPress, isDark = false }) => {
  const getChipStyle = () => {
    switch (category) {
      case 'Housing':
        return {
          backgroundColor: "rgba(16, 185, 129, 0.15)", // green
          borderColor: "rgba(16, 185, 129, 0.3)",
          iconName: "home-outline" as const,
          iconColor: "#10b981",
          textColor: "#10b981"
        }
      case 'Transportation':
        return {
          backgroundColor: "rgba(59, 130, 246, 0.15)", // blue
          borderColor: "rgba(59, 130, 246, 0.3)",
          iconName: "car-outline" as const,
          iconColor: "#3b82f6",
          textColor: "#3b82f6"
        }
      case 'Subscriptions':
        return {
          backgroundColor: "rgba(139, 92, 246, 0.15)", // purple
          borderColor: "rgba(139, 92, 246, 0.3)",
          iconName: "play-circle-outline" as const,
          iconColor: "#8b5cf6",
          textColor: "#8b5cf6"
        }
      case 'Insurance':
        return {
          backgroundColor: "rgba(239, 68, 68, 0.15)", // red
          borderColor: "rgba(239, 68, 68, 0.3)",
          iconName: "shield-outline" as const,
          iconColor: "#ef4444",
          textColor: "#ef4444"
        }
      default:
        return {
          backgroundColor: "rgba(107, 114, 128, 0.15)", // gray
          borderColor: "rgba(107, 114, 128, 0.3)",
          iconName: "add-circle-outline" as const,
          iconColor: "#6b7280",
          textColor: "#6b7280"
        }
    }
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
          {category}
        </Text>
      </XStack>
    </Button>
  )
}
