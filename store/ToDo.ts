import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { StorageUtils } from './MMKV'

export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskCategory = 'work' | 'health' | 'personal' | 'career' | 'wealth' | 'skills'
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
  completed: boolean
  createdAt: string
  updatedAt: string
}

interface ProjectStore {
  tasks: Record<string, Task>
  hydrated: boolean
  todaysTasks: Task[]
  addTask: (data: Omit<Task, 'id' | 'completed' | 'createdAt' | 'updatedAt'>) => void
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

// Memoized task filtering
const createTaskFilter = () => {
  let lastToday: string | null = null;
  let lastTasks: Record<string, Task> | null = null;
  let lastResult: Task[] | null = null;

  return (tasks: Record<string, Task>): Task[] => {
    const today = dayNames[new Date().getDay()];
    
    // Return cached result if nothing has changed
    if (lastToday === today && lastTasks === tasks && lastResult !== null) {
      return lastResult;
    }

    // Update cache
    lastToday = today;
    lastTasks = tasks;

    // Filter and sort tasks
    const filtered = Object.values(tasks).filter(task => 
      task.isOneTime || task.schedule.includes(today)
    );

    const sorted = [...filtered].sort((a, b) => {
      // Incomplete first
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      // Then by time
      if (a.time && b.time) return a.time.localeCompare(b.time)
      if (a.time) return -1
      if (b.time) return 1
      // Finally priority
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    });

    lastResult = sorted;
    return sorted;
  };
};

const taskFilter = createTaskFilter();

// Custom MMKV-based storage
const mmkvStorage = {
  getItem: async (name: string) => {
    const value = StorageUtils.get<string>(name)
    return value ?? null
  },
  setItem: async (name: string, value: string) => {
    StorageUtils.set(name, value)
  },
  removeItem: async (name: string) => {
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
        const id = Date.now().toString()

        const newTask: Task = {
          ...data,
          id,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        tasks[id] = newTask
        console.time('addTask');
        set({ tasks, todaysTasks: taskFilter(tasks) })
        console.timeEnd('addTask');
      },

      deleteTask: (id) => {
        const tasks = { ...get().tasks }
        delete tasks[id]
        set({ tasks, todaysTasks: taskFilter(tasks) })
      },

      toggleTaskCompletion: (id) => {
        const tasks = { ...get().tasks }
        if (tasks[id]) {
          tasks[id] = {
            ...tasks[id],
            completed: !tasks[id].completed,
            updatedAt: new Date().toISOString(),
          }
          set({ tasks, todaysTasks: taskFilter(tasks) })
        }
      },

      getTodaysTasks: () => get().todaysTasks,
    }),
    {
      name: 'tasks-store',
      storage: createJSONStorage(() => mmkvStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true
          state.todaysTasks = taskFilter(state.tasks)
        }
      },
    }
  )
)

// Optional small selectors
export const useStoreTasks = () => useProjectStore((s) => s.tasks)
export const useStoreHydrated = () => useProjectStore((s) => s.hydrated)
