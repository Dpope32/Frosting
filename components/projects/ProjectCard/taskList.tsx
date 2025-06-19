import React from 'react'
import { XStack, Text, Button, YStack } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { Project, TaskPriority } from '@/types'
import { getPriorityColor} from '@/utils'
import { getTaskBackgroundColor } from './projectCardUtils'

interface TaskListProps {
  project: Project
  isDark: boolean
  isIpad: () => boolean
  isWeb: boolean
  onToggleTaskCompleted?: (taskId: string, completed: boolean) => void
  onOpenAddTaskModal?: (projectId: string) => void
  priorityColor?: string
}

export const TaskList = ({ project, isDark, isIpad, isWeb, onToggleTaskCompleted, onOpenAddTaskModal, priorityColor }: TaskListProps) => {
  if (!project.tasks || project.tasks.length === 0) {
    return null
  }

  return (
    <YStack gap="$2.5">
      {/* Task count with add button */}
      {project.tasks.length > 1 && (
        <XStack jc="space-between" ai="center">
          <Text 
            fontSize={isIpad() ? 13 : 12} 
            color={isDark ? 'rgba(170, 170, 170, 0.8)' : 'rgba(85, 85, 85, 0.8)'} 
            fontFamily="$body"
            px="$0.5"
          >
            {project.tasks.filter(t => t.completed).length} of {project.tasks.length} completed
          </Text>
          
          {onOpenAddTaskModal && (
            <Button
              size={isIpad() ? "$2.5" : "$2"}
              circular
              backgroundColor={isDark ? 'rgba(34, 34, 34, 0.8)' : 'rgba(245, 245, 245, 0.9)'}
              borderColor={isDark ? 'rgba(60, 60, 60, 0.6)' : 'rgba(200, 200, 200, 0.6)'}
              borderWidth={1}
              onPress={() => onOpenAddTaskModal(project.id)}
              pressStyle={{
                backgroundColor: isDark ? 'rgba(50, 50, 50, 1)' : 'rgba(230, 230, 230, 1)',
                borderColor: priorityColor || (isDark ? '#666' : '#ccc'),
                scale: 0.95,
              }}
              hoverStyle={{
                backgroundColor: isDark ? 'rgba(40, 40, 40, 1)' : 'rgba(240, 240, 240, 1)',
                borderColor: priorityColor || (isDark ? '#666' : '#ccc'),
              }}
            >
              <MaterialIcons 
                name="add" 
                size={isIpad() ? 18 : 16} 
                color={isDark ? '#d0d0d0' : '#555'} 
              />
            </Button>
          )}
        </XStack>
      )}
      
      {/* Tasks - Simple vertical stack */}
      <YStack gap="$1.5">
        {project.tasks.map((task) => (
          <XStack
            key={task.id}
            ai="center"
            px={isIpad() ? "$3" : "$2.5"}
            py={isIpad() ? "$1.5" : "$1.5"}
            br={isIpad() ? 14 : 12}
            bg={getTaskBackgroundColor(task.priority as TaskPriority, task.completed, isDark)}
            borderWidth={1}
            borderColor={isDark ? 'rgba(60, 60, 60, 0.6)' : 'rgba(200, 200, 200, 0.7)'}
            w="100%"
            minHeight={isIpad() ? 40 : 36}
            position="relative"
            pressStyle={{
              scale: 0.98,
              bg: isDark ? 'rgba(40, 40, 40, 0.8)' : 'rgba(240, 240, 240, 0.9)',
            }}
            style={{
              opacity: task.completed ? 0.7 : 1,
            }}
          >
            {/* Checkbox */}
            <Button
              size="$1"
              circular
              bg={task.completed
                ? (isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)')
                : (isDark ? 'rgba(60, 60, 60, 0.8)' : 'rgba(255, 255, 255, 0.9)')}
              borderWidth={task.completed ? 0 : 1.5}
              borderColor={isDark ? 'rgba(120, 120, 120, 0.5)' : 'rgba(160, 160, 160, 0.6)'}
              onPress={() => onToggleTaskCompleted && onToggleTaskCompleted(task.id, !task.completed)}
              mr="$2.5"
              pressStyle={{
                scale: 0.9,
                bg: task.completed 
                  ? (isDark ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.3)') 
                  : (isDark ? 'rgba(80, 80, 80, 1)' : 'rgba(240, 240, 240, 1)'),
              }}
              style={{ 
                width: isIpad() ? 24 : 20, 
                height: isIpad() ? 24 : 20,
                minWidth: isIpad() ? 24 : 20,
                minHeight: isIpad() ? 24 : 20,
              }}
            >
              {task.completed && (
                <MaterialIcons 
                  name="check" 
                  size={isIpad() ? 16 : 14} 
                  color={isDark ? '#22c55e' : '#16a34a'} 
                />
              )}
            </Button>
            
            {/* Task text */}
            <YStack flex={1}>
              <Text
                fontSize={isIpad() ? 15 : 13}
                color={isDark ? '#f6f6f6' : '#1f1f1f'}
                fontFamily="$body"
                fontWeight={task.completed ? "400" : "500"}
                style={{ 
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                  lineHeight: isIpad() ? 20 : 18,
                }}
              >
                {task.name}
              </Text>
            </YStack>
            
            {/* Priority dot */}
            <XStack ai="center" ml="$2" mr={isIpad() ? "$1.5" : "$0"}>
              <Text 
                style={{ 
                  fontSize: isIpad() ? 24 : 22, 
                  color: getPriorityColor(task.priority), 
                  opacity: task.completed ? 0.5 : 0.8,
                }}
              >
                •
              </Text>
            </XStack>
            
            {/* Completed overlay - subtle */}
            {task.completed && (
              <XStack
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg={isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)'}
                br={isIpad() ? 14 : 12}
                pointerEvents="none"
              />
            )}
          </XStack>
        ))}
      </YStack>
    </YStack>
  )
}