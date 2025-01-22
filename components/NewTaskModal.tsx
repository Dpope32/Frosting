import React, { useState, useEffect } from 'react'
import { Sheet, Button, Switch, Form, YStack, XStack, Text, ScrollView } from 'tamagui'
import InputField from '@/components/shared/InputField'
import { useProjectStore, type Task, type TaskPriority, type TaskCategory, type WeekDay } from '@/store/ToDo'
import { KeyboardAvoidingView, Platform, Keyboard } from 'react-native'
import { useUserStore } from '@/store/UserStore'

const WEEKDAYS: Record<string, WeekDay> = {
  'sun': 'sunday',
  'mon': 'monday',
  'tue': 'tuesday',
  'wed': 'wednesday',
  'thu': 'thursday',
  'fri': 'friday',
  'sat': 'saturday',
}

interface NewTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const defaultTask: Omit<Task, 'id' | 'completed' | 'createdAt' | 'updatedAt'> = {
  name: '',
  schedule: [],
  time: undefined,
  priority: 'medium' as TaskPriority,
  category: 'personal' as TaskCategory,
  isOneTime: false
}

// Generate time options for the select
const generateTimeOptions = () => {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      options.push(timeString)
    }
  }
  return options
}

const TIME_OPTIONS = generateTimeOptions()

export function NewTaskModal({ open, onOpenChange }: NewTaskModalProps) {
  const { addTask } = useProjectStore()
  const { preferences } = useUserStore()
  const [showPrioritySelect, setShowPrioritySelect] = useState(false)
  const [showCategorySelect, setShowCategorySelect] = useState(false)
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'completed' | 'createdAt' | 'updatedAt'>>(defaultTask)
  const [showTimeSelect, setShowTimeSelect] = useState(false)

  useEffect(() => {
    if (!open) {
      setShowPrioritySelect(false)
      setShowCategorySelect(false)
      setNewTask(defaultTask)
      setShowTimeSelect(false)
    }
  }, [open])

  const toggleDay = (day: string) => {
    const fullDay = WEEKDAYS[day]
    setNewTask(prev => ({
      ...prev,
      schedule: prev.schedule.includes(fullDay)
        ? prev.schedule.filter(d => d !== fullDay)
        : [...prev.schedule, fullDay]
    }))
  }

  const handleTimeSelect = (time: string) => {
    setNewTask(prev => ({ ...prev, time }))
    setShowTimeSelect(false)
  }

  const handlePrioritySelect = (value: TaskPriority) => {
    setNewTask(prev => ({ ...prev, priority: value }))
    setShowPrioritySelect(false)
  }

  const handleCategorySelect = (value: TaskCategory) => {
    setNewTask(prev => ({ ...prev, category: value }))
    setShowCategorySelect(false)
  }

  const handleAddTask = () => {
    if (newTask.name.trim() && (newTask.isOneTime || newTask.schedule.length > 0)) {
      addTask(newTask)
      setNewTask(defaultTask)
      onOpenChange(false)
    }
  }

  return (
    <Sheet
      modal={true}
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[80]}
      zIndex={100000}
    >
      <Sheet.Overlay
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor="rgba(0,0,0,0.5)"
        backdropFilter="blur(8px)"
      />
      <Sheet.Frame
        backgroundColor="rgba(28,28,28,0.95)"
        padding="$5"
        gap="$5"
        borderRadius="$6"
        shadowColor="rgba(0,0,0,0.3)"
        shadowOffset={{ width: 0, height: -2 }}
        shadowOpacity={0.3}
        shadowRadius={8}
        elevation={10}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView bounces={false}>
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
            <Form gap="$5" onSubmit={handleAddTask}>
              <InputField
                label="Task Name"
                placeholder="Enter task name"
                value={newTask.name}
                onChangeText={(text: string) => setNewTask(prev => ({ ...prev, name: text }))}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
              <YStack gap="$3">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <XStack gap="$2" paddingVertical="$1">
                    {Object.entries(WEEKDAYS).map(([shortDay, fullDay]) => (
                      <Button
                        key={shortDay}
                        size="$4"
                        backgroundColor={
                          newTask.schedule.includes(fullDay)
                            ? preferences.primaryColor
                            : 'rgba(45,45,45,0.8)'
                        }
                        color="#fff"
                        pressStyle={{ opacity: 0.8, scale: 0.98 }}
                        onPress={() => toggleDay(shortDay)}
                        borderRadius={24}
                        paddingHorizontal="$2"
                        paddingVertical="$2.5"
                        borderWidth={1}
                        borderColor={newTask.schedule.includes(fullDay) ? 'transparent' : 'rgba(85,85,85,0.5)'}
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

              <YStack position="relative">
                <Button
                  onPress={() => setShowTimeSelect(true)}
                  backgroundColor="rgba(45,45,45,0.8)"
                  borderRadius={12}
                  height={50}
                  borderColor="rgba(85,85,85,0.5)"
                  borderWidth={1}
                  paddingHorizontal="$3"
                  pressStyle={{ opacity: 0.8 }}
                >
                  <XStack gap="$2" flex={1} alignItems="center">
                    <Text color="#fff" fontSize={16} fontWeight="500">Time:</Text>
                    <Text color="#a0a0a0" textTransform="capitalize" fontSize={16}>
                      {newTask.time || 'Select Time'}
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
                    <ScrollView 
                      bounces={false}
                      showsVerticalScrollIndicator={true}
                      contentContainerStyle={{
                        paddingBottom: 4
                      }}
                    >
                      <YStack elevation={8}>
                        {TIME_OPTIONS.map((time) => (
                          <Button
                            key={time}
                            onPress={() => handleTimeSelect(time)}
                            backgroundColor={
                              newTask.time === time
                                ? preferences.primaryColor
                                : 'transparent'
                            }
                            height={45}
                            justifyContent="center"
                            pressStyle={{ opacity: 0.8 }}
                            borderBottomWidth={1}
                            borderColor="rgba(85,85,85,0.2)"
                          >
                            <Text
                              color={newTask.time === time ? '#fff' : '#a0a0a0'}
                              textTransform="capitalize"
                              fontSize={16}
                              fontWeight={newTask.time === time ? "600" : "400"}
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

              <XStack gap="$4" width="100%">
                <YStack flex={1} position="relative">
                  <Button
                    onPress={() => setShowPrioritySelect(true)}
                    backgroundColor="rgba(45,45,45,0.8)"
                    borderRadius={12}
                    height={50}
                    borderColor="rgba(85,85,85,0.5)"
                    borderWidth={1}
                    paddingHorizontal="$3"
                    pressStyle={{ opacity: 0.8 }}
                  >
                    <XStack gap="$2" flex={1} alignItems="center">
                      <Text color="#fff" fontSize={16} fontWeight="500">Priority:</Text>
                      <Text color="#a0a0a0" textTransform="capitalize" fontSize={16}>
                        {newTask.priority}
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
                            newTask.priority === priority
                              ? preferences.primaryColor
                              : 'transparent'
                          }
                          height={45}
                          justifyContent="center"
                          pressStyle={{ opacity: 0.8 }}
                          borderBottomWidth={1}
                          borderColor="rgba(85,85,85,0.2)"
                        >
                          <Text
                            color={newTask.priority === priority ? '#fff' : '#a0a0a0'}
                            textTransform="capitalize"
                            fontSize={16}
                            fontWeight={newTask.priority === priority ? "600" : "400"}
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
                    onPress={() => setShowCategorySelect(true)}
                    backgroundColor="rgba(45,45,45,0.8)"
                    borderRadius={12}
                    height={50}
                    borderColor="rgba(85,85,85,0.5)"
                    borderWidth={1}
                    paddingHorizontal="$3"
                    pressStyle={{ opacity: 0.8 }}
                  >
                    <XStack gap="$2" flex={1} alignItems="center">
                      <Text color="#fff" fontSize={16} fontWeight="500">Category:</Text>
                      <Text color="#a0a0a0" textTransform="capitalize" fontSize={16}>
                        {newTask.category}
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
                    <ScrollView
                      bounces={false}
                      showsVerticalScrollIndicator={true}
                      contentContainerStyle={{
                        paddingBottom: 4
                      }}
                    >
                      <YStack elevation={8}>
                        {(['work', 'health', 'personal', 'career', 'wealth', 'skills'] as const).map((category) => (
                          <Button
                            key={category}
                            onPress={() => handleCategorySelect(category)}
                            backgroundColor={
                              newTask.category === category
                                ? preferences.primaryColor
                                : 'transparent'
                            }
                            height={45}
                            justifyContent="center"
                            pressStyle={{ opacity: 0.8 }}
                            borderBottomWidth={1}
                            borderColor="rgba(85,85,85,0.2)"
                          >
                            <Text
                              color={newTask.category === category ? '#fff' : '#a0a0a0'}
                              textTransform="capitalize"
                              fontSize={16}
                              fontWeight={newTask.category === category ? "600" : "400"}
                            >
                              {category}
                            </Text>
                          </Button>
                        ))}
                      </YStack>
                    </ScrollView>
                  </YStack>
                )}
                </YStack>
              </XStack>
              <YStack>
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  backgroundColor="rgba(45,45,45,0.8)"
                  padding="$4"
                  borderColor="rgba(85,85,85,0.5)"
                  borderWidth={1}
                  borderRadius={12}
                  height={60}
                >
                  <Text fontSize={16} color="#fff" fontWeight="500">One-time task</Text>
                  <Switch
                    checked={newTask.isOneTime}
                    onCheckedChange={checked => setNewTask(prev => ({ ...prev, isOneTime: checked }))}
                    backgroundColor={newTask.isOneTime ? preferences.primaryColor : 'rgba(85,85,85,0.5)'}
                  />
                </XStack>
              </YStack>
              <Form.Trigger asChild>
                <Button
                  backgroundColor={preferences.primaryColor}
                  height={50}
                  pressStyle={{ opacity: 0.8, scale: 0.98 }}
                  borderRadius={12}
                  alignSelf="center"
                  width="100%"
                  shadowColor="black"
                  shadowOffset={{ width: 0, height: 2 }}
                  shadowOpacity={0.1}
                  shadowRadius={4}
                  elevation={3}
                >
                  <Text color="white" fontWeight="600" fontSize={18}>
                    Add Task
                  </Text>
                </Button>
              </Form.Trigger>
            </Form>
          </ScrollView>
        </KeyboardAvoidingView>
      </Sheet.Frame>
    </Sheet>
  )
}