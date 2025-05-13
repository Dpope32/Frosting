import React, { useState, useEffect, useCallback } from 'react';
import { BaseCardModal } from '@/components/baseModals/BaseCardModal';
import { YStack, XStack, Text, Button, isWeb, Separator } from 'tamagui';
import { Platform, Alert, Keyboard } from 'react-native';
import { StatusSelector } from '../NewTaskModal/StatusSelector';
import { PeopleSelector } from '../NewTaskModal/PeopleSelector';
import { TagSelector } from '@/components/notes/TagSelector';
import { DebouncedInput } from '@/components/shared/debouncedInput';
import { useProjectStore } from '@/store/ProjectStore';
import { useToastStore } from '@/store/ToastStore';
import { usePeopleStore } from '@/store/People';
import { AttachmentSelector } from '@/components/projects/ProjectCard/modal/attachmentSelector';
import { SimpleImageViewer } from '@/components/notes/SimpleImageViewer';
import { Attachment } from '@/types/notes';
import type { Project } from '@/types/project';
import type { Tag } from '@/types/tag';
import type { Person } from '@/types/people';
import { isIpad } from '@/utils/deviceUtils';
import { DeadlineInputter } from '@/components/projects/ProjectCard/modal/deadlineInputter'; 
import { TasksInModal } from '@/components/projects/ProjectCard/modal/tasksInModal';
import { MaterialIcons } from '@expo/vector-icons';

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
  const [tags, setTags] = useState<Tag[]>(project?.tags || []);
  const [tasks, setTasks] = useState<any[]>(project?.tasks || []);
  const [status, setStatus] = useState<Project['status']>(project?.status || 'pending');
  const [attachments, setAttachments] = useState<Attachment[]>(project?.attachments || []);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const inputRef = React.useRef<any>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = React.useRef<any>(null);

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
      setTags(project.tags || []);
      setTasks(project.tasks || []);
      setStatus(project.status);
      setSelectedPeople(project.people || []);
      setAttachments(project.attachments || []);
    }
    
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [open, project]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
    }
  }, [isEditingTitle]);

  const handleSave = useCallback(() => {
    if (!project) return;
    updateProject(projectId, {
      name: name.trim(),
      description: description.trim(),
      deadline: deadline ? new Date(deadline) : undefined,
      tags,
      status,
      tasks,
      people: selectedPeople,
      attachments,
    });
    onOpenChange(false);
    showToast('Project updated successfully', 'success');
  }, [projectId, name, description, deadline, tags, tasks, status, selectedPeople, attachments]);

  const handleDelete = useCallback(() => {
    const deleteProject = () => {
      if (!projectId) return;
      useProjectStore.getState().deleteProject(projectId);
      onOpenChange(false);
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

  const handleTaskDelete = useCallback((taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
  }, [tasks]);

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title={
        <XStack ai="center" space="$2">
          <Button
            size="$2"
            backgroundColor="transparent"
            onPress={() => setIsEditingTitle(true)}
            pressStyle={{ opacity: 0.7 }}
          >
            <MaterialIcons
              name="edit"
              size={20}
              color={isDark ? '#5c5c5c' : '#666'}
            />
          </Button>
          {isEditingTitle ? (
            <DebouncedInput
              ref={titleInputRef}
              value={name}
              onDebouncedChange={setName}
              autoCapitalize="words"
              fontSize={22}
              fontFamily="$body"
              fontWeight="700"
              color={isDark ? '#fff' : '#000'}
              backgroundColor="transparent"
              borderWidth={0}
              onBlur={() => setIsEditingTitle(false)}
            />
          ) : (
            <Text
              fontSize={22}
              fontFamily="$body"
              fontWeight="700"
              color={isDark ? '#fff' : '#000'}
              opacity={isDark ? 1 : 0.9}
            >
              {name}
            </Text>
          )}
        </XStack>
      }
      showCloseButton
      snapPoints={isWeb ? [90] : isIpad() ? [70] : [93]}
      hideHandle
      footer={
        <XStack 
          width="100%" 
          mx={-4} 
          py={keyboardVisible ? '$4' : '$2'}
          mb={keyboardVisible ? isIpad() ? '$2' : '$3' : '$0'} 
          justifyContent="space-between"
        >
          <Button 
            onPress={handleDelete} 
            backgroundColor={isDark ? 'rgba(230, 98, 98, 0.06)' : 'rgba(203, 33, 33, 0.07)'} 
            pressStyle={{ opacity: 0.8 }}
            br={12}
            borderColor={isDark ? 'rgba(218, 37, 37, 0.14)' : 'rgba(220,38,38,0.3)'}
            borderWidth={2}
          >
            <Text color="#DC2626" fontWeight="600" fontFamily="$body">
              Delete
            </Text>
          </Button>
          <Button onPress={handleSave} 
          backgroundColor={ 'rgba(61, 132, 255, 0.07)'} 
          borderColor={'rgba(9, 132, 255, 0.44)'} 
          borderWidth={2}
          br={12}
          >
            <Text color="$blue10" fontWeight="600" fontFamily="$body">
              Save
            </Text>
          </Button>
        </XStack>
      }
    >
      <YStack 
        gap="$3" 
        px={isIpad() ? '$4' : '$2.5'} 
        pt={6}
      >
        <Separator 
          marginBottom="$2" 
          height={1}
          borderColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} 
        />
        <YStack gap="$2" mt={isIpad() ? "$2" : "$0"} mb="$2.5" mx={0}>
        <DeadlineInputter deadline={deadline} setDeadline={setDeadline} isDark={isDark} />
        </YStack>
        <XStack ai="center" alignItems="center" mb="$2.5" gap="$2" mx={4}>
          <TagSelector tags={tags} onTagsChange={setTags} />
        </XStack>
        <YStack gap="$2" mt={isIpad() ? "$2" : "$0"} mb="$0" mx={0}>
        <StatusSelector selectedStatus={status} onStatusSelect={setStatus} />
        </YStack>
        {peopleArray.length > 0 && (
        <YStack gap="$2" mt="$2" mb="$0" mx={0}>
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
        </YStack>
        )}
        <DebouncedInput
          value={description}
          placeholder="Description (optional)"
          onDebouncedChange={setDescription}
          multiline={true}
          numberOfLines={5}
          fontSize={isIpad() ? 17 : 15}
          fontFamily="$body"
          fontWeight="bold"
          w="97%"
          ml={isIpad() ? 10 : 6}
          color={isDark ? '#f6f6f6' : '#111'}
          backgroundColor={isDark ? 'rgba(255,255,255,0.0)' : 'rgba(0,0,0,0.0)'}
          borderWidth={1}
          borderColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
          borderRadius={12}
        />
        <AttachmentSelector isDark={isDark} attachments={attachments} setAttachments={setAttachments} />
        <TasksInModal tasks={tasks} isDark={isDark} onTaskDelete={handleTaskDelete} />
        <SimpleImageViewer
          imageUrl={selectedImageUrl}
          onClose={() => setSelectedImageUrl(null)}
          isDark={isDark}
        />
      </YStack>
    </BaseCardModal>
  );
}

export default EditProjectModal;
