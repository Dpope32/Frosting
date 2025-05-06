import React, { useState, useEffect, useCallback } from 'react';
import { BaseCardModal } from './BaseCardModal';
import { YStack, XStack, Text, Button, isWeb } from 'tamagui';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { PrioritySelector } from './NewTaskModal/PrioritySelector';
import { StatusSelector } from './NewTaskModal/StatusSelector';
import { TagSelector } from '@/components/notes/TagSelector';
import { DebouncedInput } from '@/components/shared/debouncedInput';
import { useProjectStore } from '@/store/ProjectStore';
import { useToastStore } from '@/store/ToastStore';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { useTagStore } from '@/store/TagStore';
import { MaterialIcons } from '@expo/vector-icons';
import { AddTaskToProjectModal } from './AddTaskToProjectModal';
import type { Project } from '@/types/project';
import type { Tag } from '@/types/tag';
import type { TaskPriority, RecurrencePattern } from '@/types/task';
import { isIpad } from '@/utils/deviceUtils';

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  isDark: boolean;
}

export function EditProjectModal({ open, onOpenChange, projectId, isDark }: EditProjectModalProps) {
  const getProjectById = useProjectStore((s) => s.getProjectById);
  const updateProject = useProjectStore((s) => s.updateProject);
  const showToast = useToastStore((s) => s.showToast);
  const addTagToStore = useTagStore((s) => s.addTag);

  const project = getProjectById(projectId);

  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [deadline, setDeadline] = useState(
    project?.deadline
      ? typeof project.deadline === 'string'
        ? project.deadline
        : new Date(project.deadline).toISOString().split('T')[0]
      : ''
  );
  const [priority, setPriority] = useState<Project['priority']>(project?.priority || 'medium');
  const [tags, setTags] = useState<Tag[]>(project?.tags || []);
  const [tasks, setTasks] = useState<any[]>(project?.tasks || []);
  const [status, setStatus] = useState<Project['status']>(project?.status || 'pending');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const inputRef = React.useRef<any>(null);

  useAutoFocus(inputRef, 500, open);

  useEffect(() => {
    if (open && project) {
      setName(project.name);
      setDescription(project.description || '');
      setDeadline(
        project.deadline
          ? typeof project.deadline === 'string'
            ? project.deadline
            : new Date(project.deadline).toISOString().split('T')[0]
          : ''
      );
      setPriority(project.priority);
      setTags(project.tags || []);
      setTasks(project.tasks || []);
      setStatus(project.status);
    }
  }, [open, project]);

  const handleSave = useCallback(() => {
    if (!project) return;
    updateProject(projectId, {
      name: name.trim(),
      description: description.trim(),
      deadline: deadline ? new Date(deadline) : undefined,
      priority,
      tags,
      status,
      tasks,
    });
    onOpenChange(false);
    showToast('Project updated successfully', 'success');
  }, [projectId, name, description, deadline, priority, tags, tasks, status]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleDateChange = (_e: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setDeadline(date.toISOString().split('T')[0]);
    }
  };

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const handleAddTask = useCallback(
    (task: { name: string; completed: boolean; priority: TaskPriority }) => {
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 9);
      const now = new Date().toISOString();
      setTasks((prev) => [
        ...prev,
        {
          id,
          name: task.name,
          completed: task.completed,
          priority: task.priority,
          schedule: [],
          category: 'task',
          completionHistory: {},
          createdAt: now,
          updatedAt: now,
          recurrencePattern: 'one-time' as RecurrencePattern,
        },
      ]);
    },
    []
  );

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Project"
      showCloseButton
      snapPoints={isWeb ? [90] : isIpad() ? [70] : [85]}
      hideHandle
      footer={
        <XStack width="100%" px="$0" py="$2" justifyContent="space-between">
          <Button theme={isDark ? 'dark' : 'light'} onPress={handleCancel} backgroundColor={isDark ? '$gray5' : '#E0E0E0'}>
            Cancel
          </Button>
          <Button onPress={handleSave} backgroundColor="#3B82F6" borderColor="#3B82F6" borderWidth={2}>
            <Text color="white" fontWeight="600" fontFamily="$body">
              Save
            </Text>
          </Button>
        </XStack>
      }
    >
      <YStack gap="$4" px={isIpad() ? '$4' : '$1.5'} pt={10}>
        <DebouncedInput
          ref={inputRef}
          value={name}
          placeholder="Project Name"
          onDebouncedChange={setName}
          autoCapitalize="words"
          fontSize={isIpad() ? 17 : 15}
          fontFamily="$body"
          fontWeight="bold"
          color={isDark ? '#f6f6f6' : '#111'}
          backgroundColor={isDark ? 'rgba(255,255,255,0.0)' : 'rgba(0,0,0,0.0)'}
          borderWidth={1}
          borderColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
          borderRadius={4}
        />
        <PrioritySelector selectedPriority={priority} onPrioritySelect={setPriority} />
        <StatusSelector selectedStatus={status} onStatusSelect={setStatus} />
        <YStack gap="$1" px={isIpad() ? '$2' : '$2'}>
          {isWeb ? (
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.currentTarget.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #3B82F6',
                borderRadius: 4,
                backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF',
                color: isDark ? '#FFFFFF' : '#000000',
                fontSize: 16,
                outline: 'none',
              }}
            />
          ) : (
            <>
              {!deadline && (
                <Button
                  onPress={() => setShowDatePicker(true)}
                  borderWidth={1}
                  borderRadius="$2"
                  backgroundColor={isDark ? '$gray0' : '$white'}
                  px="$3"
                  width="100%"
                  borderColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
                  ai="center"
                  jc="space-between"
                >
                  <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} fontFamily="$body" fontWeight="bold">
                    Select Deadline (optional)
                  </Text>
                  <MaterialIcons name="event" size={24} color={isDark ? '#6c6c6c' : '#9c9c9c'} />
                </Button>
              )}
              {deadline ? (
                <XStack ai="center" gap="$1">
                  <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} pr="$2" fontFamily="$body" fontWeight="bold">
                    Deadline:
                  </Text>
                  <Text color={isDark ? '#f6f6f6' : '#222'} fontSize={isIpad() ? 17 : 15} fontFamily="$body">
                    {new Date(deadline).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
                  </Text>
                </XStack>
              ) : (
                <Text opacity={0}>No deadline set</Text>
              )}
              {showDatePicker && (
                <YStack gap="$1">
                  <DateTimePicker
                    value={deadline ? new Date(deadline) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={handleDateChange}
                    style={{ width: '100%', backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF' }}
                  />
                </YStack>
              )}
            </>
          )}
        </YStack>
        <DebouncedInput
          value={description}
          placeholder="Description (optional)"
          onDebouncedChange={setDescription}
          multiline={true}
          numberOfLines={10}
          fontSize={isIpad() ? 17 : 15}
          fontFamily="$body"
          fontWeight="bold"
          color={isDark ? '#f6f6f6' : '#111'}
          backgroundColor={isDark ? 'rgba(255,255,255,0.0)' : 'rgba(0,0,0,0.0)'}
          borderWidth={1}
          borderColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
          borderRadius={4}
        />
         <YStack gap="$1" mt={10} mx={-4}>
          <TagSelector tags={tags} onTagsChange={setTags} />
        </YStack>
        {status === 'completed' && (
          <YStack gap="$3" mt="$4">
            <Text fontSize={16} fontWeight="bold" color={isDark ? '#f6f6f6' : '#111'}>
              Tasks
            </Text>
            {tasks.map((task) => (
              <XStack key={task.id} ai="center" justifyContent="space-between" px="$2" py="$2" br={4} backgroundColor={isDark ? '#222' : '#f0f0f0'}>
                <Text color={isDark ? '#f6f6f6' : '#111'}>{task.name}</Text>
                <Button size="$2" circular onPress={() => handleDeleteTask(task.id)}>
                  <MaterialIcons name="delete" size={16} color={isDark ? '#f6f6f6' : '#333'} />
                </Button>
              </XStack>
            ))}
            <Button onPress={() => setAddTaskModalOpen(true)} backgroundColor="#3B82F6">
              <Text color="white">Add Task</Text>
            </Button>
            <AddTaskToProjectModal
              open={addTaskModalOpen}
              onOpenChange={setAddTaskModalOpen}
              onSave={(t) => { handleAddTask(t); setAddTaskModalOpen(false); }}
            />
          </YStack>
        )}
      </YStack>
    </BaseCardModal>
  );
}

export default EditProjectModal; 