import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button, Form, YStack, XStack, Text, ScrollView, AnimatePresence, isWeb } from 'tamagui'
import { Switch, useColorScheme, Platform } from 'react-native'
import { Task, TaskPriority, TaskCategory, RecurrencePattern } from '@/types/task'
import { useProjectStore } from '@/store/ToDo'
import { useUserStore } from '@/store/UserStore'
import { useToastStore } from '@/store/ToastStore'
import { useEditTaskStore } from '@/store/EditTaskStore'
import { format, parse } from 'date-fns'
import { syncTasksToCalendar } from '@/services'
import { getDefaultTask, WEEKDAYS, MONTHS } from '../../services/taskService'
import { DebouncedInput } from '../shared/debouncedInput'
import { getCategoryColor, getPriorityColor, withOpacity, dayColors } from '@/utils/styleUtils';
import { UserPreferences } from '@/store/UserStore'; 
import { Base } from './NewTaskModal/Base'
import { useCustomCategoryStore } from '@/store/CustomCategoryStore';
import { TimePicker } from '../shared/TimePicker'
import { RecurrenceSelector } from './NewTaskModal/RecurrenceSelector'
import { CategorySelector } from './NewTaskModal/CategorySelector'
import { DateSelector } from './NewTaskModal/DateSelector'
import { DaySelector } from './NewTaskModal/DaySelector'
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

function EditTaskModalContent({
  task,
  closeModal,
  isDark,
  preferences,
  updateTask,
  showToast,
}: EditTaskModalContentProps): JSX.Element {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editedTask, setEditedTask] = useState<Omit<Task, 'id' | 'completed' | 'completionHistory' | 'createdAt' | 'updatedAt'>>(getDefaultTask());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    setEditedTask({
      name: task.name,
        time: task.time,
        schedule: task.schedule || [],
        recurrencePattern: task.recurrencePattern,
        recurrenceDate: task.recurrenceDate,
        priority: task.priority,
        category: task.category,
        showInCalendar: task.showInCalendar,
        dueDate: task.dueDate,
      });

      let initialDate = new Date();
      if (task.time) {
        try {
          const parsedTime = parse(task.time, 'h:mm a', new Date());
          if (!isNaN(parsedTime.getTime())) {
            initialDate = parsedTime;
          }
        } catch (e) { console.error("Error parsing task time:", e); }
      } else if (task.recurrenceDate) {
         try {
            const recDate = new Date(task.recurrenceDate);
             if (!isNaN(recDate.getTime())) {
                initialDate.setFullYear(recDate.getFullYear(), recDate.getMonth(), recDate.getDate());
             }
         } catch (e) { console.error("Error parsing recurrence date:", e); }
      }
      setSelectedDate(initialDate);

      setTimeout(() => {
        inputRef.current?.focus()
      }, 500)
    setShowTimePicker(false);
    setIsSubmitting(false);
  }, [task]);

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


  const handleRecurrenceSelect = useCallback((pattern: RecurrencePattern, e?: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setEditedTask(prev => ({
      ...prev,
      recurrencePattern: pattern,
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
          <XStack alignItems="center" gap="$2">
            <Text fontFamily="$body" color={isDark ? "#555555" : "$gray11"} fontSize={14} flexWrap= "nowrap">
              Show in Calendar?
            </Text>
            <Switch
              value={editedTask.showInCalendar || false}
              onValueChange={val => setEditedTask(prev => ({ ...prev, showInCalendar: val }))}
              style={{ transform: [{ scaleX: 0.8}, { scaleY: 0.8}] }} 
            />
          </XStack>
          <TimePicker
            showTimePicker={showTimePicker}
            setShowTimePicker={setShowTimePicker}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onTimeChange={handleTimeChange}
            onWebTimeChange={handleWebTimeChange}
            time={editedTask.time}
            isDark={isDark}
            primaryColor={preferences.primaryColor}
          />
        </XStack>


        <YStack gap="$2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <RecurrenceSelector
              selectedPattern={editedTask.recurrencePattern}
              onPatternSelect={handleRecurrenceSelect}
            />
          {(editedTask.recurrencePattern === 'weekly' || editedTask.recurrencePattern === 'biweekly') && (
            <DaySelector
              selectedDays={editedTask.schedule}
              onDayToggle={toggleDay}
            />
          )}

          {(editedTask.recurrencePattern === 'monthly' || editedTask.recurrencePattern === 'yearly') && (
            <DateSelector
              isYearly={editedTask.recurrencePattern === 'yearly'}
              recurrenceDate={editedTask.recurrenceDate || new Date().toISOString().split('T')[0]}
              onDateSelect={(date) => setEditedTask(prev => ({ ...prev, recurrenceDate: date }))}
              preferences={preferences}
            />
          )}
          </ScrollView>
        </YStack>

        <YStack px="$2" gap="$1.5">
          <CategorySelector
            selectedCategory={editedTask.category}
            onCategorySelect={handleCategorySelect}
          />
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
    <Base
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
    </Base>
  );
}
