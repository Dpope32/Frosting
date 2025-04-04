import React from 'react';
import { YStack, XStack, Text, isWeb } from 'tamagui';
import { useProjectStore } from '@/store/ToDo';
import { Task, WeekDay, RecurrencePattern } from '@/types/task';
import { useRecommendationStore } from '@/store/RecommendationStore';
import { useEditTaskStore } from '@/store/EditTaskStore'; // Import the edit task store
import { Pressable, Platform, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryColor, getRecurrenceColor, getRecurrenceIcon } from '@/utils/styleUtils';
import { RecommendationChip } from '@/constants/recommendations/TaskRecommendations';
import { BaseCardWithRecommendationsModal } from '../baseModals/BaseCardWithRecommendationsModal'; 

interface TaskListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // onEditTask prop is no longer needed as we use the store
}

export function TaskListModal({ open, onOpenChange }: TaskListModalProps) {
  const tasks = useProjectStore(s => s.tasks);
  const deleteTask = useProjectStore(s => s.deleteTask);
  const openRecommendationModal = useRecommendationStore(s => s.openModal);
  const openEditTaskModal = useEditTaskStore(s => s.openModal); // Get the openModal action
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Group tasks by recurrence pattern
  const tasksByRecurrence = React.useMemo(() => {
    // Initialize structure for recurrence patterns
    const recurrenceGroups: Record<string, Task[]> = {
      'one-time': [],
      'tomorrow': [],
      'everyday': [],
      'weekly': [],
      'biweekly': [],
      'monthly': [],
      'yearly': []
    };
    
    // Unique bill names to avoid duplicates
    const billNames = new Set<string>();
    
    Object.values(tasks).forEach(task => {
      // Skip NBA games (matches with vs or @ in the name)
      if (task.name.includes(' vs ') || task.name.includes(' @ ')) {
        return;
      }
      
      // For bills, only include one of each by name
      if (task.category === 'bills') {
        if (billNames.has(task.name)) {
          return;
        }
        billNames.add(task.name);
      }
      
      // For one-time tasks, only include those not completed
      if (task.recurrencePattern === 'one-time') {
        const isCompleted = Object.values(task.completionHistory).some(status => status === true);
        if (!isCompleted) {
          recurrenceGroups['one-time'].push(task);
        }
      } else {
        // Add to the appropriate recurrence group
        recurrenceGroups[task.recurrencePattern].push(task);
      }
    });
    
    // Sort each group
    Object.keys(recurrenceGroups).forEach(key => {
      recurrenceGroups[key].sort((a, b) => {
        // Sort by time first
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time) return -1;
        if (b.time) return 1;
        
        // Then by name
        return a.name.localeCompare(b.name);
      });
    });
    
    return recurrenceGroups;
  }, [tasks]);

  const getRecurrenceTitle = (pattern: string): string => {
    switch(pattern) {
      case 'one-time': return 'One-time';
      case 'tomorrow': return 'Tomorrow';
      case 'everyday': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return pattern.charAt(0).toUpperCase() + pattern.slice(1);
    }
  };

  const getScheduleText = (task: Task) => {
    if (task.recurrencePattern === 'one-time') {
      return task.scheduledDate
        ? new Date(task.scheduledDate).toLocaleDateString()
        : 'One-time';
    }
    
    if (task.schedule && task.schedule.length > 0) {
      return task.schedule.map(day => day.charAt(0).toUpperCase()).join(', ');
    }
    
    return task.recurrencePattern.charAt(0).toUpperCase() + task.recurrencePattern.slice(1);
  };

  const taskRecommendations = (
    <>
      <RecommendationChip category="Cleaning" onPress={() => { onOpenChange(false); openRecommendationModal('Cleaning'); }} isDark={isDark} />
      <RecommendationChip category="Financial" onPress={() => { onOpenChange(false); openRecommendationModal('Financial'); }} isDark={isDark} />
      <RecommendationChip category="Gym" onPress={() => { onOpenChange(false); openRecommendationModal('Gym'); }} isDark={isDark} />
      <RecommendationChip category="Self-Care" onPress={() => { onOpenChange(false); openRecommendationModal('Self-Care'); }} isDark={isDark} />
    </>
  );

  // Render a single task item
  const renderTaskItem = (task: Task) => {
    const recurrencePattern = task.recurrencePattern;
    const recurrenceColor = getRecurrenceColor(recurrencePattern);
    const recurrenceIcon = getRecurrenceIcon(recurrencePattern);
    
    const statusText = recurrencePattern === 'one-time' 
      ? 'One-time' 
      : recurrencePattern.charAt(0).toUpperCase() + recurrencePattern.slice(1);
    
    return (
      <XStack
        key={task.id}
        backgroundColor={isDark ? "$gray2" : "$gray3"}
        br={8}
        padding="$3"
        alignItems="flex-start"
        justifyContent="space-between"
        marginBottom="$1"
      >
        <YStack flex={1} marginLeft={4} marginRight={4} marginBottom={4}>
          <XStack width="100%" justifyContent="space-between" alignItems="center">
            <Text
              fontFamily="$body"
              color={isDark ? "$gray12" : "$gray11"}
              fontSize={15}
              fontWeight="500"
              flex={1}
            >
              {task.name}
            </Text>
            
            <Pressable 
              onPress={() => deleteTask(task.id)} 
              style={({ pressed }) => ({ 
                opacity: pressed ? 0.7 : 1, 
                padding: 4
              })}
            >
              <Ionicons 
                name="close" 
                size={18} 
                color="#ff4444" 
              />
            </Pressable>
          </XStack>
          
          <XStack marginTop={10} marginLeft={-4} flexWrap="wrap">
            {task.category && (
              <XStack
                alignItems="center"
                backgroundColor={`${getCategoryColor(task.category)}15`}
                px="$1"
                py="$0.5"
                br={12}
                opacity={0.9}
                marginRight={6}
                marginBottom={4}
              >
                <Ionicons
                  name="bookmark"
                  size={10}
                  color={getCategoryColor(task.category)} 
                  style={{ marginLeft: 4, marginRight: 2, marginTop: 1 }}
                />
                <Text
                  fontFamily="$body"
                  color={getCategoryColor(task.category)}
                  fontSize={11}
                  fontWeight="500"
                >
                  {task.category.toLowerCase()}
                </Text>
              </XStack>
            )}

            {task.priority && (
              <XStack 
                alignItems="center" 
                backgroundColor={`${getPriorityColor(task.priority)}15`}
                py="$0.5"
                px="$1"
                br={12}
                opacity={0.9}
                marginRight={6}
                marginBottom={4}
              >
                <Ionicons 
                  name={getPriorityIcon(task.priority)} 
                  size={10} 
                  color={getPriorityColor(task.priority)} 
                  style={{ marginRight: 2, marginTop: 1 }}
                />
                <Text
                  fontFamily="$body"
                  color={getPriorityColor(task.priority)}
                  fontSize={11}
                  fontWeight="500"
                >
                  {task.priority}
                </Text>
              </XStack>
            )}
            
            <XStack 
              alignItems="center" 
              backgroundColor={`${recurrenceColor}15`}
              px="$1"
              py="$0.5"
              br={12}
              opacity={0.9}
              marginRight={6}
              marginBottom={4}
            >
              <Ionicons 
                name={recurrenceIcon as any}
                size={10} 
                color={recurrenceColor}
                style={{ marginRight: 2, marginTop: 1 }}
              />
              <Text
                fontFamily="$body"
                color={recurrenceColor}
                fontSize={11}
                fontWeight="500"
              >
                {statusText.toLowerCase()}
              </Text>
            </XStack>

            {task.time && (
              <XStack 
                alignItems="center" 
                backgroundColor="rgba(255, 255, 255, 0.05)"
                px="$1"
                py="$0.5"
                br={12}
                borderWidth={1}
                borderColor="rgb(52, 54, 55)"
                opacity={0.9}
                marginBottom={4}
              >
                <Ionicons 
                  name="time-outline" 
                  size={10} 
                  color="rgb(157, 157, 157)" 
                  style={{ marginRight: 4, marginTop: 1 }}
                />
                <Text
                  fontFamily="$body"
                  color="rgb(157, 157, 157)"
                  fontSize={11}
                  fontWeight="500"
                >
                  {task.time}
                </Text>
              </XStack>
            )}
          </XStack>

          {/* Updated Pressable for Edit Icon */}
          <Pressable
            onPress={() => {
              onOpenChange(false); // Close this modal first
              // Use setTimeout to ensure the current modal closes before the next opens, preventing potential UI glitches
              setTimeout(() => {
                openEditTaskModal(task); // Open the edit modal with the specific task
              }, 150); // Small delay
            }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              alignSelf: 'flex-end',
              marginTop: -22,
              paddingVertical: 2
            })}
          >
            <XStack alignItems="center">
              <Ionicons 
                name="pencil" 
                size={14} 
                color={isDark ? "#888" : "#666"} 
              />
              <Text 
                fontFamily="$body"
                color={isDark ? "#888" : "#666"}
                fontSize={12}
                marginLeft={4}
              >
                Edit
              </Text>
            </XStack>
          </Pressable>
        </YStack>
      </XStack>
    );
  };

  const getPriorityColor = (priority?: string): string => {
    if (!priority) return '#607d8b';
    const colors: Record<string, string> = {
      high: '#F44336', 
      medium: '#FF9800', 
      low: '#4CAF50', 
    };
    return colors[priority] || '#607d8b';
  };

  const getPriorityIcon = (priority?: string) => {
    if (!priority) return 'flag-outline';
    const icons: Record<string, any> = {
      high: 'alert-circle',
      medium: 'alert',
      low: 'information-circle-outline',
    };
    return icons[priority] || 'flag-outline';
  };

  const hasNoTasks = Object.values(tasksByRecurrence).every(group => group.length === 0);

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
        {/* Render each recurrence group with tasks */}
        {Object.entries(tasksByRecurrence).map(([pattern, patternTasks]) =>
          patternTasks.length > 0 ? (
            <YStack key={pattern} marginBottom="$2" mt="$2"> 
              <Text 
                color={isDark ? "$gray12" : "$gray11"} 
                fontSize={15} 
                fontWeight="600" 
                fontFamily="$body" 
                marginBottom="$2"
              > 
                {getRecurrenceTitle(pattern)}
              </Text>
              {patternTasks.map(renderTaskItem)}
            </YStack>
          ) : null
        )}
        
        {/* No tasks message */}
        {hasNoTasks && (
          <YStack 
            backgroundColor={isDark ? "$gray2" : "$gray3"} 
            br={8} 
            padding="$4" 
            alignItems="center" 
            mt="$2"
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
      </>
    </BaseCardWithRecommendationsModal>
  );
}
