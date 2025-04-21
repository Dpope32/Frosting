// components/tasklist/DeleteTaskDialog.tsx
import React, { useState } from 'react'
import { AlertDialog, Button, YStack, XStack, isWeb, Spinner, Text } from 'tamagui'
import { Task } from '@/types/task'
import { useColorScheme as useRNColorScheme } from 'react-native'

interface DeleteTaskDialogProps {
  task: Task | null
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
}

export const DeleteTaskDialog: React.FC<DeleteTaskDialogProps> = ({ task, isOpen, onCancel, onConfirm }) => {
  const isDark = useRNColorScheme() === 'dark'
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleConfirm = () => {
    if (!task || task.category === 'bills') {
      onConfirm();
      return;
    }
    
    // Set deleting state
    setIsDeleting(true);
    
    // Use setTimeout to avoid UI freezing during deletion
    setTimeout(() => {
      try {
        onConfirm();
      } finally {
        setIsDeleting(false);
      }
    }, 0);
  };
  
  const handleCancel = () => {
    if (isDeleting) return; // Prevent closing while deleting
    setIsDeleting(false);
    onCancel();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleCancel}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay animation="quick" opacity={0.5} />
        <AlertDialog.Content
          bordered
          elevate
          animation={['quick', { opacity: { overshootClamping: true } }]}
          enterStyle={{ opacity: 0, y: -10, scale: 0.9 }}
          exitStyle={{ opacity: 0, y: 10, scale: 0.95 }}
          maxWidth={400}
          margin="$4"
          padding="$4"
          bg={isDark ? '$gray3' : '$gray2'}
          borderRadius="$4"
        >
          <YStack gap="$3">
            <AlertDialog.Title>
              {task?.category === 'bills' ? 'Bills Notice' : 'Delete Task'}
            </AlertDialog.Title>
            <AlertDialog.Description>
              {task?.category === 'bills'
                ? 'To delete bills, please go to the Bills screen.'
                : `Are you sure you want to delete "${task?.name}"? This action cannot be undone.`}
            </AlertDialog.Description>
            <XStack gap="$3" justifyContent="space-between" py="$3">
              <AlertDialog.Cancel asChild>
                <Button 
                  fontFamily="$body" 
                  size={isWeb ? "$4" : "$2"}
                  disabled={isDeleting}
                  opacity={isDeleting ? 0.5 : 1}
                >
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  fontFamily="$body"
                  size={isWeb ? "$4" : "$2"}
                  backgroundColor={task?.category === 'bills' ? undefined : 'rgba(255,0,0,0.1)'}
                  color={task?.category === 'bills' ? undefined : '$red9'}
                  onPress={handleConfirm}
                  disabled={task?.category === 'bills' || isDeleting}
                >
                  {isDeleting ? (
                    <XStack gap="$2" alignItems="center">
                      <Spinner size="small" color={isDark ? "white" : "$red9"} />
                      <Text color={task?.category === 'bills' ? undefined : '$red9'}>Deleting...</Text>
                    </XStack>
                  ) : (
                    task?.category === 'bills' ? 'OK' : 'Delete'
                  )}
                </Button>
              </AlertDialog.Action>
            </XStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  )
}