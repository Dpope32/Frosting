import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button, Form, YStack, XStack, Text, ScrollView, AnimatePresence, isWeb } from 'tamagui'
import { Switch, useColorScheme, Platform, View } from 'react-native'
import { Task, TaskPriority, TaskCategory, RecurrencePattern } from '@/types/task'
import { useProjectStore } from '@/store/ToDo'
import { useUserStore } from '@/store/UserStore'
import { useToastStore } from '@/store/ToastStore'
import { useEditTaskStore } from '@/store/EditTaskStore' // Import the new store
import DateTimePicker from '@react-native-community/datetimepicker'
import { format, parse } from 'date-fns'
import { syncTasksToCalendar } from '@/services'
import { BaseCardAnimated } from '@/components/cardModals/BaseCardAnimated'
import { getDefaultTask, WEEKDAYS, RECURRENCE_PATTERNS, MONTHS } from '../../services/taskService'
import { DebouncedInput } from '../shared/debouncedInput'
import { getCategoryColor, getPriorityColor, getRecurrenceColor, withOpacity, dayColors } from '@/utils/styleUtils';

import { UserPreferences } from '@/store/UserStore'; // Import UserPreferences type

interface EditTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditTaskModalContentProps {
  task: Task;
  closeModal: () => void;
  isDark: boolean;
  preferences: UserPreferences;
  updateTask: (taskId: string, updatedData: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'completionHistory'>>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

// Internal component containing the modal UI and logic
function EditTaskModalContent({
  task,
  closeModal,
  isDark, // Receive props
  preferences,
  updateTask,
  showToast,
}: EditTaskModalContentProps): JSX.Element {
  // State hooks remain inside this component as they are specific to the form
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editedTask, setEditedTask] = useState<Omit<Task, 'id' | 'completed' | 'completionHistory' | 'createdAt' | 'updatedAt'>>(getDefaultTask());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<any>(null);

  // Initialize form state when task prop changes
  useEffect(() => {
    // No need to check task here, as this component only renders when it's valid
    setEditedTask({
      name: task.name,
        time: task.time,
        schedule: task.schedule || [],
        recurrencePattern: task.recurrencePattern,
        recurrenceDate: task.recurrenceDate,
        priority: task.priority,
        category: task.category,
        showInCalendar: task.showInCalendar,
        dueDate: task.dueDate, // Keep dueDate if it exists
        // Note: We don't copy id, completed, completionHistory, createdAt, updatedAt
      });

      // Initialize date/time picker state
      let initialDate = new Date();
      if (task.time) {
        try {
          // Attempt to parse the time string (e.g., "9:00 AM") into today's date with that time
          const parsedTime = parse(task.time, 'h:mm a', new Date());
          if (!isNaN(parsedTime.getTime())) {
            initialDate = parsedTime;
          }
        } catch (e) { console.error("Error parsing task time:", e); }
      } else if (task.recurrenceDate) {
         try {
            // Use recurrenceDate if time is not set
            const recDate = new Date(task.recurrenceDate);
             if (!isNaN(recDate.getTime())) {
                initialDate.setFullYear(recDate.getFullYear(), recDate.getMonth(), recDate.getDate());
             }
         } catch (e) { console.error("Error parsing recurrence date:", e); }
      }
      setSelectedDate(initialDate);

      // Focus input after a short delay
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    // No need for the 'else' block here, this component only renders when task is valid.
    // Reset other states when the task prop changes
    setShowTimePicker(false);
    setIsSubmitting(false);
  }, [task]); // Rerun only when task prop changes

  const handleTextChange = useCallback((text: string) => {
    setEditedTask(prev => ({ ...prev, name: text }))
  }, [])

  const toggleDay = useCallback((day: string, e?: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const fullDay = WEEKDAYS[day];
    setEditedTask(prev => ({
      ...prev,
      schedule: prev.schedule.includes(fullDay)
        ? prev.schedule.filter(d => d !== fullDay)
        : [...prev.schedule, fullDay],
    }));
  }, []);

  const handleTimeChange = useCallback((event: any, pickedDate?: Date) => {
    if (pickedDate) {
      setSelectedDate(pickedDate)
      const timeString = format(pickedDate, 'h:mm a')
      setEditedTask(prev => ({ ...prev, time: timeString }))
    }
  }, [])

  const handleWebTimeChange = useCallback((date: Date) => {
    const timeString = format(date, 'h:mm a')
    setEditedTask(prev => ({ ...prev, time: timeString }))
    setSelectedDate(date)
  }, [])

  const handleTimePress = useCallback(() => {
    setShowTimePicker(!showTimePicker)
  }, [showTimePicker])

  const handleRecurrenceSelect = useCallback((pattern: RecurrencePattern, e?: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setEditedTask(prev => ({
      ...prev,
      recurrencePattern: pattern,
      // Ensure recurrenceDate is set, default to today if not already set
      recurrenceDate: prev.recurrenceDate || new Date().toISOString().split('T')[0]
    }));
  }, []);

  const handlePrioritySelect = useCallback((value: TaskPriority, e?: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setEditedTask(prev => ({ ...prev, priority: value }));
  }, []);

  const handleCategorySelect = useCallback((value: TaskCategory, e?: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setEditedTask(prev => ({ ...prev, category: value }));
  }, []);

  const handleUpdateTask = useCallback(async () => {
    if (isSubmitting || !task) return 
    try {
      if (!editedTask.name.trim()) {
        showToast('Please enter a task name')
        return
      }
      if (editedTask.schedule.length === 0 &&
          (editedTask.recurrencePattern === 'weekly' || editedTask.recurrencePattern === 'biweekly')) {
        showToast(`Please select at least one day for ${editedTask.recurrencePattern} tasks`)
        return
      }
      setIsSubmitting(true)

      const taskUpdateData: Partial<Task> = {
        name: editedTask.name.trim(),
        time: editedTask.time,
        schedule:
          editedTask.recurrencePattern === 'one-time'
            ? []
            : (editedTask.recurrencePattern === 'weekly' || editedTask.recurrencePattern === 'biweekly')
              ? editedTask.schedule
              : [], 
        recurrencePattern: editedTask.recurrencePattern,
        recurrenceDate: editedTask.recurrenceDate,
        priority: editedTask.priority,
        category: editedTask.category,
        showInCalendar: editedTask.showInCalendar,
      };

      try {
        updateTask(task.id, taskUpdateData) 
        if (taskUpdateData.showInCalendar !== task.showInCalendar) { 
          syncTasksToCalendar()
        }
        closeModal() 
        showToast('Successfully updated task!')
      } catch {
        showToast('Failed to update task. Please try again.')
        closeModal() 
      }
    } catch {
      showToast('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [editedTask, updateTask, closeModal, showToast, isSubmitting, task])

  return (
    <ScrollView
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        style={{ maxWidth: isWeb ? 800 : '100%' }}
      >
      <Form gap="$2.5" onSubmit={handleUpdateTask}>
        <DebouncedInput
          ref={inputRef}
          placeholder="Enter task name"
          value={editedTask.name}
          onDebouncedChange={handleTextChange}
          onFocus={(e) => {
            if (Platform.OS === 'web') {
              e.stopPropagation();
              e.preventDefault();
            }
          }}
          borderWidth={1}
          autoCapitalize="sentences"
          autoCorrect={true}
          spellCheck={true}
          br={12}
          fontFamily="$body"
          px="$3"
          height={50}
          fontSize={17}
          fontWeight="400"
          theme={isDark ? "dark" : "light"}
          backgroundColor={isDark ? "$gray2" : "white"}
          borderColor={isDark ? "$gray7" : "$gray4"}
          color={isDark ? "$gray12" : "$gray11"}
          focusStyle={{
            borderColor: isDark ? "$gray7" : "$gray4",
          }}
        />
        <XStack alignItems="center" justifyContent="space-between" px="$2" gap="$3">
          <XStack alignItems="center" gap="$1">
            <Text fontFamily="$body" color={isDark ? "$gray12" : "$gray11"} fontSize={14}>
              Show in Calendar
            </Text>
            <Switch
              value={editedTask.showInCalendar || false}
              onValueChange={val => setEditedTask(prev => ({ ...prev, showInCalendar: val }))}
              style={{ transform: [{ scaleX: 0.8}, { scaleY: 0.8}] }} 
            />
          </XStack>

          <YStack flex={1} alignItems='flex-end'>
            <Button
              onPress={handleTimePress}
              theme={isDark ? "dark" : "light"}
              backgroundColor="transparent"
              br={12}
              height={50}
              borderColor={isDark ? "$gray7" : "$gray4"}
              borderWidth={1}
              px="$3"
              pressStyle={{ opacity: 0.8 }}
              jc="flex-start"
              width="100%"
            >
              <XStack flex={1} alignItems="center" justifyContent="space-between">
                <Text fontFamily="$body" color={isDark ? "$gray12" : "$gray11"} fontSize={14}>
                  {editedTask.time || "Select time"}
                </Text>
                <Text fontFamily="$body" color={isDark ? "$gray11" : "$gray10"} fontSize={14}>
                  {showTimePicker ? '▲' : '▼'}
                </Text>
              </XStack>
            </Button>

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

        <YStack gap="$2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$2" py="$1">
              {RECURRENCE_PATTERNS.map(pattern => {
                const recurrenceColor = getRecurrenceColor(pattern.value);
                return (
                  <Button
                    key={pattern.value}
                    backgroundColor={
                      editedTask.recurrencePattern === pattern.value
                        ? withOpacity(recurrenceColor, 0.15)
                        : isDark ? "$gray2" : "white"
                    }
                    pressStyle={{ opacity: 0.8, scale: 0.98 }}
                    onPress={(e) => handleRecurrenceSelect(pattern.value, e)}
                    br={20}
                    px="$3"
                    py="$2.5"
                    borderWidth={1}
                    borderColor={
                      editedTask.recurrencePattern === pattern.value
                        ? 'transparent'
                        : isDark ? "$gray7" : "$gray4"
                    }
                  >
                    <XStack alignItems="center" gap="$1.5">
                      <Text
                        fontSize={14}
                        fontWeight="600"
                        fontFamily="$body"
                        color={editedTask.recurrencePattern === pattern.value ? recurrenceColor : isDark ? "$gray12" : "$gray11"}
                      >
                        {pattern.label}
                      </Text>
                    </XStack>
                  </Button>
                );
              })}
            </XStack>
          </ScrollView>
        </YStack>

        <AnimatePresence>
          {(editedTask.recurrencePattern === 'weekly' || editedTask.recurrencePattern === 'biweekly') && (
            <YStack gap="$3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="$2" py="$1">
                  {Object.entries(WEEKDAYS).map(([sd, fd]) => {
                    const dayColor = dayColors[sd as keyof typeof dayColors] || preferences.primaryColor;
                    return (
                      <Button
                        key={sd}
                        backgroundColor={
                          editedTask.schedule.includes(fd)
                            ? withOpacity(dayColor, 0.15)
                            : isDark ? "$gray2" : "white"
                        }
                        pressStyle={{ opacity: 0.8, scale: 0.98 }}
                        onPress={(e) => toggleDay(sd, e)}
                        br={24}
                        px="$2"
                        py="$2.5"
                        borderWidth={1}
                        borderColor={
                          editedTask.schedule.includes(fd)
                            ? 'transparent'
                            : isDark ? "$gray7" : "$gray4"
                        }
                      >
                        <Text
                          fontSize={14}
                          fontWeight="600"
                          fontFamily="$body"
                          color={editedTask.schedule.includes(fd) ? dayColor : isDark ? "$gray12" : "$gray11"}
                        >
                          {sd.toUpperCase()}
                        </Text>
                      </Button>
                    );
                  })}
                </XStack>
              </ScrollView>
            </YStack>
          )}

          {(editedTask.recurrencePattern === 'monthly' || editedTask.recurrencePattern === 'yearly') && (
            <YStack gap="$3">
              {editedTask.recurrencePattern === 'yearly' && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <XStack gap="$2" py="$1">
                    {MONTHS.map((m, i) => (
                      <Button
                        key={m}
                        backgroundColor={
                          new Date(editedTask.recurrenceDate || new Date().toISOString()).getMonth() === i
                            ? preferences.primaryColor
                            : isDark ? "$gray2" : "white"
                        }
                        pressStyle={{ opacity: 0.8, scale: 0.98 }}
                        onPress={() => {
                          const d = new Date(editedTask.recurrenceDate || new Date().toISOString())
                          d.setMonth(i)
                          setEditedTask(prev => ({ ...prev, recurrenceDate: d.toISOString().split('T')[0] }))
                        }}
                        br={24}
                        px="$2"
                        py="$2.5"
                        borderWidth={1}
                        borderColor={
                          new Date(editedTask.recurrenceDate || new Date().toISOString()).getMonth() === i
                            ? 'transparent'
                            : isDark ? "$gray7" : "$gray4"
                        }
                        minWidth={45}
                      >
                        <Text
                          fontSize={14}
                          fontWeight="600"
                          fontFamily="$body"
                          color={
                            new Date(editedTask.recurrenceDate || new Date().toISOString()).getMonth() === i
                              ? '#fff'
                              : isDark ? "$gray12" : "$gray11"
                          }
                        >
                          {m.substring(0, 3)}
                        </Text>
                      </Button>
                    ))}
                  </XStack>
                </ScrollView>
              )}
              <ScrollView
                horizontal={!isWeb}
                showsHorizontalScrollIndicator={false}
              >
                <XStack
                  gap="$2"
                  py="$1"
                  flexWrap={isWeb ? 'wrap' : 'nowrap'}
                >
                  {Array.from({ length: 31 }, (_, idx) => idx + 1).map(d => (
                    <Button
                      key={d}
                      backgroundColor={
                        new Date(editedTask.recurrenceDate || new Date().toISOString()).getDate() === d
                          ? preferences.primaryColor
                          : isDark ? "$gray2" : "white"
                      }
                      pressStyle={{ opacity: 0.8, scale: 0.98 }}
                      onPress={() => {
                        const dt = new Date(editedTask.recurrenceDate || new Date().toISOString())
                        dt.setDate(d)
                        setEditedTask(prev => ({ ...prev, recurrenceDate: dt.toISOString().split('T')[0] }))
                      }}
                      br={24}
                      px="$2"
                      py="$2.5"
                      borderWidth={1}
                      borderColor={
                        new Date(editedTask.recurrenceDate || new Date().toISOString()).getDate() === d
                          ? 'transparent'
                          : isDark ? "$gray7" : "$gray4"
                      }
                      minWidth={45}
                      mb={isWeb ? '$2' : '$0'}
                    >
                      <Text
                        fontSize={14}
                        fontWeight="600"
                        fontFamily="$body"
                        color={
                          new Date(editedTask.recurrenceDate || new Date().toISOString()).getDate() === d
                            ? '#fff'
                            : isDark ? "$gray12" : "$gray11"
                        }
                      >
                        {d}
                      </Text>
                    </Button>
                  ))}
                </XStack>
              </ScrollView>
            </YStack>
          )}
        </AnimatePresence>

        <YStack px="$2" gap="$1.5">
          <Text color={isDark ? "$gray8" : "$gray9"} fontFamily="$body" fontWeight="500">Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
            <XStack gap="$2">
              {['work','health','personal','family','wealth'].map(cat => {
                const color = getCategoryColor(cat as TaskCategory);
                return (
                  <Button
                    key={cat}
                    onPress={(e) => handleCategorySelect(cat as TaskCategory, e)}
                    backgroundColor={
                      editedTask.category === cat
                        ? withOpacity(color, 0.15)
                        : isDark ? "$gray2" : "white"
                    }
                    pressStyle={{ opacity: 0.8, scale: 0.98 }}
                    br={20}
                    px="$3"
                    py="$2.5"
                    borderWidth={1}
                    borderColor={
                      editedTask.category === cat
                        ? 'transparent'
                        : isDark ? "$gray7" : "$gray4"
                    }
                  >
                    <Text
                      fontSize={14}
                      fontWeight="600"
                      fontFamily="$body"
                      color={editedTask.category === cat ? color : isDark ? "$gray12" : "$gray11"}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </Button>
                );
              })}
            </XStack>
          </ScrollView>
        </YStack>

        <YStack px="$2" gap="$1">
          <Text color={isDark ? "$gray9" : "$gray11"} fontFamily="$body" fontWeight="500">Priority</Text>
          <XStack gap="$2" mt="$1">
            {['high', 'medium', 'low'].map(priority => {
              const color = getPriorityColor(priority as TaskPriority);
              return (
                <Button
                  key={priority}
                  onPress={(e) => handlePrioritySelect(priority as TaskPriority, e)}
                  backgroundColor={
                    editedTask.priority === priority
                      ? withOpacity(color, 0.15)
                      : isDark ? "$gray2" : "white"
                  }
                  pressStyle={{ opacity: 0.8, scale: 0.98 }}
                  br={20}
                  px="$3"
                  py="$2.5"
                  borderWidth={1}
                  borderColor={
                    editedTask.priority === priority
                      ? 'transparent'
                      : isDark ? "$gray7" : "$gray4"
                  }
                >
                  <Text
                    fontSize={14}
                    fontFamily="$body"
                    fontWeight={editedTask.priority === priority ? "700" : "600"}
                    color={editedTask.priority === priority ? color : isDark ? "$gray12" : "$gray11"}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </Button>
              );
            })}
          </XStack>
        </YStack>

        <Form.Trigger asChild>
          <Button
            backgroundColor={preferences.primaryColor}
            height={42}
            py={12}
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
            br={12}
            px={12}
            alignSelf="center"
            m={20}
            width="90%"
            shadowColor="black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            elevation={3}
            disabled={isSubmitting}
            opacity={isSubmitting ? 0.7 : 1}
          >
            <Text fontFamily="$body" color="white" fontWeight="600" fontSize={16}>
              {isSubmitting ? 'Updating...' : 'Update Task'}
            </Text>
          </Button>
        </Form.Trigger>
      </Form>
    </ScrollView>
  );
}

// Main export component - Calls hooks unconditionally and renders content conditionally
export function EditTaskModal({ open, onOpenChange }: EditTaskModalProps): JSX.Element | null {
  const { taskToEdit, closeModal } = useEditTaskStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';

  // If the modal is not supposed to be open based on props, or no task is selected, return null
  if (!open || !taskToEdit) {
    return null;
  }

  // Pass necessary props down to BaseCardAnimated or handle modal visibility/closing
  return (
    <BaseCardAnimated
      onClose={() => onOpenChange(false)} 
      title="Edit Task"
      showCloseButton={true}
    >
      <EditTaskModalContent
        task={taskToEdit}
        closeModal={() => onOpenChange(false)}
        isDark={isDark}
        preferences={useUserStore().preferences}
        updateTask={useProjectStore().updateTask}
        showToast={useToastStore().showToast}
      />
    </BaseCardAnimated>
  );
}
