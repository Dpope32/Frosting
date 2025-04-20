// components/tasklist/TaskListModal.tsx
import React from 'react'
import { XStack  } from 'tamagui' 
import { useColorScheme } from 'react-native'
import { BaseCardWithRecommendationsModal } from '../recModals/BaseCardWithRecommendationsModal'
import { FilterChip } from './filterChip'
import { DeleteTaskDialog } from './DeleteTaskDialog'
import { TaskItem } from './taskItem'
import { useProjectStore } from '@/store/ToDo'
import { useBillStore } from '@/store/BillStore'
import { useRecommendationStore } from '@/store/RecommendationStore'
import { useEditTaskStore } from '@/store/EditTaskStore'
import { useToastStore } from '@/store/ToastStore'
import { useUserStore } from '@/store/UserStore'
import { Task } from '@/types/task'
import { RecommendationCategory, RecommendationChip } from '@/constants/recommendations/TaskRecommendations'

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

  const tasksByRec = React.useMemo(() => {
    const groups: Record<string, Task[]> = { 'one-time':[], tomorrow:[], everyday:[], weekly:[], biweekly:[], monthly:[], yearly:[] }
    const seenBills = new Set<string>()
    let seenNbaGame = false
    Object.values(tasks).forEach(task => {
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
      if (pat === 'one-time') groups['one-time'].push(task)
      else groups[pat]?.push(task)
    })
    return groups
  }, [tasks, bills, preferences.showNBAGameTasks])

  const keys = React.useMemo(() => Object.keys(tasksByRec).filter(k => tasksByRec[k].length > 0), [tasksByRec]);
  const filterChipCount = keys.length;

  const entries = React.useMemo(() => (
    filter ? Object.entries(tasksByRec).filter(([k]) => k===filter)
           : Object.entries(tasksByRec)
  ), [tasksByRec, filter])

  const header = React.useMemo(() => {
    if (filterChipCount < 2) return null
    return (
      <XStack mb="$2" flexWrap="wrap" gap="$2">
        <FilterChip
          key="all"
          label="All"
          isSelected={filter === null}
          onPress={() => setFilter(null)}
          pattern="all"
        />
        {keys.map(k => (
          <FilterChip
            key={k}
            label={k}
            isSelected={filter===k}
            onPress={() => setFilter(filter===k ? null : k)}
          />
        ))}
      </XStack>
    )
  }, [tasksByRec, filter, keys, filterChipCount])


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

  const onLongPress = (task: Task) => { setDialogTask(task); setDialogOpen(true) }
  const onConfirm = () => {
    if (dialogTask?.category==='bills') showToast('Delete in Bills screen','warning')
    else if (dialogTask) { deleteTask(dialogTask.id); showToast('Deleted','success') }
    setDialogOpen(false); setDialogTask(null)
  }

  return (
    <>
      <BaseCardWithRecommendationsModal
        open={open}
        onOpenChange={o => { if(!o) setFilter(null); onOpenChange(o) }}
        title="All Tasks"
        recommendationChips={filterChipCount < 2 ? taskRecommendations : header}
      >
        {entries.map(([_, arr]) => arr.map(t => (
          <TaskItem
            key={t.id}
            task={t}
            onLongPress={onLongPress}
            onPressEdit={t => { onOpenChange(false); openEditModal(t) }}
          />
        )))}
      </BaseCardWithRecommendationsModal>
      <DeleteTaskDialog
        task={dialogTask}
        isOpen={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        onConfirm={onConfirm}
      />
    </>
  )
}
