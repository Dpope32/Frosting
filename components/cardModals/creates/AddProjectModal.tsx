import React, { useState, useEffect, useCallback } from 'react';
import { BaseCardModal } from '@/components/baseModals/BaseCardModal';
import { YStack, XStack, Text, Button, isWeb } from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import { PrioritySelector } from '@/components/cardModals/NewTaskModal/PrioritySelector';
import { PeopleSelector } from '@/components/cardModals/NewTaskModal/PeopleSelector';
import { TagSelector } from '@/components/notes/TagSelector';
import { useProjectStore, usePeopleStore, useTagStore, useToastStore, useCalendarStore } from '@/store';
import type { Project, Person, Tag, TaskPriority, Task, TaskCategory, RecurrencePattern } from '@/types';
import { DebouncedInput } from '@/components/shared/debouncedInput'
import { isIpad } from '@/utils';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, Pressable } from 'react-native';
import { useAutoFocus } from '@/hooks';
import { MaterialIcons } from '@expo/vector-icons';

interface AddProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDark: boolean;
}

export function AddProjectModal({ open, onOpenChange, isDark }: AddProjectModalProps) {
  const addProject = useProjectStore((state) => state.addProject);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<Project['priority']>('medium');
  const [selectedPeople, setSelectedPeople] = useState<Person[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  // Task management state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskName, setCurrentTaskName] = useState('');
  const [currentTaskPriority, setCurrentTaskPriority] = useState<TaskPriority>('medium');
  const [showAddTask, setShowAddTask] = useState(false);
  
  const tagStoreTags = useTagStore((state) => state.tags);
  const addTagToStore = useTagStore((state) => state.addTag);
  const showToast = useToastStore((state) => state.showToast)
  const contacts = usePeopleStore((state) => state.contacts);
  const projectTitleInputRef = React.useRef<any>(null);
  useAutoFocus(projectTitleInputRef, 1000, open);
  
  const peopleList = Object.values(contacts);
  
  // Task management functions
  const handleAddTask = useCallback(() => {
    if (currentTaskName.trim()) {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 9),
        name: currentTaskName.trim(),
        schedule: [],
        priority: currentTaskPriority,
        category: 'task' as TaskCategory,
        completed: false,
        completionHistory: {},
        createdAt: now,
        updatedAt: now,
        recurrencePattern: 'one-time' as RecurrencePattern,
        showInCalendar: false,
        tags: [],
      };
      setTasks(prev => [...prev, newTask]);
      setCurrentTaskName('');
      setCurrentTaskPriority('medium');
      setShowAddTask(false);
    }
  }, [currentTaskName, currentTaskPriority]);

  const handleRemoveTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);
  
  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setDeadline('');
      setPriority('medium');
      setSelectedPeople([]);
      setTags([]);
      setTasks([]);
      setCurrentTaskName('');
      setCurrentTaskPriority('medium');
      setShowAddTask(false);
    }
  }, [open]);
  

  const handleSave = useCallback(() => {
    if (!name.trim()) return;
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 9);
    const newProject: Project = {
      id,
      name: name.trim(),
      description: description.trim(),
      createdAt: new Date(),
      deadline: deadline ? new Date(deadline) : undefined,
      status: 'in_progress',
      priority,
      tags,
      isArchived: false,
      isDeleted: false,
      tasks,
      people: selectedPeople,
      notes: [],
      isPinned: false,
    };
    addProject(newProject);
    // Optimistically add a calendar event for the project deadline
    if (newProject.deadline) {
      const calendarStore = useCalendarStore.getState();
      const dateStr = newProject.deadline.toISOString().split('T')[0];
      calendarStore.addEvent({
        date: dateStr,
        title: `${newProject.name} Deadline`,
        description: newProject.description,
        notifyOnDay: true,
        notifyBefore: false,
      });
      // Schedule notifications for the newly added event
      const events = calendarStore.events;
      const addedEvent = events[events.length - 1];
      calendarStore.scheduleEventNotifications(addedEvent);
    }
    onOpenChange(false);
    setName('');
    setDescription('');
    setDeadline('');
    setPriority('medium');
    setTags([]);
    setTasks([]);
    setCurrentTaskName('');
    setCurrentTaskPriority('medium');
    setShowAddTask(false);
    setShowDatePicker(false);
    showToast("Project created successfully", "success");
      }, [name, description, deadline, priority, tags, tasks, addProject, onOpenChange, addTagToStore]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false); 
    if (date) {
      setDeadline(date.toISOString().split('T')[0]);
    }
  };

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title="New Project"
      showCloseButton={true}
      snapPoints={isWeb ? [90] : isIpad() ? [70] : [92]}
      hideHandle={true}
      footer={
        <XStack width="100%" px="$0" py="$2" justifyContent="space-between">
          <Button
            theme={isDark ? "dark" : "light"}
            onPress={handleCancel}
            backgroundColor={isDark ? "$gray5" : "#E0E0E0"}
          >
            Cancel
          </Button>
          <Button
            onPress={handleSave}
            backgroundColor="#3B82F6"
            borderColor="#3B82F6"
            borderWidth={2}
          >
            <Text color="white" fontWeight="600" fontFamily="$body">
              Save
            </Text>
          </Button>
        </XStack>
      }
    >
      <YStack gap={isIpad() ? "$4" : "$3"} px={isIpad() ? "$4" : "$1.5"}>
        <YStack gap="$1" pt={isIpad() ? "$3" : "$2"} px={isIpad() ? "$2" : "$2"} > 
          <DebouncedInput
            value={name}
            placeholder="What's the name of this project?"
            onDebouncedChange={setName}
            ref={projectTitleInputRef}
            autoCapitalize="sentences"
            fontSize={isIpad() ? 17 : 15}
            fontFamily="$body"
            fontWeight="bold"
            color={isDark ? '#f6f6f6' : '#111'}
            backgroundColor={isDark ? 'rgba(255,255,255,0.0)' : 'rgba(0,0,0,0.0)'}
            borderWidth={1}
            borderColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0, 0, 0, 0.1)'}
            borderRadius={4}
          />
        </YStack>
        <YStack gap="$1" px={isIpad() ? "$2" : "$2"}>
          {isWeb ? (
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.currentTarget.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                color: isDark ? '#f6f6f6' : '#111',
                fontSize: '15px',
                fontFamily: 'inherit',
                fontWeight: '500',
                outline: 'none',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4F8EF7';
                e.target.style.boxShadow = `0 0 0 3px ${isDark ? 'rgba(79,142,247,0.1)' : 'rgba(79,142,247,0.1)'}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          ) : ( 
            <YStack px={isIpad() ? "$1" : "$1"}>
              {!deadline && (
                <Button
                  onPress={() => setShowDatePicker(true)}
                  borderWidth={1}
                  borderRadius={12}
                  backgroundColor={isDark ? 'transparent' : 'transparent'}
                  px="$3"
                  width="100%"
                  borderColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
                  ai="center"
                  jc="space-between"
                >
                  <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} fontFamily="$body" fontWeight="bold">Select Deadline (optional)</Text>
                   <MaterialIcons  name="event" size={24} color={isDark ? '#6c6c6c' : '#9c9c9c'} />
                </Button>
              )}
              {deadline ? (
                <XStack pl={isIpad() ? "$0" : "$1"} gap="$1" pb={16} pt={4} ai="center">
                  <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} pr="$2" fontFamily="$body" fontWeight="bold">
                    Deadline:
                  </Text>
                  <Pressable onPress={() => setShowDatePicker(true)}>
                    <MaterialIcons name="edit" size={isIpad() ? 18 : 16} color={isDark ? '#f6f6f6' : '#222'} />
                  </Pressable>
                  <Text color={isDark ? '#f6f6f6' : '#222'} fontSize={isIpad() ? 17 : 15} fontFamily="$body">
                    {new Date(deadline).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </XStack>
              ) : <Text opacity={0}>No deadline set</Text>}
              {showDatePicker && (
                <YStack gap="$1">
                  <DateTimePicker
                    value={deadline ? new Date(deadline) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={handleDateChange}
                    style={{ width: '100%', backgroundColor: isDark ? '#1e1e1e' : '#FFFFFF', alignSelf: 'center', padding: 10, marginBottom: 10, marginTop: -55, borderRadius: 16, overflow: 'hidden' }}
                  />
                </YStack>
              )}
            </YStack>
          )}
        </YStack>
        {peopleList.length > 0 && (
          <PeopleSelector 
            people={peopleList} 
            selectedPeople={selectedPeople} 
            onPersonSelect={(person) => {
              setSelectedPeople(prev => 
                prev.some(p => p.id === person.id)
                  ? prev.filter(p => p.id !== person.id)
                  : [...prev, person]
              );
            }} 
          />
        )}
        <YStack gap="$1" px={isIpad() ? "$2" : "$2"}>
          <DebouncedInput
            value={description}
            placeholder="Description (optional)"
            onDebouncedChange={setDescription}
            multiline={true}
            numberOfLines={8}
            fontSize={isIpad() ? 17 : 15}
            fontFamily="$body"
            fontWeight="bold"
            color={isDark ? '#f6f6f6' : '#111'}
            backgroundColor={isDark ? 'rgba(255,255,255,0.0)' : 'rgba(0,0,0,0.0)'}
            borderWidth={1}
            borderColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
            borderRadius={4}
          />
        </YStack>

        {/* Task Management Section */}
        <YStack gap="$2" px={isIpad() ? "$2" : "$2"}>
          <XStack justifyContent="space-between" alignItems="center">
            <Text
              fontSize={isIpad() ? 17 : 15}
              fontFamily="$body"
              fontWeight="bold"
              color={isDark ? '#f6f6f6' : '#111'}
            >
              Tasks ({tasks.length})
            </Text>
            <Button
              size="$2"
              backgroundColor="#4F8EF7"
              borderRadius={8}
              paddingHorizontal={12}
              onPress={() => setShowAddTask(true)}
              pressStyle={{ opacity: 0.8 }}
            >
              <XStack alignItems="center" gap="$1">
                <MaterialIcons name="add" size={16} color="#fff" />
                <Text color="#fff" fontSize={12} fontWeight="600" fontFamily="$body">
                  Add Task
                </Text>
              </XStack>
            </Button>
          </XStack>

          {/* Add Task Form */}
          {showAddTask && (
            <YStack
              gap="$3"
              padding="$3"
              backgroundColor={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
              borderRadius={12}
              borderWidth={1}
              borderColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}
            >
              <DebouncedInput
                value={currentTaskName}
                onDebouncedChange={setCurrentTaskName}
                placeholder="Task name"
                maxLength={40}
                autoCapitalize="words"
                autoCorrect
                spellCheck
                fontSize={isIpad() ? 16 : 14}
                fontFamily="$body"
                fontWeight="500"
                color={isDark ? '#f6f6f6' : '#111'}
                backgroundColor={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'}
                borderWidth={1}
                borderColor={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}
                px="$2.5"
                height={40}
                borderRadius={8}
              />
              <PrioritySelector 
                selectedPriority={currentTaskPriority} 
                onPrioritySelect={setCurrentTaskPriority} 
              />
              <XStack gap="$2" justifyContent="flex-end">
                <Button
                  size="$2"
                  backgroundColor="transparent"
                  borderColor={isDark ? 'rgba(220,38,38,0.4)' : '$red10'}
                  borderWidth={1}
                  onPress={() => {
                    setShowAddTask(false);
                    setCurrentTaskName('');
                    setCurrentTaskPriority('medium');
                  }}
                  pressStyle={{ opacity: 0.8 }}
                >
                  <Text color={isDark ? '#ff6b6b' : '$red10'} fontSize={12} fontWeight="600" fontFamily="$body">
                    Cancel
                  </Text>
                </Button>
                <Button
                  size="$2"
                  backgroundColor="#4F8EF7"
                  onPress={handleAddTask}
                  disabled={!currentTaskName.trim()}
                  pressStyle={{ opacity: 0.8 }}
                >
                  <Text color="#fff" fontSize={12} fontWeight="600" fontFamily="$body">
                    Add
                  </Text>
                </Button>
              </XStack>
            </YStack>
          )}

          {/* Task List */}
          {tasks.length > 0 && (
            <YStack height={200}>
              <FlashList
                data={tasks}
                showsVerticalScrollIndicator={false}
                estimatedItemSize={50}
                renderItem={({ item: task }) => (
                  <XStack
                    alignItems="center"
                    justifyContent="space-between"
                    padding="$2.5"
                    marginBottom="$2"
                    backgroundColor={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}
                    borderRadius={8}
                    borderWidth={1}
                    borderColor={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}
                  >
                    <XStack alignItems="center" gap="$2" flex={1}>
                      <YStack
                        backgroundColor={
                          task.priority === 'high' 
                            ? '#ef4444' 
                            : task.priority === 'medium' 
                            ? '#f59e0b' 
                            : '#10b981'
                        }
                        width={3}
                        height={20}
                        borderRadius={2}
                      />
                      <Text
                        fontSize={isIpad() ? 15 : 13}
                        fontFamily="$body"
                        fontWeight="500"
                        color={isDark ? '#f6f6f6' : '#111'}
                        flex={1}
                      >
                        {task.name}
                      </Text>
                    </XStack>
                    <Button
                      size="$1"
                      backgroundColor="transparent"
                      onPress={() => handleRemoveTask(task.id)}
                      pressStyle={{ opacity: 0.6 }}
                    >
                      <MaterialIcons 
                        name="close" 
                        size={16} 
                        color={isDark ? '#ff6b6b' : '#dc2626'} 
                      />
                    </Button>
                  </XStack>
                )}
              />
            </YStack>
          )}
        </YStack>
        <YStack gap="$1" px={isIpad() ? "$2" : "$2"}>
          <Text
            fontSize={isIpad() ? 17 : 15}
            fontFamily="$body"
            fontWeight="bold"
            color={isDark ? '#f6f6f6' : '#111'}
            mb="$2"
          >
            Tags
          </Text>
          <YStack 
            backgroundColor={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'}
            borderRadius={12}
            borderWidth={1}
            borderColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
            padding="$3"
          >
            <TagSelector tags={tags} onTagsChange={setTags} />
          </YStack>
        </YStack>
      </YStack>
    </BaseCardModal>
  );
}
