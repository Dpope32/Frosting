import React, { useState, useEffect, useCallback } from 'react'
import { Platform, Keyboard, KeyboardEvent, Pressable, View } from 'react-native'
import { Form, ScrollView, XStack, Text, isWeb, Button, YStack } from 'tamagui'
import { Task, TaskPriority, TaskCategory, RecurrencePattern, WeekDay } from '@/types/task'
import { useProjectStore } from '@/store/ToDo'
import { useUserStore } from '@/store/UserStore'
import { useToastStore } from '@/store/ToastStore'
import * as Haptics from 'expo-haptics'
import { format } from 'date-fns'
import { syncTasksToCalendar } from '@/services'
import { Base } from './Base'
import { getDefaultTask, WEEKDAYS } from '@/services/taskService'
import { Ionicons } from '@expo/vector-icons'
import { Pencil } from '@tamagui/lucide-icons'

import { TaskNameInput } from './TaskNameInput'
import { CalendarSettings } from './CalendarSettings'
import { RecurrenceSelector } from './RecurrenceSelector'
import { DaySelector } from './DaySelector'
import DateTimePicker from '@react-native-community/datetimepicker'
import { CategorySelector } from './CategorySelector'
import { PrioritySelector } from './PrioritySelector'
import { SubmitButton } from './SubmitButton'
import { isIpad } from '@/utils/deviceUtils'
import { DateSelector } from './DateSelector'

interface NewTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isDark: boolean
}

export function NewTaskModal({ open, onOpenChange, isDark }: NewTaskModalProps): JSX.Element | null {
  if (!open) {
    return null
  }

  const { addTask } = useProjectStore()
  const { preferences } = useUserStore()
  const { showToast } = useToastStore()
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'completed' | 'completionHistory' | 'createdAt' | 'updatedAt'>>(getDefaultTask())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [keyboardOffset, setKeyboardOffset] = useState(0)

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setShowTimePicker(false)
        setNewTask(getDefaultTask())
        setIsSubmitting(false)
      }, 200)
    }
  }, [open])

  useEffect(() => {
    const onKeyboardShow = (e: KeyboardEvent) => setKeyboardOffset(e.endCoordinates.height)
    const onKeyboardHide = () => setKeyboardOffset(0)

    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      onKeyboardShow
    )
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      onKeyboardHide
    )
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  const handleTextChange = useCallback((text: string) => {
    setNewTask(prev => ({ ...prev, name: text }))
  }, [])

  const toggleDay = useCallback((day: keyof typeof WEEKDAYS, e?: any) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    const fullDay = WEEKDAYS[day] as WeekDay
    setNewTask(prev => ({
      ...prev,
      schedule: prev.schedule.includes(fullDay)
        ? prev.schedule.filter(d => d !== fullDay)
        : [...prev.schedule, fullDay],
    }))
  }, [])

  const handleTimeChange = useCallback((event: any, pickedDate?: Date) => {
    if (pickedDate) {
      setSelectedDate(pickedDate)
      const timeString = format(pickedDate, 'h:mm a')
      setNewTask(prev => ({ ...prev, time: timeString }))
    }
  }, [])

  const handleWebTimeChange = useCallback((date: Date) => {
    const timeString = format(date, 'h:mm a')
    setNewTask(prev => ({ ...prev, time: timeString }))
    setSelectedDate(date)
  }, [])

  const handleTimePickerToggle = useCallback(() => {
    setShowTimePicker(!showTimePicker)
  }, [showTimePicker])

  const handleRecurrenceSelect = useCallback((pattern: RecurrencePattern, e?: any) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setNewTask(prev => ({
      ...prev,
      recurrencePattern: pattern,
      recurrenceDate: new Date().toISOString().split('T')[0]
    }))
  }, [])

  const handlePrioritySelect = useCallback((value: TaskPriority, e?: any) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setNewTask(prev => ({ ...prev, priority: value }))
  }, [])

  const handleCategorySelect = useCallback((value: TaskCategory, e?: any) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setNewTask(prev => ({ ...prev, category: value }))
  }, [])

  const handleAddTask = useCallback(async () => {
    if (isSubmitting) return
    try {
      if (!newTask.name.trim()) {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        showToast('Please enter a task name', 'error')
        return
      }
      if (newTask.schedule.length === 0 &&
          (newTask.recurrencePattern === 'weekly' || newTask.recurrencePattern === 'biweekly')) {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        showToast(`Please select at least one day for ${newTask.recurrencePattern} tasks`, 'error')
        return
      }
      setIsSubmitting(true)
      const taskToAdd = {
        ...newTask,
        name: newTask.name.trim(),
        schedule:
          newTask.recurrencePattern === 'one-time'
            ? []
            : (newTask.recurrencePattern === 'weekly' || newTask.recurrencePattern === 'biweekly')
              ? newTask.schedule
              : [],
        recurrenceDate: newTask.recurrenceDate
      }
      try {
        addTask(taskToAdd)
        if (taskToAdd.showInCalendar) {
          syncTasksToCalendar()
        }
        setTimeout(() => onOpenChange(false), Platform.OS === 'web' ? 300 : 200)
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        showToast('Task added successfully', 'success')
      } catch {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        showToast('Failed to add task. Please try again.', 'error')
        setTimeout(() => onOpenChange(false), Platform.OS === 'web' ? 300 : 100)
      }
    } catch {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      showToast('An error occurred. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }, [newTask, addTask, onOpenChange, showToast, isSubmitting])

  return (
    <Base
      onClose={() => {
        if (Platform.OS === 'web') {
          setTimeout(() => onOpenChange(false), 100)
        } else {
          onOpenChange(false)
        }
      }}
      title="New ToDo"
      showCloseButton={true}
      keyboardOffset={keyboardOffset}
    >
      <ScrollView  contentContainerStyle={{}} keyboardShouldPersistTaps="handled" >
        <Form gap={isIpad() ? "$2.5" : "$2.5"} px={isIpad() ? 6 : 4} py={isIpad() ? 4 : 2} pb={12}>
          <TaskNameInput
            value={newTask.name}
            onChange={handleTextChange}
          />
          <PrioritySelector selectedPriority={newTask.priority} onPrioritySelect={handlePrioritySelect}/>
          <XStack alignItems="center" justifyContent="space-between" px="$3" gap="$3">
            <XStack alignItems="center" gap="$2">
              <Text fontFamily="$body" color={isDark ? '#6c6c6c' : '#9c9c9c'}fontSize={isIpad() ? 17 : 15} flexWrap= "nowrap">
                Show in Calendar
              </Text>
              <Pressable
                onPress={() => setNewTask(prev => ({ ...prev, showInCalendar: !prev.showInCalendar }))}
                style={{ 
                  paddingHorizontal: 2, 
                  paddingVertical: 2, 
                  marginLeft: 2,
                  backgroundColor: newTask.showInCalendar ? (isDark ? '#1a1a1a' : '#f0f0f0') : 'transparent',
                  borderRadius: 8,
                }}
              >
                <View style={{
                  width: 22,
                  height: 22,
                  borderWidth: 1.5,
                  borderRadius: 6,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderColor: newTask.showInCalendar ? '#00C851' : '#bbb',
                  backgroundColor: newTask.showInCalendar 
                    ? (isDark ? '#181f1b' : '#b6f2d3') 
                    : (isDark ? '#232323' : '#f7f7f7'),
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 2,
                  shadowOffset: { width: 0, height: 1 },
                }}>
                  {newTask.showInCalendar && (
                    <Ionicons name="checkmark-sharp" size={15} color="#00C851" />
                  )}
                </View>
              </Pressable>
            </XStack>
            <YStack flex={1} alignItems='flex-end'>
              <Pressable
                onPress={handleTimePickerToggle}
                style={{
                  width: '100%',
                  height: 50,
                  borderRadius: 12,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  backgroundColor: newTask.time ? 'transparent' : (isDark ? 'transparent' : 'rgba(238,238,238,0.8)'),
                  borderWidth: newTask.time ? 0 : 1,
                  borderColor: newTask.time ? 'transparent' : (isDark ? '#444' : '#e0e0e0'),
                  shadowOpacity: 0,
                  marginTop: 0,
                  marginBottom: 0,
                  cursor: 'pointer',
                }}
              >
                <Text
                  fontFamily="$body"
                  color={newTask.time ? (isDark ? '#f3f3f3' : '#333') : (isDark ? "$gray12" : "$gray11")}
                  fontSize={14}
                  style={{ flex: 1 }}
                >
                  {newTask.time || "Select time"}
                </Text>
                {newTask.time ? (
                  <Pencil size={18} color={isDark ? '#000' : '#f3f3f3'} />
                ) : (
                  <Text fontFamily="$body" color={isDark ? "$gray11" : "$gray10"} fontSize={14}>
                    {showTimePicker ? '▲' : '▼'}
                  </Text>
                )}
              </Pressable>
            </YStack>
          </XStack>

          {showTimePicker && (
            <View
              style={{
                zIndex: 10,
                width: '100%',
                backgroundColor: isDark ? '#1c1c1e' : 'white',
                borderRadius: 12,
                elevation: 10,
                shadowColor: 'black',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                borderWidth: 1,
                borderColor: isDark ? '#2c2c2e' : '#e5e5ea',
                marginTop: 8,
              }}
            >
              <YStack
                height={Platform.OS === 'web' ? 100 : 200}
                justifyContent="center"
                alignItems="center"
                padding="$4"
                backgroundColor={isDark ? "$gray1" : "white"}
                borderRadius={12}
              >
                {Platform.OS === 'web' ? (
                  <XStack width="100%" alignItems="center" justifyContent="space-between">
                    <input
                      type="time"
                      value={format(selectedDate, 'HH:mm')}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onChange={e => {
                        const [hrs, mins] = e.target.value.split(':').map(Number)
                        const newDate = new Date(selectedDate)
                        newDate.setHours(hrs)
                        newDate.setMinutes(mins)
                        handleWebTimeChange(newDate)
                      }}
                      style={{
                        padding: 12,
                        fontSize: 16,
                        borderRadius: 8,
                        border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                        backgroundColor: isDark ? '#222' : '#fff',
                        color: isDark ? '#fff' : '#000',
                        width: '100%',
                        marginRight: 10
                      }}
                    />
                    <Button
                      onPress={() => setShowTimePicker(false)}
                      backgroundColor={preferences.primaryColor}
                      px="$3"
                      py="$2"
                      br={12}
                    >
                      <Text color="white" fontFamily="$body" fontWeight="600">Done</Text>
                    </Button>
                  </XStack>
                ) : (
                  <DateTimePicker
                    value={selectedDate}
                    mode="time"
                    is24Hour={false}
                    onChange={handleTimeChange}
                    display="spinner"
                    themeVariant={isDark ? "dark" : "light"}
                  />
                )}
              </YStack>
            </View>
          )}
          {(newTask.recurrencePattern === 'weekly' || newTask.recurrencePattern === 'biweekly') && (
            <DaySelector
              selectedDays={newTask.schedule}
              onDayToggle={toggleDay}
            />
          )}

          {(newTask.recurrencePattern === 'monthly' || newTask.recurrencePattern === 'yearly') && (
            <DateSelector
              isYearly={newTask.recurrencePattern === 'yearly'}
              recurrenceDate={newTask.recurrenceDate || new Date().toISOString().split('T')[0]}
              onDateSelect={(date) => setNewTask(prev => ({ ...prev, recurrenceDate: date }))}
              preferences={preferences}
            />
          )}
          <CategorySelector selectedCategory={newTask.category} onCategorySelect={handleCategorySelect}/>
          <Form.Trigger asChild>
            <SubmitButton 
              isSubmitting={isSubmitting} 
              preferences={preferences}
              onPress={handleAddTask}
            />
          </Form.Trigger>
        </Form>
      </ScrollView>
    </Base>
  )
} 