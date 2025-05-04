import React, { useState, useEffect, useCallback } from 'react';
import { BaseCardModal } from './BaseCardModal';
import { YStack, XStack, Text, Button, Input, isWeb } from 'tamagui';
import { PrioritySelector } from './NewTaskModal/PrioritySelector';
import { TagSelector } from '@/components/notes/TagSelector';
import { useProjectStore } from '@/store/ProjectStore';
import type { Project } from '@/types/project';
import type { Tag } from '@/types/tag';
import { DebouncedInput } from '@/components/shared/debouncedInput'
import { isIpad } from '@/utils/deviceUtils';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

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
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setDeadline('');
      setPriority('medium');
      setTags([]);
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
      status: 'pending',
      priority,
      tags,
      isArchived: false,
      isDeleted: false,
      tasks: [],
      people: [],
      notes: [],
      attachments: [],
    };
    addProject(newProject);
    onOpenChange(false);
  }, [name, description, deadline, priority, tags, addProject, onOpenChange]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
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
      snapPoints={isWeb ? [90] : isIpad() ? [70] : [77]}
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
      <YStack gap="$4" px="$4">
        <YStack gap="$1" pt="$3">
          <DebouncedInput
            value={name}
            placeholder="Project name"
            onDebouncedChange={setName}
          />
        </YStack>
        <PrioritySelector selectedPriority={priority} onPrioritySelect={setPriority} />
        <YStack gap="$1">
          {isWeb ? (
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.currentTarget.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #3B82F6',
                borderRadius: 4,
                backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF',
                color: isDark ? '#FFFFFF' : '#000000',
                fontSize: 16,
                outline: 'none'
              }}
            />
          ) : (
            <>
              <Button
                onPress={() => setShowDatePicker(true)}
                borderWidth={1}
                borderColor="#3B82F6"
                borderRadius="$2"
                backgroundColor={isDark ? '$gray3' : '$white'}
                px="$3"
                py="$2"
              >
                <Text color={deadline ? '#3B82F6' : '$gray8'}>{deadline || 'Select date'}</Text>
              </Button>
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
        <YStack gap="$1">
          <DebouncedInput
            value={description}
            placeholder="Description (optional)"
            onDebouncedChange={setDescription}
            multiline={true}
            numberOfLines={5}
          />
        </YStack>
        <TagSelector tags={tags} onTagsChange={setTags} />
      </YStack>
    </BaseCardModal>
  );
} 