import React from 'react'
import { Sheet, YStack, XStack, Text, ScrollView } from 'tamagui'
import { useProjectStore, Task, WeekDay } from '@/store/ToDo'
import { useThunderStore } from '@/store/ThunderStore'
import { useRecommendationStore } from '@/store/RecommendationStore'
import { Pressable, Platform, useColorScheme } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getCategoryColor } from '../utils'
import { RecommendationChip } from '@/utils/TaskRecommendations'

interface TaskListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskListModal({ open, onOpenChange }: TaskListModalProps) {
  const tasks = useProjectStore(s => s.tasks)
  const deleteTask = useProjectStore(s => s.deleteTask)
  const syncGameTasks = useThunderStore(s => s.syncGameTasks)
  const openRecommendationModal = useRecommendationStore(s => s.openModal)

  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'

  // Group tasks by day
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
          // Sunday is index 0, so we shift it to the end
          const dayArray = Object.values(days)[dayIndex === 0 ? 6 : dayIndex - 1]
          dayArray.push(task)
        }
      } else {
        task.schedule.forEach(day => {
          days[day].push(task)
        })
      }
    })
    // Sort tasks by time
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

  const formatDayName = (day: string) =>
    day.charAt(0).toUpperCase() + day.slice(1)

  const getScheduleText = (task: Task) => {
    if (task.recurrencePattern === 'one-time') {
      return task.scheduledDate
        ? new Date(task.scheduledDate).toLocaleDateString()
        : 'One-time'
    }
    return task.schedule.map(formatDayName).join(', ')
  }

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[80]}
      dismissOnSnapToBottom
      dismissOnOverlayPress
      animation="quick"
      zIndex={100000}
    >
      <Sheet.Overlay 
        animation="quick"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Frame
        backgroundColor={isDark ? "$gray1" : "white"}
        padding="$4"
        gap={Platform.OS === 'web' ? '$4' : '$5'}
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
        {...(isWeb ? {
          style: {
            overflowY: 'auto',
            maxHeight: '90vh',
            maxWidth: 800,
            margin: '0 auto',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
          }
        } : {})}
      >
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          <YStack gap={Platform.OS === 'web' ? '$4' : '$2'}>
            <XStack justifyContent="space-between" alignItems="center">
              <Text
                fontSize={20}
                fontWeight="700"
                fontFamily="$body"
                color={isDark ? "$gray12" : "$gray11"}
              >
                All Tasks
              </Text>
              <Pressable
                onPress={() => {
                  syncGameTasks()
                  onOpenChange(false)
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.1)',
                  padding: 8,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4
                })}
              >
                <Ionicons name="sync" size={16} color={isDark ? "#fff" : "#000"} />
                <Text fontFamily="$body" fontSize={14} color={isDark ? "#fff" : "#000"}> Sync Games </Text>
              </Pressable>
            </XStack>
            
            <XStack justifyContent="space-between" paddingBottom="$4" marginTop="$1">
              <RecommendationChip 
                category="Cleaning"  
                onPress={() => {
                  onOpenChange(false) 
                  // Use the global store to open the modal
                  openRecommendationModal('Cleaning')
                }}  
                isDark={isDark}
              />
              <RecommendationChip 
                category="Financial" 
                onPress={() => {
                  onOpenChange(false)
                  openRecommendationModal('Financial')
                }}  
                isDark={isDark}
              />
              <RecommendationChip 
                category="Gym" 
                onPress={() => {
                  onOpenChange(false)
                  openRecommendationModal('Gym')
                }} 
                isDark={isDark}
              />
              <RecommendationChip 
                category="Self-Care" 
                onPress={() => {
                  onOpenChange(false)
                  openRecommendationModal('Self-Care')
                }} 
                isDark={isDark}
              />
            </XStack>
          </YStack>
          {Object.entries(tasksByDay).map(([day, dayTasks]) =>
            dayTasks.length > 0 ? (
              <YStack key={day} marginBottom="$4">
                <Text
                  color={isDark ? "$gray12" : "$gray11"}
                  fontSize={16}
                  fontWeight="600"
                  fontFamily="$body"
                  marginBottom="$2"
                >
                  {formatDayName(day)}
                </Text>
                {dayTasks.map((task: Task) => (
                  <XStack
                    key={task.id}
                    backgroundColor={isDark ? "$gray2" : "$gray3"}
                    borderRadius={8}
                    padding="$3"
                    alignItems="center"
                    justifyContent="space-between"
                    marginBottom="$2"
                  >
                    <YStack flex={1}>
                      <Text
                        fontFamily="$body"
                        color={isDark ? "$gray12" : "$gray11"}
                        fontSize={16}
                        fontWeight="500"
                      >
                        {task.name}
                      </Text>
                      <XStack gap="$2" marginTop="$1" flexWrap="wrap">
                        <Text
                          fontFamily="$body"
                          color={getCategoryColor(task.category)}
                          fontSize={12}
                          opacity={0.8}
                        >
                          {task.category}
                        </Text>
                        {task.time && (
                          <Text
                            fontFamily="$body"
                            color={isDark ? "$gray11" : "$gray10"}
                            fontSize={12}
                            opacity={0.6}
                          >
                            {task.time}
                          </Text>
                        )}
                        <Text
                          fontFamily="$body"
                          color={isDark ? "$gray11" : "$gray10"}
                          fontSize={12}
                          opacity={0.6}
                        >
                          {getScheduleText(task)}
                        </Text>
                      </XStack>
                    </YStack>
                    <Pressable
                      onPress={() => deleteTask(task.id)}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                        padding: 8
                      })}
                    >
                      <Ionicons
                        name="close"
                        size={24}
                        color="#ff4444"
                        style={{ fontWeight: 200 }}
                      />
                    </Pressable>
                  </XStack>
                ))}
              </YStack>
            ) : null
          )}

          {Object.values(tasksByDay).every(dayTasks => dayTasks.length === 0) && (
            <YStack
              backgroundColor={isDark ? "$gray2" : "$gray3"}
              borderRadius={8}
              padding="$4"
              alignItems="center"
            >
              <Text
                fontFamily="$body"
                color={isDark ? "$gray12" : "$gray11"}
                opacity={0.7}
              >
                No tasks found
              </Text>
            </YStack>
          )}
        </ScrollView>
      </Sheet.Frame>
      
    </Sheet>
  )
}
