import React, { useRef, useState } from 'react';
import { XStack, YStack, Text, Button, Stack } from 'tamagui';
import { BaseCardModal } from './BaseCardModal';
import { PrioritySelector } from './NewTaskModal/PrioritySelector';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { DebouncedInput } from '../shared/debouncedInput';
import { TaskPriority } from '@/types/task';

interface AddTaskToProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: { name: string; completed: boolean; priority: TaskPriority }) => void;
  projectName: string;
}

export function AddTaskToProjectModal({ open, onOpenChange, onSave, projectName }: AddTaskToProjectModalProps) {
  const [name, setName] = useState('');
  const [completed, setCompleted] = useState(false);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const inputRef = useRef<any>(null);
  useAutoFocus(inputRef, 500, open);

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name, completed, priority });
      setName('');
      setCompleted(false);
      setPriority('medium');
      onOpenChange(false);
    }
  };
  const handleCancel = () => {
    setName('');
    setCompleted(false);
    setPriority('medium');
    onOpenChange(false);
  };

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title={`New Task - ${projectName}`}
      snapPoints={[60]}
      showCloseButton
      hideHandle
      footer={
        <XStack width="100%" px="$0" py="$2" justifyContent="space-between">
          <Button
            backgroundColor="transparent"
            borderColor={'$red10'}
            height={40}
            paddingHorizontal={20}
            pressStyle={{ opacity: 0.8 }}
            onPress={handleCancel}
          >
            <Text color="$red10" fontWeight="bold" fontFamily="$body" fontSize={14}>
              Cancel
            </Text>
          </Button>
          <Button
            backgroundColor="#4F8EF7"
            height={40}
            paddingHorizontal={20}
            pressStyle={{ opacity: 0.8 }}
            onPress={handleSave}
            disabled={!name.trim()}
          >
            <Text color="#fff" fontWeight="500" fontSize={14} fontFamily="$body">
              Save
            </Text>
          </Button>
        </XStack>
      }
    >
      <YStack gap="$4" px="$2" py="$2">
        <DebouncedInput
          ref={inputRef}
          value={name}
          onDebouncedChange={setName}
          placeholder="Task name"
          maxLength={40}
          autoCapitalize="words"
          autoCorrect
          spellCheck
          fontSize={16}
          fontFamily="$body"
          px="$2.5"
          height={40}
        />
        <PrioritySelector selectedPriority={priority} onPrioritySelect={setPriority} />
      </YStack>
    </BaseCardModal>
  );
}

export default AddTaskToProjectModal; 