import React from 'react';
import { YStack, XStack, Text, Button } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import type { TaskPriority } from '@/types/task';
import { getPriorityColor } from '@/utils/styleUtils';
import { isIpad } from '@/utils/deviceUtils';
import { getTaskBackgroundColor } from '@/components/projects/ProjectCard/projectCardUtils';

interface Task {
  id: string;
  name: string;
  priority: TaskPriority;
  completed: boolean;
  [key: string]: any; // allows for other task properties
}

interface TasksInModalProps {
  tasks: Task[];
  isDark: boolean;
  onTaskDelete: (taskId: string) => void;
}

export function TasksInModal({ tasks, isDark, onTaskDelete }: TasksInModalProps) {
  if (!tasks || tasks.length === 0) {
    return null;
  }

  return (
    <YStack gap="$2" pb="$4" mx={0} mr={0}>
      <XStack gap={0} flexWrap="wrap" alignItems='center' alignContent="center">
        {tasks.map((task) => (
          <XStack
            key={task.id}
            ai="center"
            px={isIpad() ? 12 : 12}
            py={isIpad() ? 10 : 8}
            alignContent='center'
            alignItems='center'
            br={10}
            bg={getTaskBackgroundColor(task.priority, task.completed, isDark)}
            borderWidth={1}
            borderColor={isDark ? '#333' : '#ddd'}
            style={{
              opacity: task.completed ? 0.6 : 1,
              marginBottom: 4,
              width: '100%',
              flexBasis: '100%',
            }}
          >
            <Text
              fontSize={isIpad() ? 15 : 14}
              color={isDark ? '#f6f6f6' : '#222'}
              fontFamily="$body"
              style={{ 
                flex: 1,
                textDecorationLine: task.completed ? 'line-through' : 'none',
                whiteSpace: 'normal' 
              }}
            >
              {task.name}
            </Text>
            <XStack ai="center" gap="$2">
              <Text style={{ fontSize: isIpad() ? 22 : 18, color: getPriorityColor(task.priority), lineHeight: isIpad() ? 22 : 20 }}>•</Text>
              <Button
                size="$1"
                circular
                backgroundColor={isDark ? 'rgba(255, 255, 255, 0)' : 'rgba(0, 0, 0, 0)'}
                onPress={() => onTaskDelete(task.id)}
                mr={2}
                ai="center"
                jc="center"
                style={{ width: isIpad() ? 26 : 22, height: isIpad() ? 26 : 22 }}
                pressStyle={{ opacity: 0.7 }}
              >
                <MaterialIcons name="close" size={isIpad() ? 16 : 14} color={isDark ? 'rgb(255, 0, 0)' : 'rgb(255, 6, 6)'} />
              </Button>
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
        ))}
      </XStack>
    </YStack>
  );
}

export default TasksInModal;
