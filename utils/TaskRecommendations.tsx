import React from 'react'
import { Platform } from 'react-native'
import { XStack, Button, Text } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import { RecurrencePattern, TaskCategory, WeekDay } from '@/store/ToDo'

export interface RecommendedTask {
  name: string
  recurrencePattern: RecurrencePattern
  category: TaskCategory
  priority: 'low' | 'medium' | 'high'
  time?: string
  schedule: WeekDay[]
}

export type RecommendationCategory = 'Cleaning' | 'Financial' | 'Gym' | 'Self-Care'

export interface RecommendationChipProps {
  category: RecommendationCategory
  onPress: () => void
  isDark?: boolean
}

export const getRecommendedTasks = (category: RecommendationCategory): RecommendedTask[] => {
  switch (category) {
    case 'Cleaning':
      return [
        { name: 'Wipe down screens and electronics', recurrencePattern: 'weekly', category: 'personal', priority: 'medium', schedule: ['sunday'] },
        { name: 'Wash bed sheets and pillowcases', recurrencePattern: 'weekly', category: 'personal', priority: 'medium', schedule: ['saturday'] },
        { name: 'Clean bathroom surfaces', recurrencePattern: 'weekly', category: 'personal', priority: 'high', schedule: ['sunday'] },
        { name: 'Vacuum living areas', recurrencePattern: 'weekly', category: 'personal', priority: 'medium', schedule: ['saturday'] },
        { name: 'Dust furniture and shelves', recurrencePattern: 'weekly', category: 'personal', priority: 'low', schedule: ['sunday'] },
        { name: 'Deep clean refrigerator', recurrencePattern: 'monthly', category: 'personal', priority: 'medium', schedule: ['saturday'] },
        { name: 'Clean oven and stovetop', recurrencePattern: 'monthly', category: 'personal', priority: 'medium', schedule: ['sunday'] },
        { name: 'Wash windows', recurrencePattern: 'monthly', category: 'personal', priority: 'low', schedule: ['saturday'] },
        { name: 'Clean air vents and replace filters', recurrencePattern: 'monthly', category: 'personal', priority: 'medium', schedule: ['sunday'] },
        { name: 'Deep clean carpets', recurrencePattern: 'yearly', category: 'personal', priority: 'medium', schedule: ['saturday'] },
        { name: 'Clean behind and under appliances', recurrencePattern: 'yearly', category: 'personal', priority: 'low', schedule: ['sunday'] },
        { name: 'Clean gutters', recurrencePattern: 'yearly', category: 'personal', priority: 'high', schedule: ['saturday'] }
      ]
    case 'Financial':
      return [
        { name: 'Check bank accounts and transactions', recurrencePattern: 'weekly', category: 'wealth', priority: 'high', schedule: ['monday'] },
        { name: 'Review recent expenses', recurrencePattern: 'weekly', category: 'wealth', priority: 'medium', schedule: ['friday'] },
        { name: 'Pay credit card bills', recurrencePattern: 'monthly', category: 'wealth', priority: 'high', schedule: ['monday'] },
        { name: 'Review subscription services', recurrencePattern: 'monthly', category: 'wealth', priority: 'medium', schedule: ['tuesday'] },
        { name: 'Update budget', recurrencePattern: 'monthly', category: 'wealth', priority: 'medium', schedule: ['wednesday'] },
        { name: 'Check credit score', recurrencePattern: 'monthly', category: 'wealth', priority: 'low', schedule: ['thursday'] },
        { name: 'Review investment portfolio', recurrencePattern: 'monthly', category: 'wealth', priority: 'medium', schedule: ['friday'] },
        { name: 'Set aside money for savings', recurrencePattern: 'monthly', category: 'wealth', priority: 'high', schedule: ['monday'] },
        { name: 'Review insurance policies', recurrencePattern: 'yearly', category: 'wealth', priority: 'medium', schedule: ['tuesday'] },
        { name: 'Prepare tax documents', recurrencePattern: 'yearly', category: 'wealth', priority: 'high', time: '15 Feb', schedule: ['monday'] },
        { name: 'File taxes', recurrencePattern: 'yearly', category: 'wealth', priority: 'high', time: '15 Apr', schedule: ['monday'] },
        { name: 'Annual financial review', recurrencePattern: 'yearly', category: 'wealth', priority: 'medium', schedule: ['friday'] }
      ]
    case 'Gym':
      return [
        { name: 'Cardio workout', recurrencePattern: 'weekly', category: 'health', priority: 'high', schedule: ['monday', 'wednesday', 'friday'] },
        { name: 'Upper body strength training', recurrencePattern: 'weekly', category: 'health', priority: 'medium', schedule: ['tuesday', 'thursday'] },
        { name: 'Lower body strength training', recurrencePattern: 'weekly', category: 'health', priority: 'medium', schedule: ['monday', 'friday'] },
        { name: 'Core workout', recurrencePattern: 'weekly', category: 'health', priority: 'medium', schedule: ['wednesday'] },
        { name: 'Stretching/flexibility session', recurrencePattern: 'weekly', category: 'health', priority: 'low', schedule: ['tuesday', 'thursday'] },
        { name: 'Track body measurements', recurrencePattern: 'monthly', category: 'health', priority: 'medium', schedule: ['monday'] },
        { name: 'Reassess fitness goals', recurrencePattern: 'monthly', category: 'health', priority: 'medium', schedule: ['friday'] },
        { name: 'Try a new workout routine', recurrencePattern: 'monthly', category: 'health', priority: 'low', schedule: ['saturday'] },
        { name: 'Schedule physical check-up', recurrencePattern: 'yearly', category: 'health', priority: 'high', schedule: ['monday'] },
        { name: 'Replace workout shoes', recurrencePattern: 'yearly', category: 'health', priority: 'medium', schedule: ['tuesday'] },
        { name: 'Review and update workout plan', recurrencePattern: 'monthly', category: 'health', priority: 'medium', schedule: ['sunday'] },
        { name: 'Rest day (active recovery)', recurrencePattern: 'weekly', category: 'health', priority: 'medium', schedule: ['sunday'] }
      ]
    case 'Self-Care':
      return [
        { name: 'Meditation session', recurrencePattern: 'weekly', category: 'personal', priority: 'medium', schedule: ['monday', 'wednesday', 'friday'] },
        { name: 'Journal writing', recurrencePattern: 'weekly', category: 'personal', priority: 'medium', schedule: ['tuesday', 'thursday'] },
        { name: 'Read for pleasure', recurrencePattern: 'weekly', category: 'personal', priority: 'low', schedule: ['saturday', 'sunday'] },
        { name: 'Digital detox (no screens)', recurrencePattern: 'weekly', category: 'personal', priority: 'medium', schedule: ['sunday'] },
        { name: 'Call a friend or family member', recurrencePattern: 'weekly', category: 'personal', priority: 'medium', schedule: ['saturday'] },
        { name: 'Try a new hobby', recurrencePattern: 'monthly', category: 'personal', priority: 'low', schedule: ['saturday'] },
        { name: 'Skincare routine', recurrencePattern: 'weekly', category: 'personal', priority: 'low', schedule: ['sunday'] },
        { name: 'Plan a day trip', recurrencePattern: 'monthly', category: 'personal', priority: 'medium', schedule: ['monday'] },
        { name: 'Declutter personal space', recurrencePattern: 'monthly', category: 'personal', priority: 'medium', schedule: ['saturday'] },
        { name: 'Schedule mental health check-in', recurrencePattern: 'monthly', category: 'personal', priority: 'high', schedule: ['monday'] },
        { name: 'Take a long bath or shower', recurrencePattern: 'weekly', category: 'personal', priority: 'low', schedule: ['friday'] },
        { name: 'Set personal goals', recurrencePattern: 'monthly', category: 'personal', priority: 'high', schedule: ['monday'] }
      ]
    default:
      return []
  }
}

export const formatScheduleDays = (days: WeekDay[]) => {
  if (days.length === 0) return ''
  
  const capitalizedDays = days.map(day => 
    day.charAt(0).toUpperCase() + day.slice(1).substring(0, 2)
  )
  
  return capitalizedDays.join(', ')
}

export const getRecurrenceColor = (pattern: string) => {
  switch (pattern) {
    case 'daily':
      return '#3b82f6' // blue
    case 'weekly':
      return '#10b981' // green
    case 'monthly':
      return '#f59e0b' // amber
    case 'yearly':
      return '#ef4444' // red
    default:
      return '#6b7280' // gray
  }
}

export const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'alert-circle'
    case 'medium':
      return 'remove-circle'
    case 'low':
      return 'arrow-down-circle'
    default:
      return 'remove-circle'
  }
}

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return '#ef4444' // red
    case 'medium':
      return '#f59e0b' // amber
    case 'low':
      return '#10b981' // green
    default:
      return '#6b7280' // gray
  }
}

export const RecommendationChip: React.FC<RecommendationChipProps> = ({ category, onPress, isDark = false }) => {
  const getChipStyle = () => {
    switch (category) {
      case 'Cleaning':
        return {
          backgroundColor: "rgba(16, 185, 129, 0.15)", // green
          borderColor: "rgba(16, 185, 129, 0.3)",
          iconName: "water-outline" as const,
          iconColor: "#10b981",
          textColor: "#10b981"
        }
      case 'Financial':
        return {
          backgroundColor: "rgba(59, 130, 246, 0.15)", // blue
          borderColor: "rgba(59, 130, 246, 0.3)",
          iconName: "cash-outline" as const,
          iconColor: "#3b82f6",
          textColor: "#3b82f6"
        }
      case 'Gym':
        return {
          backgroundColor: "rgba(239, 68, 68, 0.15)", // red
          borderColor: "rgba(239, 68, 68, 0.3)",
          iconName: "fitness-outline" as const,
          iconColor: "#ef4444",
          textColor: "#ef4444"
        }
      case 'Self-Care':
        return {
          backgroundColor: "rgba(139, 92, 246, 0.15)", // purple
          borderColor: "rgba(139, 92, 246, 0.3)",
          iconName: "heart-outline" as const,
          iconColor: "#8b5cf6",
          textColor: "#8b5cf6"
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
      paddingHorizontal="$2"
      paddingVertical="$1"
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
      scale={1}
      minWidth={0}
      flex={1}
      maxWidth={Platform.OS === 'web' ? 'auto' : '22%'}
    >
      <XStack gap="$1" alignItems="center" justifyContent="center">
        <Ionicons name={style.iconName} size={14} color={style.iconColor} />
        <Text 
          color={style.textColor} 
          fontSize={12} 
          fontWeight="600"
          numberOfLines={1}
        >
          {category}
        </Text>
      </XStack>
    </Button>
  )
}
