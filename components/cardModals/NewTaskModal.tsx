import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button, Form, YStack, XStack, Text, ScrollView, AnimatePresence } from 'tamagui'
import { Switch, useColorScheme, Platform, View } from 'react-native'
import { Task, TaskPriority, TaskCategory, RecurrencePattern } from '@/types/task'
import { useProjectStore } from '@/store/ToDo'
import { useUserStore } from '@/store/UserStore'
import { useToastStore } from '@/store/ToastStore'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { syncTasksToCalendar } from '@/services'
import { BaseCardAnimated } from './BaseCardAnimated'
import { getDefaultTask, WEEKDAYS, RECURRENCE_PATTERNS, MONTHS } from '../../services/taskService'
import { DebouncedInput } from '../shared/debouncedInput'
import { getCategoryColor,  getPriorityColor,  getRecurrenceColor, getRecurrenceIcon, withOpacity, dayColors } from '@/utils/styleUtils';


interface NewTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewTaskModal({ open, onOpenChange }: NewTaskModalProps): JSX.Element | null { 
  if (!open) {
    return null;
  }

  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'
  const { addTask } = useProjectStore()
  const { preferences } = useUserStore()
  const { showToast } = useToastStore()
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'completed' | 'completionHistory' | 'createdAt' | 'updatedAt'>>(getDefaultTask())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<any>(null)

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setShowTimePicker(false)
        setNewTask(getDefaultTask())
        setIsSubmitting(false)
      }, 200)
    } else {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [open])

  const handleTextChange = useCallback((text: string) => {
    setNewTask(prev => ({ ...prev, name: text }))
  }, [])

  const toggleDay = useCallback((day: string, e?: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const fullDay = WEEKDAYS[day];
    setNewTask(prev => ({
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
      setNewTask(prev => ({ ...prev, time: timeString }))
    }
  }, [])

  const handleWebTimeChange = useCallback((date: Date) => {
    const timeString = format(date, 'h:mm a')
    setNewTask(prev => ({ ...prev, time: timeString }))
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
    
    setNewTask(prev => ({
      ...prev,
      recurrencePattern: pattern,
      recurrenceDate: new Date().toISOString().split('T')[0]
    }));
  }, []);

  const handlePrioritySelect = useCallback((value: TaskPriority, e?: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setNewTask(prev => ({ ...prev, priority: value }));
  }, []);

  const handleCategorySelect = useCallback((value: TaskCategory, e?: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setNewTask(prev => ({ ...prev, category: value }));
  }, []);

  const handleAddTask = useCallback(async () => {
    if (isSubmitting) return
    try {
      if (!newTask.name.trim()) {
        showToast('Please enter a task name')
        return
      }
      if (newTask.schedule.length === 0 &&
          (newTask.recurrencePattern === 'weekly' || newTask.recurrencePattern === 'biweekly')) {
        showToast(`Please select at least one day for ${newTask.recurrencePattern} tasks`)
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
        showToast('Task added successfully')
      } catch {
        showToast('Failed to add task. Please try again.')
        setTimeout(() => onOpenChange(false), Platform.OS === 'web' ? 300 : 100)
      }
    } catch {
      showToast('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [newTask, addTask, onOpenChange, showToast, isSubmitting])

  return (
    <BaseCardAnimated 
      onClose={() => {
        if (Platform.OS === 'web') {
          setTimeout(() => onOpenChange(false), 100)
        } else {
          onOpenChange(false)
        }
      }} 
      title="New Task"
    >
        <ScrollView
          bounces={false} 
          keyboardShouldPersistTaps="handled" 
          showsHorizontalScrollIndicator={false} 
          style={{ maxWidth: isWeb ? 800 : '100%' }}
        >
        <Form gap="$2.5" onSubmit={handleAddTask}>
          <DebouncedInput
            ref={inputRef}
            placeholder="Enter task name"
            value={newTask.name}
            onDebouncedChange={handleTextChange}
            onFocus={(e) => {
              if (Platform.OS === 'web') {
                e.stopPropagation();
                e.preventDefault();
              }
            }}
            borderWidth={1}
            autoCapitalize="sentences"
            br={16}
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
          

          <YStack gap="$2">
            <Button
              onPress={handleTimePress}
              theme={isDark ? "dark" : "light"}
              backgroundColor={isDark ? "$gray2" : "white"}
              br={16}
              height={50}
              borderColor={isDark ? "$gray7" : "$gray4"}
              borderWidth={1}
              px="$3"
              pressStyle={{ opacity: 0.8 }}
            >
              <XStack flex={1} alignItems="center" justifyContent="space-between">
                <Text fontFamily="$body" color={isDark ? "$gray12" : "$gray11"} fontSize={16}>
                  {newTask.time || "Select time (optional)"}
                </Text>
                <Text fontFamily="$body"color={isDark ? "$gray11" : "$gray10"} fontSize={16}>
                  {showTimePicker ? '▲' : '▼'}
                </Text>
              </XStack>
            </Button>
            
            {showTimePicker && (
              <View
                style={{
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
          </YStack>
          <XStack alignItems="center" justifyContent="flex-start"  px="$1"> 
          <Switch
              value={newTask.showInCalendar || false}
              onValueChange={val => setNewTask(prev => ({ ...prev, showInCalendar: val }))}
              style={{ transform: [{ scaleX: 0.9}, { scaleY: 0.9}] }} 
            />
            <Text fontFamily="$body" color={isDark ? "$gray9" : "$gray8"} marginLeft="$2" fontSize={14}> 
              Show in Calendar
            </Text>
          </XStack>
          <YStack px="1.5">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="$2" py="$1">
                
              {RECURRENCE_PATTERNS.map(pattern => {
                  const recurrenceColor = getRecurrenceColor(pattern.value);
                  
                  return (
                    <Button
                      key={pattern.value}
                      backgroundColor={
                        newTask.recurrencePattern === pattern.value
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
                        newTask.recurrencePattern === pattern.value
                          ? 'transparent'
                          : isDark ? "$gray7" : "$gray4"
                      }
                    >
                      <XStack alignItems="center" gap="$1.5">
                        <Text
                          fontSize={14}
                          fontWeight="600"
                          fontFamily="$body"
                          color={newTask.recurrencePattern === pattern.value ? recurrenceColor : isDark ? "$gray12" : "$gray11"}
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
            {(newTask.recurrencePattern === 'weekly' || newTask.recurrencePattern === 'biweekly') && (
              <YStack gap="$3">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <XStack gap="$2" py="$1">
                  {Object.entries(WEEKDAYS).map(([sd, fd]) => {
                      const dayColor = dayColors[sd as keyof typeof dayColors] || preferences.primaryColor;
                      return (
                        <Button
                          key={sd}
                          backgroundColor={
                            newTask.schedule.includes(fd)
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
                            newTask.schedule.includes(fd)
                              ? 'transparent'
                              : isDark ? "$gray7" : "$gray4"
                          }
                        >
                          <Text
                            fontSize={14}
                            fontWeight="600"
                            fontFamily="$body"
                            color={newTask.schedule.includes(fd) ? dayColor : isDark ? "$gray12" : "$gray11"}
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
              
            {(newTask.recurrencePattern === 'monthly' || newTask.recurrencePattern === 'yearly') && (
              <YStack gap="$3">
                {newTask.recurrencePattern === 'yearly' && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <XStack gap="$2" py="$1">
                      {MONTHS.map((m, i) => (
                        <Button
                          key={m}
                          backgroundColor={
                            new Date(newTask.recurrenceDate || new Date().toISOString()).getMonth() === i
                              ? preferences.primaryColor
                              : isDark ? "$gray2" : "white"
                          }
                          pressStyle={{ opacity: 0.8, scale: 0.98 }}
                          onPress={() => {
                            const d = new Date(newTask.recurrenceDate || new Date().toISOString())
                            d.setMonth(i)
                            setNewTask(prev => ({ ...prev, recurrenceDate: d.toISOString().split('T')[0] }))
                          }}
                          br={24}
                          px="$2"
                          py="$2.5"
                          borderWidth={1}
                          borderColor={
                            new Date(newTask.recurrenceDate || new Date().toISOString()).getMonth() === i
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
                              new Date(newTask.recurrenceDate || new Date().toISOString()).getMonth() === i
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
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <XStack gap="$2" py="$1">
                    {Array.from({ length: 31 }, (_, idx) => idx + 1).map(d => (
                      <Button
                        key={d}
                        backgroundColor={
                          new Date(newTask.recurrenceDate || new Date().toISOString()).getDate() === d
                            ? preferences.primaryColor
                            : isDark ? "$gray2" : "white"
                        }
                        pressStyle={{ opacity: 0.8, scale: 0.98 }}
                        onPress={() => {
                          const dt = new Date(newTask.recurrenceDate || new Date().toISOString())
                          dt.setDate(d)
                          setNewTask(prev => ({ ...prev, recurrenceDate: dt.toISOString().split('T')[0] }))
                        }}
                        br={24}
                        px="$2"
                        py="$2.5"
                        borderWidth={1}
                        borderColor={
                          new Date(newTask.recurrenceDate || new Date().toISOString()).getDate() === d
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
                            new Date(newTask.recurrenceDate || new Date().toISOString()).getDate() === d
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
                    newTask.category === cat
                      ? withOpacity(color, 0.15)
                      : isDark ? "$gray2" : "white"
                  }
                  pressStyle={{ opacity: 0.8, scale: 0.98 }}
                  br={20}
                  px="$3"
                  py="$2.5"
                  borderWidth={1}
                  borderColor={
                    newTask.category === cat
                      ? 'transparent'
                      : isDark ? "$gray7" : "$gray4"
                  }
                >
                  <Text
                    fontSize={14}
                    fontWeight="600"
                    fontFamily="$body"
                    color={newTask.category === cat ? color : isDark ? "$gray12" : "$gray11"}
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
                    newTask.priority === priority
                      ? withOpacity(color, 0.15)
                      : isDark ? "$gray2" : "white"
                  }
                  pressStyle={{ opacity: 0.8, scale: 0.98 }}
                  br={20}
                  px="$3"
                  py="$2.5"
                  borderWidth={1}
                  borderColor={
                    newTask.priority === priority
                      ? 'transparent'
                      : isDark ? "$gray7" : "$gray4"
                  }
                >
                  <Text
                    fontSize={14}
                    fontFamily="$body"
                    fontWeight={newTask.priority === priority ? "700" : "600"}
                    color={newTask.priority === priority ? color : isDark ? "$gray12" : "$gray11"}
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
            width="100%"
            shadowColor="black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            elevation={3}
            disabled={isSubmitting}
            opacity={isSubmitting ? 0.7 : 1}
          >
            <Text fontFamily="$body" color="white" fontWeight="600" fontSize={16}>
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </Text>
          </Button>
        </Form.Trigger>
        </Form>
      </ScrollView>
    </BaseCardAnimated>
  )
}
