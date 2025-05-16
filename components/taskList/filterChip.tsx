// components/tasklist/FilterChip.tsx
import React from 'react'
import { Button, Text } from 'tamagui'
import { RecurrencePattern } from '@/types'
import { getRecurrenceColor, withOpacity } from '@/utils/styleUtils'
import { useColorScheme } from 'react-native'

interface FilterChipProps {
  label: string
  onPress: () => void
  isSelected: boolean
  pattern?: RecurrencePattern | 'all'
  color?: string 
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, onPress, isSelected, pattern, color }) => {
  const isDark = useColorScheme() === 'dark'
  const recurrenceColor = pattern && pattern !== 'all' ? getRecurrenceColor(pattern) : null
  const chipColor = color || recurrenceColor
  const bgColor = isSelected
    ? chipColor
      ? withOpacity(chipColor, isDark ? 0.4 : 0.8)
      : isDark ? '$blue7' : '$blue8'
    : isDark ? '$gray4' : '$gray6'
  const borderColor = isSelected
    ? chipColor
      ? withOpacity(chipColor, isDark ? 0.6 : 1.0)
      : isDark ? '$blue8' : '$blue9'
    : isDark ? '$gray5' : '$gray7'
  const textColor = isSelected
    ? chipColor
      ? isDark ? '#FFFFFF' : '#000000'
      : isDark ? '$blue12' : '$blue1'
    : isDark ? '$gray12' : '$gray1'

  return (
    <Button
      size="$2"
      theme={isDark ? 'dark' : 'light'}
      onPress={onPress}
      backgroundColor={bgColor}
      pressStyle={{ opacity: 0.7 }}
      borderColor={borderColor}
      borderWidth={1}
      borderRadius="$4"
      paddingHorizontal="$2"
      height="$3"
      unstyled
      marginRight="$2"
      justifyContent="center"
      alignItems="center"
    >
      <Text fontSize={12} color={textColor} fontFamily="$body">
        {label}
      </Text>
    </Button>
  )
}