import React, { useState, useEffect, useCallback } from 'react';
import { BaseCardModal } from './BaseCardModal';
import { YStack, XStack, Text, Button, isWeb } from 'tamagui';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, Alert, Keyboard } from 'react-native';
import { PrioritySelector } from './NewTaskModal/PrioritySelector';
import { StatusSelector } from './NewTaskModal/StatusSelector';
import { PeopleSelector } from './NewTaskModal/PeopleSelector';
import { TagSelector } from '@/components/notes/TagSelector';
import { DebouncedInput } from '@/components/shared/debouncedInput';
import { useProjectStore } from '@/store/ProjectStore';
import { useToastStore } from '@/store/ToastStore';
import { useTagStore } from '@/store/TagStore';
import { usePeopleStore } from '@/store/People';
import { MaterialIcons } from '@expo/vector-icons';
import type { Project } from '@/types/project';
import type { Tag } from '@/types/tag';
import type { Person } from '@/types/people';
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
  const { contacts } = usePeopleStore();
  
  const peopleArray = Object.values(contacts || {});
  const project = getProjectById(projectId);

  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [selectedPeople, setSelectedPeople] = useState<Person[]>(project?.people || []);
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
      setSelectedPeople(project.people || []);
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
      people: selectedPeople,
    });
    onOpenChange(false);
    showToast('Project updated successfully', 'success');
  }, [projectId, name, description, deadline, priority, tags, tasks, status, selectedPeople]);

  const handleDelete = useCallback(() => {
    const deleteProject = () => {
      if (!projectId) return;
      
      // Delete the project
      useProjectStore.getState().deleteProject(projectId);
      
      // Close the modal
      onOpenChange(false);
      
      // Show success toast
      showToast('Project deleted successfully', 'success');
    };
    
    if (isWeb) {
      if (window.confirm('Are you sure you want to delete this project?')) {
        deleteProject();
      }
    } else {
      Alert.alert(
        'Delete Project',
        'Are you sure you want to delete this project?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: deleteProject }
        ]
      );
    }
  }, [projectId, onOpenChange, showToast]);

  const handleDateChange = (_e: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setDeadline(date.toISOString().split('T')[0]);
    }
  };

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Project"
      showCloseButton
      snapPoints={isWeb ? [90] : isIpad() ? [70] : [93]}
      hideHandle
      footer={
        <XStack width="100%" mx={-4} py="$2" justifyContent="space-between">
          <Button 
            onPress={handleDelete} 
            backgroundColor={isDark ? 'rgba(220,38,38,0.3)' : 'rgba(220,38,38,0.3)'} 
            borderWidth={0}
            pressStyle={{ opacity: 0.8 }}
          >
            <Text color="#DC2626" fontWeight="600" fontFamily="$body">
              Delete
            </Text>
          </Button>
          <Button onPress={handleSave} backgroundColor="#3B82F6" borderColor="#3B82F6" borderWidth={2}>
            <Text color="white" fontWeight="600" fontFamily="$body">
              Save
            </Text>
          </Button>
        </XStack>
      }
    >
      <YStack 
        gap="$4" 
        px={isIpad() ? '$4' : '$2.5'} 
        pt={10}
      >
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
        <YStack gap="$2" px={isIpad() ? '$2' : '$1'}>
          {isWeb ? (
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.currentTarget.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: 4,
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                color: isDark ? '#f6f6f6' : '#111',
                fontSize: isIpad() ? 17 : 15,
                fontFamily: 'inherit',
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
                  backgroundColor={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}
                  px="$3"
                  py="$2"
                  width="100%"
                  borderColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
                  ai="center"
                  jc="space-between"
                  pressStyle={{ opacity: 0.8 }}
                >
                  <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} fontFamily="$body" fontWeight="bold">
                    Set Deadline (optional)
                  </Text>
                  <MaterialIcons name="event" size={24} color={isDark ? '#6c6c6c' : '#9c9c9c'} />
                </Button>
              )}
              {deadline ? (
                <XStack ai="center" jc="space-between" width="100%">
                  <XStack ai="center" gap="$2" px={8}>
                    <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} fontFamily="$body" fontWeight="bold">
                      Deadline:
                    </Text>
                    <Text color={isDark ? '#f6f6f6' : '#222'} fontSize={isIpad() ? 17 : 15} fontFamily="$body">
                      {new Date(deadline).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
                    </Text>
                  </XStack>
                  <Button
                    size="$2"
                    circular
                    backgroundColor="transparent"
                    onPress={() => setShowDatePicker(true)}
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <MaterialIcons name="edit" size={20} color={isDark ? '#f6f6f6' : '#666'} />
                  </Button>
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
        <YStack gap="$2" mt="$4" mb="$2" mx={0}>
          {peopleArray.length > 0 && (
            <PeopleSelector
              people={peopleArray}
              selectedPeople={selectedPeople}
              onPersonSelect={(person) => {
                const isSelected = selectedPeople.some(p => p.id === person.id);
                if (isSelected) {
                  setSelectedPeople(selectedPeople.filter(p => p.id !== person.id));
                } else {
                  setSelectedPeople([...selectedPeople, person]);
                }
              }}
            />
          )}
        </YStack>
        <PrioritySelector selectedPriority={priority} onPrioritySelect={setPriority} />
        <XStack gap="$2" mt="$2" mx={10}>
        <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} fontFamily="$body" fontWeight="500">Tags?</Text>
          <TagSelector tags={tags} onTagsChange={setTags} />
        </XStack>
        <StatusSelector selectedStatus={status} onStatusSelect={setStatus} />
        <DebouncedInput
          value={description}
          placeholder="Description (optional)"
          onDebouncedChange={setDescription}
          multiline={true}
          numberOfLines={7}
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
    </BaseCardModal>
  );
}

export default EditProjectModal;
