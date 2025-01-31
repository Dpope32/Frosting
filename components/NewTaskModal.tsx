import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Sheet, Button, Form, YStack, XStack, Text, ScrollView, Input } from 'tamagui'
import { KeyboardAvoidingView, Platform, Keyboard, TouchableOpacity } from 'react-native'
import { useProjectStore, type Task, type TaskPriority, type TaskCategory, type WeekDay } from '@/store/ToDo'
import { useUserStore } from '@/store/UserStore'
import { useToastStore } from '@/store/ToastStore'
import { Ionicons } from '@expo/vector-icons'

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
  }
}

const generateTimeOptions = () => {
  const options: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h12 = hour % 12 === 0 ? 12 : hour % 12
      const ampm = hour < 12 ? 'AM' : 'PM'
      const minStr = minute.toString().padStart(2, '0')
      options.push(`${h12}:${minStr} ${ampm}`)
    }
  }
  return options
}

const TIME_OPTIONS = generateTimeOptions()

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
  const [showTimeSelect, setShowTimeSelect] = useState(false)
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'completed' | 'createdAt' | 'updatedAt'>>(getDefaultTask())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<any>(null)

  useEffect(() => {
    let focusTimeout: NodeJS.Timeout
    let resetTimeout: NodeJS.Timeout
    if (!open) {
      resetTimeout = setTimeout(() => {
        setShowPrioritySelect(false)
        setShowCategorySelect(false)
        setNewTask(getDefaultTask())
        setShowTimeSelect(false)
        setIsSubmitting(false)
      }, 200)
    } else {
      focusTimeout = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
    return () => {
      if (focusTimeout) clearTimeout(focusTimeout)
      if (resetTimeout) clearTimeout(resetTimeout)
    }
  }, [open])

  const handleTextChange = useCallback((text: string) => {
    setNewTask((prev) => ({ ...prev, name: text }))
  }, [])

  const toggleDay = useCallback((day: string) => {
    const fullDay = WEEKDAYS[day]
    setNewTask((prev) => ({
      ...prev,
      schedule: prev.schedule.includes(fullDay)
        ? prev.schedule.filter((d) => d !== fullDay)
        : [...prev.schedule, fullDay],
    }))
  }, [])

  const handleTimeSelect = useCallback((time: string) => {
    setNewTask((prev) => ({ ...prev, time }))
    setShowTimeSelect(false)
  }, [])

  const handleTimePress = useCallback(() => {
    setShowTimeSelect((prev) => !prev)
    setShowPrioritySelect(false)
    setShowCategorySelect(false)
  }, [])

  const handlePrioritySelect = useCallback((value: TaskPriority) => {
    setNewTask((prev) => ({ ...prev, priority: value }))
    setShowPrioritySelect(false)
  }, [])

  const handlePriorityPress = useCallback(() => {
    setShowPrioritySelect(!showPrioritySelect)
    setShowCategorySelect(false)
    setShowTimeSelect(false)
  }, [showPrioritySelect])

  const handleCategorySelect = useCallback((value: TaskCategory) => {
    setNewTask((prev) => ({ ...prev, category: value }))
    setShowCategorySelect(false)
  }, [])

  const handleCategoryPress = useCallback(() => {
    setShowCategorySelect(!showCategorySelect)
    setShowPrioritySelect(false)
    setShowTimeSelect(false)
  }, [showCategorySelect])

  const handleOneTimeChange = useCallback((checked: boolean) => {
    setNewTask((prev) => ({ ...prev, isOneTime: checked }))
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
      await new Promise((resolve) => setTimeout(resolve, 80))
      try {
        addTask(taskToAdd) 
        showToast('Task added successfully')
      } catch (error) {
        showToast('Failed to add task. Please try again.')
        return
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
        unmountChildrenWhenHidden={false}
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
          shadowColor="rgba(0,0,0,0.3)"
          shadowOffset={{ width: 0, height: -2 }}
          shadowOpacity={0.3}
          shadowRadius={8}
        >
       
       <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
            <Sheet.Handle
              backgroundColor="rgba(85,85,85,0.5)"
              width={40}
              height={4}
              borderRadius={2}
              alignSelf="center"
              marginBottom={16}
            />
            <Text fontSize={24} fontWeight="700" color="#fff" marginBottom={20}>
              New Task
            </Text>
            <Form gap="$4" onSubmit={handleAddTask}>
              <Input
                ref={inputRef}
                placeholder="Enter task name"
                value={newTask.name}
                onChangeText={handleTextChange}
                borderWidth={1}
                borderColor="rgba(85,85,85,0.5)"
                backgroundColor="rgba(45,45,45,0.8)"
                color="#fff"
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
                        size="$4"
                        backgroundColor={
                          newTask.schedule.includes(fullDay) ? preferences.primaryColor : 'rgba(45,45,45,0.8)'
                        }
                        color="#fff"
                        pressStyle={{ opacity: 0.8, scale: 0.98 }}
                        onPress={() => toggleDay(shortDay)}
                        borderRadius={24}
                        paddingHorizontal="$2"
                        paddingVertical="$2.5"
                        borderWidth={1}
                        borderColor={
                          newTask.schedule.includes(fullDay) ? 'transparent' : 'rgba(85,85,85,0.5)'
                        }
                        shadowColor="black"
                        shadowOffset={{ width: 0, height: 2 }}
                        shadowOpacity={0.1}
                        shadowRadius={4}
                        elevation={2}
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
                  <Button
                    onPress={handleTimePress}
                    backgroundColor="rgba(45,45,45,0.8)"
                    borderRadius={12}
                    height={50}
                    borderColor="rgba(85,85,85,0.5)"
                    borderWidth={1}
                    paddingHorizontal="$3"
                    pressStyle={{ opacity: 0.8 }}
                  >
                    <XStack gap="$2" flex={1}  justifyContent= 'flex-start'>
                    <Text color="#fff" fontSize={16} fontWeight="500" marginRight={72}>
                        Time:
                      </Text>
                      <Text color="#a0a0a0" fontSize={16}  display= 'flex'> 
                        {newTask.time || (showTimeSelect ? '▲' : '▼')}
                      </Text>
                    </XStack>
                  </Button>
                  {showTimeSelect && (
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
                      height={250}
                    >
                      <ScrollView bounces={false} showsVerticalScrollIndicator>
                        <YStack elevation={8}>
                          {TIME_OPTIONS.map((time) => (
                            <Button
                              key={time}
                              onPress={() => handleTimeSelect(time)}
                              backgroundColor={
                                newTask.time === time ? preferences.primaryColor : 'transparent'
                              }
                              height={45}
                              justifyContent="center"
                              pressStyle={{ opacity: 0.8 }}
                              borderBottomWidth={1}
                              borderColor="rgba(85,85,85,0.2)"
                            >
                              <Text
                                color={newTask.time === time ? '#fff' : '#a0a0a0'}
                                fontSize={16}
                                fontWeight={newTask.time === time ? '600' : '400'}
                              >
                                {time}
                              </Text>
                            </Button>
                          ))}
                        </YStack>
                      </ScrollView>
                    </YStack>
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
                  <Button
                    onPress={handlePriorityPress}
                    backgroundColor="rgba(45,45,45,0.8)"
                    borderRadius={12}
                    height={50}
                    borderColor="rgba(85,85,85,0.5)"
                    borderWidth={1}
                    paddingHorizontal="$3"
                    pressStyle={{ opacity: 0.8 }}
                  >
                    <XStack gap="$2" flex={1}  justifyContent= 'flex-start'>
                    <Text color="#fff" fontSize={16} fontWeight="500" marginRight={60}>
                        Priority:
                      </Text>
                      <Text color="#a0a0a0" fontSize={16}  display= 'flex' justifyContent= 'flex-end'> 
                        {newTask.priority || (showPrioritySelect ? '▲' : '▼')}
                      </Text>
                    </XStack>
                  </Button>
                  {showPrioritySelect && (
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
                      elevation={8}
                    >
                      {(['high', 'medium', 'low'] as const).map((priority) => (
                        <Button
                          key={priority}
                          onPress={() => handlePrioritySelect(priority)}
                          backgroundColor={
                            newTask.priority === priority ? preferences.primaryColor : 'transparent'
                          }
                          height={45}
                          justifyContent="center"
                          pressStyle={{ opacity: 0.8 }}
                          borderBottomWidth={1}
                          borderColor="rgba(85,85,85,0.2)"
                        >
                          <Text
                            color={newTask.priority === priority ? '#fff' : '#a0a0a0'}
                            fontSize={16}
                            fontWeight={newTask.priority === priority ? '600' : '400'}
                          >
                            {priority}
                          </Text>
                        </Button>
                      ))}
                    </YStack>
                  )}
                </YStack>
                <YStack flex={1} position="relative">
                  <Button
                    onPress={handleCategoryPress}
                    backgroundColor="rgba(45,45,45,0.8)"
                    borderRadius={12}
                    height={50}
                    borderColor="rgba(85,85,85,0.5)"
                    borderWidth={1}
                    paddingHorizontal="$3"
                    pressStyle={{ opacity: 0.8 }}
                  >
                    <XStack gap="$2" flex={1}  justifyContent= 'flex-start'>
                      <Text color="#fff" fontSize={16} fontWeight="500" marginRight={48}>
                        Category:
                      </Text>
                      <Text color="#a0a0a0" fontSize={16}  display= 'flex' justifyContent= 'flex-end'> 
                        {newTask.category || (showCategorySelect ? '▲' : '▼')}
                      </Text>
                    </XStack>
                  </Button>
                  {showCategorySelect && (
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
                      height={200}
                    >
                      <ScrollView bounces={false} showsVerticalScrollIndicator>
                        <YStack elevation={8}>
                          {(['work', 'health', 'personal', 'career', 'wealth', 'skills'] as const).map((cat) => (
                            <Button
                              key={cat}
                              onPress={() => handleCategorySelect(cat)}
                              backgroundColor={
                                newTask.category === cat ? preferences.primaryColor : 'transparent'
                              }
                              height={45}
                              justifyContent="center"
                              pressStyle={{ opacity: 0.8 }}
                              borderBottomWidth={1}
                              borderColor="rgba(85,85,85,0.2)"
                            >
                              <Text
                                color={newTask.category === cat ? '#fff' : '#a0a0a0'}
                                fontSize={16}
                                fontWeight={newTask.category === cat ? '600' : '400'}
                              >
                                {cat}
                              </Text>
                            </Button>
                          ))}
                        </YStack>
                      </ScrollView>
                    </YStack>
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
                  <Text color="white" fontWeight="600" fontSize={18} >
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
