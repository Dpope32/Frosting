import React from 'react'
import { Pressable, useColorScheme } from 'react-native'
import { XStack, YStack, Text, Button, AnimatePresence, isWeb } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
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
  notifyOnTime: boolean
  onNotifyOnTimeChange: (notifyOnTime: boolean) => void
  notifyBefore: boolean
  onNotifyBeforeChange: (notifyBefore: boolean) => void
  notifyBeforeTime: string
  onNotifyBeforeTimeChange: (notifyBeforeTime: string) => void
  showNotifyTimeOptions: boolean
  onShowNotifyTimeOptionsChange: (show: boolean) => void
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
  notifyOnTime,
  onNotifyOnTimeChange,
  notifyBefore,
  onNotifyBeforeChange,
  notifyBeforeTime,
  onNotifyBeforeTimeChange,
  showNotifyTimeOptions,
  onShowNotifyTimeOptionsChange
}: AdvancedSettingsProps) {
  const colorScheme = useColorScheme()
  
  // Handle button press without conditional rendering that causes remounts
  const handleButtonPress = () => {
    if (showTimePicker && !time) {
      setShowTimePicker(false);
    } else {
      onOpenChange(!isOpen);
    }
  }
  
  return (
    <YStack>
      <Button
        backgroundColor="transparent"
        height={isIpad() ? isOpen ? 2 : 34 : isOpen ? 2 : 34}
        onPress={handleButtonPress}
        pressStyle={{ opacity: 0.7 }}
        width={200}
        px={0}
      >
        <XStack px={isWeb ? 6 : isIpad() ? "$2.5" : 5} alignItems="center" justifyContent="space-between" width="100%">
          {!isOpen && !(showTimePicker && !time) && (
            <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} fontFamily="$body" fontWeight="500">
              Advanced
            </Text>
          )}  
          <XStack flex={1} justifyContent={isOpen ? "flex-end" : "flex-end"}>
            {(isOpen || (showTimePicker && !time)) ? (
              <MaterialIcons name="keyboard-arrow-up" size={isIpad() ? 20 : 16} color={isDark ? 'transparent' : 'transparent'} />
            ) : (
              <MaterialIcons name="keyboard-arrow-down" size={isIpad() ? 20 : 16} color={isDark ? '#6c6c6c' : '#9c9c9c'} />
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
            gap="$1"
            pb="$1"
          >
            <Button
              backgroundColor="transparent"
              onPress={() => setShowTimePicker(true)}
              px={0}
              alignSelf="flex-start"
              pressStyle={{ opacity: 0.7 }}
              mt={time ? -6 : 0}
              mb={6}
              minHeight={40}
              height={40}
              flexDirection="row"
              alignItems="center"
              ml={time ?  -6 : 6}
            >
              <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={15} fontFamily="$body" fontWeight="500">
                {time ? `` : 'Select Time'}
              </Text>
              {time && (
                  <XStack alignItems="center" gap="$1" ml={time ? 0 : 6}>
                    <Pressable
                      onPress={() => setShowTimePicker(true)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        paddingHorizontal: 2,
                        paddingRight: 12,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: 'transparent' ,
                      }}
                    >
                      <Text
                        color={isDark ? '#9a9a9a' : '#7c7c7c'}
                        fontSize={isWeb ? 17 : isIpad() ? 15 : 14}
                        fontFamily="$body"
                        fontWeight="500"
                      >
                        {time}
                      </Text>
                    </Pressable>
                  </XStack>
                )}
              <MaterialIcons name="timer" size={18} color={isDark ? '#5c5c5c' : 'rgba(191, 191, 191, 0.77)'} style={{ marginLeft: 4 }} />
            </Button>
            <YStack 
              display={showTimePicker ? "flex" : "none"}
              animation="quick"
              gap="$2" pb={6}
            >
              <TimePicker
                showTimePicker={showTimePicker}
                setShowTimePicker={setShowTimePicker}
                selectedDate={selectedDate}
                onTimeChange={onTimeChange}
                onWebTimeChange={onWebTimeChange}
                time={time}
                isDark={isDark}
                primaryColor={primaryColor}
              />
            </YStack>
            
            <YStack 
              display={!showTimePicker && isOpen ? "flex" : "none"}
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
              
              
              {time && (
                <AlertMeSelector
                  notifyOnTime={notifyOnTime}
                  onNotifyOnTimeChange={onNotifyOnTimeChange}
                  notifyBefore={notifyBefore}
                  onNotifyBeforeChange={onNotifyBeforeChange}
                  notifyBeforeTime={notifyBeforeTime}
                  onNotifyBeforeTimeChange={onNotifyBeforeTimeChange}
                  showTimeOptions={showNotifyTimeOptions}
                  setShowTimeOptions={onShowNotifyTimeOptionsChange}
                  isDark={isDark}
                  primaryColor={primaryColor}
                />
              )}
            </YStack>
          </YStack>
        )}
      </AnimatePresence>
    </YStack>
  )
} 