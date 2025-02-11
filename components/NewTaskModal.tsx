import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Sheet, Button, Form, YStack, XStack, Text, ScrollView, Input } from 'tamagui'
import {  TouchableOpacity } from 'react-native'
import { useProjectStore, type Task, type TaskPriority, type TaskCategory, type WeekDay } from '@/store/ToDo'
import { useUserStore } from '@/store/UserStore'
import { useToastStore } from '@/store/ToastStore'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
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

const getDefaultTask = (): Omit<Task, 'id' | 'completed' | 'createdAt' | 'updatedAt'> => {
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()
  return {
    name: '',
    schedule: WEEKDAYS[currentDay as keyof typeof WEEKDAYS]
      ? [WEEKDAYS[currentDay as keyof typeof WEEKDAYS]]
      : [],
    time: undefined,
    priority: null as unknown as TaskPriority,
    category: null as unknown as TaskCategory,
    isOneTime: false,
    completionHistory: {},
  }
}

type DebouncedInputProps = {
  value: string
  onDebouncedChange: (val: string) => void
} & Omit<React.ComponentProps<typeof Input>, 'value'>

const DebouncedInput = React.forwardRef<any, DebouncedInputProps>(
  ({ value, onDebouncedChange, ...props }, ref) => {
    const [text, setText] = useState(value)
    
    useEffect(() => {
      const handler = setTimeout(() => onDebouncedChange(text), 500)
      return () => clearTimeout(handler)
    }, [text, onDebouncedChange])

    useEffect(() => {
      setText(value)
    }, [value])

    return <Input ref={ref} {...props} value={text} onChangeText={setText} />
  }
)

interface NewTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewTaskModal({ open, onOpenChange }: NewTaskModalProps) {
  const { addTask } = useProjectStore()
  const { preferences } = useUserStore()
  const { showToast } = useToastStore()
  const [showPrioritySelect, setShowPrioritySelect] = useState(false)
  const [showCategorySelect, setShowCategorySelect] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'completed' | 'createdAt' | 'updatedAt'>>(getDefaultTask())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<any>(null)

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setShowPrioritySelect(false)
        setShowCategorySelect(false)
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
    setShowTimePicker(false)
    if (selectedDate) {
      setSelectedDate(selectedDate)
      const timeString = format(selectedDate, 'h:mm a')
      setNewTask(prev => ({ ...prev, time: timeString }))
    }
  }, [])

  const handleTimePress = useCallback(() => {
    setShowTimePicker(true)
    setShowPrioritySelect(false)
    setShowCategorySelect(false)
  }, [])

  const SelectButton = ({ 
    label, 
    value, 
    onPress, 
    showDropdown = false 
  }: { 
    label: string
    value: string | null
    onPress: () => void
    showDropdown?: boolean
  }) => (
    <Button
      onPress={onPress}
      backgroundColor="$backgroundHover"
      borderRadius={12}
      height={50}
      borderColor="rgba(85,85,85,0.5)"
      borderWidth={1}
      paddingHorizontal="$3"
      pressStyle={{ opacity: 0.8 }}
    >
      <XStack flex={1} alignItems="center" justifyContent="space-between" paddingRight="$2">
        <Text color="#fff" fontSize={16} fontWeight="500" marginRight="$2">
          {label}
        </Text>
        <Text 
          color="#a0a0a0" 
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
  )
  const DropdownList = ({
    items,
    selectedValue,
    onSelect,
    maxHeight = 250
  }: {
    items: string[]
    selectedValue: string | null
    onSelect: (value: any) => void
    maxHeight?: number
  }) => (
    <YStack
      position="absolute"
      top="110%"
      left={0}
      right={0}
      backgroundColor="rgba(45,45,45,0.95)"
      borderRadius={12}
      zIndex={1000}
      overflow="hidden"
      shadowColor="black"
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.2}
      shadowRadius={8}
      maxHeight={maxHeight}
    >
      <ScrollView bounces={false}>
        <YStack>
          {items.map(item => (
            <Button
              key={item}
              onPress={() => onSelect(item)}
      backgroundColor={selectedValue === item ? preferences.primaryColor : '$backgroundTransparent'}
              height={45}
              justifyContent="center"
              pressStyle={{ opacity: 0.8 }}
              borderBottomWidth={1}
              borderColor="rgba(85,85,85,0.2)"
              paddingHorizontal="$3"
            >
              <Text
                color={selectedValue === item ? '#fff' : '#a0a0a0'}
                fontSize={16}
                fontWeight={selectedValue === item ? '600' : '400'}
              >
                {item}
              </Text>
            </Button>
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  )

  const handlePrioritySelect = useCallback((value: TaskPriority) => {
    setNewTask(prev => ({ ...prev, priority: value }))
    setShowPrioritySelect(false)
  }, [])

  const handleCategorySelect = useCallback((value: TaskCategory) => {
    setNewTask(prev => ({ ...prev, category: value }))
    setShowCategorySelect(false)
  }, [])

  const handleOneTimeChange = useCallback((checked: boolean) => {
    setNewTask(prev => ({ ...prev, isOneTime: checked }))
  }, [])

  const handleAddTask = useCallback(async () => {
    if (isSubmitting) return
    try {
      if (!newTask.name.trim()) {
        showToast('Please enter a task name')
        return
      }
      if (!newTask.isOneTime && newTask.schedule.length === 0) {
        showToast('Please select at least one day or mark as one-time task')
        return
      }
      setIsSubmitting(true)
      const taskToAdd = { ...newTask, name: newTask.name.trim() }
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
      snapPoints={[65]}
      dismissOnSnapToBottom
      dismissOnOverlayPress
      animation="quick"
      zIndex={100000}
    >
      <Sheet.Overlay 
        animation="lazy" 
        enterStyle={{ opacity: 0 }} 
        exitStyle={{ opacity: 0 }} 
      />
      <Sheet.Frame
        backgroundColor="rgba(16,16,16,1)"
        padding="$4"
        gap="$5"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
      >
        <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
          <Sheet.Handle />
          <Text fontSize={24} fontWeight="700" color="#fff" marginBottom={20}>
            New Task
          </Text>
          <Form gap="$4" onSubmit={handleAddTask}>
            <DebouncedInput
              ref={inputRef}
              placeholder="Enter task name"
              value={newTask.name}
              onDebouncedChange={handleTextChange}
              borderWidth={1}
              borderColor="rgba(85,85,85,0.5)"
              backgroundColor="rgba(45,45,45,0.8)"
              color="#fff"
              autoCapitalize="sentences"
              borderRadius={12}
              paddingHorizontal="$3"
              height={50}
            />
            
            <YStack gap="$3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="$2" paddingVertical="$1">
                  {Object.entries(WEEKDAYS).map(([shortDay, fullDay]) => (
                    <Button
                      key={shortDay}
              backgroundColor={
                newTask.schedule.includes(fullDay) 
                  ? preferences.primaryColor 
                  : '$backgroundHover'
              }
                      color="#fff"
                      pressStyle={{ opacity: 0.8, scale: 0.98 }}
                      onPress={() => toggleDay(shortDay)}
                      borderRadius={24}
                      paddingHorizontal="$2"
                      paddingVertical="$2.5"
                      borderWidth={1}
                      borderColor={
                        newTask.schedule.includes(fullDay) 
                          ? 'transparent' 
                          : 'rgba(85,85,85,0.5)'
                      }
                    >
                      <Text 
                        fontSize={14} 
                        fontWeight="600" 
                        color={newTask.schedule.includes(fullDay) ? '#fff' : '#a0a0a0'}
                      >
                        {shortDay.toUpperCase()}
                      </Text>
                    </Button>
                  ))}
                </XStack>
              </ScrollView>
            </YStack>

            <XStack gap="$4" width="100%">
              <YStack flex={1} position="relative">
              <SelectButton
                  label="Time:"
                  value={newTask.time || null}
                  onPress={handleTimePress}
                />
                {showTimePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="time"
                    is24Hour={false}
                    onChange={handleTimeChange}
                  />
                )}
              </YStack>
              <YStack flex={1}>
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  backgroundColor="rgba(45,45,45,0.8)"
                  paddingHorizontal="$4"
                  borderColor="rgba(85,85,85,0.5)"
                  borderWidth={1}
                  borderRadius={12}
                  height={50}
                >
                  <Text fontSize={16} color="#fff" fontWeight="500">
                    One-time
                  </Text>
                  <TouchableOpacity onPress={() => handleOneTimeChange(!newTask.isOneTime)}>
                    <YStack
                      width={24}
                      height={24}
                      borderWidth={2}
                      borderColor={preferences.primaryColor}
                      borderRadius={4}
                      backgroundColor={newTask.isOneTime ? preferences.primaryColor : 'transparent'}
                      justifyContent="center"
                      alignItems="center"
                    >
                      {newTask.isOneTime && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </YStack>
                  </TouchableOpacity>
                </XStack>
              </YStack>
            </XStack>

            <XStack gap="$4" width="100%">
              <YStack flex={1} position="relative">
                <SelectButton
                  label="Priority:"
                  value={newTask.priority}
                  onPress={() => {
                    setShowPrioritySelect(!showPrioritySelect)
                    setShowCategorySelect(false)
                  }}
                  showDropdown={showPrioritySelect}
                />
                {showPrioritySelect && (
                  <DropdownList
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
                  }}
                  showDropdown={showCategorySelect}
                />
                {showCategorySelect && (
                  <DropdownList
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
)
}
