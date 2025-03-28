import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as Haptics from 'expo-haptics'
import { createPersistStorage } from './AsyncStorage'
import { Platform } from 'react-native'

export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskCategory = 'work' | 'health' | 'personal' | 'family' | 'wealth'
export type RecurrencePattern = 'one-time' | 'tomorrow' | 'everyday' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface Task {
  id: string
  name: string
  schedule: WeekDay[]
  time?: string
  priority: TaskPriority
  category: TaskCategory
  completed: boolean
  completionHistory: Record<string, boolean>
  createdAt: string
  updatedAt: string
  scheduledDate?: string
  recurrencePattern: RecurrencePattern
  recurrenceDate?: string
  showInCalendar?: boolean
}

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
  const dateStr = date.toISOString().split('T')[0]
  const fallbackRecDate = task.recurrenceDate ? new Date(task.recurrenceDate) : new Date(task.createdAt)
  switch (task.recurrencePattern) {
    case 'one-time': {
      if ((task.name.includes(' vs ') || task.name.includes(' @ ')) && task.scheduledDate) {
        const gameDateStr = new Date(task.scheduledDate).toISOString().split('T')[0]
        return gameDateStr === dateStr && !task.completed
      }
      if ((task.name.includes('birthday') || task.name.includes('🎂') || task.name.includes('🎁')) && task.scheduledDate) {
        const bdayStr = new Date(task.scheduledDate).toISOString().split('T')[0]
        return bdayStr === dateStr && !task.completed
      }
      if (task.completed) {
        return task.completionHistory[dateStr] === true
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
    case 'everyday':
      return true
    case 'weekly':
      return task.schedule.includes(today)
    case 'biweekly': {
      const startDate = fallbackRecDate
      const weekDiff = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      return task.schedule.includes(today) && (weekDiff % 2 === 0)
    }
    case 'monthly': {
      const recDay = fallbackRecDate.getDate()
      return date.getDate() === recDay
    }
    case 'yearly': {
      const recMonth = fallbackRecDate.getMonth()
      const recDay = fallbackRecDate.getDate()
      return (date.getMonth() === recMonth && date.getDate() === recDay) || task.schedule.includes(today)
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
    
    // Update completion status for recurring tasks
    Object.values(tasks).forEach(task => {
      if (task.recurrencePattern !== 'one-time') {
        task.completed = task.completionHistory[dateStr] || false
      }
    })
    
    // Filter tasks that are due today
    const filtered = Object.values(tasks).filter(task => isTaskDue(task, currentDate))
    debugTaskFilter('After initial filtering', filtered)
    
    // Map to track tasks we've already included
    const includedTaskMap: Record<string, boolean> = {}
    
    // More aggressive deduplication for monthly bills
    const uniqueFiltered = filtered.filter(task => {
      // Create a unique key for each task based on identifying properties
      const taskKey = `${task.name}-${task.recurrencePattern}-${task.category}`
      
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
      const aCompletedToday = a.completionHistory[dateStr] || false
      const bCompletedToday = b.completionHistory[dateStr] || false
      if (aCompletedToday !== bCompletedToday) return aCompletedToday ? 1 : -1
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
          recurrencePattern: data.recurrencePattern || 'one-time'
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
          const today = new Date().toISOString().split('T')[0]
          const currentStatus = tasks[id].completionHistory[today] || false
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const cleanedHistory = Object.entries(tasks[id].completionHistory)
            .filter(([date]) => new Date(date) >= thirtyDaysAgo)
            .reduce((acc, [date, value]) => ({ ...acc, [date]: value }), {})
          tasks[id] = {
            ...tasks[id],
            completed: !currentStatus,
            completionHistory: {
              ...cleanedHistory,
              [today]: !currentStatus
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
          const today = new Date().toISOString().split('T')[0]
          Object.keys(tasks).forEach(id => {
            if (!tasks[id].recurrencePattern) {
              tasks[id].recurrencePattern = 'weekly'
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
            if (tasks[id].recurrencePattern !== 'one-time') {
              tasks[id].completed = tasks[id].completionHistory[today] || false
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
