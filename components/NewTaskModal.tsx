import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Sheet, Button, Form, YStack, XStack, Text, ScrollView, Input, AnimatePresence } from 'tamagui'
import { TouchableOpacity, useColorScheme, Pressable } from 'react-native'
import { useProjectStore, type Task, type TaskPriority, type TaskCategory, type WeekDay, type RecurrencePattern } from '@/store/ToDo'
import { useUserStore } from '@/store/UserStore'
import { useToastStore } from '@/store/ToastStore'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Platform } from 'react-native'
import { format } from 'date-fns'

const WEEKDAYS: Record<string, WeekDay> = {
  sun: 'sunday',
  mon: 'monday',
  tue: 'tuesday',
  wed: 'wednesday',
  thu: 'thursday',
  fri: 'friday',
  sat: 'saturday',
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const RECURRENCE_PATTERNS: { label: string; value: RecurrencePattern; icon: string }[] = [
  { label: 'One-time', value: 'one-time', icon: 'calendar-sharp' },
  { label: 'Weekly', value: 'weekly', icon: 'calendar' },
  { label: 'Biweekly', value: 'biweekly', icon: 'calendar-outline' },
  { label: 'Monthly', value: 'monthly', icon: 'calendar-clear' },
  { label: 'Yearly', value: 'yearly', icon: 'calendar-number' }
]

const getDefaultTask = (): Omit<Task, 'id' | 'completed' | 'completionHistory' | 'createdAt' | 'updatedAt'> => {
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()
  return {
    name: '',
    schedule: WEEKDAYS[currentDay as keyof typeof WEEKDAYS]
      ? [WEEKDAYS[currentDay as keyof typeof WEEKDAYS]]
      : [],
    time: undefined,
    priority: null as unknown as TaskPriority,
    category: null as unknown as TaskCategory,
    recurrencePattern: 'one-time',
    recurrenceDate: new Date().toISOString().split('T')[0]
  }
}

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
  const [showPrioritySelect, setShowPrioritySelect] = useState(false)
  const [showCategorySelect, setShowCategorySelect] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'completed' | 'completionHistory' | 'createdAt' | 'updatedAt'>>(getDefaultTask())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRecurrenceSelect, setShowRecurrenceSelect] = useState(false)
  const inputRef = useRef<any>(null)

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setShowPrioritySelect(false)
        setShowCategorySelect(false)
        setShowRecurrenceSelect(false)
        setNewTask(getDefaultTask())
        setShowTimePicker(false)
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

  const handleTimeChange = useCallback((event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'web') {
      setShowTimePicker(false)
    }
    if (selectedDate) {
      setSelectedDate(selectedDate)
      const timeString = format(selectedDate, 'h:mm a')
      setNewTask(prev => ({ ...prev, time: timeString }))
    }
  }, [])

  const handleWebTimeChange = useCallback((date: Date) => {
    const timeString = format(date, 'h:mm a')
    setNewTask(prev => ({ ...prev, time: timeString }))
    setSelectedDate(date)
  }, [])

  const handleTimePress = useCallback(() => {
    setShowTimePicker(true)
    setShowPrioritySelect(false)
    setShowCategorySelect(false)
    setShowRecurrenceSelect(false)
  }, [])

  const handleRecurrenceSelect = useCallback((pattern: RecurrencePattern) => {
    setNewTask(prev => ({
      ...prev,
      recurrencePattern: pattern,
      recurrenceDate: new Date().toISOString().split('T')[0]
    }))
    setShowRecurrenceSelect(false)
  }, [])

  interface SelectButtonProps {
    label: string
    value: string | null | undefined
    onPress: () => void
    showDropdown?: boolean
    icon?: string
  }

  const SelectButton = ({ 
    label, 
    value, 
    onPress, 
    showDropdown = false,
    icon
  }: SelectButtonProps) => {
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'
    
    return (
      <Button
        onPress={onPress}
        theme={isDark ? "dark" : "light"}
        backgroundColor={isDark ? "$gray2" : "white"}
        borderRadius={12}
        height={50}
        borderColor={isDark ? "$gray7" : "$gray4"}
        borderWidth={1}
        paddingHorizontal="$3"
        pressStyle={{ opacity: 0.8 }}
      >
        <XStack flex={1} alignItems="center" justifyContent="space-between" paddingRight="$2">
          <XStack alignItems="center" gap="$2">
            {icon && <Ionicons name={icon as any} size={20} color={isDark ? "$gray12" : "$gray11"} />}
            <Text color={isDark ? "$gray12" : "$gray11"} fontSize={16} fontWeight="500">
              {label}
            </Text>
          </XStack>
          <Text 
            color={isDark ? "$gray11" : "$gray10"} 
            fontSize={16} 
            numberOfLines={1} 
            maxWidth="60%"
            ellipsizeMode="tail"
            textAlign="right"
          >
            {value || (showDropdown ? '▲' : '▼')}
          </Text>
        </XStack>
      </Button>
    );
  }

  interface DropdownListProps<T> {
    items: Array<T | { label: string; value: T; icon?: string }>
    selectedValue: T | null
    onSelect: (value: T) => void
    maxHeight?: number
  }

  function DropdownList<T extends string>({
    items,
    selectedValue,
    onSelect,
    maxHeight = 300
  }: DropdownListProps<T>) {
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'
    const { preferences } = useUserStore()

    return (
      <YStack
        position="absolute"
        top="110%"
        left={0}
        right={0}
        backgroundColor={isDark ? "$gray1" : "white"}
        borderRadius={12}
        zIndex={1000}
        overflow="hidden"
        shadowColor="black"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.1}
        shadowRadius={8}
        maxHeight={maxHeight}
        borderWidth={1}
        borderColor={isDark ? "$gray7" : "$gray4"}
      >
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <YStack>
            {items.map(item => {
              const value = typeof item === 'string' ? item as T : item.value;
              const label = typeof item === 'string' ? item as string : item.label;
              const icon = typeof item === 'string' ? null : item.icon;
              
              return (
                <Pressable
                  key={value}
                  onPress={() => onSelect(value)}
                  style={({ pressed }: { pressed: boolean }) => ({
                    backgroundColor: selectedValue === value ? preferences.primaryColor : isDark ? "#1c1c1e" : "white",
                    height: 45,
                    justifyContent: 'center',
                    opacity: pressed ? 0.8 : 1,
                    borderBottomWidth: 1,
                    borderColor: isDark ? "#2c2c2e" : "#e5e5ea",
                    paddingHorizontal: 12
                  })}
                >
                  <XStack alignItems="center" gap="$2" paddingVertical={10}>
                    {icon && <Ionicons name={icon as any} size={20} color={selectedValue === value ? '#fff' : isDark ? '#fff' : '#000'} />}
                    <Text
                      color={selectedValue === value ? '#fff' : isDark ? "#fff" : "#000"}
                      fontSize={16}
                      fontWeight={selectedValue === value ? '600' : '400'}
                    >
                      {label}
                    </Text>
                  </XStack>
                </Pressable>
              );
            })}
          </YStack>
        </ScrollView>
      </YStack>
    );
  }

  const handlePrioritySelect = useCallback((value: TaskPriority) => {
    setNewTask(prev => ({ ...prev, priority: value }))
    setShowPrioritySelect(false)
  }, [])

  const handleCategorySelect = useCallback((value: TaskCategory) => {
    setNewTask(prev => ({ ...prev, category: value }))
    setShowCategorySelect(false)
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
      const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()
      const taskToAdd = { 
        ...newTask, 
        name: newTask.name.trim(),
        schedule: newTask.recurrencePattern === 'one-time' ? [] : (
          newTask.recurrencePattern === 'weekly' || newTask.recurrencePattern === 'biweekly'
            ? newTask.schedule
            : []
        ),
        recurrenceDate: newTask.recurrenceDate
      }
      
      console.log('Adding task:', {
        name: taskToAdd.name,
        pattern: taskToAdd.recurrencePattern,
        schedule: taskToAdd.schedule,
        recurrenceDate: taskToAdd.recurrenceDate
      })
      onOpenChange(false)
      await new Promise(resolve => setTimeout(resolve, 80))
      try {
        addTask(taskToAdd)
        showToast('Task added successfully')
      } catch (error) {
        showToast('Failed to add task. Please try again.')
      }
    } catch {
      showToast('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [newTask, addTask, onOpenChange, showToast, isSubmitting])

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[70]}
      dismissOnSnapToBottom
      dismissOnOverlayPress
      animation="quick"
      zIndex={100000}
    >
      <Sheet.Overlay 
        animation="quick" 
        enterStyle={{ opacity: 0 }} 
        exitStyle={{ opacity: 0 }} 
      />
      <Sheet.Frame
        backgroundColor={isDark ? "$gray1" : "white"}
        padding="$4"
        gap="$5"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
        {...(isWeb ? { style: { overflowY: 'auto', maxHeight: '90vh', maxWidth: 600, margin: '0 auto', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' } } : {})}
      >
          <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
            <Text fontSize={24} fontWeight="700" fontFamily="$body" color={isDark ? "$gray12" : "$gray11"} marginBottom={20}>
              New Task
            </Text>
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
                theme={isDark ? "dark" : "light"}
                backgroundColor={isDark ? "$gray2" : "white"}
                borderColor={isDark ? "$gray7" : "$gray4"}
                color={isDark ? "$gray12" : "$gray11"}
              />
              
              <YStack gap="$4">
                <YStack position="relative">
                  <SelectButton
                    label="Recurrence:"
                    value={RECURRENCE_PATTERNS.find(p => p.value === newTask.recurrencePattern)?.label}
                    onPress={() => {
                      setShowRecurrenceSelect(!showRecurrenceSelect)
                      setShowPrioritySelect(false)
                      setShowCategorySelect(false)
                    }}
                    showDropdown={showRecurrenceSelect}
                  />
                  {showRecurrenceSelect && (
                    <DropdownList<RecurrencePattern>
                      items={RECURRENCE_PATTERNS}
                      selectedValue={newTask.recurrencePattern}
                      onSelect={handleRecurrenceSelect}
                      maxHeight={200}
                    />
                  )}
                </YStack>

                <AnimatePresence>
                  {(newTask.recurrencePattern === 'monthly' || newTask.recurrencePattern === 'yearly') && (
                    <YStack gap="$3">
                      {newTask.recurrencePattern === 'yearly' && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <XStack gap="$2" paddingVertical="$1">
                            {MONTHS.map((month, index) => (
                              <Button
                                key={month}
                                backgroundColor={
                                  new Date(newTask.recurrenceDate || new Date().toISOString()).getMonth() === index
                                    ? preferences.primaryColor 
                                    : isDark ? "$gray2" : "white"
                                }
                                pressStyle={{ opacity: 0.8, scale: 0.98 }}
                                onPress={() => {
                                  const date = new Date(newTask.recurrenceDate || new Date().toISOString());
                                  date.setMonth(index);
                                  setNewTask(prev => ({
                                    ...prev,
                                    recurrenceDate: date.toISOString().split('T')[0]
                                  }));
                                }}
                                borderRadius={24}
                                paddingHorizontal="$2"
                                paddingVertical="$2.5"
                                borderWidth={1}
                                borderColor={
                                  new Date(newTask.recurrenceDate || new Date().toISOString()).getMonth() === index
                                    ? 'transparent' 
                                    : isDark ? "$gray7" : "$gray4"
                                }
                                minWidth={45}
                              >
                                <Text 
                                  fontSize={14} 
                                  fontWeight="600" 
                                  color={new Date(newTask.recurrenceDate || new Date().toISOString()).getMonth() === index ? '#fff' : isDark ? "$gray12" : "$gray11"}
                                >
                                  {month.substring(0, 3)}
                                </Text>
                              </Button>
                            ))}
                          </XStack>
                        </ScrollView>
                      )}
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <XStack gap="$2" paddingVertical="$1">
                          {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                            <Button
                              key={day}
                              backgroundColor={
                                new Date(newTask.recurrenceDate || new Date().toISOString()).getDate() === day
                                  ? preferences.primaryColor 
                                  : isDark ? "$gray2" : "white"
                              }
                              pressStyle={{ opacity: 0.8, scale: 0.98 }}
                              onPress={() => {
                                const date = new Date(newTask.recurrenceDate || new Date().toISOString());
                                date.setDate(day);
                                setNewTask(prev => ({
                                  ...prev,
                                  recurrenceDate: date.toISOString().split('T')[0]
                                }));
                              }}
                              borderRadius={24}
                              paddingHorizontal="$2"
                              paddingVertical="$2.5"
                              borderWidth={1}
                              borderColor={
                                new Date(newTask.recurrenceDate || new Date().toISOString()).getDate() === day
                                  ? 'transparent' 
                                  : isDark ? "$gray7" : "$gray4"
                              }
                              minWidth={45}
                            >
                              <Text 
                                fontSize={14} 
                                fontWeight="600" 
                                color={new Date(newTask.recurrenceDate || new Date().toISOString()).getDate() === day ? '#fff' : isDark ? "$gray12" : "$gray11"}
                              >
                                {day}
                              </Text>
                            </Button>
                          ))}
                        </XStack>
                      </ScrollView>
                    </YStack>
                  )}
                  {(newTask.recurrencePattern === 'weekly' || newTask.recurrencePattern === 'biweekly') && (
                    <YStack gap="$3">
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <XStack gap="$2" paddingVertical="$1">
                          {Object.entries(WEEKDAYS).map(([shortDay, fullDay]) => (
                            <Button
                              key={shortDay}
                              backgroundColor={
                                newTask.schedule.includes(fullDay) 
                                  ? preferences.primaryColor 
                                  : isDark ? "$gray2" : "white"
                              }
                              pressStyle={{ opacity: 0.8, scale: 0.98 }}
                              onPress={() => toggleDay(shortDay)}
                              borderRadius={24}
                              paddingHorizontal="$2"
                              paddingVertical="$2.5"
                              borderWidth={1}
                              borderColor={
                                newTask.schedule.includes(fullDay) 
                                  ? 'transparent' 
                                  : isDark ? "$gray7" : "$gray4"
                              }
                            >
                              <Text 
                                fontSize={14} 
                                fontWeight="600" 
                                color={newTask.schedule.includes(fullDay) ? '#fff' : isDark ? "$gray12" : "$gray11"}
                              >
                                {shortDay.toUpperCase()}
                              </Text>
                            </Button>
                          ))}
                        </XStack>
                      </ScrollView>
                    </YStack>
                  )}
                </AnimatePresence>
              </YStack>

              <YStack position="relative">
                <SelectButton
                  label="Time:"
                  value={newTask.time || null}
                  onPress={handleTimePress}
                />
                {showTimePicker && (
                  <YStack
                    position="absolute"
                    top="110%"
                    left={0}
                    right={0}
                    backgroundColor={isDark ? "$gray1" : "white"}
                    borderRadius={12}
                    zIndex={1000}
                    overflow="hidden"
                    shadowColor="black"
                    shadowOffset={{ width: 0, height: 4 }}
                    shadowOpacity={0.1}
                    shadowRadius={8}
                    borderWidth={1}
                    borderColor={isDark ? "$gray7" : "$gray4"}
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
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              const newDate = new Date(selectedDate);
                              newDate.setHours(hours);
                              newDate.setMinutes(minutes);
                              handleWebTimeChange(newDate);
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
                  </YStack>
                )}
              </YStack>

              <XStack gap="$4" width="100%">
                <YStack flex={1} position="relative">
                  <SelectButton
                    label="Priority:"
                    value={newTask.priority}
                    onPress={() => {
                      setShowPrioritySelect(!showPrioritySelect)
                      setShowCategorySelect(false)
                      setShowRecurrenceSelect(false)
                    }}
                    showDropdown={showPrioritySelect}
                  />
                  {showPrioritySelect && (
                    <DropdownList<TaskPriority>
                      items={['high', 'medium', 'low']}
                      selectedValue={newTask.priority}
                      onSelect={handlePrioritySelect}
                      maxHeight={150}
                    />
                  )}
                </YStack>
                <YStack flex={1} position="relative">
                  <SelectButton
                    label="Category:"
                    value={newTask.category}
                    onPress={() => {
                      setShowCategorySelect(!showCategorySelect)
                      setShowPrioritySelect(false)
                      setShowRecurrenceSelect(false)
                    }}
                    showDropdown={showCategorySelect}
                  />
                  {showCategorySelect && (
                    <DropdownList<TaskCategory>
                      items={['work', 'health', 'personal', 'career', 'wealth', 'skills']}
                      selectedValue={newTask.category}
                      onSelect={handleCategorySelect}
                      maxHeight={250}
                    />
                  )}
                </YStack>
              </XStack>

              <Form.Trigger asChild>
                <Button
                  backgroundColor={preferences.primaryColor}
                  height={50}
                  pressStyle={{ opacity: 0.8, scale: 0.98 }}
                  borderRadius={12}
                  alignSelf="center"
                  marginTop={50}
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
      </Sheet.Frame>
    </Sheet>
  );
}
