import React, { useState, useRef, useMemo } from 'react'
import { Pressable, Platform as RNPlatform, useColorScheme } from 'react-native'
import { isWeb, Stack, Text, XStack, YStack } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { TaskCard } from '@/components/home/TaskCard'
import { Button } from 'tamagui' 
import { Task } from '@/types/task'
import { RecommendationChipHome } from '@/constants'
import { addDevTasks } from '@/services/devServices'
import { useRecommendationStore, useUserStore } from '@/store'
import { YearCompleteSection } from '@/components/home/YearCompleteSection'
import { format } from 'date-fns'
import { isIpad } from '@/utils'
import { GreetingSection } from '@/components/home/GreetingSection'
import { EasterEgg } from '../shared/EasterEgg'
import { ProjectSection } from '@/components/home/ProjectSection'

const DEBUG = false;

function log(...args: any[]) {
  if (DEBUG) { console.log('[TaskSection]', ...args)}
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
  onTaskListPress
}: TaskSectionProps) => {
  const openRecommendationModal = useRecommendationStore(s => s.openModal)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const todayLocalStr = format(new Date(), 'yyyy-MM-dd')
  const username = useUserStore(s => s.preferences.username);
  const [easterEggVisible, setEasterEggVisible] = useState(false);
  const easterEggTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Filter out duplicate task titles, but prioritize completed tasks or keep track of original IDs
  const uniqueTasks = useMemo(() => {
    const taskGroups: Record<string, Task[]> = {};
    
    // Group tasks by name
    todaysTasks.forEach(task => {
      if (!taskGroups[task.name]) {
        taskGroups[task.name] = [];
      }
      taskGroups[task.name].push(task);
    });
    
    // For each group, select the best task to display
    return Object.values(taskGroups).map(tasks => {
      if (tasks.length === 1) return tasks[0];
      
      // If there are completed tasks, prioritize the first completed one
      const completedTask = tasks.find(task => task.completionHistory[todayLocalStr]);
      if (completedTask) return completedTask;
      
      // Otherwise return the first task
      return tasks[0];
    });
  }, [todaysTasks, todayLocalStr]);
  
  // useEffect(() => {
 //   if (DEBUG) {
 //     log(`todaysTasks updated - count: ${todaysTasks.length}`);
      
 //     if (todaysTasks.length > 0) {
 //       log('First 3 tasks:');
 //       todaysTasks.slice(0, 3).forEach(task => {
 //         const isCompletedToday = task.completionHistory[todayLocalStr] || false;
 //         log(`- ${task.name} (${task.id}): ${task.recurrencePattern}, completed: ${isCompletedToday}`);
 //       });
 //       const completedTasks = todaysTasks.filter(task => task.completionHistory[todayLocalStr]);
 //       log(`Completed tasks: ${completedTasks.length}`);
 //       completedTasks.forEach(task => {
 //         log(`- ${task.name} (${task.id}): ${task.recurrencePattern}`);
 //       });
 //     }
 //   }
//  }, [todaysTasks, todayLocalStr]);

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
    <Stack br={16} px="$0" py={isIpad() ? "$3" : "$2"} paddingBottom={isIpad() ? "$3" : "$2"}>
      <XStack
        alignItems="center"
        width="100%" 
        marginBottom="$2" 
        gap={isWeb ? "$2" : "$0"}
        px={RNPlatform.OS === 'web' ? "$3" : "$0"}
        justifyContent={RNPlatform.OS === 'web' ? "flex-start" : isIpad() ? "space-between" : "space-between" }
      >
        <Pressable
          onPress={() => {
            if (RNPlatform.OS !== 'web') {
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
            marginLeft: isWeb ? 0 : 2
          })}
        >
          <Ionicons
            name="reorder-three-outline"
            size={isWeb ? 22 : 21}
            color="#dbd0c6"
            style={{
              textShadowColor: 'rgba(219, 208, 198, 0.15)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 4,
              marginRight: isIpad() ? -20 : -16
            }}
          />
        </Pressable>
        
        <XStack flex={1} justifyContent={RNPlatform.OS === 'web' ? "flex-start" : "center"}>
          {isIpad() ? (
            <GreetingSection username={username} />
          ) : (
            <Text
              fontFamily="$body"
              color={isDark ? "#dbd0c6" : "#dbd0c6"}
              fontSize={RNPlatform.OS === 'web' ? 22 : isIpad() ? 20 : 18}
              fontWeight="bold"
              marginRight={RNPlatform.OS === 'web' ? 20 : 10}
              marginLeft={RNPlatform.OS === 'web' ? 20 : isIpad() ? -30 : -24}
            >
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          )}
          {__DEV__ && (
            <Button
              size="$2"
              circular
              bg="transparent"
              pressStyle={{ scale: 0.95 }}
              animation="quick"
              elevation={4}
              onPress={() => addDevTasks()} 
              position="absolute" 
              right="$3" 
              top="-10%" 
              y="0%" 
            >
              <Text color="#c3c3c3" fontSize={20} fontWeight="bold">+</Text>
            </Button>
          )}
        </XStack>
      </XStack>
      
      <Stack
        flex={1}
        position="relative"
        justifyContent={RNPlatform.OS === 'web' ? 'flex-start' : isIpad() ? 'flex-start' : 'center'}
        px={RNPlatform.OS === 'web' ? "$3" : "$1"}
        py={RNPlatform.OS === 'web' ? "$2" : "$0"}
      >
        {RNPlatform.OS === 'web' ? (
          uniqueTasks.length === 0 ? (
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
                  <RecommendationChipHome category="Cleaning" onPress={() => openRecommendationModal('Cleaning')} isDark={isDark}/>
                  <RecommendationChipHome category="Wealth" onPress={() => openRecommendationModal('Wealth')} isDark={isDark}/>
                  <RecommendationChipHome category="Gym" onPress={() => openRecommendationModal('Gym')} isDark={isDark}/>
                  <RecommendationChipHome category="Self-Care" onPress={() => openRecommendationModal('Self-Care')} isDark={isDark}/>
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
              maxHeight: uniqueTasks.length > 4 ? '200px' : 'auto',
              overflowY: uniqueTasks.length > 4 ? 'auto' : 'visible',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(219, 208, 198, 0.3) rgba(0, 0, 0, 0.1)',
              padding: '10px'
            }}>
              {uniqueTasks.map((task: Task) => {
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
                      tags={task.tags}
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
            {uniqueTasks.length === 0 ? (
              <Stack 
                p="$2"
                px="$1"
                mt={0}
                gap="$2"
                br={12}
              >
                <YStack width="100%">
                  <XStack
                    justifyContent="center"
                    gap="$2"
                    px="$2"
                    flexWrap="wrap"
                    width="100%"
                    flexDirection="row"
                  >
                    <RecommendationChipHome category="Cleaning" onPress={() => openRecommendationModal('Cleaning')} isDark={isDark}/>
                    <RecommendationChipHome category="Wealth" onPress={() => openRecommendationModal('Wealth')} isDark={isDark}/>
                    <RecommendationChipHome category="Gym" onPress={() => openRecommendationModal('Gym')} isDark={isDark}/>
                    <RecommendationChipHome category="Self-Care" onPress={() => openRecommendationModal('Self-Care')} isDark={isDark}/>
                  </XStack>
                </YStack>
              </Stack>
            ) : (
              <>
                <XStack
                  flexWrap="wrap"
                  gap={isIpad() ? "$0.5" : "$0.5"}
                  px={isIpad() ? "$3" : "$3"}
                  paddingLeft={isIpad() ? "$2.5" : "$4"}
                  paddingVertical="$1.5"
                  paddingBottom={isIpad() ? "$4" : "$3"}
                  justifyContent={isIpad() ? "center" : "flex-start"}
                  borderBottomWidth={1}
                  borderColor={isDark ? "rgba(29, 29, 29, 0.65)" : "rgba(0, 0, 0, 0.1)"}
                >
                  {uniqueTasks.map((task: Task) => {
                    const isCompleted = task.completionHistory[todayLocalStr] || false;
                    return (
                      <Stack 
                        key={task.id} 
                        width={isIpad() ? "80%" : "99%"}
                        marginBottom="$2"
                        animation="quick"
                      >
                        <TaskCard
                          title={task.name}
                          time={task.time}
                          category={task.category}
                          priority={task.priority}
                          status={task.recurrencePattern === 'one-time' ? 'One-time' : task.recurrencePattern.charAt(0).toUpperCase() + task.recurrencePattern.slice(1)}
                          checked={isCompleted}
                          tags={task.tags}
                          onCheck={() => handleToggleTask(task.id)}
                          onDelete={() => deleteTask(task.id)}
                        />
                      </Stack>
                    );
                  })}
                </XStack>
              </>
            )}
            {!isWeb && <ProjectSection />}
            {!isWeb ? (
              <>
                <Pressable
                  delayLongPress={1500} 
                  hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }} 
                  android_disableSound={true}
                  onLongPress={() => {
                    if (!isWeb) {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                    setEasterEggVisible(false);
                    if (easterEggTimeout.current) {
                      clearTimeout(easterEggTimeout.current);
                      easterEggTimeout.current = null;
                    }
                    easterEggTimeout.current = setTimeout(() => {
                      setEasterEggVisible(true);
                    }, 100); 
                  }}
                  onPressIn={() => {
                    if (DEBUG) {
                      log('Press started on YearCompleteSection');
                    }
                  }}
                  onPressOut={() => {
                    if (easterEggTimeout.current) {
                      clearTimeout(easterEggTimeout.current);
                      easterEggTimeout.current = null;
                    }
                  }}
                  style={{ 
                    width: '100%', 
                    paddingTop: 8, 
                    paddingBottom: 8, 
                    zIndex: 20, 
                    position: 'relative',
                    marginTop: 4, 
                    marginBottom: 4 
                  }}
                >
                  <YearCompleteSection />
                </Pressable>
                <EasterEgg
                  visible={easterEggVisible}
                  onAnimationEnd={() => setEasterEggVisible(false)}
                />
              </>
            ) : <YearCompleteSection />}
          </>
        )}
      </Stack>
    </Stack>
  )
}
