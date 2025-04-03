import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as Haptics from 'expo-haptics'
import { createPersistStorage } from './AsyncStorage'
import { Platform } from 'react-native'
import { Task, WeekDay } from '@/types/task'
import { format } from 'date-fns'

interface ProjectStore {
  tasks: Record<string, Task>
  hydrated: boolean
  todaysTasks: Task[]
  addTask: (data: Omit<Task, 'id' | 'completed' | 'completionHistory' | 'createdAt' | 'updatedAt'>) => void
  deleteTask: (id: string) => void
  toggleTaskCompletion: (id: string) => void
  getTodaysTasks: () => Task[]
}

const dayNames: WeekDay[] = [
  'sunday','monday','tuesday','wednesday','thursday','friday','saturday'
]

const isTaskDue = (task: Task, date: Date): boolean => {
  const today = dayNames[date.getDay()]
  const currentDateStrLocal = format(date, 'yyyy-MM-dd')
  const fallbackRecDate = task.recurrenceDate ? new Date(task.recurrenceDate) : new Date(task.createdAt)
  
  // Special handling for bills - check this first before any recurrence patterns
  if (task.category === 'bills' && task.dueDate) {
    const isDueDate = date.getDate() === task.dueDate
    return isDueDate
  }
  
  switch (task.recurrencePattern) {
    case 'one-time': {
      if ((task.name.includes(' vs ') || task.name.includes(' @ ')) && task.scheduledDate) {
        const gameDate = new Date(task.scheduledDate)
        const localGameDate = new Date(gameDate.getTime() - (gameDate.getTimezoneOffset() * 60000))
        const localGameDateStr = localGameDate.toISOString().split('T')[0]
        return localGameDateStr === currentDateStrLocal && !task.completed
      }
      if ((task.name.includes('birthday') || task.name.includes('🎂') || task.name.includes('🎁')) && task.scheduledDate) {
        const bdayDateLocal = new Date(task.scheduledDate)
        const bdayStrLocal = format(bdayDateLocal, 'yyyy-MM-dd')
        return bdayStrLocal === currentDateStrLocal && !task.completed
      }
      if (task.completed) {
        // Completion history should still use the UTC date string key it was saved with
        const dateStrUTC = date.toISOString().split('T')[0]
        return task.completionHistory[dateStrUTC] === true
      }
      return true
    }
    case 'tomorrow': {
      const createdDateStr = new Date(task.createdAt).toISOString().split('T')[0]
      const yesterday = new Date(date)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      return createdDateStr === yesterdayStr
    }
    case 'everyday': {
      // Check completion based on local date string
      return !task.completionHistory[currentDateStrLocal]
    }
    case 'weekly': {
      // Check completion based on local date string
      return task.schedule.includes(today) && !task.completionHistory[currentDateStrLocal]
    }
    case 'biweekly': {
      const startDate = fallbackRecDate
      const weekDiff = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      // Check completion based on local date string
      return task.schedule.includes(today) && (weekDiff % 2 === 0) && !task.completionHistory[currentDateStrLocal]
    }
    case 'monthly': {
      // Skip bills in monthly recurrence since we handle them separately
      if (task.category === 'bills') return false
      const recDay = fallbackRecDate.getDate()
      return date.getDate() === recDay && !task.completionHistory[currentDateStrLocal]
    }
    case 'yearly': {
      const recMonth = fallbackRecDate.getMonth()
      const recDay = fallbackRecDate.getDate()
      // Check completion based on local date string
      return (date.getMonth() === recMonth && date.getDate() === recDay) && !task.completionHistory[currentDateStrLocal]
    }
    default:
      return false
  }
}

const createTaskFilter = () => {
  let lastToday: string | null = null
  let lastTasks: Record<string, Task> | null = null
  let lastResult: Task[] | null = null
  
  // Debug function for monitoring task filtering
  const debugTaskFilter = (stage: string, tasks: Task[]) => {

    const monthlyCounts: Record<string, number> = {}
    
    tasks.forEach(task => {
      if (task.recurrencePattern === 'monthly') {
        const key = `${task.name}-${task.id}`
        monthlyCounts[key] = (monthlyCounts[key] || 0) + 1
      }
    })
  }
  
  return (tasks: Record<string, Task>): Task[] => {
    const currentDate = new Date()
    const dateStr = currentDate.toISOString().split('T')[0]
    if (lastToday === dateStr && lastTasks === tasks && lastResult !== null) {
      return lastResult
    }
    
    lastToday = dateStr
    lastTasks = tasks
    
    // Update completion status for recurring tasks based on local date
    const currentDateStrLocal = format(currentDate, 'yyyy-MM-dd')
    Object.values(tasks).forEach(task => {
      if (task.recurrencePattern !== 'one-time') {
        task.completed = task.completionHistory[currentDateStrLocal] || false
      }
    })
    
    // Filter tasks that are due today
    const filtered = Object.values(tasks).filter(task => {
    const isDue = isTaskDue(task, currentDate)
    return isDue
  })
    debugTaskFilter('After initial filtering', filtered)
    
    // Map to track tasks we've already included
    const includedTaskMap: Record<string, boolean> = {}
    // More aggressive deduplication for monthly bills (using local date context if needed)
    const uniqueFiltered = filtered.filter(task => {
      // Create a unique key for each task based on identifying properties
      // Consider if local date affects uniqueness (e.g., monthly bill on 1st vs last day)
      const taskKey = `${task.name}-${task.recurrencePattern}-${task.category}` // Keep simple for now
      
      // If we've already seen this task, skip it
      if (includedTaskMap[taskKey]) {
        return false
      }
      
      // Mark this task as included
      includedTaskMap[taskKey] = true
      return true
    })
    
    debugTaskFilter('After deduplication', uniqueFiltered)
    const sorted = [...uniqueFiltered].sort((a, b) => {
      // Sort based on completion status for the current local date
      const aCompletedToday = a.completionHistory[currentDateStrLocal] || false
      const bCompletedToday = b.completionHistory[currentDateStrLocal] || false
      if (aCompletedToday !== bCompletedToday) return aCompletedToday ? 1 : -1
      // Keep existing time/priority sorting logic
      if (a.time && b.time) return a.time.localeCompare(b.time)
      if (a.time) return -1
      if (b.time) return 1
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
    lastResult = sorted
    return sorted
  }
}

const taskFilter = createTaskFilter()

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      tasks: {},
      hydrated: false,
      todaysTasks: [],
      addTask: (data) => {
        const tasks = { ...get().tasks }
        const id = Date.now().toString()
        const newTask: Task = {
          ...data,
          id,
          completed: false,
          completionHistory: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          recurrencePattern: data.recurrencePattern || (data.category === 'bills' ? 'monthly' : 'one-time'),
          dueDate: data.category === 'bills' ? data.dueDate : undefined
        }
        tasks[id] = newTask
        set({ tasks, todaysTasks: taskFilter(tasks) })
      },
      deleteTask: (id) => {
        const tasks = { ...get().tasks }
        delete tasks[id]
        set({ tasks, todaysTasks: taskFilter(tasks) })
      },
      toggleTaskCompletion: (id) => {
        const tasks = { ...get().tasks }
        if (tasks[id]) {
          const todayLocalStr = format(new Date(), 'yyyy-MM-dd') // Use local date string as key
          const currentStatus = tasks[id].completionHistory[todayLocalStr] || false
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const cleanedHistory = Object.entries(tasks[id].completionHistory)
            .filter(([date]) => new Date(date) >= thirtyDaysAgo)
            .reduce((acc, [date, value]) => ({ ...acc, [date]: value }), {})
          tasks[id] = {
            ...tasks[id],
            completed: !currentStatus, // This reflects completion for the local day
            completionHistory: {
              ...cleanedHistory,
              [todayLocalStr]: !currentStatus // Store completion status with local date string key
            },
            updatedAt: new Date().toISOString()
          }
          set({ tasks, todaysTasks: taskFilter(tasks) })
        }
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }
      },
      getTodaysTasks: () => get().todaysTasks
    }),
    {
      name: 'tasks-store',
      storage: createPersistStorage<ProjectStore>(),
      onRehydrateStorage: () => (state, error) => {
        if (state) {
          const tasks = state.tasks
          let needsMigration = false
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const todayLocalStr = format(new Date(), 'yyyy-MM-dd') // Use local date string
          Object.keys(tasks).forEach(id => {
            if (!tasks[id].recurrencePattern) {
              tasks[id].recurrencePattern = 'weekly' // Keep existing migration logic
              needsMigration = true
            }
            if (!tasks[id].completionHistory) {
              needsMigration = true
              tasks[id].completionHistory = {}
              if (tasks[id].completed) {
                const completionDate = new Date(tasks[id].updatedAt).toISOString().split('T')[0]
                if (new Date(completionDate) >= thirtyDaysAgo) {
                  tasks[id].completionHistory[completionDate] = true
                }
              }
            } else {
              tasks[id].completionHistory = Object.entries(tasks[id].completionHistory)
                .filter(([date]) => new Date(date) >= thirtyDaysAgo)
                .reduce((acc, [date, value]) => ({ ...acc, [date]: value }), {})
            }
            // Update completion status based on local date string
            if (tasks[id].recurrencePattern !== 'one-time') {
              tasks[id].completed = tasks[id].completionHistory[todayLocalStr] || false
            }
          })
          if (needsMigration) {
            state.tasks = tasks
          }
          state.hydrated = true
          state.todaysTasks = taskFilter(state.tasks)
        } else {
          useProjectStore.setState({ hydrated: true })
        }
      }
    }
  )
)

export const useStoreTasks = () => useProjectStore((s) => s.tasks)
export const useStoreHydrated = () => useProjectStore((s) => s.hydrated)
