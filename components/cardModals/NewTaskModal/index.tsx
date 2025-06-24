import React, { useState, useEffect, useCallback } from 'react'
import { Platform, Keyboard, KeyboardEvent, TextInput, View } from 'react-native'
import { Form, ScrollView, isWeb } from 'tamagui'
import { format } from 'date-fns'
import * as Haptics from 'expo-haptics'

import { Task, TaskPriority, TaskCategory, RecurrencePattern, WeekDay } from '@/types'
import { Tag } from '@/types'
import { useProjectStore } from '@/store/ToDo'
import { useUserStore, useToastStore } from '@/store'
import { syncTasksToCalendar, getDefaultTask, WEEKDAYS } from '@/services'
import { scheduleEventNotification } from '@/services/notificationServices'
import { useDeviceId } from '@/hooks/sync/useDeviceId'
import { addSyncLog } from '@/components/sync/syncUtils'
import { Base } from './Base'
import { RecurrenceSelector } from './RecurrenceSelector'
import { DaySelector } from './DaySelector'
import { useAutoFocus } from '@/hooks/useAutoFocus'
import { PrioritySelector } from './PrioritySelector'
import { SubmitButton } from './SubmitButton'
import { isIpad } from '@/utils'
import { DateSelector } from './DateSelector'
import { styles } from '@/components/styles'
import { AdvancedSettings } from './AdvancedSettings'

interface NewTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isDark: boolean
}

export function NewTaskModal({ open, onOpenChange, isDark }: NewTaskModalProps): JSX.Element | null {
  if (!open) { return null}
  
  const { addTask } = useProjectStore()
  const { preferences } = useUserStore()
  const { showToast } = useToastStore()
  const premium = useUserStore((s) => s.preferences.premium === true)
  const { deviceId } = useDeviceId(premium)
  
  // Separate task name state to prevent cascading re-renders
  const [taskName, setTaskName] = useState('')
  
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'completed' | 'completionHistory' | 'createdAt' | 'updatedAt'>>(getDefaultTask())
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Stabilize keyboard offset to prevent bouncing
  const [keyboardOffset, setKeyboardOffset] = useState(0)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false)
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false)
  const [notifyOnTime, setNotifyOnTime] = useState(false)
  const [notifyBefore, setNotifyBefore] = useState(false)
  const [notifyBeforeTime, setNotifyBeforeTime] = useState<string>('1h')
  const [showNotifyTimeOptions, setShowNotifyTimeOptions] = useState(false)
  const nameInputRef = React.useRef<any>(null);
  const username = useUserStore((state) => state.preferences.username)

  useAutoFocus(nameInputRef, 750, open);

  useEffect(() => {
    if (open) {
      setShowTimePicker(false);
      setTaskName(''); // Reset separate task name state
      setNewTask(getDefaultTask());
      setIsSubmitting(false);
      setKeyboardOffset(0);
      setIsKeyboardVisible(false);
      setSelectedDate(new Date()); 
      setIsAdvancedSettingsOpen(false);
      setIsDatePickerVisible(false);
      setNotifyOnTime(false);
      setNotifyBefore(false);
      setNotifyBeforeTime('1h');
    } else {
      setTimeout(() => {
        setShowTimePicker(false);
        setTaskName('');
        setNewTask(getDefaultTask());
        setIsSubmitting(false);
        setKeyboardOffset(0);
        setIsKeyboardVisible(false);
        setSelectedDate(new Date());
        setIsAdvancedSettingsOpen(false);
        setIsDatePickerVisible(false);
        setNotifyOnTime(false);
        setNotifyBefore(false);
        setNotifyBeforeTime('1h');
      }, 200);
    }
  }, [open]);

  // Stabilized keyboard listeners
  useEffect(() => {
    const onKeyboardShow = (e: KeyboardEvent) => {
      setKeyboardOffset(e.endCoordinates.height)
      setIsKeyboardVisible(true)
    }
    const onKeyboardHide = () => {
      setKeyboardOffset(0)
      setIsKeyboardVisible(false)
    }

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
      setIsAdvancedSettingsOpen(true)
    }
  }, [])

  const handleWebTimeChange = useCallback((date: Date) => {
    const timeString = format(date, 'h:mm a')
    setNewTask(prev => ({ ...prev, time: timeString }))
    setSelectedDate(date)
    setIsAdvancedSettingsOpen(true)
  }, [])

  const handleTimePress = useCallback(() => {
    if (newTask.time) {
      // If time is already set, open the time picker to edit it
      setShowTimePicker(true)
    } else {
      // If no time is set, open the time picker
      setShowTimePicker(true)
    }
  }, [newTask.time])

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
    
    setNewTask(prev => ({
      ...prev,
      // If the user clicks the same category that's already selected, unselect it
      category: prev.category === value ? '' : value
    }))
  }, [])

  const handleShowInCalendarChange = useCallback((showInCalendar: boolean) => {
    setNewTask(prev => ({ ...prev, showInCalendar }))
  }, [])

  const handleDatePickerVisibilityChange = useCallback((visible: boolean) => {
    setIsDatePickerVisible(visible);
    // Don't close advanced settings when the date picker is shown
  }, []);

  const scheduleNotificationForTask = useCallback(async (taskName: string, time: string) => {
    if (Platform.OS === 'web' || Platform.OS === 'windows' || Platform.OS === 'macos') return;

    try {
      // Parse the time string and set it on today's date
      const [hourStr, minuteStr] = time.split(':');
      const [minutes, period] = minuteStr.split(' ');
      
      let hour = parseInt(hourStr);
      if (period && period.toLowerCase() === 'pm' && hour < 12) {
        hour += 12;
      } else if (period && period.toLowerCase() === 'am' && hour === 12) {
        hour = 0;
      }
      
      const notificationDate = new Date();
      notificationDate.setHours(hour);
      notificationDate.setMinutes(parseInt(minutes));
      notificationDate.setSeconds(0);
      
      // If the time is in the past for today, schedule for tomorrow
      if (notificationDate.getTime() < Date.now()) {
        notificationDate.setDate(notificationDate.getDate() + 1);
      }
      
      // Schedule the notification
      await scheduleEventNotification(
        notificationDate,
        'Task Reminder',
        `Time to complete: ${taskName}`,
        `task-${taskName}-${Date.now()}`
      );
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }, []);

  // Simple, immediate task name handler - no debouncing during typing
  const handleTaskNameChange = useCallback((value: string) => {
    setTaskName(value)
    // Update newTask immediately to prevent state conflicts
    setNewTask(prev => ({ ...prev, name: value }))
  }, [])

  const handleAddTask = useCallback(async () => {
    if (isSubmitting) return
    try {
      // Use the separate taskName state for validation
      if (!taskName.trim()) {
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
        name: taskName.trim(), // Use separate taskName state
        schedule:
          newTask.recurrencePattern === 'one-time'
            ? []
            : (newTask.recurrencePattern === 'weekly' || newTask.recurrencePattern === 'biweekly')
              ? newTask.schedule
              : [],
        recurrenceDate: newTask.recurrenceDate
      }
      try {
        // 🚨 DEBUG LOGGING: Track tomorrow and one-time task creation
        if (taskToAdd.recurrencePattern === 'tomorrow' || taskToAdd.recurrencePattern === 'one-time') {
          const timestamp = new Date().toISOString()
          const deviceInfo = deviceId || 'unknown-device'
          const taskName = taskToAdd.name.slice(0, 30) // Truncate for readability
          const pattern = taskToAdd.recurrencePattern
          
          addSyncLog(
            `[NEW TASK] "${taskName}" created with pattern: ${pattern}`,
            'info',
            `Device: ${deviceInfo} | Timestamp: ${timestamp} | Full name: "${taskToAdd.name}" | Category: ${taskToAdd.category || 'none'} | Priority: ${taskToAdd.priority} | Time: ${taskToAdd.time || 'none'} | Schedule: [${taskToAdd.schedule.join(', ')}] | RecurrenceDate: ${taskToAdd.recurrenceDate || 'none'}`
          )
          
          // Special logging for tomorrow tasks to track conversion behavior
          if (pattern === 'tomorrow') {
            const createdDate = new Date().toISOString().split('T')[0]
            addSyncLog(
              `[TOMORROW TASK] "${taskName}" created on ${createdDate} - will be due tomorrow`,
              'info',
              `This task should convert to one-time after midnight. Created at: ${timestamp} on device: ${deviceInfo}`
            )
          }
          
          // Special logging for one-time tasks to track completion behavior
          if (pattern === 'one-time') {
            addSyncLog(
              `[ONE-TIME TASK] "${taskName}" created - completion will be permanent`,
              'info',
              `One-time tasks stay completed once marked done. Created at: ${timestamp} on device: ${deviceInfo}`
            )
          }
        }
        
        addTask(taskToAdd)
        if (taskToAdd.showInCalendar) {
          syncTasksToCalendar()
        }
        
        // Schedule notification if notifyOnTime is true and time is set
        if (notifyOnTime && taskToAdd.time) {
          await scheduleNotificationForTask(taskToAdd.name, taskToAdd.time);
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
  }, [taskName, newTask, addTask, onOpenChange, showToast, isSubmitting, notifyOnTime, scheduleNotificationForTask])

  const handleTagChange = useCallback((tags: Tag[]) => {
    setNewTask(prev => ({ ...prev, tags }))
  }, [])

  // Determine if submit button should be hidden
  const shouldHideSubmitButton = isDatePickerVisible || showNotifyTimeOptions;

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
      keyboardOffset={isKeyboardVisible ? keyboardOffset : 0}
    >
      <ScrollView
        contentContainerStyle={{}}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none" 
      >
        <Form gap={isIpad() ? "$2.5" : "$2.5"} px={isIpad() ? 6 : 6} pb={12} pt={isWeb ? 0 : isIpad() ? 0 : -4}>
          <View
            style={{
              width: '98%',
              alignSelf: 'center',
              minHeight: 44,
              borderWidth: 2,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.00)',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
            }}
          >
            <TextInput
              ref={nameInputRef}
              placeholder={`What do you need to do ${username}?`}
              placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
              value={taskName}
              onChangeText={handleTaskNameChange}
              autoCapitalize="sentences"
              autoCorrect={true}
              spellCheck={true}
              style={{
                fontSize: isIpad() ? 17 : 15,
                fontFamily: 'System',
                color: isDark ? '#fff' : '#000',
                minHeight: 20,
                textAlignVertical: 'center',
                padding: 0,
                margin: 0,
              }}
              multiline={false}
              textContentType="none"
              autoComplete="off"
              selectionColor={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}
            />
          </View>
          
          <PrioritySelector 
            selectedPriority={newTask.priority} 
            onPrioritySelect={handlePrioritySelect}
            time={newTask.time}
            onTimePress={handleTimePress}
            isDark={isDark}
          />

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
              onDatePickerVisibilityChange={handleDatePickerVisibilityChange}
            />
          )}
          <View style={{ marginBottom: 10 }}>
          <AdvancedSettings
            category={newTask.category}
            onCategorySelect={handleCategorySelect}
            tags={newTask.tags || []}
            onTagsChange={handleTagChange}
            showInCalendar={newTask.showInCalendar ?? false}
            onShowInCalendarChange={handleShowInCalendarChange}
            showTimePicker={showTimePicker}
            setShowTimePicker={setShowTimePicker}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onTimeChange={handleTimeChange}
            onWebTimeChange={handleWebTimeChange}
            time={newTask.time}
            isDark={isDark}
            primaryColor={preferences.primaryColor}
            isOpen={isAdvancedSettingsOpen}
            onOpenChange={setIsAdvancedSettingsOpen}
            notifyOnTime={notifyOnTime}
            onNotifyOnTimeChange={setNotifyOnTime}
            notifyBefore={notifyBefore}
            onNotifyBeforeChange={setNotifyBefore}
            notifyBeforeTime={notifyBeforeTime}
            onNotifyBeforeTimeChange={setNotifyBeforeTime}
            showNotifyTimeOptions={showNotifyTimeOptions}
            onShowNotifyTimeOptionsChange={setShowNotifyTimeOptions}
          />
        </View>
          {!shouldHideSubmitButton && (
            <Form.Trigger asChild>
              <SubmitButton 
                isSubmitting={isSubmitting} 
                preferences={preferences}
                onPress={handleAddTask}
              />
            </Form.Trigger>
          )}
        </Form>
      </ScrollView>
    </Base>
  )
}
