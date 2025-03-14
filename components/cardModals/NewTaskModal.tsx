import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button, Form, YStack, XStack, Text, ScrollView, Input, AnimatePresence } from 'tamagui'
import { Switch, useColorScheme, Platform, View } from 'react-native'
import { useProjectStore, type Task, type TaskPriority, type TaskCategory, type WeekDay, type RecurrencePattern } from '@/store/ToDo'
import { useUserStore } from '@/store/UserStore'
import { useToastStore } from '@/store/ToastStore'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { syncTasksToCalendar } from '@/services'
import { BaseCardAnimated } from './BaseCardAnimated'
import { getDefaultTask, WEEKDAYS, RECURRENCE_PATTERNS, MONTHS } from '../../services/taskService'

type DebouncedInputProps = {
  value: string
  onDebouncedChange: (val: string) => void
} & Omit<React.ComponentProps<typeof Input>, 'value'>

const DebouncedInput = React.forwardRef<any, DebouncedInputProps>(
  ({ value, onDebouncedChange, ...props }, ref) => {
    const [text, setText] = useState(value)
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'
    
    useEffect(() => {
      const handler = setTimeout(() => onDebouncedChange(text), 500)
      return () => clearTimeout(handler)
    }, [text, onDebouncedChange])

    useEffect(() => {
      setText(value)
    }, [value])

    return (
      <Input 
        ref={ref} 
        {...props} 
        value={text} 
        onChangeText={setText}
        theme={isDark ? "dark" : "light"}
        backgroundColor={isDark ? "$gray2" : "white"}
        borderColor={isDark ? "$gray7" : "$gray4"}
        color={isDark ? "$gray12" : "$gray11"}
      />
    )
  }
)

interface NewTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewTaskModal({ open, onOpenChange }: NewTaskModalProps): JSX.Element {
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

  const toggleDay = useCallback((day: string) => {
    const fullDay = WEEKDAYS[day]
    setNewTask(prev => ({
      ...prev,
      schedule: prev.schedule.includes(fullDay)
        ? prev.schedule.filter(d => d !== fullDay)
        : [...prev.schedule, fullDay],
    }))
  }, [])

  const handleTimeChange = useCallback((event: any, pickedDate?: Date) => {
    // Remove the automatic closing for non-web platforms
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

  const handleRecurrenceSelect = useCallback((pattern: RecurrencePattern) => {
    setNewTask(prev => ({
      ...prev,
      recurrencePattern: pattern,
      recurrenceDate: new Date().toISOString().split('T')[0]
    }))
  }, [])

  const handlePrioritySelect = useCallback((value: TaskPriority) => {
    setNewTask(prev => ({ ...prev, priority: value }))
  }, [])

  const handleCategorySelect = useCallback((value: TaskCategory) => {
    setNewTask(prev => ({ ...prev, category: value }))
  }, [])

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
      onOpenChange(false)
      await new Promise(resolve => setTimeout(resolve, 80))
      try {
        addTask(taskToAdd)
        if (taskToAdd.showInCalendar) {
          syncTasksToCalendar()
        }
        showToast('Task added successfully')
      } catch {
        showToast('Failed to add task. Please try again.')
      }
    } catch {
      showToast('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [newTask, addTask, onOpenChange, showToast, isSubmitting])

  return (
    <BaseCardAnimated open={open} onOpenChange={onOpenChange} title="New Task">
      <Button
          position="absolute"
          top="$3"
          right="$3"
          size="$2"
          circular
          zIndex={100}
          backgroundColor="transparent"
          onPress={() => onOpenChange(false)}
          pressStyle={{ opacity: 0.7 }}
        >
          <Ionicons 
            name="close" 
            size={24} 
            color={isDark ? "white" : "black"} 
          />
        </Button>
        
        <ScrollView 
          bounces={false} 
          keyboardShouldPersistTaps="handled" 
          showsHorizontalScrollIndicator={false} 
          style={{ maxWidth: isWeb ? 600 : '100%' }}
        >
        <Form gap="$4" onSubmit={handleAddTask}>
          <DebouncedInput
            ref={inputRef}
            placeholder="Enter task name"
            value={newTask.name}
            onDebouncedChange={handleTextChange}
            borderWidth={1}
            autoCapitalize="sentences"
            borderRadius={12}
            fontFamily="$body"
            paddingHorizontal="$3"
            height={50}
            fontSize={17}
            fontWeight="400"
            theme={isDark ? "dark" : "light"}
            backgroundColor={isDark ? "$gray2" : "white"}
            borderColor={isDark ? "$gray7" : "$gray4"}
            color={isDark ? "$gray12" : "$gray11"}
          />
          
          {/* Time Input */}
          <YStack gap="$2">
            <Button
              onPress={handleTimePress}
              theme={isDark ? "dark" : "light"}
              backgroundColor={isDark ? "$gray2" : "white"}
              borderRadius={12}
              height={50}
              borderColor={isDark ? "$gray7" : "$gray4"}
              borderWidth={1}
              paddingHorizontal="$3"
              pressStyle={{ opacity: 0.8 }}
            >
              <XStack flex={1} alignItems="center" justifyContent="space-between">
                <Text color={isDark ? "$gray12" : "$gray11"} fontSize={16}>
                  {newTask.time || "Select time (optional)"}
                </Text>
                <Text color={isDark ? "$gray11" : "$gray10"} fontSize={16}>
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
                        paddingHorizontal="$3"
                        paddingVertical="$2"
                        borderRadius={8}
                      >
                        <Text color="white" fontWeight="600">Done</Text>
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
          
          {/* Recurrence Pattern Buttons */}
          <YStack gap="$2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="$2" paddingVertical="$1">
                {RECURRENCE_PATTERNS.map(pattern => (
                  <Button
                    key={pattern.value}
                    backgroundColor={
                      newTask.recurrencePattern === pattern.value
                        ? preferences.primaryColor
                        : isDark ? "$gray2" : "white"
                    }
                    pressStyle={{ opacity: 0.8, scale: 0.98 }}
                    onPress={() => handleRecurrenceSelect(pattern.value)}
                    borderRadius={24}
                    paddingHorizontal="$3"
                    paddingVertical="$2.5"
                    borderWidth={1}
                    borderColor={
                      newTask.recurrencePattern === pattern.value
                        ? 'transparent'
                        : isDark ? "$gray7" : "$gray4"
                    }
                  >
                    <XStack alignItems="center" gap="$1.5">
                      <Ionicons 
                        name={pattern.icon as any} 
                        size={16} 
                        color={newTask.recurrencePattern === pattern.value ? '#fff' : isDark ? "$gray12" : "$gray11"} 
                      />
                      <Text
                        fontSize={14}
                        fontWeight="600"
                        color={newTask.recurrencePattern === pattern.value ? '#fff' : isDark ? "$gray12" : "$gray11"}
                      >
                        {pattern.label}
                      </Text>
                    </XStack>
                  </Button>
                ))}
              </XStack>
            </ScrollView>
          </YStack>
          
          <AnimatePresence>
            {(newTask.recurrencePattern === 'weekly' || newTask.recurrencePattern === 'biweekly') && (
              <YStack gap="$3">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <XStack gap="$2" paddingVertical="$1">
                    {Object.entries(WEEKDAYS).map(([sd, fd]) => (
                      <Button
                        key={sd}
                        backgroundColor={
                          newTask.schedule.includes(fd)
                            ? preferences.primaryColor
                            : isDark ? "$gray2" : "white"
                        }
                        pressStyle={{ opacity: 0.8, scale: 0.98 }}
                        onPress={() => toggleDay(sd)}
                        borderRadius={24}
                        paddingHorizontal="$2"
                        paddingVertical="$2.5"
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
                          color={newTask.schedule.includes(fd) ? '#fff' : isDark ? "$gray12" : "$gray11"}
                        >
                          {sd.toUpperCase()}
                        </Text>
                      </Button>
                    ))}
                  </XStack>
                </ScrollView>
              </YStack>
            )}
              
            {(newTask.recurrencePattern === 'monthly' || newTask.recurrencePattern === 'yearly') && (
              <YStack gap="$3">
                {newTask.recurrencePattern === 'yearly' && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <XStack gap="$2" paddingVertical="$1">
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
                          borderRadius={24}
                          paddingHorizontal="$2"
                          paddingVertical="$2.5"
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
                  <XStack gap="$2" paddingVertical="$1">
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
                        borderRadius={24}
                        paddingHorizontal="$2"
                        paddingVertical="$2.5"
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
          
          {/* Priority Buttons */}
          <YStack gap="$2">
            <XStack justifyContent="space-between" alignItems="center">
              <Text color={isDark ? "$gray12" : "$gray11"} fontWeight="500">Priority</Text>
              <XStack alignItems="center">
                <Text color={isDark ? "$gray12" : "$gray11"} marginRight="$2">
                  Show in Calendar
                </Text>
                <Switch
                  value={newTask.showInCalendar || false}
                  onValueChange={val => setNewTask(prev => ({ ...prev, showInCalendar: val }))}
                />
              </XStack>
            </XStack>
            <XStack gap="$2">
              {['high', 'medium', 'low'].map(priority => (
                <Button
                  key={priority}
                  flex={1}
                  backgroundColor={
                    newTask.priority === priority
                      ? preferences.primaryColor
                      : isDark ? "$gray2" : "white"
                  }
                  pressStyle={{ opacity: 0.8, scale: 0.98 }}
                  onPress={() => handlePrioritySelect(priority as TaskPriority)}
                  borderRadius={12}
                  paddingVertical="$2.5"
                  borderWidth={1}
                  borderColor={
                    newTask.priority === priority
                      ? 'transparent'
                      : isDark ? "$gray7" : "$gray4"
                  }
                >
                  <Text
                    fontSize={14}
                    fontWeight="600"
                    color={newTask.priority === priority ? '#fff' : isDark ? "$gray12" : "$gray11"}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </Button>
              ))}
            </XStack>
          </YStack>
          
          {/* Category Buttons */}
          <YStack gap="$2">
            <Text color={isDark ? "$gray12" : "$gray11"} fontWeight="500">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
              <XStack gap="$2">
                {['work','health','personal','family','wealth'].map(cat => (
                  <Button
                    key={cat}
                    onPress={() => handleCategorySelect(cat as TaskCategory)}
                    backgroundColor={
                      newTask.category === cat
                        ? preferences.primaryColor
                        : isDark ? "$gray2" : "white"
                    }
                    pressStyle={{ opacity: 0.8, scale: 0.98 }}
                    borderRadius={24}
                    paddingHorizontal="$3"
                    paddingVertical="$2.5"
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
                      color={newTask.category === cat ? '#fff' : isDark ? "$gray12" : "$gray11"}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </Button>
                ))}
              </XStack>
            </ScrollView>
          </YStack>
          
          <Form.Trigger asChild>
          <Button
            backgroundColor={preferences.primaryColor}
            height={50}
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
            borderRadius={12}
            alignSelf="center"
            marginTop={8}  
            width="100%"
            shadowColor="black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={4}
            elevation={3}
            disabled={isSubmitting}
            opacity={isSubmitting ? 0.7 : 1}
          >
            <Text color="white" fontWeight="600" fontSize={18}>
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </Text>
          </Button>
        </Form.Trigger>
        </Form>
      </ScrollView>
    </BaseCardAnimated>
  )
}
