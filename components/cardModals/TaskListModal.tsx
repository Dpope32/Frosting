import React from 'react'
import { BaseCardModal } from './BaseCardModal'
import { Stack, Text, XStack } from 'tamagui'
import { useProjectStore, Task, WeekDay } from '@/store/ToDo'
import { Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getCategoryColor } from '../utils'

interface TaskListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskListModal({ open, onOpenChange }: TaskListModalProps) {
  const tasks = useProjectStore(s => s.tasks)
  const deleteTask = useProjectStore(s => s.deleteTask)

  // Group tasks by days
  const tasksByDay = React.useMemo(() => {
    const days: Record<WeekDay, Task[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    };

    Object.values(tasks).forEach(task => {
      if (task.isOneTime) {
        // For one-time tasks, add to all selected days
        task.schedule.forEach(day => {
          days[day].push(task);
        });
      } else {
        // For recurring tasks, add to each scheduled day
        task.schedule.forEach(day => {
          days[day].push(task);
        });
      }
    });

    // Sort tasks within each day by time
    Object.keys(days).forEach(day => {
      days[day as WeekDay].sort((a, b) => {
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time) return -1;
        if (b.time) return 1;
        return 0;
      });
    });

    return days;
  }, [tasks]);

  // Format day name
  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Get schedule display text
  const getScheduleText = (task: Task) => {
    if (task.isOneTime) {
      return 'One-time';
    }
    return task.schedule.map(formatDayName).join(', ');
  };

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title="All Tasks"
    >
      <Stack gap="$4">
        {Object.entries(tasksByDay).map(([day, dayTasks]) => 
          dayTasks.length > 0 ? (
            <Stack key={day} gap="$2">
              <Text
                color="#dbd0c6"
                fontSize={16}
                fontWeight="600"
                marginLeft="$2"
                marginTop="$2"
              >
                {formatDayName(day)}
              </Text>
              {dayTasks.map((task: Task) => (
            <XStack
              key={task.id}
              backgroundColor="rgba(0, 0, 0, 0.3)"
              borderRadius={8}
              padding="$3"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack flex={1}>
                <Text color="white" fontSize={16} fontWeight="500">
                  {task.name}
                </Text>
                <XStack gap="$2" marginTop="$1" flexWrap="wrap">
                  <Text
                    color={getCategoryColor(task.category)}
                    fontSize={12}
                    opacity={0.8}
                  >
                    {task.category}
                  </Text>
                  {task.time && (
                    <Text color="white" fontSize={12} opacity={0.6}>
                      {task.time}
                    </Text>
                  )}
                  <Text color="#dbd0c6" fontSize={12} opacity={0.6}>
                    {getScheduleText(task)}
                  </Text>
                </XStack>
              </Stack>
              <Pressable
                onPress={() => deleteTask(task.id)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  padding: 8,
                })}
              >
                <Ionicons name="close" size={24} color="#ff4444" style={{ fontWeight:200}} />
              </Pressable>
            </XStack>
              ))}
            </Stack>
          ) : null
        )}
        {Object.values(tasksByDay).every(tasks => tasks.length === 0) && (
          <Stack
            backgroundColor="rgba(0, 0, 0, 0.3)"
            borderRadius={8}
            padding="$4"
            alignItems="center"
          >
            <Text color="white" opacity={0.7}>
              No tasks found
            </Text>
          </Stack>
        )}
      </Stack>
    </BaseCardModal>
  )
}
