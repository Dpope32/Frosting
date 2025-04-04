import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { useProjectStore } from '@/store/ToDo';
import { Task, WeekDay } from '@/types/task';
import { useRecommendationStore } from '@/store/RecommendationStore';
import { Pressable, Platform, useColorScheme} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryColor } from '../../utils/styleUtils';
import { RecommendationChip } from '@/constants/recommendations/TaskRecommendations';
import { BaseCardWithRecommendationsModal } from './BaseCardWithRecommendationsModal'; 

interface TaskListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskListModal({ open, onOpenChange }: TaskListModalProps) {
  const tasks = useProjectStore(s => s.tasks);
  const deleteTask = useProjectStore(s => s.deleteTask);
  const openRecommendationModal = useRecommendationStore(s => s.openModal);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';
  const tasksByDay = React.useMemo(() => {
    const days: Record<WeekDay, Task[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    }
    Object.values(tasks).forEach(task => {
      if (task.recurrencePattern === 'one-time') {
        const scheduledDate = task.scheduledDate ? new Date(task.scheduledDate) : null
        if (scheduledDate) {
          const dayIndex = scheduledDate.getDay()
          const dayArray = Object.values(days)[dayIndex === 0 ? 6 : dayIndex - 1]
          dayArray.push(task)
        }
      } else {
        task.schedule.forEach(day => {
          days[day].push(task)
        })
      }
    })
    Object.keys(days).forEach(day => {
      days[day as WeekDay].sort((a, b) => {
        if (a.time && b.time) return a.time.localeCompare(b.time)
        if (a.time) return -1
        if (b.time) return 1
        return 0
      })
    })
    return days
  }, [tasks])

  const formatDayName = (day: string) => day.charAt(0).toUpperCase()

  const formatDayName2 = (day: string) =>
    day.charAt(0).toUpperCase() + day.slice(1)

  const getScheduleText = (task: Task) => {
    if (task.recurrencePattern === 'one-time') {
      return task.scheduledDate
        ? new Date(task.scheduledDate).toLocaleDateString()
        : 'One-time'
    }
    return task.schedule.map(formatDayName).join(', ')
  };

  const taskRecommendations = (
    <>
      <RecommendationChip category="Cleaning" onPress={() => { onOpenChange(false); openRecommendationModal('Cleaning'); }} isDark={isDark} />
      <RecommendationChip category="Financial" onPress={() => { onOpenChange(false); openRecommendationModal('Financial'); }} isDark={isDark} />
      <RecommendationChip category="Gym" onPress={() => { onOpenChange(false); openRecommendationModal('Gym'); }} isDark={isDark} />
      <RecommendationChip category="Self-Care" onPress={() => { onOpenChange(false); openRecommendationModal('Self-Care'); }} isDark={isDark} />
    </>
  );

  return (
    <BaseCardWithRecommendationsModal
      open={open}
      onOpenChange={onOpenChange} 
      title="All Tasks"
      snapPoints={isWeb ? [95] : [80]}
      showCloseButton={true}
      hideHandle={true}
      recommendations={taskRecommendations} 
    >
      <>
        {Object.entries(tasksByDay).map(([day, dayTasks]) =>
          dayTasks.length > 0 ? (
            <YStack key={day} marginBottom="$2" mt="$2"> 
              <Text color={isDark ? "$gray12" : "$gray11"} fontSize={15} fontWeight="600" fontFamily="$body" marginBottom="$2"> {formatDayName2(day)} </Text>
              {dayTasks.map((task: Task) => (
                <XStack
                  key={task.id}
                  backgroundColor={isDark ? "$gray2" : "$gray3"}
                  br={8}
                  padding={isWeb ? "$3" : "$3"}
                  alignItems="center"
                  justifyContent="space-between"
                  marginBottom="$2"
                >
                  <YStack flex={1}>
                    <Text
                      fontFamily="$body"
                      color={isDark ? "$gray12" : "$gray11"}
                      fontSize={15}
                      fontWeight="500"
                    >
                      {task.name}
                    </Text>
                    <XStack gap="$1.5" mt="$1" flexWrap="nowrap">
                      <Text
                        fontFamily="$body"
                        color={getCategoryColor(task.category)}
                        fontSize={12}
                        opacity={0.8}
                      >
                        {task.category}
                      </Text>
                      {task.time && (
                        <Text fontFamily="$body" color={isDark ? "$gray11" : "$gray10"} fontSize={12} opacity={0.6}>{task.time}</Text>)}
                        <Text fontFamily="$body" color={isDark ? "$gray11" : "$gray10"} fontSize={12} opacity={0.6} >{getScheduleText(task)} </Text>
                    </XStack>
                  </YStack>
                  <Pressable onPress={() => deleteTask(task.id)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, padding: 4})}>
                    <Ionicons name="close" size={18} color="#ff4444" style={{ fontWeight: 200 }} mt={Platform.OS === 'web' ? 0 : -16}/>
                  </Pressable>
                </XStack>
              ))}
            </YStack>
          ) : null
        )}
        {Object.values(tasksByDay).every(dayTasks => dayTasks.length === 0) && (
          <YStack backgroundColor={isDark ? "$gray2" : "$gray3"} br={8} padding="$4" alignItems="center" mt="$2">
            <Text fontFamily="$body" color={isDark ? "$gray12" : "$gray11"} opacity={0.7}> No tasks found</Text>
          </YStack>
        )}
      </>
    </BaseCardWithRecommendationsModal>
  )
}
