import React, { useState, useEffect, useCallback } from 'react'
import { Platform, Keyboard, KeyboardEvent, TextInput, View, InteractionManager } from 'react-native'
import { Form, ScrollView, isWeb } from 'tamagui'
import { format } from 'date-fns'
import * as Haptics from 'expo-haptics'

import {
  Task,
  TaskPriority,
  TaskCategory,
  RecurrencePattern,
  WeekDay,
} from "@/types";
import { Tag } from "@/types";
import { useProjectStore } from "@/store/ToDo";
import { useUserStore, useToastStore } from "@/store";
import { syncTasksToCalendar, getDefaultTask, WEEKDAYS } from "@/services";
import { scheduleEventNotification } from "@/services/notificationServices";
import { useDeviceId } from "@/hooks/sync/useDeviceId";
import { addSyncLog } from "@/components/sync/syncUtils";
import { Base } from "./Base";
import { RecurrenceSelector } from "./RecurrenceSelector";
import { DaySelector } from "./DaySelector";
import { useAutoFocus } from "@/hooks/useAutoFocus";
import { PrioritySelector } from "./PrioritySelector";
import { SubmitButton } from "./SubmitButton";
import { isIpad } from "@/utils";
import { DateSelector } from "./DateSelector";
import { styles } from "@/components/styles";
import { AdvancedSettings } from "./AdvancedSettings";

interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDark: boolean;
}

export function NewTaskModal({
  open,
  onOpenChange,
  isDark,
}: NewTaskModalProps): JSX.Element | null {
  if (!open) {
    return null;
  }

  const { addTask } = useProjectStore();
  const { preferences } = useUserStore();
  const { showToast } = useToastStore();
  const premium = useUserStore((s) => s.preferences.premium === true);
  const { deviceId } = useDeviceId(premium);

  const [taskName, setTaskName] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTask, setNewTask] = useState<
    Omit<
      Task,
      "id" | "completed" | "completionHistory" | "createdAt" | "updatedAt"
    >
  >(getDefaultTask());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [notifyOnTime, setNotifyOnTime] = useState(false);
  const [notifyBefore, setNotifyBefore] = useState(false);
  const [notifyBeforeTime, setNotifyBeforeTime] = useState<string>("1h");
  const [showNotifyTimeOptions, setShowNotifyTimeOptions] = useState(false);
  const nameInputRef = React.useRef<any>(null);
  const username = useUserStore((state) => state.preferences.username);

  useAutoFocus(nameInputRef, 750, open);

  useEffect(() => {
    if (open) {
      setShowTimePicker(false);
      setTaskName("");
      setNewTask(getDefaultTask());
      setIsSubmitting(false);
      setKeyboardOffset(0);
      setIsKeyboardVisible(false);
      setSelectedDate(new Date());
      setIsAdvancedSettingsOpen(false);
      setIsDatePickerVisible(false);
      setNotifyOnTime(false);
      setNotifyBefore(false);
      setNotifyBeforeTime("1h");
    } else {
      setTimeout(() => {
        setShowTimePicker(false);
        setTaskName("");
        setNewTask(getDefaultTask());
        setIsSubmitting(false);
        setKeyboardOffset(0);
        setIsKeyboardVisible(false);
        setSelectedDate(new Date());
        setIsAdvancedSettingsOpen(false);
        setIsDatePickerVisible(false);
        setNotifyOnTime(false);
        setNotifyBefore(false);
        setNotifyBeforeTime("1h");
      }, 200);
    }
  }, [open]);

  useEffect(() => {
    const onKeyboardShow = (e: KeyboardEvent) => {
      setKeyboardOffset(e.endCoordinates.height);
      setIsKeyboardVisible(true);
    };
    const onKeyboardHide = () => {
      setKeyboardOffset(0);
      setIsKeyboardVisible(false);
    };

    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      onKeyboardShow
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      onKeyboardHide
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const toggleDay = useCallback((day: keyof typeof WEEKDAYS, e?: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const fullDay = WEEKDAYS[day] as WeekDay;
    setNewTask((prev) => ({
      ...prev,
      schedule: prev.schedule.includes(fullDay)
        ? prev.schedule.filter((d) => d !== fullDay)
        : [...prev.schedule, fullDay],
    }));
  }, []);

  const handleTimeChange = useCallback((event: any, pickedDate?: Date) => {
    if (pickedDate) {
      setSelectedDate(pickedDate);
      const timeString = format(pickedDate, "h:mm a");
      setNewTask((prev) => ({ ...prev, time: timeString }));
      setIsAdvancedSettingsOpen(true);
    }
  }, []);

  const handleWebTimeChange = useCallback((date: Date) => {
    const timeString = format(date, "h:mm a");
    setNewTask((prev) => ({ ...prev, time: timeString }));
    setSelectedDate(date);
    setIsAdvancedSettingsOpen(true);
  }, []);

  const handleTimePress = useCallback(() => {
    if (newTask.time) {
      setShowTimePicker(true);
    } else {
      setShowTimePicker(true);
    }
  }, [newTask.time]);

  const handleRecurrenceSelect = useCallback(
    (pattern: RecurrencePattern, e?: any) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      setNewTask((prev) => ({
        ...prev,
        recurrencePattern: pattern,
        recurrenceDate: new Date().toISOString().split("T")[0],
      }));
    },
    []
  );

  const handlePrioritySelect = useCallback((value: TaskPriority, e?: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setNewTask((prev) => ({ ...prev, priority: value }));
  }, []);

  const handleCategorySelect = useCallback((value: TaskCategory, e?: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setNewTask((prev) => ({
      ...prev,
      category: prev.category === value ? "" : value,
    }));
  }, []);

  const handleShowInCalendarChange = useCallback((showInCalendar: boolean) => {
    setNewTask((prev) => ({ ...prev, showInCalendar }));
  }, []);

  const handleDatePickerVisibilityChange = useCallback((visible: boolean) => {
    setIsDatePickerVisible(visible);
    // Don't close advanced settings when the date picker is shown
  }, []);

  const scheduleNotificationForTask = useCallback(
    async (taskName: string, time: string) => {
      if (
        Platform.OS === "web" ||
        Platform.OS === "windows" ||
        Platform.OS === "macos"
      )
        return;

      try {
        // Parse the time string and set it on today's date
        const [hourStr, minuteStr] = time.split(":");
        const [minutes, period] = minuteStr.split(" ");

        let hour = parseInt(hourStr);
        if (period && period.toLowerCase() === "pm" && hour < 12) {
          hour += 12;
        } else if (period && period.toLowerCase() === "am" && hour === 12) {
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
          "Task Reminder",
          `Time to complete: ${taskName}`,
          `task-${taskName}-${Date.now()}`
        );
      } catch (error) {
        console.error("Error scheduling notification:", error);
      }
    },
    []
  );

  // Simple, immediate task name handler - no debouncing during typing
  const handleTaskNameChange = useCallback((value: string) => {
    setTaskName(value);
    // Update newTask immediately to prevent state conflicts
    setNewTask((prev) => ({ ...prev, name: value }));
  }, []);

  const handleAddTask = useCallback(async () => {
    if (isSubmitting) return;
    try {
      if (!taskName.trim()) {
        if (Platform.OS !== "web")
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showToast("Please enter a task name", "error");
        return;
      }
      if (
        newTask.schedule.length === 0 &&
        (newTask.recurrencePattern === "weekly" ||
          newTask.recurrencePattern === "biweekly")
      ) {
        if (Platform.OS !== "web")
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showToast(
          `Please select at least one day for ${newTask.recurrencePattern} tasks`,
          "error"
        );
        return;
      }

      setIsSubmitting(true)

      const taskToAdd = {
        ...newTask,
        name: taskName.trim(),
        schedule:
          newTask.recurrencePattern === "one-time"
            ? []
            : (newTask.recurrencePattern === 'weekly' || newTask.recurrencePattern === 'biweekly')
              ? newTask.schedule
              : [],
        recurrenceDate: newTask.recurrenceDate
      }

      // Close optimistically immediately
      onOpenChange(false)
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

      // Defer heavy work until after interactions/animations
      InteractionManager.runAfterInteractions(() => {
        (async () => {
          try {
            if (taskToAdd.recurrencePattern === 'tomorrow' || taskToAdd.recurrencePattern === 'one-time') {
              const timestamp = new Date().toISOString()
              const deviceInfo = deviceId || 'unknown-device'
              const tn = taskToAdd.name.slice(0, 30)
              const pattern = taskToAdd.recurrencePattern

              addSyncLog(
                `[NEW TASK] "${tn}" created with pattern: ${pattern}`,
                'info',
                `Device: ${deviceInfo} | Timestamp: ${timestamp} | Full name: "${taskToAdd.name}" | Category: ${taskToAdd.category || 'none'} | Priority: ${taskToAdd.priority} | Time: ${taskToAdd.time || 'none'} | Schedule: [${taskToAdd.schedule.join(', ')}] | RecurrenceDate: ${taskToAdd.recurrenceDate || 'none'}`
              )

              if (pattern === 'tomorrow') {
                const createdDate = new Date().toISOString().split('T')[0]
                addSyncLog(
                  `[TOMORROW TASK] "${tn}" created on ${createdDate} - will be due tomorrow`,
                  'info',
                  `This task should convert to one-time after midnight. Created at: ${timestamp} on device: ${deviceInfo}`
                )
              }

              if (pattern === 'one-time') {
                addSyncLog(
                  `[ONE-TIME TASK] "${tn}" created - completion will be permanent`,
                  'info',
                  `One-time tasks stay completed once marked done. Created at: ${timestamp} on device: ${deviceInfo}`
                )
              }
            }

            addTask(taskToAdd)
            if (taskToAdd.showInCalendar) {
              syncTasksToCalendar()
            }
            if (notifyOnTime && taskToAdd.time) {
              // Fire-and-forget; internal try/catch already handles errors
              scheduleNotificationForTask(taskToAdd.name, taskToAdd.time)
            }

            showToast('Task added successfully', 'success')
          } catch {
            showToast('Failed to add task. Please try again.', 'error')
          }
        })()
      })
    } catch {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      showToast('An error occurred. Please try again.', 'error')
    }
  }, [
    taskName,
    newTask,
    addTask,
    onOpenChange,
    showToast,
    isSubmitting,
    notifyOnTime,
    scheduleNotificationForTask,
  ]);

  const handleTagChange = useCallback((tags: Tag[]) => {
    setNewTask((prev) => ({ ...prev, tags }));
  }, []);

  // Determine if submit button should be hidden
  const shouldHideSubmitButton = isDatePickerVisible || showNotifyTimeOptions;

  const titleContent = (
    <View
      style={{
        width: "100%",
        alignSelf: "center",
        paddingTop: isWeb ? 20 : 18,
        paddingBottom: isWeb ? 8 : 6,
        paddingHorizontal: isWeb ? -8 : -4,
      }}
    >
      <View
        style={{
          width: "108%",
          alignSelf: "center",
          minHeight: isWeb ? 52 : 48,
          borderWidth: isDark ? 1 : 1.5,
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.2)"
            : "rgba(0, 0, 0, 0.12)",
          backgroundColor: isDark
            ? "rgba(0, 0, 0, 0.4)"
            : "rgba(248, 250, 252, 0.9)",
          borderRadius: isWeb ? 14 : 12,
          paddingHorizontal: isWeb ? 20 : 18,
          paddingVertical: isWeb ? 16 : 14,
          shadowColor: isDark ? "transparent" : "rgba(0, 0, 0, 0.08)",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0 : 0.1,
          shadowRadius: 4,
          elevation: isDark ? 0 : 2,
        }}
      >
        <TextInput
          ref={nameInputRef}
          placeholder={`What do you need to do ${username}?`}
          placeholderTextColor={
            isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.45)"
          }
          value={taskName}
          onChangeText={handleTaskNameChange}
          autoCapitalize="sentences"
          autoCorrect={true}
          spellCheck={true}
          style={{
            fontSize: isWeb ? 16 : isIpad() ? 15 : 14,
            fontFamily: "System",
            fontWeight: "400",
            color: isDark ? "#fff" : "#1f2937",
            minHeight: isWeb ? 20 : 18,
            textAlignVertical: "center",
            padding: 0,
            margin: 0,
            lineHeight: isWeb ? 24 : 20,
            ...(isWeb && {
              outline: "none",
              border: "none",
              boxShadow: "none",
              backgroundColor: "transparent",
            }),
          }}
          multiline={false}
          textContentType="none"
          autoComplete="off"
          selectionColor={
            isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(59, 130, 246, 0.4)"
          }
        />
      </View>
    </View>
  );

  return (
    <Base
      onClose={() => {
        if (Platform.OS === "web") {
          setTimeout(() => onOpenChange(false), 100);
        } else {
          onOpenChange(false);
        }
      }}
      showCloseButton={true}
      keyboardOffset={isKeyboardVisible ? keyboardOffset : 0}
      titleContent={titleContent}
    >
      <ScrollView
        contentContainerStyle={{}}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <Form
          gap={isIpad() ? "$2.5" : "$2.5"}
          px={isIpad() ? 6 : 6}
          pb={12}
          pt={isWeb ? 0 : isIpad() ? 0 : -4}
        >
          <PrioritySelector
            selectedPriority={newTask.priority}
            onPrioritySelect={handlePrioritySelect}
            time={newTask.time}
            onTimePress={handleTimePress}
            isDark={isDark}
          />

          <RecurrenceSelector
            selectedPattern={newTask.recurrencePattern}
            onPatternSelect={handleRecurrenceSelect}
          />

          {(newTask.recurrencePattern === "weekly" ||
            newTask.recurrencePattern === "biweekly") && (
            <DaySelector
              selectedDays={newTask.schedule}
              onDayToggle={toggleDay}
            />
          )}

          {(newTask.recurrencePattern === "monthly" ||
            newTask.recurrencePattern === "yearly") && (
            <DateSelector
              isYearly={newTask.recurrencePattern === "yearly"}
              recurrenceDate={
                newTask.recurrenceDate || new Date().toISOString().split("T")[0]
              }
              onDateSelect={(date) =>
                setNewTask((prev) => ({ ...prev, recurrenceDate: date }))
              }
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
  );
}
