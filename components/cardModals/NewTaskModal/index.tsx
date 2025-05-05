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
import { TimePicker } from '@/components/shared/TimePicker'
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
    if (open) {
      // Reset state when modal opens for a new task
      setShowTimePicker(false);
      setNewTask(getDefaultTask());
      setIsSubmitting(false);
      setKeyboardOffset(0);
      setSelectedDate(new Date()); // Reset selected date for time picker
    } else {
      // Optional: Add a slight delay for closing animation
      setTimeout(() => {
        setShowTimePicker(false);
        setNewTask(getDefaultTask());
        setIsSubmitting(false);
        setKeyboardOffset(0);
        setSelectedDate(new Date());
      }, 200);
    }
  }, [open]);

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

  const handleTextChange = useCallback((text: string) => {setNewTask(prev => ({ ...prev, name: text }))}, [])

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
        <Form gap={isIpad() ? "$2.5" : "$3"} px={isIpad() ? 6 : 4} py={isIpad() ? 4 : 2} pb={12}>
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
            <TimePicker
              showTimePicker={showTimePicker}
              setShowTimePicker={setShowTimePicker}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onTimeChange={handleTimeChange}
              onWebTimeChange={handleWebTimeChange}
              time={newTask.time}
              isDark={isDark}
              primaryColor={preferences.primaryColor}
            />
          </XStack>

          <RecurrenceSelector
            selectedPattern={newTask.recurrencePattern} 
            onPatternSelect={handleRecurrenceSelect} />

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
