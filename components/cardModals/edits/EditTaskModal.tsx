import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Form, ScrollView} from 'tamagui'
import { Platform, Keyboard, KeyboardEvent } from 'react-native'
import { Task, TaskPriority, TaskCategory, RecurrencePattern, WeekDay } from '@/types/task'
import { useProjectStore } from '@/store/ToDo'
import { useUserStore } from '@/store/UserStore'
import { useToastStore } from '@/store/ToastStore'
import { useEditTaskStore } from '@/store/EditTaskStore'
import { format } from 'date-fns'
import { syncTasksToCalendar } from '@/services'
import { getDefaultTask, WEEKDAYS } from '@/services'
import { Base } from '../NewTaskModal/Base'
import { RecurrenceSelector } from '../NewTaskModal/RecurrenceSelector'
import { CategorySelector } from '../NewTaskModal/CategorySelector'
import { DateSelector } from '../NewTaskModal/DateSelector'
import { DaySelector } from '../NewTaskModal/DaySelector'
import * as Haptics from 'expo-haptics'
import { TagSelector } from '@/components/notes/TagSelector'
import { Tag } from '@/types/tag'
import { useTagStore } from '@/store/TagStore'
import { ShowInCalendar } from '../NewTaskModal/showInCalendar'
import { PrioritySelector } from '../NewTaskModal/PrioritySelector'
import { SubmitButton } from '../NewTaskModal/SubmitButton'
import { isIpad } from '@/utils/deviceUtils'
import { DebouncedInput } from '@/components/shared/debouncedInput'
import { styles } from '@/components/styles'

interface EditTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDark: boolean;
}

export function EditTaskModal({ open, onOpenChange, isDark }: EditTaskModalProps): JSX.Element | null {
  const { taskToEdit } = useEditTaskStore();
  const { updateTask } = useProjectStore();
  const { preferences } = useUserStore();
  const { showToast } = useToastStore();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editedTask, setEditedTask] = useState<Omit<Task, 'id' | 'completed' | 'completionHistory' | 'createdAt' | 'updatedAt'>>(getDefaultTask());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [tags, setTags] = useState<Tag[]>([]);
  const nameInputRef = useRef<React.ElementRef<typeof DebouncedInput>>(null)
  const username = useUserStore((state) => state.preferences.username)

  useEffect(() => {
    if (open && taskToEdit) {
      setShowTimePicker(false);
      setEditedTask({
        name: taskToEdit.name,
        time: taskToEdit.time,
        schedule: taskToEdit.schedule || [],
        recurrencePattern: taskToEdit.recurrencePattern,
        recurrenceDate: taskToEdit.recurrenceDate,
        priority: taskToEdit.priority,
        category: taskToEdit.category,
        showInCalendar: taskToEdit.showInCalendar,
        dueDate: taskToEdit.dueDate,
        tags: taskToEdit.tags || [],
      });
      setTags(taskToEdit.tags || []);
      setSelectedDate(new Date());
      setIsSubmitting(false);
      setKeyboardOffset(0);
    } else {
      setTimeout(() => {
        setShowTimePicker(false);
        setEditedTask(getDefaultTask());
        setIsSubmitting(false);
        setKeyboardOffset(0);
        setSelectedDate(new Date());
        setTags([]);
      }, 200);
    }
  }, [open, taskToEdit]);

  useEffect(() => {
    const onKeyboardShow = (e: KeyboardEvent) => setKeyboardOffset(e.endCoordinates.height);
    const onKeyboardHide = () => setKeyboardOffset(0);

    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      onKeyboardShow
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      onKeyboardHide
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleTextChange = useCallback((text: string) => {
    setEditedTask(prev => ({ ...prev, name: text }));
  }, []);

  const toggleDay = useCallback((day: keyof typeof WEEKDAYS, e?: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const fullDay = WEEKDAYS[day] as WeekDay;
    setEditedTask(prev => ({
      ...prev,
      schedule: prev.schedule.includes(fullDay)
        ? prev.schedule.filter(d => d !== fullDay)
        : [...prev.schedule, fullDay],
    }));
  }, []);


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

  const handleShowInCalendarChange = useCallback((showInCalendar: boolean) => {
    setEditedTask(prev => ({ ...prev, showInCalendar }));
  }, []);

  const handleTagChange = useCallback((tags: Tag[]) => {
    setEditedTask(prev => ({ ...prev, tags }));
    setTags(tags);
  }, []);

  const handleUpdateTask = useCallback(async () => {
    if (isSubmitting || !taskToEdit) return;
    try {
      if (!editedTask.name.trim()) {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showToast('Please enter a task name', 'error');
        return;
      }
      if (editedTask.schedule.length === 0 &&
          (editedTask.recurrencePattern === 'weekly' || editedTask.recurrencePattern === 'biweekly')) {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showToast(`Please select at least one day for ${editedTask.recurrencePattern} tasks`, 'error');
        return;
      }
      setIsSubmitting(true);
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
        tags: editedTask.tags,
      };
      try {
        updateTask(taskToEdit.id, taskUpdateData);
        if (taskUpdateData.showInCalendar !== taskToEdit.showInCalendar) {
          syncTasksToCalendar();
        }
        setTimeout(() => onOpenChange(false), Platform.OS === 'web' ? 300 : 200);
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast('Successfully updated task!', 'success');
      } catch {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showToast('Failed to update task. Please try again.', 'error');
        setTimeout(() => onOpenChange(false), Platform.OS === 'web' ? 300 : 100);
      }
    } catch {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [editedTask, updateTask, onOpenChange, showToast, isSubmitting, taskToEdit]);

  if (!open || !taskToEdit) {
    return null;
  }

  return (
    <Base
      onClose={() => {
        if (Platform.OS === 'web') {
          setTimeout(() => onOpenChange(false), 100);
        } else {
          onOpenChange(false);
        }
      }}
      title="Edit Task"
      showCloseButton={true}
      keyboardOffset={keyboardOffset}
    >
      <ScrollView contentContainerStyle={{}} keyboardShouldPersistTaps="handled">
        <Form gap={isIpad() ? "$2.5" : "$2.5"} px={isIpad() ? 6 : 4} py={isIpad() ? 4 : 2} pb={12}>
          <DebouncedInput
            ref={nameInputRef}
            style={[styles.input, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)', color: isDark ? '#fff' : '#000' }]}
            placeholder={`What do you need to do ${username}?`} 
            placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
            value={editedTask.name}
            onDebouncedChange={(value) => setEditedTask(prev => ({ ...prev, name: value }))}
          />
          <PrioritySelector selectedPriority={editedTask.priority} onPrioritySelect={handlePrioritySelect}/>

          <RecurrenceSelector
            selectedPattern={editedTask.recurrencePattern}
            onPatternSelect={handleRecurrenceSelect} />

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
          <ShowInCalendar
            showInCalendar={editedTask.showInCalendar ?? false}
            onShowInCalendarChange={handleShowInCalendarChange}
            isDark={isDark}
          />
          <CategorySelector selectedCategory={editedTask.category} onCategorySelect={handleCategorySelect}/>
          <TagSelector onTagsChange={handleTagChange} tags={editedTask.tags || []}/>
          <Form.Trigger asChild>
            <SubmitButton
              isSubmitting={isSubmitting}
              preferences={preferences}
              onPress={handleUpdateTask}
            />
          </Form.Trigger>
        </Form>
      </ScrollView>
    </Base>
  );
}
