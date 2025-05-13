import React from 'react'
import { useColorScheme, Platform } from 'react-native'
import { XStack, YStack, Text, Button, AnimatePresence, isWeb } from 'tamagui'
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import { isIpad } from '@/utils/deviceUtils'
import { CategorySelector } from './CategorySelector'
import { TaskCategory } from '@/types/task'
import { Tag } from '@/types/tag'
import { TagSelector } from '@/components/notes/TagSelector'
import { TimePicker } from '@/components/shared/TimePicker'
import { ShowInCalendar } from './showInCalendar'

interface AdvancedSettingsProps {
  category: TaskCategory
  onCategorySelect: (category: TaskCategory, e?: any) => void
  tags: Tag[]
  onTagsChange: (tags: Tag[]) => void
  showInCalendar: boolean
  onShowInCalendarChange: (showInCalendar: boolean) => void
  showTimePicker: boolean
  setShowTimePicker: (show: boolean) => void
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  onTimeChange: (event: any, pickedDate?: Date) => void
  onWebTimeChange: (date: Date) => void
  time?: string
  isDark: boolean
  primaryColor: string
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function AdvancedSettings({
  category,
  onCategorySelect,
  tags,
  onTagsChange,
  showInCalendar,
  onShowInCalendarChange,
  showTimePicker,
  setShowTimePicker,
  selectedDate,
  setSelectedDate,
  onTimeChange,
  onWebTimeChange,
  time,
  isDark,
  primaryColor,
  isOpen,
  onOpenChange
}: AdvancedSettingsProps) {
  const colorScheme = useColorScheme()
  
  return (
    <YStack>
      <Button
        backgroundColor="transparent"
        height={isIpad() ? 48 : 42}
        onPress={() => {
          if (showTimePicker) {
            setShowTimePicker(false);
          } else {
            onOpenChange(!isOpen);
          }
        }}
        pressStyle={{ opacity: 0.7 }}
        width="100%"
        px={0}
      >
        <XStack px={isIpad() ? "$2.5" : "$2.5"} alignItems="center" justifyContent="space-between" width="100%">
          {!isOpen && !showTimePicker && (
            <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} fontFamily="$body" fontWeight="500">
              Advanced Settings
            </Text>
          )}
          <XStack flex={1} justifyContent={isOpen ? "flex-end" : "flex-end"}>
            {(isOpen || showTimePicker) ? (
              <ChevronUp size={isIpad() ? 20 : 16} color={isDark ? '#6c6c6c' : '#9c9c9c'} />
            ) : (
              <ChevronDown size={isIpad() ? 20 : 16} color={isDark ? '#6c6c6c' : '#9c9c9c'} />
            )}
          </XStack>
        </XStack>
      </Button>
      
      <AnimatePresence>
        {showTimePicker && (
          <YStack
            key="time-picker"
            animation="quick"
            enterStyle={{ opacity: 0, y: -10 }}
            exitStyle={{ opacity: 0, y: -10 }}
            y={0}
            opacity={1}
            pt={0}
            pb={0}
          >
            <YStack pl={6} pt={0} pb={0}>
              <TimePicker
                showTimePicker={showTimePicker}
                setShowTimePicker={setShowTimePicker}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                onTimeChange={onTimeChange}
                onWebTimeChange={onWebTimeChange}
                time={time}
                isDark={isDark}
                primaryColor={primaryColor}
              />
            </YStack>
          </YStack>
        )}
        
        {isOpen && !showTimePicker && (
          <YStack
            key="content"
            animation="quick"
            enterStyle={{ opacity: 0, y: -10 }}
            exitStyle={{ opacity: 0, y: -10 }}
            y={0}
            opacity={1}
            gap="$2"
            pb="$2"
          >
            <ShowInCalendar
              showInCalendar={showInCalendar}
              onShowInCalendarChange={onShowInCalendarChange}
              isDark={isDark}
            />
            
            <CategorySelector
              selectedCategory={category}
              onCategorySelect={onCategorySelect}
            />
            
            <YStack py={7}>
              <TagSelector
                onTagsChange={onTagsChange}
                tags={tags}
              />
            </YStack>
            
            <YStack pl={6}>
              <TimePicker
                showTimePicker={false}
                setShowTimePicker={setShowTimePicker}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                onTimeChange={onTimeChange}
                onWebTimeChange={onWebTimeChange}
                time={time}
                isDark={isDark}
                primaryColor={primaryColor}
              />
            </YStack>
          </YStack>
        )}
      </AnimatePresence>
    </YStack>
  )
} 