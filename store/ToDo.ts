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
  clearTasks: () => void
}

const dayNames: WeekDay[] = [
  'sunday','monday','tuesday','wednesday','thursday','friday','saturday'
]

const isTaskDue = (task: Task, date: Date): boolean => {
  const today = dayNames[date.getDay()];
  const currentDateStrLocal = format(date, 'yyyy-MM-dd');
  const fallbackRecDate = task.recurrenceDate ? new Date(task.recurrenceDate) : new Date(task.createdAt);
  
  // Special handling for bills
  if (task.category === 'bills' && task.dueDate) {
    const isDueDate = date.getDate() === task.dueDate;
    return isDueDate;
  }
  
  // Check if this task was interacted with today
  const hasInteractionToday = currentDateStrLocal in task.completionHistory;
  
  switch (task.recurrencePattern) {
    case 'one-time': {
      // Special handling for NBA games
      if ((task.name.includes(' vs ') || task.name.includes(' @ ')) && task.scheduledDate) {
        try {
          const gameDate = new Date(task.scheduledDate);
          const gameDateStr = format(gameDate, 'yyyy-MM-dd');
          
          // Show NBA games only if they're scheduled for today OR were interacted with today
          return gameDateStr === currentDateStrLocal || hasInteractionToday;
        } catch (error) {
          console.error("Error parsing game date:", error);
          return false;
        }
      }
      
      // For other one-time tasks
      if (hasInteractionToday) {
        return true;
      }
      
      if (task.scheduledDate || task.recurrenceDate) {
        const dateStr = task.scheduledDate || task.recurrenceDate;
        try {
          if (dateStr) {
            const taskDate = new Date(dateStr);
            const taskDateStr = format(taskDate, 'yyyy-MM-dd');
            return taskDateStr === currentDateStrLocal;
          }
        } catch (error) {
          console.error("Error parsing task date:", error);
        }
      }
      
      // For tasks created today without a date
      const createdDate = new Date(task.createdAt);
      const createdDateStr = format(createdDate, 'yyyy-MM-dd');
      return createdDateStr === currentDateStrLocal;
    }
    
    // Rest of the cases remain the same...
    case 'tomorrow': {
      const createdDateStr = format(new Date(task.createdAt), 'yyyy-MM-dd');
      const yesterday = new Date(date);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
      return createdDateStr === yesterdayStr;
    }
    
    case 'everyday': {
      return true;
    }
    
    case 'weekly': {
      return task.schedule.includes(today);
    }
    
    case 'biweekly': {
      const startDate = fallbackRecDate;
      const weekDiff = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return task.schedule.includes(today) && (weekDiff % 2 === 0);
    }
    
    case 'monthly': {
      if (task.category === 'bills') return false;
      const recDay = fallbackRecDate.getDate();
      return date.getDate() === recDay;
    }
    
    case 'yearly': {
      const recMonth = fallbackRecDate.getMonth();
      const recDay = fallbackRecDate.getDate();
      return (date.getMonth() === recMonth && date.getDate() === recDay);
    }
    
    default:
      return false;
  }
};


export const debugTasks = () => {
  const store = useProjectStore.getState()
  const tasks = store.tasks
  const currentDate = new Date()
  const currentDateStrLocal = format(currentDate, 'yyyy-MM-dd')
  
  // Log all NBA games specifically
  const nbaGames = Object.values(tasks).filter(task => 
    (task.name.includes(' vs ') || task.name.includes(' @ ')) &&
    task.recurrencePattern === 'one-time'
  )
  
  console.log("NBA Games:", nbaGames.map(game => ({
    id: game.id,
    name: game.name,
    scheduledDate: game.scheduledDate,
    localScheduledDate: game.scheduledDate ? format(new Date(game.scheduledDate), 'yyyy-MM-dd') : null,
    completed: game.completed,
    completionHistory: game.completionHistory,
    isScheduledForToday: game.scheduledDate ? 
      format(new Date(game.scheduledDate), 'yyyy-MM-dd') === currentDateStrLocal : false
  })))
  
  // Log today's tasks after filtering
  console.log("Today's tasks:", store.todaysTasks.map(task => ({
    id: task.id,
    name: task.name,
    recurrencePattern: task.recurrencePattern,
    completed: task.completed,
    completedToday: task.completionHistory[currentDateStrLocal] === true
  })))
  
  return { nbaGames, todaysTasks: store.todaysTasks }
}


const taskFilter = (tasks: Record<string, Task>): Task[] => {
  const currentDate = new Date();
  const currentDateStrLocal = format(currentDate, 'yyyy-MM-dd');
  const currentDay = currentDate.getDate();
  
  // Create a map to store unique bills by name
  const uniqueBills = new Map();
  
  // Get tasks due today, handling bills specially
  const filteredTasks = Object.values(tasks).filter(task => {
    // For bills, deduplicate by name and only show if due today
    if (task.category === 'bills') {
      if (task.dueDate === currentDay) {
        // If we haven't seen this bill name yet, keep it
        if (!uniqueBills.has(task.name)) {
          uniqueBills.set(task.name, task);
          return true;
        }
        // Otherwise, it's a duplicate bill, filter it out
        return false;
      }
      // Not due today
      return false;
    }
    
    // For non-bill tasks, use regular filtering
    return isTaskDue(task, currentDate) || currentDateStrLocal in task.completionHistory;
  });
  
  // Sort the tasks (completed at bottom)
  return filteredTasks.sort((a, b) => {
    const aCompletedToday = a.completionHistory[currentDateStrLocal] || false;
    const bCompletedToday = b.completionHistory[currentDateStrLocal] || false;
    if (aCompletedToday !== bCompletedToday) return aCompletedToday ? 1 : -1;
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};


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
          const todayLocalStr = format(new Date(), 'yyyy-MM-dd')
          const currentStatus = tasks[id].completionHistory[todayLocalStr] || false
          
          // For debugging
          console.log('Toggle task:', tasks[id].name)
          console.log('Current completion status:', currentStatus)
          console.log('Today local date string:', todayLocalStr)
          
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
              [todayLocalStr]: !currentStatus
            },
            updatedAt: new Date().toISOString()
          }
          
          // For debugging
          console.log('New completion status:', !currentStatus)
          console.log('Updated task:', tasks[id])
          
          set({ 
            tasks, 
            todaysTasks: taskFilter(tasks) 
          })
          
          // For debugging
          console.log('Today\'s tasks after toggle:', taskFilter(tasks).map(t => ({
            name: t.name,
            completed: t.completed,
            completionHistory: t.completionHistory
          })))
        }
        
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }
      },
      getTodaysTasks: () => get().todaysTasks,
      clearTasks: () => {
        set({ tasks: {}, todaysTasks: [] }) // Reset tasks and todaysTasks
      }
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
