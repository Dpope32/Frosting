import React from 'react'
import { Platform } from 'react-native'
import { XStack, Button, Text, isWeb } from 'tamagui'
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
        { name: 'Empty Cat Litter', recurrencePattern: 'weekly', category: 'personal', priority: 'medium', schedule: ['sunday','tuesday','thursday','saturday'] },
        { name: 'Wipe down screens and electronics', recurrencePattern: 'weekly', category: 'personal', priority: 'medium', schedule: ['monday'] },
        { name: 'Wash bed sheets and pillowcases', recurrencePattern: 'weekly', category: 'personal', priority: 'medium', schedule: ['saturday'] },
        { name: 'Clean bathroom', recurrencePattern: 'weekly', category: 'personal', priority: 'high', schedule: ['sunday'] },
        { name: 'Laundry', recurrencePattern: 'weekly', category: 'personal', priority: 'high', time:"7:00", schedule: ['sunday','wednesday','thursday','friday','saturday'] },
        { name: 'Vacuum living areas', recurrencePattern: 'weekly', category: 'personal', priority: 'medium', schedule: ['saturday', 'wednesday'] },
        { name: 'Take Dog outside', recurrencePattern: 'everyday', category: 'personal', priority: 'high', time:"7:00", schedule: ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'] },
        { name: 'Dust furniture and shelves', recurrencePattern: 'monthly', category: 'personal', priority: 'low', schedule: ['sunday'] },
        { name: 'Throw out food from fridge', recurrencePattern: 'weekly', category: 'personal', priority: 'medium', schedule: ['thursday'] },
        { name: 'Clean oven and stovetop', recurrencePattern: 'monthly', category: 'personal', priority: 'medium', schedule: ['sunday'] },
        { name: 'Wash windows', recurrencePattern: 'monthly', category: 'personal', priority: 'low', schedule: ['saturday'] },
        { name: 'Clean air vents and replace filters', recurrencePattern: 'monthly', category: 'personal', priority: 'medium', schedule: ['sunday'] },
        { name: 'Deep clean carpets', recurrencePattern: 'yearly', category: 'personal', priority: 'medium', schedule: ['saturday'] },
        { name: 'Clean behind and under appliances', recurrencePattern: 'yearly', category: 'personal', priority: 'low', schedule: ['sunday'] },
        { name: 'Clean gutters', recurrencePattern: 'yearly', category: 'personal', priority: 'high', schedule: ['saturday'] }
      ]
    case 'Financial':
      return [
        { name: 'Check bank accounts', recurrencePattern: 'weekly', category: 'wealth', priority: 'high', schedule: ['monday','friday'] },
        { name: 'Review recent expenses', recurrencePattern: 'weekly', category: 'wealth', priority: 'medium', schedule: ['friday'] },
        { name: 'Pay credit cards', recurrencePattern: 'monthly', category: 'wealth', priority: 'high', schedule: ['monday'] },
        { name: 'Update budget', recurrencePattern: 'biweekly', category: 'wealth', priority: 'medium', schedule: ['wednesday'] },
        { name: 'Check credit score', recurrencePattern: 'monthly', category: 'wealth', priority: 'low', schedule: ['thursday'] },
        { name: 'Review investments', recurrencePattern: 'biweekly', category: 'wealth', priority: 'medium', schedule: ['friday'] },
        { name: 'Set aside money for savings', recurrencePattern: 'monthly', category: 'wealth', priority: 'high', schedule: ['monday'] },
        { name: 'File taxes', recurrencePattern: 'yearly', category: 'wealth', priority: 'high', time: '15 Apr', schedule: ['monday'] },
        { name: 'Annual financial review', recurrencePattern: 'yearly', category: 'wealth', priority: 'medium', schedule: ['friday'] }
      ]
    case 'Gym':
      return [
        { name: 'Cardio workout', recurrencePattern: 'everyday', category: 'health', priority: 'high', schedule: ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'] },
        { name: 'Upper body strength training', recurrencePattern: 'weekly', category: 'health', priority: 'medium', schedule: ['tuesday', 'thursday'] },
        { name: 'Lower body strength training', recurrencePattern: 'weekly', category: 'health', priority: 'medium', schedule: ['monday', 'friday'] },
        { name: 'Workout', recurrencePattern: 'weekly', category: 'health', priority: 'medium', schedule: ['monday','tuesday','wednesday', 'thursday','friday'] },
        { name: 'Stretching/flexibility session', recurrencePattern: 'weekly', category: 'health', priority: 'low', schedule: ['tuesday','wednesday', 'thursday'] },
        { name: 'Reassess fitness goals', recurrencePattern: 'monthly', category: 'health', priority: 'medium', schedule: ['friday'] },
        { name: 'Try a new workout routine', recurrencePattern: 'biweekly', category: 'health', priority: 'low', schedule: ['saturday'] },
        { name: 'Schedule physical check-up', recurrencePattern: 'yearly', category: 'health', priority: 'high', schedule: ['monday'] },
        { name: 'Review and update workout plan', recurrencePattern: 'monthly', category: 'health', priority: 'medium', schedule: ['sunday'] },
        { name: 'Rest day (active recovery)', recurrencePattern: 'weekly', category: 'health', priority: 'medium', schedule: ['sunday'] }
      ]
    case 'Self-Care':
      return [
        { name: 'Meditate', recurrencePattern: 'weekly', category: 'personal', priority: 'medium', schedule: ['monday', 'wednesday', 'friday'] },
        { name: 'Journal', recurrencePattern: 'everyday', category: 'personal', priority: 'medium', schedule: ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'] },
        { name: 'Read', recurrencePattern: 'weekly', category: 'personal', priority: 'low', schedule: ['saturday', 'sunday'] },
        { name: 'Digital detox', recurrencePattern: 'weekly', category: 'personal', priority: 'medium', schedule: ['sunday'] },
        { name: 'Call a friend or family member', recurrencePattern: 'biweekly', category: 'personal', priority: 'medium', schedule: ['wednesday'] },
        { name: 'Drink Water', recurrencePattern: 'everyday', category: 'personal', priority: 'low', schedule: ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'] },
        { name: 'Skincare routine', recurrencePattern: 'everyday', category: 'personal', priority: 'low', schedule: ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'] },
        { name: 'Plan a day trip', recurrencePattern: 'monthly', category: 'personal', priority: 'medium', schedule: ['tuesday'] },
        { name: 'Declutter personal space', recurrencePattern: 'monthly', category: 'personal', priority: 'medium', schedule: ['saturday'] },
        { name: 'Treat yoself', recurrencePattern: 'weekly', category: 'personal', priority: 'low', schedule: ['friday'] },
        { name: 'Set personal goals', recurrencePattern: 'monthly', category: 'personal', priority: 'high', schedule: ['monday'] }
      ]
    default:
      return []
  }
}

export const formatScheduleDays = (days: WeekDay[]) =>
  days.map(day => day.charAt(0).toUpperCase()).join(', ')

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
      fontFamily="$body"
      borderWidth={1}
      borderRadius={8}
      paddingHorizontal={Platform.OS === 'web' ? '$2' : '$1'}
      paddingVertical="$1"
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
      scale={1}
      minWidth={0}
      flex={Platform.OS === 'web' ? 1 : 0}
      width={Platform.OS === 'web' ? 'auto' : 100}
      marginBottom={Platform.OS === 'web' ? 0 : '$1'}
    >
      <XStack gap={Platform.OS === 'web' ? '$2' : '$1'} alignItems="center" justifyContent="center" >
        <Ionicons name={style.iconName} size={14} color={style.iconColor} />
        <Text color={style.textColor} fontFamily="$body" fontSize={isWeb ? 13 : 12}  fontWeight="600" numberOfLines={1}> {category}  </Text>
      </XStack>
    </Button>
  )
}
