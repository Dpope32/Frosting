import React, { useEffect } from 'react'
import { Pressable, Platform, useColorScheme, Animated } from 'react-native'
import { isWeb, Stack, Text, XStack, YStack } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { TaskCard } from '@/components/home/TaskCard'
import { Task } from '@/types/task'
import { RecommendationChip } from '@/constants/recommendations/TaskRecommendations'
import { useRecommendationStore } from '@/store/RecommendationStore'
import { YearCompleteSection } from '@/components/home/YearCompleteSection'
import { format } from 'date-fns'
import { isIpad } from '@/utils/deviceUtils'
// Enable debugging
const DEBUG = false;

function log(...args: any[]) {
  if (DEBUG) {
    console.log('[TaskSection]', ...args);
  }
}

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
  const openRecommendationModal = useRecommendationStore(s => s.openModal)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const todayLocalStr = format(new Date(), 'yyyy-MM-dd')
  
  useEffect(() => {
    if (DEBUG) {
      log(`todaysTasks updated - count: ${todaysTasks.length}`);
      
      if (todaysTasks.length > 0) {
        log('First 3 tasks:');
        todaysTasks.slice(0, 3).forEach(task => {
          const isCompletedToday = task.completionHistory[todayLocalStr] || false;
          log(`- ${task.name} (${task.id}): ${task.recurrencePattern}, completed: ${isCompletedToday}`);
        });
        const completedTasks = todaysTasks.filter(task => task.completionHistory[todayLocalStr]);
        log(`Completed tasks: ${completedTasks.length}`);
        completedTasks.forEach(task => {
          log(`- ${task.name} (${task.id}): ${task.recurrencePattern}`);
        });
      }
    }
  }, [todaysTasks, todayLocalStr]);

  const handleToggleTask = (id: string) => {
    if (DEBUG) {
      const task = todaysTasks.find(t => t.id === id);
      if (task) {
        log(`Toggling task: ${task.name} (${id})`);
        log(`Current completion status: ${task.completionHistory[todayLocalStr] || false}`);
      } else {
        log(`Task ${id} not found in todaysTasks!`);
      }
    }
    toggleTaskCompletion(id);
  };

  return (
    <Stack
      br={16}
      px="$1"
      py="$2"
      paddingBottom="$2"
      >
      <XStack
        alignItems="center"
        width="100%" 
        marginBottom="$2" 
        gap={isWeb ? "$2" : "$0"}
        px={Platform.OS === 'web' ? "$3" : "$0"}
        justifyContent={isWeb ? "flex-start" : isIpad() ? "space-between" : "space-between" }
      >
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            }
            onTaskListPress()
          }}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            width: 30,
            height: 30,
            borderRadius: 15,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: isWeb ? 20 : 0,
          })}
        >
          <Ionicons
            name="reorder-three-outline"
            size={isWeb ? 22 : 21}
            color="#dbd0c6"
            style={{
              textShadowColor: 'rgba(219, 208, 198, 0.15)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 4
            }}
          />
        </Pressable>
        
        <Text
          fontFamily="$body"
          color={isDark ? "#dbd0c6" : "#dbd0c6"}
          fontSize={20}
          fontWeight="bold"
          marginRight={isWeb ? 20 : 0}
        >
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            }
            onAddTaskPress()
          }}
          style={({ pressed }) => ({
            width: 30,
            height: 30,
            borderRadius: 15,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }]
          })}
        >
          <Ionicons name="add" size={isWeb ? 22 : 21} color="#dbd0c6" />
        </Pressable>
      </XStack>
      
      <Stack
        flex={1}
        position="relative"
        justifyContent={Platform.OS === 'web' ? 'flex-start' : isIpad() ? 'flex-start' : 'center'}
        px={Platform.OS === 'web' ? "$3" : "$1"}
        py={Platform.OS === 'web' ? "$2" : "$1"}
      >
        {Platform.OS === 'web' ? (
          todaysTasks.length === 0 ? (
            <Stack 
              p="$2"
              px="$2"
              mt="$3"
              gap="$4"
              br={12}
            >
              <YStack width="100%">
                <XStack
                  justifyContent="space-between"
                  gap="$2"
                  px="$2"
                  flexWrap="wrap"
                  width="100%"
                  flexDirection="row"
                >
                  <RecommendationChip category="Cleaning" onPress={() => openRecommendationModal('Cleaning')} isDark={true}/>
                  <RecommendationChip category="Wealth" onPress={() => openRecommendationModal('Wealth')} isDark={true}/>
                  <RecommendationChip category="Gym" onPress={() => openRecommendationModal('Gym')} isDark={true}/>
                  <RecommendationChip category="Self-Care" onPress={() => openRecommendationModal('Self-Care')} isDark={true}/>
                </XStack>
              </YStack>
            </Stack>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 10,
              alignItems: 'flex-start',
              justifyItems: 'flex-start',
              width: '95%',
              maxHeight: todaysTasks.length > 4 ? '200px' : 'auto',
              overflowY: todaysTasks.length > 4 ? 'auto' : 'visible',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(219, 208, 198, 0.3) rgba(0, 0, 0, 0.1)',
              padding: '10px'
            }}>
              {todaysTasks.map((task: Task) => {
                const isCompleted = task.completionHistory[todayLocalStr] || false;
                
                if (DEBUG && (task.name.includes("Test") || task.name.includes("Pay"))) {
                  log(`Rendering task: ${task.name} (${task.id})`);
                  log(`Completed status: ${isCompleted}`);
                  log(`CompletionHistory keys: ${Object.keys(task.completionHistory)}`);
                }
                
                return (
                  <div key={task.id} style={{ 
                    marginBottom: 0,
                    width: '100%',
                    transition: 'transform 0.2s ease',
                    transform: 'translateY(0)',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    <TaskCard
                      title={task.name}
                      time={task.time}
                      category={task.category}
                      priority={task.priority}
                      status={task.recurrencePattern === 'one-time' ? 'One-time' : task.recurrencePattern.charAt(0).toUpperCase() + task.recurrencePattern.slice(1)}
                      checked={isCompleted}
                      onCheck={() => handleToggleTask(task.id)}
                      onDelete={() => deleteTask(task.id)}
                    />
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <>
            {todaysTasks.length === 0 ? (
              <Stack 
                p="$2"
                px="$1"
                mt={0}
                gap="$2"
                br={12}
              >
                <YStack width="100%">
                  <XStack
                    justifyContent="space-evenly"
                    gap="$2"
                    px="$2"
                    flexWrap="wrap"
                    width="100%"
                    flexDirection="row"
                  >
                    <RecommendationChip category="Cleaning" onPress={() => openRecommendationModal('Cleaning')} isDark={true}/>
                    <RecommendationChip category="Wealth" onPress={() => openRecommendationModal('Wealth')} isDark={true}/>
                    <RecommendationChip category="Gym" onPress={() => openRecommendationModal('Gym')} isDark={true}/>
                    <RecommendationChip category="Self-Care" onPress={() => openRecommendationModal('Self-Care')} isDark={true}/>
                  </XStack>
                </YStack>
              </Stack>
            ) : (
              <XStack
                flexWrap="wrap"
                gap="$1.5"
                width="100%"
                paddingHorizontal="$1"
                paddingVertical="$1"
                justifyContent={isIpad() ? "space-between" : "flex-start"}
              >
                {todaysTasks.map((task: Task) => {
                  const isCompleted = task.completionHistory[todayLocalStr] || false;
                  return (
                    <Stack 
                      key={task.id} 
                      width={isIpad() ? "48%" : "100%"}
                      marginBottom="$1.5"
                      animation="quick"
                    >
                      <TaskCard
                        title={task.name}
                        time={task.time}
                        category={task.category}
                        priority={task.priority}
                        status={task.recurrencePattern === 'one-time' ? 'One-time' : task.recurrencePattern.charAt(0).toUpperCase() + task.recurrencePattern.slice(1)}
                        checked={isCompleted}
                        onCheck={() => handleToggleTask(task.id)}
                        onDelete={() => deleteTask(task.id)}
                      />
                    </Stack>
                  );
                })}
              </XStack>
            )}
            <YearCompleteSection />
          </>
        )}
      </Stack>
    </Stack>
  )
}
