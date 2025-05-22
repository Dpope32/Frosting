//@ts-nocheck
import React from 'react'
import { useColorScheme } from 'react-native'
import { XStack, YStack, Text, Button, AnimatePresence } from 'tamagui'
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import { isIpad } from '@/utils'
import { CategorySelector } from './CategorySelector'
import { TaskCategory, Tag } from '@/types'
import { TagSelector } from './TagSelectorNew'
import { TimePicker } from '@/components/shared/TimePicker'
import { ShowInCalendar } from './showInCalendar'
import { AlertMeSelector } from './AlertMeSelector'

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
  alertMe: boolean
  onAlertMeChange: (alertMe: boolean) => void
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
  onOpenChange,
  alertMe,
  onAlertMeChange
}: AdvancedSettingsProps) {
  const colorScheme = useColorScheme()
  
  // Handle button press without conditional rendering that causes remounts
  const handleButtonPress = () => {
    if (showTimePicker) {
      setShowTimePicker(false);
    } else {
      onOpenChange(!isOpen);
    }
  }
  
  return (
    <YStack>
      <Button
        backgroundColor="transparent"
        height={isIpad() ? isOpen ? 10 : 34 : isOpen ? 10 : 34}
        onPress={handleButtonPress}
        pressStyle={{ opacity: 0.7 }}
        width="100%"
        px={0}
      >
        <XStack px={isIpad() ? "$2.5" : 5} alignItems="center" justifyContent="space-between" width="100%">
          {!isOpen && !showTimePicker && (
            <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} fontFamily="$body" fontWeight="500">
              Advanced Settings
            </Text>
          )}
          <XStack flex={1} justifyContent={isOpen ? "flex-end" : "flex-end"}>
            {(isOpen || showTimePicker) ? (
              <ChevronUp size={isIpad() ? 20 : 16} color={isDark ? 'transparent' : 'transparent'} />
            ) : (
              <ChevronDown size={isIpad() ? 20 : 16} color={isDark ? '#6c6c6c' : '#9c9c9c'} />
            )}
          </XStack>
        </XStack>
      </Button>
      
      <AnimatePresence>
        {(isOpen || showTimePicker) && (
          <YStack
            key="advanced-settings-content"
            animation="quick"
            enterStyle={{ opacity: 0, y: -10 }}
            exitStyle={{ opacity: 0, y: -10 }}
            y={0}
            opacity={1}
            gap="$2"
            pb="$2"
          >
            <YStack 
              pl={showTimePicker ? 6 : 0} 
              pt={0} 
              pb={0}
              display={showTimePicker ? "flex" : "none"}
            >
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
            
            <YStack 
              display={isOpen && !showTimePicker ? "flex" : "none"}
              animation="quick"
              gap="$2"
            >
              <YStack>
                <TagSelector
                  onTagsChange={onTagsChange}
                  tags={tags}
                />
              </YStack>
              
              <CategorySelector
                selectedCategory={category}
                onCategorySelect={onCategorySelect}
              />

              <ShowInCalendar
                showInCalendar={showInCalendar}
                onShowInCalendarChange={onShowInCalendarChange}
                isDark={isDark}
              />
              
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
              
              {time && (
                <AlertMeSelector
                  alertMe={alertMe}
                  onAlertMeChange={onAlertMeChange}
                  isDark={isDark}
                />
              )}
            </YStack>
          </YStack>
        )}
      </AnimatePresence>
    </YStack>
  )
} 