import React, { useState } from 'react'; 
import { YStack, XStack, Text, isWeb, Spinner, Button, AlertDialog } from 'tamagui';
import { useProjectStore } from '@/store/ToDo';
import { useBillStore } from '@/store/BillStore'; 
import { Task, RecurrencePattern } from '@/types/task';
import { useRecommendationStore } from '@/store/RecommendationStore';
import { useEditTaskStore } from '@/store/EditTaskStore';
import { useToastStore } from '@/store/ToastStore'; 
import { Pressable, Platform, useColorScheme, Alert, ActivityIndicator } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons';
import { getCategoryColor, getRecurrenceColor, getRecurrenceIcon, withOpacity } from '@/utils/styleUtils';
import { RecommendationChip } from '@/constants/recommendations/TaskRecommendations';
import { BaseCardWithRecommendationsModal } from '../cardModals/BaseCardWithRecommendationsModal';

interface TaskListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const FilterChip = ({
  label,
  onPress,
  isSelected,
  pattern
}: {
  label: string,
  onPress: () => void,
  isSelected: boolean,
  pattern?: RecurrencePattern | 'all'
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const defaultSelectedBg = isDark ? '$blue7' : '$blue8';
  const defaultSelectedBorder = isDark ? '$blue8' : '$blue9';
  const defaultSelectedColor = isDark ? '$blue12' : '$blue1';
  const defaultUnselectedBg = isDark ? '$gray4' : '$gray6';
  const defaultUnselectedBorder = isDark ? '$gray5' : '$gray7';
  const defaultUnselectedColor = isDark ? '$gray12' : '$gray1';

  const recurrenceColor = pattern && pattern !== 'all' ? getRecurrenceColor(pattern) : null;

  const selectedBg = isSelected
    ? (recurrenceColor ? withOpacity(recurrenceColor, isDark ? 0.4 : 0.8) : defaultSelectedBg)
    : defaultUnselectedBg;
  const selectedBorder = isSelected
    ? (recurrenceColor ? withOpacity(recurrenceColor, isDark ? 0.6 : 1.0) : defaultSelectedBorder)
    : defaultUnselectedBorder;
  const selectedColor = isSelected
    ? (recurrenceColor ? (isDark ? '#FFFFFF' : '#000000') : defaultSelectedColor)
    : defaultUnselectedColor;

  return (
    <Button
      size="$2"
      theme={isDark ? 'dark' : 'light'}
      onPress={onPress}
      backgroundColor={selectedBg}
      pressStyle={{ opacity: 0.7 }}
      borderColor={selectedBorder}
      borderWidth={1}
      borderRadius="$4"
      paddingHorizontal="$3"
      height="$3"
      unstyled
      marginRight="$2"
      marginBottom="$1" 
      justifyContent="center"
      alignItems="center" 
    >
      <Text fontSize={12} color={selectedColor} fontFamily="$body">
        {label}
      </Text>
    </Button>
  );
};

const extractNameFromBirthdayTask = (taskName: string): string | null => {
    const wishMatch = taskName.match(/^Wish\s+(.+?)\s+a happy birthday!/);
    if (wishMatch && wishMatch[1]) return wishMatch[1].trim();
    const presentMatch = taskName.match(/^Get\s+(.+?)'s birthday present/);
    if (presentMatch && presentMatch[1]) return presentMatch[1].trim();
    return null;
};

export function TaskListModal({ open, onOpenChange }: TaskListModalProps) {
  const tasks = useProjectStore(s => s.tasks);
  const deleteTask = useProjectStore(s => s.deleteTask);
  const { bills: billObjects } = useBillStore();
  const openRecommendationModal = useRecommendationStore(s => s.openModal);
  const openEditTaskModal = useEditTaskStore(s => s.openModal);
  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  
  const [isDeleteTaskAlertOpen, setIsDeleteTaskAlertOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    const idToDelete = taskToDelete.id;
    setIsDeleteTaskAlertOpen(false); 
    setTaskToDelete(null);
    setDeletingTaskId(idToDelete); 

    try {
      deleteTask(idToDelete); 
      showToast("Task deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting task:", error);
      showToast("Failed to delete task", "error");
    } finally {
      setDeletingTaskId(null); 
    }
  };

  const cancelDeleteTask = () => {
    setIsDeleteTaskAlertOpen(false);
    setTaskToDelete(null);
  };

  const tasksByRecurrence = React.useMemo(() => {
  const existingBillNames = new Set(Object.values(billObjects).map(bill => bill.name));

    const recurrenceGroups: Record<string, Task[]> = {
      'one-time': [],
      'tomorrow': [],
      'everyday': [],
      'weekly': [],
      'biweekly': [],
      'monthly': [],
      'yearly': []
    };

    const uniqueBillNames = new Set<string>();
    const seenBirthdayNames = new Set<string>();

    Object.values(tasks).forEach(task => {
      if (task.name.includes(' vs ') || task.name.includes(' @ ')) {
        return;
      }

      if (task.category === 'bills') {
        const match = task.name.match(/^Pay\s+(.+?)\s+\(\$.+\)$/);
        const baseBillName = match ? match[1] : null;
        if (!baseBillName || !existingBillNames.has(baseBillName)) {
          return;
        }
        if (uniqueBillNames.has(baseBillName)) {
          return;
        }
        uniqueBillNames.add(baseBillName);
        recurrenceGroups['monthly'].push(task);
        return;
      }

      const isBirthdayWishTask = task.name.includes(' happy birthday!');
      const isBirthdayPresentTask = task.name.includes("'s birthday present");

      if (isBirthdayWishTask || isBirthdayPresentTask) {
        const personName = extractNameFromBirthdayTask(task.name);
        if (personName && !seenBirthdayNames.has(personName)) {
          recurrenceGroups['yearly'].push(task);
          seenBirthdayNames.add(personName);
        }
        return;
      }

      const pattern = task.recurrencePattern || 'one-time';
      if (pattern === 'one-time') {
        const isCompleted = Object.values(task.completionHistory || {}).some(status => status === true);
        if (!isCompleted) {
          recurrenceGroups['one-time'].push(task);
        }
      } else if (recurrenceGroups[pattern]) {
        recurrenceGroups[pattern].push(task);
      } else {
        recurrenceGroups['one-time'].push(task);
      }
    });

    Object.keys(recurrenceGroups).forEach(key => {
      recurrenceGroups[key].sort((a, b) => {
        if (a.time && b.time) {
            const timeA = new Date(`1970-01-01T${a.time.replace(' ', '')}`);
            const timeB = new Date(`1970-01-01T${b.time.replace(' ', '')}`);
            if (!isNaN(timeA.getTime()) && !isNaN(timeB.getTime())) {
                return timeA.getTime() - timeB.getTime();
            }
        }
        if (a.time) return -1;
        if (b.time) return 1;
        return a.name.localeCompare(b.name);
      });
    });

    return recurrenceGroups;
  }, [tasks, billObjects]);

  const totalTasks = React.useMemo(() => {
    const count = Object.values(tasksByRecurrence).reduce((sum, group) => sum + group.length, 0);
    return count;
  }, [tasksByRecurrence]);

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

  const taskRecommendations = (
    <XStack flexWrap="wrap" gap="$2" alignItems="center" marginBottom="$1">
      <RecommendationChip category="Cleaning" onPress={() => { onOpenChange(false); openRecommendationModal('Cleaning'); }} isDark={isDark} />
      <RecommendationChip category="Financial" onPress={() => { onOpenChange(false); openRecommendationModal('Financial'); }} isDark={isDark} />
      <RecommendationChip category="Gym" onPress={() => { onOpenChange(false); openRecommendationModal('Gym'); }} isDark={isDark} />
      <RecommendationChip category="Self-Care" onPress={() => { onOpenChange(false); openRecommendationModal('Self-Care'); }} isDark={isDark} />
    </XStack>
  );

  const filterChips = React.useMemo(() => {
    const availablePatterns = Object.keys(tasksByRecurrence).filter(pattern => tasksByRecurrence[pattern].length > 0) as RecurrencePattern[];
    if (availablePatterns.length <= 1) return null;

    const chips = (
      <XStack flexWrap="wrap" alignItems="center" marginBottom="$1">
         <FilterChip
           label="All"
           pattern="all"
           onPress={() => {
             setSelectedFilter(null);
           }}
           isSelected={selectedFilter === null}
         />
        {availablePatterns.map((pattern: RecurrencePattern) => (
          <FilterChip
            key={pattern}
            label={getRecurrenceTitle(pattern)}
            pattern={pattern}
            onPress={() => {
              const newFilter = pattern === selectedFilter ? null : pattern;
              setSelectedFilter(newFilter);
            }}
            isSelected={selectedFilter === pattern}
          />
        ))}
      </XStack>
    );
    return chips;
  }, [tasksByRecurrence, selectedFilter, isDark]); 

  const headerContent = totalTasks >= 4 ? filterChips : taskRecommendations;

  const renderTaskItem = (task: Task) => {
    let displayPattern: RecurrencePattern | 'one-time' = 'one-time';
    if (task.category === 'bills') {
        displayPattern = 'monthly';
    } else if (task.name.includes(' happy birthday!') || task.name.includes("'s birthday present")) {
        displayPattern = 'yearly';
    } else {
        displayPattern = task.recurrencePattern || 'one-time';
    }

    const recurrenceColor = getRecurrenceColor(displayPattern);
    const recurrenceIcon = getRecurrenceIcon(displayPattern);
    const statusText = displayPattern === 'one-time' ? 'One-time' : getRecurrenceTitle(displayPattern);

    return (
      <XStack
        key={task.id}
        backgroundColor={isDark ? "$gray2" : "$gray3"}
        br={8}
        padding="$3"
        alignItems="flex-start"
        justifyContent="space-between"
        marginBottom="$2"
      >
        <YStack flex={1} gap={isWeb ? "$3.5" : "$2"} marginRight="$2">
          <XStack width="100%" alignItems="center" justifyContent="center">
            <Text
              fontFamily="$body"
              paddingLeft={isWeb ? "$1" : "$0"}
              color={isDark ? "$gray12" : "$gray11"}
              fontSize={15}
              fontWeight="500"
              flex={1}
            >
              {task.name}
            </Text>
          </XStack>

          <XStack flexWrap="wrap" alignItems="center" >
            {task.category && task.category !== 'bills' && (
              <XStack
                alignItems="center"
                backgroundColor={`${getCategoryColor(task.category)}1A`}
                px="$1.5"
                py="$0.5"
                br={12}
                mr="$1.5"
                mb="$1"
              >
                <Ionicons
                  name="bookmark"
                  size={11}
                  color={getCategoryColor(task.category)}
                  style={{ marginRight: 3 }}
                />
                <Text
                  fontFamily="$body"
                  color={getCategoryColor(task.category)}
                  fontSize={11}
                  fontWeight="500"
                  textTransform="capitalize"
                >
                  {task.category}
                </Text>
              </XStack>
            )}

            {task.priority && (
              <XStack
                alignItems="center"
                backgroundColor={`${getPriorityColor(task.priority)}1A`}
                py="$0.5"
                px="$1.5"
                br={12}
                mr="$1.5"
                mb="$1"
              >
                <Ionicons
                  name={getPriorityIcon(task.priority)}
                  size={11}
                  color={getPriorityColor(task.priority)}
                  style={{ marginRight: 3 }}
                />
                <Text
                  fontFamily="$body"
                  color={getPriorityColor(task.priority)}
                  fontSize={11}
                  fontWeight="500"
                  textTransform="capitalize"
                >
                  {task.priority}
                </Text>
              </XStack>
            )}

            <XStack
              alignItems="center"
              backgroundColor={`${recurrenceColor}1A`}
              px="$1.5"
              py="$0.5"
              br={12}
              mr="$1.5"
              mb="$1"
            >
              <Ionicons
                name={recurrenceIcon as any}
                size={11}
                color={recurrenceColor}
                style={{ marginRight: 3 }}
              />
              <Text
                fontFamily="$body"
                color={recurrenceColor}
                fontSize={11}
                fontWeight="500"
                textTransform="capitalize"
              >
                {statusText}
              </Text>
            </XStack>

            {task.time && (
              <XStack
                alignItems="center"
                backgroundColor={isDark ? "$gray4" : "$gray5"}
                px="$1.5"
                py="$0.5"
                br={12}
                mb="$1"
              >
                <Ionicons
                  name="time-outline"
                  size={11}
                  color={isDark ? "$gray10" : "$gray11"}
                  style={{ marginRight: 3 }}
                />
                <Text
                  fontFamily="$body"
                  color={isDark ? "$gray10" : "$gray11"}
                  fontSize={11}
                  fontWeight="500"
                >
                  {task.time}
                </Text>
              </XStack>
            )}
          </XStack>
        </YStack>

        <YStack alignItems="center">
          <Pressable
            onPress={() => {
              if (deletingTaskId === task.id) return;
              if (Platform.OS === 'web') {
                setTaskToDelete(task);
                setIsDeleteTaskAlertOpen(true);
              } else {
                Alert.alert(
                  "Delete Task",
                  `Are you sure you want to delete "${task.name}"?`,
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete", style: "destructive",
                      onPress: () => {
                        setDeletingTaskId(task.id);
                        try {
                          deleteTask(task.id);
                          showToast("Task deleted successfully", "success");
                        } catch (error) {
                           console.error("Error deleting task:", error);
                           showToast("Failed to delete task", "error");
                        } finally {
                          setDeletingTaskId(null);
                        }
                      }
                    }
                  ],
                  { cancelable: true }
                );
              }
            }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              padding: 4,
              alignItems: 'center',
              justifyContent: 'center'
            })}
            disabled={deletingTaskId === task.id}
          >
            {deletingTaskId === task.id ? (
              <ActivityIndicator size="small" color="#ff4444" />
            ) : (
              <Ionicons name="close-circle" size={20} color="#ff6b6b" />
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              onOpenChange(false);
              setTimeout(() => { openEditTaskModal(task); }, 150);
            }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              padding: 4,
            })}
          >
            <Ionicons
              name="pencil-outline"
              size={16}
              color={isDark ? "$gray9" : "$gray10"}
            />
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

  const filteredEntries = React.useMemo(() => {
    let entries;
    if (selectedFilter === null) {
      entries = Object.entries(tasksByRecurrence);
    } else {
      entries = Object.entries(tasksByRecurrence).filter(([pattern]) => pattern === selectedFilter);
    }
    return entries;
  }, [tasksByRecurrence, selectedFilter]);

  const hasNoFilteredTasks = Array.isArray(filteredEntries) &&
                             filteredEntries.every(([, tasks]: [string, Task[]]) => tasks.length === 0) &&
                             !hasNoTasks;
  
  return (
    <>
      <BaseCardWithRecommendationsModal
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            setSelectedFilter(null);
          }
          onOpenChange(newOpen);
        }}
        title="All Tasks"
        snapPoints={isWeb ? [95] : [80]}
        showCloseButton={true}
        hideHandle={true}
        recommendations={headerContent ?? null}
      >
        {filteredEntries.map(([pattern, patternTasks]) => {
          return patternTasks.length > 0 ? (
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
              {console.log(`[TaskListModal] Rendering tasks for pattern: ${pattern}`)}
              {patternTasks.map(renderTaskItem)}
            </YStack>
          ) : null;
        })}
        {hasNoTasks && (
          <YStack 
            backgroundColor={isDark ? "$gray2" : "$gray3"} 
            br={8} 
            padding="$4" 
            alignItems="center" 
            mt="$2"
          >
            {console.log('[TaskListModal] Rendering "No tasks found" message.')}
            <Text 
              fontFamily="$body" 
              color={isDark ? "$gray12" : "$gray11"} 
              opacity={0.7}
            > 
              No tasks found
            </Text>
          </YStack>
        )}
        {hasNoFilteredTasks && !hasNoTasks && (
          <YStack
            backgroundColor={isDark ? "$gray2" : "$gray3"} 
            br={8} 
            padding="$4" 
            alignItems="center" 
            mt="$2"
          >
            {console.log('[TaskListModal] Rendering "No tasks match filter" message.')}
            <Text
              fontFamily="$body"
              color={isDark ? "$gray12" : "$gray11"}
              opacity={0.7}
            >
              No tasks match the selected filter.
            </Text>
          </YStack>
        )}
      </BaseCardWithRecommendationsModal>

      <AlertDialog open={isDeleteTaskAlertOpen} onOpenChange={setIsDeleteTaskAlertOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay />
          <AlertDialog.Content>
            <YStack gap="$3">
              <AlertDialog.Title>Delete Task</AlertDialog.Title>
              <AlertDialog.Description>
                Are you sure you want to delete "{taskToDelete?.name ?? 'this task'}"? This action cannot be undone.
              </AlertDialog.Description>
              <XStack gap="$3" justifyContent="flex-end">
                <AlertDialog.Cancel asChild>
                  <Button onPress={cancelDeleteTask}>Cancel</Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <Button onPress={confirmDeleteTask}>Delete</Button>
                </AlertDialog.Action>
              </XStack>
            </YStack>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>
    </>
  );
}
