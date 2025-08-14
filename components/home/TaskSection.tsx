import React, { useState, useRef, useMemo } from 'react'
import { Pressable, Platform as RNPlatform, useColorScheme } from 'react-native'
import { isWeb, Stack, Text, XStack, YStack } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { TaskCard } from '@/components/home/TaskCard'
import { Button } from 'tamagui' 
import { Task } from '@/types/task'
import { RecommendationChipHome } from '@/constants'
import { addDevTasks } from '@/services/dev/devTasks'
import { useRecommendationStore, useUserStore } from '@/store'
import { YearCompleteSection } from '@/components/home/YearCompleteSection'
import { format } from 'date-fns'
import { isIpad } from '@/utils'
import { GreetingSection } from '@/components/home/GreetingSection'
import { EasterEgg } from '../shared/EasterEgg'
import { ProjectSection } from '@/components/home/ProjectSection'
import { TaskProgressBar } from '@/components/home/TaskProgressBar'

interface TaskSectionProps {
  todaysTasks: Task[]
  toggleTaskCompletion: (id: string) => void
  deleteTask: (id: string) => void
  onAddTaskPress: () => void
  onTaskListPress: () => void
}

export const TaskSection = React.memo<TaskSectionProps>(({
  todaysTasks,
  toggleTaskCompletion,
  deleteTask,
  onTaskListPress
}) => {
  const openRecommendationModal = useRecommendationStore(s => s.openModal)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const todayLocalStr = format(new Date(), 'yyyy-MM-dd')
  const username = useUserStore(s => s.preferences.username);
  const [easterEggVisible, setEasterEggVisible] = useState(false);
  const easterEggTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const uniqueTasks = useMemo(() => {
    const taskGroups: Record<string, Task[]> = {};
    
    todaysTasks.forEach(task => {
      if (!taskGroups[task.name]) {
        taskGroups[task.name] = [];
      }
      taskGroups[task.name].push(task);
    });
    
    return Object.values(taskGroups).map(tasks => {
      if (tasks.length === 1) return tasks[0];
      
      const completedTask = tasks.find(task => task.completionHistory[todayLocalStr]);
      if (completedTask) return completedTask;
      
      return tasks[0];
    });
  }, [todaysTasks, todayLocalStr]);
  

  const handleToggleTask = React.useCallback((id: string) => {
    toggleTaskCompletion(id);
  }, [toggleTaskCompletion]);

  const handleDeleteTask = React.useCallback((id: string) => {
    deleteTask(id);
  }, [deleteTask]);

  const handleTaskListPress = React.useCallback(() => {
    if (RNPlatform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }
    onTaskListPress()
  }, [onTaskListPress]);

  const handleEasterEgg = React.useCallback(() => {
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
  }, []);

  React.useEffect(() => {
    return () => {
      if (easterEggTimeout.current) {
        clearTimeout(easterEggTimeout.current);
      }
    };
  }, []);

  const completedTasksCount = React.useMemo(() => {
    return uniqueTasks.filter(task => task.completionHistory[todayLocalStr] || false).length;
  }, [uniqueTasks, todayLocalStr]);

  const recommendationChips = React.useMemo(() => (
    <Stack 
      p="$2"
      px={RNPlatform.OS === 'web' ? "$2" : "$1"}
      mt={RNPlatform.OS === 'web' ? "$3" : 0}
      gap={RNPlatform.OS === 'web' ? "$4" : "$2"}
      br={12}
    >
      <YStack width="100%">
        <XStack
          justifyContent={RNPlatform.OS === 'web' ? "space-between" : "center"}
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
  ), [openRecommendationModal, isDark]);

  return (
    <Stack br={16} px="$0" py={isIpad() ? "$3" : "$2"} paddingBottom={"$0"}>
      <XStack
        alignItems="center"
        width="100%" 
        marginBottom="$2" 
        gap={isWeb ? "$2" : "$0"}
        px={RNPlatform.OS === 'web' ? "$3" : "$0"}
        justifyContent={RNPlatform.OS === 'web' ? "flex-start" : isIpad() ? "space-between" : "space-between" }
      >
        <Pressable
          onPress={handleTaskListPress}
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
            size={isWeb ? 23 : 22}
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
              fontSize={RNPlatform.OS === 'web' ? 23 : isIpad() ? 21 : 18}
              fontWeight="900"
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

      <TaskProgressBar 
        completedTasks={completedTasksCount} 
        totalTasks={uniqueTasks.length} 
      />
      <Stack
        flex={1}
        position="relative"
        justifyContent={RNPlatform.OS === 'web' ? 'flex-start' : isIpad() ? 'flex-start' : 'center'}
        px={RNPlatform.OS === 'web' ? "$3" : "$1"}
        py={RNPlatform.OS === 'web' ? "$2" : "$0"}
      >
        {RNPlatform.OS === 'web' ? (
          uniqueTasks.length === 0 ? (
            recommendationChips
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
                      onDelete={() => handleDeleteTask(task.id)}
                    />
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <>
            {uniqueTasks.length === 0 ? (
              recommendationChips
            ) : (
              <>
                <XStack
                  flexWrap="wrap"
                  gap={isIpad() ? "$0.5" : "$0"}
                  px={isIpad() ? "$4" : "$3"}
                  paddingLeft={isIpad() ? "$4" : "$4"}
                  paddingVertical="$1"
                  paddingBottom={isIpad() ? "$3" : "$2"}
                  justifyContent={isIpad() ? "center" : "flex-start"}
                  borderBottomWidth={1}
                  borderColor={isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.2)"}
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
                          onDelete={() => handleDeleteTask(task.id)}
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
                  hitSlop={{ top: 20, bottom: 40, left: 40, right: 40 }} 
                  android_disableSound={true}
                  onLongPress={handleEasterEgg}
                  onPressIn={() => {
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
                    zIndex: 20, 
                    position: 'relative',
                    marginTop: 4, 
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
})

TaskSection.displayName = 'TaskSection'
