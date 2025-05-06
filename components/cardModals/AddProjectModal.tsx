import React, { useState, useEffect, useCallback } from 'react';
import { BaseCardModal } from './BaseCardModal';
import { YStack, XStack, Text, Button, Input, isWeb } from 'tamagui';
import { PrioritySelector } from './NewTaskModal/PrioritySelector';
import { PeopleSelector } from './NewTaskModal/PeopleSelector';
import { TagSelector } from '@/components/notes/TagSelector';
import { useProjectStore } from '@/store/ProjectStore';
import { usePeopleStore } from '@/store/People';
import type { Project } from '@/types/project';
import type { Person } from '@/types/people';
import type { Tag } from '@/types/tag';
import { DebouncedInput } from '@/components/shared/debouncedInput'
import { isIpad } from '@/utils/deviceUtils';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { useToastStore } from '@/store/ToastStore';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { useTagStore } from '@/store/TagStore';
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
  const tagStoreTags = useTagStore((state) => state.tags);
  const addTagToStore = useTagStore((state) => state.addTag);
  const showToast = useToastStore((state) => state.showToast)
  const contacts = usePeopleStore((state) => state.contacts);
  const projectTitleInputRef = React.useRef<any>(null);
  useAutoFocus(projectTitleInputRef, 1000, open);
  
  const peopleList = Object.values(contacts);
  
  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setDeadline('');
      setPriority('medium');
      setSelectedPeople([]);
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
      people: selectedPeople,
      notes: [],
      attachments: [],
    };
    addProject(newProject);
    onOpenChange(false);
    newProject.tags?.forEach((tag) => {
      addTagToStore(tag.name);
    });
    setName('');
    setDescription('');
    setDeadline('');
    setPriority('medium');
    setTags([]);
    setShowDatePicker(false);
    showToast("Project created successfully", "success");
  }, [name, description, deadline, priority, tags, addProject, onOpenChange, addTagToStore]);

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
      snapPoints={isWeb ? [90] : isIpad() ? [70] : [90]}
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
        </YStack>
        <PrioritySelector selectedPriority={priority} onPrioritySelect={setPriority} />
        <YStack gap="$1" px={isIpad() ? "$2" : "$2"}>
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
            <YStack gap="$2" px={isIpad() ? "$2" : "$1"}>
              {!deadline && (
                <Button
                  onPress={() => setShowDatePicker(true)}
                  borderBottomWidth={1}
                  borderRadius="$2"
                  backgroundColor={isDark ? '$gray0' : '$white'}
                  px="$3"
                  width="100%"
                  borderBottomColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
                  ai="center"
                  jc="space-between"
                >
                  <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} fontFamily="$body" fontWeight="bold">Select Deadline (optional)</Text>
                   
                   <MaterialIcons  name="event" size={24} color={isDark ? '#6c6c6c' : '#9c9c9c'} />
                </Button>
              )}
              {deadline ? (
                <XStack pl="$1" gap="$1" ai="center" > 
                  <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} pr="$2" fontFamily="$body" fontWeight="bold">Deadline:</Text>
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
                    style={{ width: '100%', backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF' }}
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
        <YStack gap="$1" mt={12} mx={-4} >
          <TagSelector tags={tags} onTagsChange={setTags} />
          </YStack>
      </YStack>
    </BaseCardModal>
  );
}
