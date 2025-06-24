// components/tasklist/FilterChip.tsx
import React from 'react'
import { Button, Text } from 'tamagui'
import { RecurrencePattern } from '@/types'
import { getRecurrenceColor, withOpacity } from '@/utils'
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
  
  // Improved styling for better light mode appearance
  const bgColor = isSelected
    ? chipColor
      ? withOpacity(chipColor, isDark ? 0.4 : 0.12)
      : isDark ? '$blue7' : '$blue2'
    : isDark ? '$gray4' : '$gray2'
    
  const borderColor = isSelected
    ? chipColor
      ? withOpacity(chipColor, isDark ? 0.6 : 0.3)
      : isDark ? '$blue8' : '$blue6'
    : isDark ? '$gray5' : '$gray4'
    
  const textColor = isSelected
    ? chipColor
      ? isDark ? '#FFFFFF' : chipColor
      : isDark ? '$blue12' : '$blue11'
    : isDark ? '$gray12' : '$gray11'

  return (
    <Button
      size="$2"
      theme={isDark ? 'dark' : 'light'}
      onPress={onPress}
      backgroundColor={bgColor}
      pressStyle={{ 
        opacity: 0.8,
        transform: [{ scale: 0.98 }]
      }}
      borderColor={borderColor}
      borderWidth={1}
      borderRadius="$3"
      paddingHorizontal="$3"
      height="$3.5"
      unstyled
      marginRight="$2"
      justifyContent="center"
      alignItems="center"
      shadowColor="transparent"
      shadowOffset={{ width: 0, height: 0 }}
      shadowOpacity={0}
      shadowRadius={0}
      elevation={0}
    >
      <Text 
        fontSize={13} 
        color={textColor} 
        fontFamily="$body"
        fontWeight={isSelected ? "600" : "500"}
      >
        {label}
      </Text>
    </Button>
  )
}