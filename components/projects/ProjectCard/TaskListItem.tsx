import React from 'react'
import { XStack, Text, Button, isWeb } from 'tamagui'
import { TaskPriority } from '@/types'
import { getPriorityColor } from '@/utils'

interface TaskListItemProps {
  task: {
    id: string
    name: string
    priority: TaskPriority
    completed: boolean
  }
  isDark: boolean
  onToggleTaskCompleted?: (taskId: string, completed: boolean) => void
}

export const TaskListItem = ({ task, isDark, onToggleTaskCompleted }: TaskListItemProps) => {
  return (
    <XStack
      ai="center"
      px={isWeb? 16 : 4}
      py={isWeb? 6 : 3}
      br={10}
      bg={
        task.completed 
          ? isDark ? '#000' : '#777'
          : task.priority === 'high'
            ? isDark ? 'rgba(255, 0, 0, 0.05)' : 'rgba(255, 0, 0, 0.05)'
            : task.priority === 'medium'
              ? isDark ? 'rgba(255, 255, 0, 0.03)' : 'rgba(255, 255, 0, 0.05)'
              : isDark ? '#151515' : '#999'
      }
      style={{
        opacity: task.completed ? 0.6 : 1,
        position: 'relative',
        marginBottom: 0,
        width: isWeb ? '100%' : '48%',
        minWidth: isWeb ? 150 : 130,
        maxWidth: isWeb ? 280 : 300,
        flexBasis: isWeb ? '100%' : '48%',
        marginTop: isWeb ? 8 : 4,
      }}
    >
      <Button
        size="$1"
        circular
        bg={task.completed ? '$green8' : '$gray4'}
        onPress={() => onToggleTaskCompleted?.(task.id, !task.completed)}
        ai="center"
        jc="center"
        pressStyle={{
          bg: isDark ? '#222' : '#f5f5f5',
        }}
        style={{ width: 24, height: 24 }}
      >
        {task.completed ? '✓' : ''}
      </Button>
      <Text
        fontSize={13}
        color={isDark ? '#f6f6f6' : '#222'}
        fontFamily="$body"
        style={{ 
          flex: 1, 
          marginLeft: 6,
          alignSelf: 'flex-start',
          textDecorationLine: task.completed ? 'line-through' : 'none', 
          whiteSpace: 'normal' 
        }}
      >
        {task.name}
      </Text>
      <XStack ml={10} ai="center">
        <Text style={{ fontSize: 22, color: getPriorityColor(task.priority), lineHeight: 22 }}>•</Text>
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
  )
}
