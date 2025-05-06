import React, { useState, useEffect, useCallback } from 'react'
import { Platform, Keyboard, KeyboardEvent, Pressable, View } from 'react-native'
import { Form, ScrollView, XStack   } from 'tamagui'
import { format } from 'date-fns'
import * as Haptics from 'expo-haptics'

import { TagSelector } from '@/components/notes/TagSelector'
import { Task, TaskPriority, TaskCategory, RecurrencePattern, WeekDay } from '@/types/task'
import { Tag } from '@/types/tag'
import { useProjectStore } from '@/store/ToDo'
import { useUserStore } from '@/store/UserStore'
import { useToastStore } from '@/store/ToastStore'
import { syncTasksToCalendar } from '@/services'
import { Base } from './Base'
import { getDefaultTask, WEEKDAYS } from '@/services/taskService'
import { TaskNameInput } from './TaskNameInput'
import { RecurrenceSelector } from './RecurrenceSelector'
import { DaySelector } from './DaySelector'
import { CategorySelector } from './CategorySelector'
import { PrioritySelector } from './PrioritySelector'
import { TimePicker } from '@/components/shared/TimePicker'
import { SubmitButton } from './SubmitButton'
import { isIpad } from '@/utils/deviceUtils'
import { DateSelector } from './DateSelector'
import { ShowInCalendar } from './showInCalendar'

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
      setShowTimePicker(false);
      setNewTask(getDefaultTask());
      setIsSubmitting(false);
      setKeyboardOffset(0);
      setSelectedDate(new Date()); 
    } else {
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

  const handleTimeChange = useCallback((pickedDate?: Date) => {
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

  const handleShowInCalendarChange = useCallback((showInCalendar: boolean) => {
    setNewTask(prev => ({ ...prev, showInCalendar }))
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

  const handleTagChange = useCallback((tags: Tag[]) => {
    setNewTask(prev => ({ ...prev, tags }))
  }, [])

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
        <Form gap={isIpad() ? "$2.5" : "$2.5"} px={isIpad() ? 6 : 4}pb={12}>
          <TaskNameInput
            value={newTask.name}
            onChange={handleTextChange}
          />
          <PrioritySelector selectedPriority={newTask.priority} onPrioritySelect={handlePrioritySelect}/>

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
         <ShowInCalendar
            showInCalendar={newTask.showInCalendar ?? false}
            onShowInCalendarChange={handleShowInCalendarChange}
            isDark={isDark}
           />
          <CategorySelector selectedCategory={newTask.category} onCategorySelect={handleCategorySelect}/>
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
            <TagSelector onTagsChange={handleTagChange} tags={newTask.tags || []}/>
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
