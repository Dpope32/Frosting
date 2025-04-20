// components/tasklist/DeleteTaskDialog.tsx
import React from 'react'
import { AlertDialog, Button, YStack, XStack, isWeb } from 'tamagui'
import { Task } from '@/types/task'
import { useColorScheme } from '@/hooks/useColorScheme'

interface DeleteTaskDialogProps {
  task: Task | null
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
}

export const DeleteTaskDialog: React.FC<DeleteTaskDialogProps> = ({ task, isOpen, onCancel, onConfirm }) => {
  const isDark = useColorScheme() === 'dark'

  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
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
                <Button fontFamily="$body" size={isWeb ? "$4" : "$2"}>Cancel</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  fontFamily="$body"
                  size={isWeb ? "$4" : "$2"}
                  backgroundColor={task?.category === 'bills' ? undefined : 'rgba(255,0,0,0.1)'}
                  color={task?.category === 'bills' ? undefined : '$red9'}
                  onPress={onConfirm}
                  disabled={task?.category === 'bills'}
                >
                  {task?.category === 'bills' ? 'OK' : 'Delete'}
                </Button>
              </AlertDialog.Action>
            </XStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  )
}