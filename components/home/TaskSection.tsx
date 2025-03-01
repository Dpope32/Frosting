import React from 'react'
import { Pressable, Platform } from 'react-native'
import { isWeb, Stack, Text, XStack } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import { TaskCard } from '@/components/TaskCard'
import { getCategoryColor } from '@/components/utils'
import { Task } from '@/store/ToDo'

interface TaskSectionProps {
  todaysTasks: Task[]
  toggleTaskCompletion: (id: string) => void
  deleteTask: (id: string) => void
  onAddTaskPress: () => void
  onTaskListPress: () => void
}

export const TaskSection = ({
  todaysTasks,
  toggleTaskCompletion,
  deleteTask,
  onAddTaskPress,
  onTaskListPress
}: TaskSectionProps) => {
  return (
    <Stack
      backgroundColor="rgba(0, 0, 0, 0.8)"
      borderRadius={16}
      padding="$4"
      paddingBottom="$12"
      borderWidth={2.5}
      borderColor="rgba(255, 255, 255, 0.15)"
      minHeight={Platform.OS === 'web' ? (todaysTasks.length < 5 ? 'auto' : 300) : 'auto'}
      style={Platform.OS === 'web' ? {
        boxShadow: '0px 0px 10px rgba(255, 255, 255, 0.05)'
      } : {
        shadowColor: "rgba(255, 255, 255, 0.05)",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10
      }}
    >
      <XStack alignItems={Platform.OS === 'web'  ? 'flex-start' : 'center'} width="100%" marginBottom="$5" paddingLeft="$4">
        <Text 
          fontFamily="$body"
          color="#dbd0c6" 
          fontSize={20} 
          fontWeight="bold"
          style={{
            textShadowColor: 'rgba(219, 208, 198, 0.15)',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 4
          }}
        >
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
      </XStack>
      <Stack 
        gap="$2" 
        paddingHorizontal={16} 
        flex={1} 
        position="relative"
        justifyContent={Platform.OS === 'web' && todaysTasks.length === 0 ? 'flex-start' : 'center'}
      >
        {todaysTasks.length === 0 ? (
          <XStack 
            bg="rgba(0, 0, 0, 0.85)"
            p={Platform.OS === 'web' ? '$8' : '$6'} 
            paddingHorizontal={Platform.OS === 'web' ? '$12' : '$6'}
            borderRadius="$4" 
            ai="center" 
            jc="center"
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.15)"
            marginTop={Platform.OS === 'web' ? '$6' : 0}
            style={Platform.OS === 'web' ? {
              boxShadow: '0px 0px 8px rgba(255, 255, 255, 0.05)',
              maxWidth: '800px',
              alignSelf: 'flex-start',
              width: '100%'
            } : {}}
          >
            <Text 
              fontFamily="$body"
              color="#dbd0c6" 
              fontSize={16} 
              fontWeight="500"
              textAlign="center"
              style={{
                textShadowColor: 'rgba(0, 0, 0, 0.5)',
                textShadowOffset: { width: 0.5, height: 0.5 },
                textShadowRadius: 1,
                lineHeight: 24,
                ...(Platform.OS === 'web' ? {
                  whiteSpace: 'nowrap'
                } : {})
              }}
            >
              Add repeating or one-time tasks for personal, work, or anything else to get started
            </Text>
          </XStack>
        ) : (
          <Stack 
            gap="$0"
            style={Platform.OS === 'web' ? {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '12px'
            } : {
              maxHeight: 400,
              overflow: 'auto',
              width: '100%'
            }}
          >
            {todaysTasks.map((task: Task) => (
              <Stack key={task.id} style={Platform.OS === 'web' ? {} : { marginBottom: 8, width: '100%' }}>
                <TaskCard
                  title={task.name}
                  time={task.time}
                  category={task.category}
                  priority={task.priority}
                  status={task.recurrencePattern === 'one-time' ? 'One-time' : task.recurrencePattern.charAt(0).toUpperCase() + task.recurrencePattern.slice(1)}
                  categoryColor={getCategoryColor(task.category)}
                  checked={task.completionHistory[new Date().toISOString().split('T')[0]] || false}
                  onCheck={() => toggleTaskCompletion(task.id)}
                  onDelete={() => deleteTask(task.id)}
                />
              </Stack>
            ))}
          </Stack>
        )}
        <Pressable
          onPress={onTaskListPress}
          style={Platform.OS === 'web' ? {
            position: 'absolute',
            top: -57,
            right: -10,
            width: 34,
            height: 34,
            borderRadius: 17,
            justifyContent: 'center',
            alignItems: 'center',
          } : {
            position: 'absolute',
            top: -52,
            right: -10,
            width: 34,
            height: 34,
            borderRadius: 17,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons 
            name="list-circle-outline" 
            size={24} 
            color="#dbd0c6"
            style={{
              textShadowColor: 'rgba(219, 208, 198, 0.15)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 4
            }}
          />
        </Pressable>
        <Pressable
          onPress={onAddTaskPress}
          style={Platform.OS === 'web' ? {
            position: 'absolute',
            bottom: -75,
            right: -12,
            width: 34,
            height: 34,
            borderRadius: 17,
            justifyContent: 'center',
            alignItems: 'center',
          } : {
            position: 'absolute',
            bottom: -75,
            right: -12,
            width: 34,
            height: 34,
            borderRadius: 17,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons 
            name="add" 
            size={isWeb ? 32 : 24} 
            color="#dbd0c6"
          />
        </Pressable>
      </Stack>
    </Stack>
  )
}
