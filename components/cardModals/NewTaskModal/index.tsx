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
import { AdvancedSettings } from "./AdvancedSettings";
import { TitleContent } from "./titleContent";

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
  if (!open) return null;

  const { addTask } = useProjectStore();
  const { preferences } = useUserStore();
  const { showToast } = useToastStore();
  const premium = useUserStore((s) => s.preferences.premium === true);
  const { deviceId } = useDeviceId(premium);

  const [taskName, setTaskName] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTask, setNewTask] = useState< Omit<Task, "id" | "completed" | "completionHistory" | "createdAt" | "updatedAt">>(getDefaultTask());
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

        if (notificationDate.getTime() < Date.now()) {
          notificationDate.setDate(notificationDate.getDate() + 1);
        }

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

  const handleTaskNameChange = useCallback((value: string) => {
    setTaskName(value);
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

      setIsSubmitting(true);

      const taskToAdd = {
        ...newTask,
        name: taskName.trim(),
        schedule:
          newTask.recurrencePattern === "one-time"
            ? []
            : newTask.recurrencePattern === "weekly" ||
              newTask.recurrencePattern === "biweekly"
            ? newTask.schedule
            : [],
        recurrenceDate: newTask.recurrenceDate,
      };

      onOpenChange(false);
      if (Platform.OS !== "web")
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      InteractionManager.runAfterInteractions(() => {
        (async () => {
          try {
            if (
              taskToAdd.recurrencePattern === "tomorrow" ||
              taskToAdd.recurrencePattern === "one-time"
            ) {
              const timestamp = new Date().toISOString();
              const deviceInfo = deviceId || "unknown-device";
              const tn = taskToAdd.name.slice(0, 30);
              const pattern = taskToAdd.recurrencePattern;

              addSyncLog(
                `[NEW TASK] "${tn}" created with pattern: ${pattern}`,
                "info",
                `Device: ${deviceInfo} | Timestamp: ${timestamp} | Full name: "${
                  taskToAdd.name
                }" | Category: ${taskToAdd.category || "none"} | Priority: ${
                  taskToAdd.priority
                } | Time: ${
                  taskToAdd.time || "none"
                } | Schedule: [${taskToAdd.schedule.join(
                  ", "
                )}] | RecurrenceDate: ${taskToAdd.recurrenceDate || "none"}`
              );

              if (pattern === "tomorrow") {
                const createdDate = new Date().toISOString().split("T")[0];
                addSyncLog(
                  `[TOMORROW TASK] "${tn}" created on ${createdDate} - will be due tomorrow`,
                  "info",
                  `This task should convert to one-time after midnight. Created at: ${timestamp} on device: ${deviceInfo}`
                );
              }

              if (pattern === "one-time") {
                addSyncLog(
                  `[ONE-TIME TASK] "${tn}" created - completion will be permanent`,
                  "info",
                  `One-time tasks stay completed once marked done. Created at: ${timestamp} on device: ${deviceInfo}`
                );
              }
            }

            addTask(taskToAdd);
            if (taskToAdd.showInCalendar) {
              syncTasksToCalendar();
            }
            if (notifyOnTime && taskToAdd.time) {
              scheduleNotificationForTask(taskToAdd.name, taskToAdd.time);
            }

            showToast("Task added successfully", "success");
          } catch {
            showToast("Failed to add task. Please try again.", "error");
          }
        })();
      });
    } catch {
      if (Platform.OS !== "web")
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast("An error occurred. Please try again.", "error");
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

  const shouldHideSubmitButton = isDatePickerVisible || showNotifyTimeOptions;


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
      titleContent={<TitleContent isDark={isDark} nameInputRef={nameInputRef} taskName={taskName} handleTaskNameChange={handleTaskNameChange} />}
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
