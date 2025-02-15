import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { StorageUtils } from './MMKV'

export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskCategory = 'work' | 'health' | 'personal' | 'career' | 'wealth' | 'skills'
export type RecurrencePattern = 'weekly' | 'biweekly' | 'monthly' | 'yearly'
export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface Task {
  id: string
  name: string
  schedule: WeekDay[]
  time?: string
  priority: TaskPriority
  category: TaskCategory
  isOneTime: boolean
  completed: boolean // Kept for backward compatibility
  completionHistory: Record<string, boolean> // Date string -> completion status
  createdAt: string
  updatedAt: string
  scheduledDate?: string
  recurrencePattern: RecurrencePattern
  recurrenceDate?: string // For non-weekly patterns
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

// Day names for recurring tasks
const dayNames: WeekDay[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

const isTaskDue = (task: Task, date: Date): boolean => {
  if (task.isOneTime) {
    if (task.scheduledDate) {
      return new Date(task.scheduledDate).toDateString() === date.toDateString();
    }
    return new Date(task.createdAt).toDateString() === date.toDateString();
  }

  const today = dayNames[date.getDay()];
  
  switch (task.recurrencePattern) {
    case 'weekly':
      return task.schedule.includes(today);
    
    case 'biweekly': {
      if (!task.recurrenceDate) return false;
      const startDate = new Date(task.recurrenceDate);
      const weekDiff = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return weekDiff % 2 === 0 && task.schedule.includes(today);
    }
    
    case 'monthly': {
      if (!task.recurrenceDate) return false;
      const recDate = new Date(task.recurrenceDate);
      return date.getDate() === recDate.getDate();
    }
    
    case 'yearly': {
      if (!task.recurrenceDate) return false;
      const recDate = new Date(task.recurrenceDate);
      return date.getMonth() === recDate.getMonth() && 
             date.getDate() === recDate.getDate();
    }
    
    default:
      return false;
  }
};

// Memoized task filtering
const createTaskFilter = () => {
  let lastToday: string | null = null;
  let lastTasks: Record<string, Task> | null = null;
  let lastResult: Task[] | null = null;

  return (tasks: Record<string, Task>): Task[] => {
    const currentDate = new Date();
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Return cached result if nothing has changed
    if (lastToday === dateStr && lastTasks === tasks && lastResult !== null) {
      return lastResult;
    }

    // Update cache
    lastToday = dateStr;
    lastTasks = tasks;

    // Filter and sort tasks
    const filtered = Object.values(tasks).filter(task => isTaskDue(task, currentDate));

    // Remove duplicate tasks by name and scheduledDate
    const uniqueFiltered = filtered.filter((task, index, self) => 
      index === self.findIndex((t) => 
        t.name === task.name && 
        t.scheduledDate === task.scheduledDate
      )
    );

    const sorted = [...uniqueFiltered].sort((a, b) => {
      // Sort by completion status for today
      const aCompletedToday = a.completionHistory[dateStr] || false;
      const bCompletedToday = b.completionHistory[dateStr] || false;
      if (aCompletedToday !== bCompletedToday) return aCompletedToday ? 1 : -1;
      
      // Then by time
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      
      // Finally priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    lastResult = sorted;
    return sorted;
  };
};

const taskFilter = createTaskFilter();

// Custom MMKV-based storage
const mmkvStorage = {
  getItem: (name: string) => {
    const value = StorageUtils.get<string>(name)
    return value ?? null
  },
  setItem: (name: string, value: string) => {
    StorageUtils.set(name, value)
  },
  removeItem: (name: string) => {
    StorageUtils.delete(name)
  },
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      tasks: {},
      hydrated: false,
      todaysTasks: [],
      addTask: (data) => {
        const tasks = { ...get().tasks }
        
        // Check if a task with the same name and scheduledDate already exists
        const existingTask = Object.values(tasks).find(task => 
          task.name === data.name && 
          task.scheduledDate === data.scheduledDate
        );
        
        // Only add if no duplicate exists
        if (!existingTask) {
          const id = Date.now().toString()
          const newTask: Task = {
            ...data,
            id,
            completed: false,
            completionHistory: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            recurrencePattern: data.recurrencePattern || 'weekly' // Default to weekly
          }
          tasks[id] = newTask
          set({ tasks, todaysTasks: taskFilter(tasks) })
        }
      },
      deleteTask: (id) => {
        const tasks = { ...get().tasks }
        delete tasks[id]
        set({ tasks, todaysTasks: taskFilter(tasks) })
      },
      toggleTaskCompletion: (id) => {
        const tasks = { ...get().tasks }
        if (tasks[id]) {
          const today = new Date().toISOString().split('T')[0];
          const currentStatus = tasks[id].completionHistory[today] || false;
          
          // Clean up old completion history (older than 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const cleanedHistory = Object.entries(tasks[id].completionHistory)
            .filter(([date]) => new Date(date) >= thirtyDaysAgo)
            .reduce((acc, [date, value]) => ({ ...acc, [date]: value }), {});
          
          tasks[id] = {
            ...tasks[id],
            completed: !currentStatus, // Keep legacy field updated
            completionHistory: {
              ...cleanedHistory,
              [today]: !currentStatus
            },
            updatedAt: new Date().toISOString()
          }
          set({ tasks, todaysTasks: taskFilter(tasks) })
        }
      },
      getTodaysTasks: () => get().todaysTasks
    }),
    {
      name: 'tasks-store',
      storage: createJSONStorage(() => mmkvStorage),
      onRehydrateStorage: () => (state, error) => {
        if (state) {
          // Migrate existing tasks to include completionHistory if needed
          const tasks = state.tasks;
          let needsMigration = false;
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          Object.keys(tasks).forEach(id => {
            // Add recurrencePattern to existing tasks if missing
            if (!tasks[id].recurrencePattern) {
              tasks[id].recurrencePattern = 'weekly';
              needsMigration = true;
            }
            
            if (!tasks[id].completionHistory) {
              needsMigration = true;
              tasks[id].completionHistory = {};
              // If task is completed, mark it as completed on the last update date
              if (tasks[id].completed) {
                const completionDate = new Date(tasks[id].updatedAt).toISOString().split('T')[0];
                if (new Date(completionDate) >= thirtyDaysAgo) {
                  tasks[id].completionHistory[completionDate] = true;
                }
              }
            } else {
              // Clean up old completion history
              tasks[id].completionHistory = Object.entries(tasks[id].completionHistory)
                .filter(([date]) => new Date(date) >= thirtyDaysAgo)
                .reduce((acc, [date, value]) => ({ ...acc, [date]: value }), {});
            }
          });
          
          if (needsMigration) {
            state.tasks = tasks;
          }
          
          state.hydrated = true;
          state.todaysTasks = taskFilter(state.tasks);
        } else {
          useProjectStore.setState({ hydrated: true });
        }
      }      
    }
  )
)

// Optional small selectors
export const useStoreTasks = () => useProjectStore((s) => s.tasks)
export const useStoreHydrated = () => useProjectStore((s) => s.hydrated)
