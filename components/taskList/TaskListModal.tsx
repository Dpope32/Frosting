// components/tasklist/TaskListModal.tsx
import React from 'react'
import { XStack, YStack } from 'tamagui' 
import { Platform, Alert } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BaseCardWithRecommendationsModal } from '../recModals/BaseCardWithRecommendationsModal'
import { FilterChip } from './filterChip'
import { DeleteTaskDialog } from './DeleteTaskDialog'
import { TaskItem } from './taskItem'
import { useProjectStore } from '@/store/ToDo'
import { useBillStore, useRecommendationStore, useEditTaskStore, useToastStore, useUserStore, useCustomCategoryStore } from '@/store'
import { RecurrencePattern, Task } from '@/types'
import { RecommendationCategory, RecommendationChip } from '@/constants'
import { ScrollView as RNScrollView } from 'react-native'
import { getCategoryColor, isIpad } from '@/utils'
import { useColorScheme } from '@/hooks'
import { Sheet } from 'tamagui'

interface TaskListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const TaskListModal: React.FC<TaskListModalProps> = ({ open, onOpenChange }) => {
  const tasks = useProjectStore(s => s.tasks)
  const deleteTask = useProjectStore(s => s.deleteTask)
  const bills = useBillStore(s => s.bills)
  const openRecModal = useRecommendationStore(s => s.openModal)
  const openEditModal = useEditTaskStore(s => s.openModal)
  const showToast = useToastStore(s => s.showToast)
  const { preferences } = useUserStore(); 
  const isDark = useColorScheme() === 'dark'
  const [filter, setFilter] = React.useState<string | null>(null)
  const [dialogTask, setDialogTask] = React.useState<Task | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const customCategories = useCustomCategoryStore((s) => s.categories)
  const userColor = useUserStore(s => s.preferences.primaryColor)
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null)

  const tasksByRec = React.useMemo(() => {
    const groups: Record<string, Task[]> = { 'one-time':[], tomorrow:[], everyday:[], weekly:[], biweekly:[], monthly:[], yearly:[] }
    const seenBills = new Set<string>()
    let seenNbaGame = false
    Object.values(tasks).forEach(task => {
      // Filter out birthday tasks
      if (task.name.includes('birthday') || task.name.includes('🎂') || task.name.includes('🎁')) {
        return;
      }

      if (task.name.includes('🏀') && !preferences.showNBAGameTasks) {
        return;
      }

      if (task.category === 'bills') {
        const m = task.name.match(/^Pay\s+(.+?)\s+/)
        const name = m?.[1]
        if (name && bills[name] && !seenBills.has(name)) { seenBills.add(name); groups.monthly.push(task) }
        return
      }
      if (task.name.includes('🏀')) {
        if (!seenNbaGame) {
          groups['one-time'].push(task);
          seenNbaGame = true;
        }
        return
      }
      const pat = task.recurrencePattern || 'one-time'
      // Filter out completed one-time tasks
      if (pat === 'one-time' && task.completed) {
        return;
      }
      if (pat === 'one-time') groups['one-time'].push(task)
      else groups[pat]?.push(task)
    })
    return groups
  }, [tasks, bills, preferences.showNBAGameTasks])

  const taskRecommendationCategories: RecommendationCategory[] = ['Cleaning', 'Wealth', 'Gym', 'Self-Care'];
  const taskRecommendations = React.useMemo(() => (
    <>
      {taskRecommendationCategories.map((category: RecommendationCategory) => {
        const handlePress = () => {
          onOpenChange(false);
          openRecModal(category);
        };
        return (
          <RecommendationChip
            key={category}
            category={category}
            onPress={handlePress}
            isDark={isDark}
          />
        );
      })}
    </>
  ), [openRecModal, onOpenChange, isDark]); 

  const onLongPress = (task: Task) => {
    if (Platform.OS === 'web') {
      setDialogTask(task);
      setDialogOpen(true);
    } else {
      if (task.category === 'bills') {
        Alert.alert(
          'Bills Notice',
          'To delete bills, please go to the Bills screen.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Delete Task',
          `Are you sure you want to delete "${task.name}"? This action cannot be undone.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Delete', 
              style: 'destructive',
              onPress: () => {
                deleteTask(task.id);
                onOpenChange(false);
                showToast(`Deleted "${task.name}"`, 'success');
              }
            }
          ]
        );
      }
    }
  }

  const onConfirm = () => {
    if (dialogTask?.category === 'bills') {
      showToast('Delete in Bills screen', 'warning');
    } else if (dialogTask) {
      const taskName = dialogTask.name;
      deleteTask(dialogTask.id);
      setDialogOpen(false);
      setDialogTask(null);
      onOpenChange(false);
      setTimeout(() => {
        showToast(`Deleted "${taskName}"`, 'success');
      }, 100);
    }
  }

  // Combine recurrence and category filters into one row
  const allCategories = ['work','health','personal','family','wealth', ...customCategories.map(cat => cat.name)];
  const allRecurrencePatterns = ['one-time', 'tomorrow', 'everyday', 'weekly', 'biweekly', 'monthly', 'yearly'];

  // Get all tasks as an array
  const allTasksArr = Object.values(tasks);

  // For categories
  const categoriesWithTasks = allCategories.filter(cat =>
    allTasksArr.some(t => t.category === cat)
  );

  // For recurrences
  const recurrencesWithTasks = allRecurrencePatterns.filter(pattern =>
    allTasksArr.some(t => (t.recurrencePattern || 'one-time') === pattern)
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BaseCardWithRecommendationsModal
        open={open}
        hideHandle={true}
        onOpenChange={o => { if(!o) setFilter(null); onOpenChange(o) }}
        title="All Tasks"
        recommendationChips={Object.keys(tasksByRec).length < 2 ? taskRecommendations : null}
      >
        <YStack px={isIpad() ? "$2" : "$1.5 "} gap="$1.5" pb={isIpad() ? "$2" : "$1.5"}>
          {Platform.OS === 'web' ? (
            <RNScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingVertical: 4 }}>
              <XStack gap="$1" flexWrap="nowrap">
                <FilterChip
                  key="all"
                  label="All"
                  isSelected={categoryFilter === null && filter === null}
                  onPress={() => { setCategoryFilter(null); setFilter(null); }}
                  pattern="all"
                />
                {categoriesWithTasks.map(cat => {
                  const isCustom = customCategories.some(c => c.name === cat);
                  const color = isCustom ? userColor : getCategoryColor(cat);
                  const isSelected = categoryFilter === cat;
                  return (
                    <FilterChip
                      key={cat}
                      label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                      isSelected={isSelected}
                      onPress={() => { setCategoryFilter(cat); setFilter(null); }}
                      color={color}
                    />
                  );
                })}
                {recurrencesWithTasks.length > 1 && recurrencesWithTasks.map(pattern => {
                  const isSelected = filter === pattern;
                  return (
                    <FilterChip
                      key={pattern}
                      label={pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                      isSelected={isSelected}
                      onPress={() => { setFilter(pattern); setCategoryFilter(null); }}
                      pattern={pattern as RecurrencePattern}
                    />
                  );
                })}
              </XStack>
            </RNScrollView>
          ) : (
            <Sheet.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingVertical: 4 }}>
              <XStack gap="$1" flexWrap="nowrap">
                <FilterChip
                  key="all"
                  label="All"
                  isSelected={categoryFilter === null && filter === null}
                  onPress={() => { setCategoryFilter(null); setFilter(null); }}
                  pattern="all"
                />
                {categoriesWithTasks.map(cat => {
                  const isCustom = customCategories.some(c => c.name === cat);
                  const color = isCustom ? userColor : getCategoryColor(cat);
                  const isSelected = categoryFilter === cat;
                  return (
                    <FilterChip
                      key={cat}
                      label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                      isSelected={isSelected}
                      onPress={() => { setCategoryFilter(cat); setFilter(null); }}
                      color={color}
                    />
                  );
                })}
                {recurrencesWithTasks.length > 1 && recurrencesWithTasks.map(pattern => {
                  const isSelected = filter === pattern;
                  return (
                    <FilterChip
                      key={pattern}
                      label={pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                      isSelected={isSelected}
                      onPress={() => { setFilter(pattern); setCategoryFilter(null); }}
                      pattern={pattern as RecurrencePattern}
                    />
                  );
                })}
              </XStack>
            </Sheet.ScrollView>
          )}
        </YStack>
        {Object.entries(tasksByRec).map(([rec, arr]) =>
          arr
            .filter(t =>
              (categoryFilter ? t.category === categoryFilter : true) &&
              (filter ? t.recurrencePattern === filter : true)
            )
            .map(t => (
              <YStack mt={1} key={t.id} >
                <TaskItem
                  task={t}
                  onLongPress={onLongPress}
                  onPressEdit={t => { onOpenChange(false); openEditModal(t) }}
                />
              </YStack>
            ))
        )}
      </BaseCardWithRecommendationsModal>
      {Platform.OS === 'web' && (
        <DeleteTaskDialog
          task={dialogTask}
          isOpen={dialogOpen}
          onCancel={() => setDialogOpen(false)}
          onConfirm={onConfirm}
        />
      )}
    </GestureHandlerRootView>
  )
}
