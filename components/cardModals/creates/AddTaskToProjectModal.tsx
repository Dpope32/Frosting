import React, { useRef, useState } from 'react';
import { XStack, YStack, Text, Button } from 'tamagui';
import { BaseCardModal } from '@/components/baseModals/BaseCardModal'
import { PrioritySelector } from '@/components/cardModals/NewTaskModal/PrioritySelector';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { DebouncedInput } from '@/components/shared/debouncedInput';
import { TaskPriority } from '@/types';
import { useColorScheme } from '@/hooks/useColorScheme';
import { isIpad } from '@/utils/deviceUtils';

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
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
      snapPoints={[63]}
      showCloseButton
      hideHandle
      footer={
        <XStack width="100%" px="$0" py="$2" justifyContent="space-between">
          <Button
            backgroundColor="transparent"
            borderColor={isDark ? 'rgba(220,38,38,0.4)' : '$red10'}
            height={40}
            paddingHorizontal={20}
            pressStyle={{ opacity: 0.8 }}
            onPress={handleCancel}
          >
            <Text color={isDark ? '#ff6b6b' : '$red10'} fontWeight="bold" fontFamily="$body" fontSize={14}>
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
      <YStack 
        gap="$4" 
        px="$2.5" 
        py="$4"
      >
        <DebouncedInput
          ref={inputRef}
          value={name}
          onDebouncedChange={setName}
          placeholder="Task name"
          maxLength={40}
          autoCapitalize="words"
          autoCorrect
          spellCheck
          fontSize={isIpad() ? 17 : 15}
          fontFamily="$body"
          fontWeight="bold"
          color={isDark ? '#f6f6f6' : '#111'}
          backgroundColor={isDark ? 'rgba(255,255,255,0.0)' : 'rgba(0,0,0,0.0)'}
          borderWidth={1}
          borderColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
          px="$2.5"
          height={45}
          borderRadius={12}
        />
        <PrioritySelector selectedPriority={priority} onPrioritySelect={setPriority} />
      </YStack>
    </BaseCardModal>
  );
}

export default AddTaskToProjectModal;
