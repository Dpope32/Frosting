import React from 'react'
import { Platform } from 'react-native'
import { XStack, Button, Text } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'

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
        { name: 'Cable TV' },
        { name: 'Home Insurance' },
        { name: 'Property Tax' },
        { name: 'HOA Fees' },
        { name: 'Home Maintenance' },
        { name: 'Lawn Care' },
        { name: 'Pest Control' }
      ]
    case 'Transportation':
      return [
        { name: 'Car Payment' },
        { name: 'Car Insurance' },
        { name: 'Gas' },
        { name: 'Oil Change' },
        { name: 'Car Maintenance' },
        { name: 'Public Transit Pass' },
        { name: 'Parking' },
        { name: 'Tolls' },
        { name: 'Rideshare Services' },
        { name: 'Vehicle Registration' },
        { name: 'Roadside Assistance' },
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
        { name: 'YouTube Premium' },
        { name: 'DoorDash+' },
        { name: 'Uber One' },
        { name: 'Gym Membership' },
        { name: 'Cloud Storage' },
        { name: 'Microsoft 365' },
        { name: 'Adobe Creative Cloud' },
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
        { name: 'Pet Insurance' },
        { name: 'Disability Insurance' },
        { name: 'Umbrella Insurance' },
        { name: 'Travel Insurance' }
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
      borderRadius={8}
      paddingHorizontal="$4"
      paddingVertical="$1"
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
      scale={1}
      minWidth={0}
      flex={1}
      maxWidth={Platform.OS === 'web' ? 'auto' : '24%'}
    >
      <XStack gap="$1" alignItems="center" justifyContent="center">
        <Ionicons name={style.iconName} size={12} color={style.iconColor} />
        <Text 
          color={style.textColor} 
          fontSize={10} 
          fontWeight="600"
          numberOfLines={1}
        >
          {category}
        </Text>
      </XStack>
    </Button>
  )
}
