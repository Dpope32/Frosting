import React from 'react'
import { XStack, Text, Button } from 'tamagui'
import { Check } from '@tamagui/lucide-icons'
import { Project, TaskPriority } from '@/types'
import { getPriorityColor} from '@/utils'
import { getTaskBackgroundColor } from './projectCardUtils'

interface TaskListProps {
  project: Project
  isDark: boolean
  isIpad: () => boolean
  isWeb: boolean
  onToggleTaskCompleted?: (taskId: string, completed: boolean) => void
}

export const TaskList = ({ project, isDark, isIpad, isWeb, onToggleTaskCompleted }: TaskListProps) => {
  if (!project.tasks || project.tasks.length === 0) {
    return null
  }

  return (
    <>
      <XStack w="100%" h={1} bg={isDark ? '#555555' : '#ccc'} opacity={0.18} my={isIpad() ? 10 : 8} />
      {project.tasks.length > 1 && (
        <Text fontSize={12} color={isDark ? 'rgba(255, 255, 255, 0.84)' : 'rgba(0, 0, 0, 0.5)'} ml={0} mb={6} fontFamily="$body">
          {project.tasks.filter(t => t.completed).length}/{project.tasks.length} completed
        </Text>
      )}
      <XStack gap={8} flexWrap="wrap" alignItems='center' alignContent="center">
        {project.tasks.map((task) => {
          return (
            <XStack
              key={task.id}
              ai="center"
              px={isIpad() ? 12 : 6}
              py={isIpad() ? 6 : 5}
              alignContent='center'
              alignItems='center'
              br={10}
              bg={getTaskBackgroundColor(task.priority as TaskPriority, task.completed, isDark)}
              borderWidth={1}
              borderColor={isDark ? '#333' : '#ddd'}
              style={{
                opacity: task.completed ? 0.6 : 1,
                marginBottom: 0,
                width: '100%',
                flexBasis: '100%',
              }}
            >
              <Button
                size="$1"
                circular
                bg={task.completed
                  ? (isDark ? 'transparent' : '#e0e0e0')
                  : (isDark ? '#222' : '#f5f5f5')}
                borderWidth={1}
                borderColor={isDark ? 'transparent' : '#bbb'}
                onPress={() => onToggleTaskCompleted && onToggleTaskCompleted(task.id, !task.completed)}
                mr={8}
                ai="center"
                jc="center"
                style={{ width: isIpad() ? 24 : 20, height: isIpad() ? 24 : 20 }}
              >
                {task.completed ? <Check size={isIpad() ? 16 : 14} color={isDark ? '#00ff00' : '#00ff00'} /> : ''}
              </Button>
              <Text
                fontSize={isIpad() ? 14 : 13}
                color={isDark ? '#f6f6f6' : '#222'}
                fontFamily="$body"
                style={{ flex: 1, textDecorationLine: task.completed ? 'line-through' : 'none', whiteSpace: 'normal' }}
              >
                {task.name}
              </Text>
              <XStack ml={isIpad() ? 10 : 6} ai="center">
                <Text style={{ fontSize: isIpad() ? 22 : 18, color: getPriorityColor(task.priority), lineHeight: isIpad() ? 22 : 20 }}>•</Text>
              </XStack>
              {task.completed && (
                <XStack
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg={isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.18)'}
                  zIndex={1}
                  br={10}
                  pointerEvents="none"
                />
              )}
            </XStack>
          );
        })}
      </XStack>
    </>
  )
}
