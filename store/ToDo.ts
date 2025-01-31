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
  updateTask: (id: string, updateData: Partial<Omit<Task, 'id' | 'createdAt'>>) => void
  getTodaysTasks: () => Task[]
}

const dayNames: WeekDay[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

const createTaskFilter = () => {
  let lastToday: string | null = null;
  let lastTasks: Record<string, Task> | null = null;
  let lastResult: Task[] | null = null;
  return (tasks: Record<string, Task>): Task[] => {
    const today = dayNames[new Date().getDay()];
    if (lastToday === today && lastTasks === tasks && lastResult !== null) {
      return lastResult;
    }
    lastToday = today;
    lastTasks = tasks;
    const filtered = Object.values(tasks).filter(task => {
      if (!task.isOneTime) {
        return task.schedule.includes(today);
      }
      if (task.completed) {
        return false;
      }
      const taskDate = new Date(task.createdAt).toDateString();
      const currentDate = new Date().toDateString();
      return taskDate === currentDate;
    });
    const sorted = [...filtered].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      if (a.time && b.time) return a.time.localeCompare(b.time)
      if (a.time) return -1
      if (b.time) return 1
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    });
    lastResult = sorted;
    return sorted;
  };
};

const taskFilter = createTaskFilter();

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
        const id = Date.now().toString()
        const newTask: Task = {
          ...data,
          id,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
          tasks[id] = {
            ...tasks[id],
            completed: !tasks[id].completed,
            updatedAt: new Date().toISOString(),
          }
          set({ tasks, todaysTasks: taskFilter(tasks) })
        }
      },
      updateTask: (id, updateData) => {
        const tasks = { ...get().tasks }
        if (tasks[id]) {
          tasks[id] = {
            ...tasks[id],
            ...updateData,
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
          if (Object.keys(state.tasks).length === 0) {
            const now = new Date().toISOString();
            state.tasks['default-sunday'] = {
              id: 'default-sunday',
              name: 'Pray',
              schedule: ['sunday'],
              priority: 'medium',
              category: 'personal',
              isOneTime: false,
              completed: false,
              createdAt: now,
              updatedAt: now,
            }
            state.tasks['default-monday'] = {
              id: 'default-monday',
              name: 'Meeting with boss',
              schedule: ['monday'],
              priority: 'medium',
              category: 'work',
              isOneTime: false,
              completed: false,
              createdAt: now,
              updatedAt: now,
            }
            state.tasks['default-tuesday'] = {
              id: 'default-tuesday',
              name: 'Clean computer screens',
              schedule: ['tuesday'],
              priority: 'medium',
              category: 'personal',
              isOneTime: false,
              completed: false,
              createdAt: now,
              updatedAt: now,
            }
            state.tasks['default-wednesday'] = {
              id: 'default-wednesday',
              name: 'Visit grandparents',
              schedule: ['wednesday'],
              priority: 'medium',
              category: 'personal',
              isOneTime: false,
              completed: false,
              createdAt: now,
              updatedAt: now,
            }
            state.tasks['default-thursday'] = {
              id: 'default-thursday',
              name: 'Read',
              schedule: ['thursday'],
              priority: 'medium',
              category: 'personal',
              isOneTime: false,
              completed: false,
              createdAt: now,
              updatedAt: now,
            }
            state.tasks['default-friday'] = {
              id: 'default-friday',
              name: 'Push code to production',
              schedule: ['friday'],
              priority: 'medium',
              category: 'work',
              isOneTime: false,
              completed: false,
              createdAt: now,
              updatedAt: now,
            }
            state.tasks['default-saturday'] = {
              id: 'default-saturday',
              name: 'Mod Lua Scripts',
              schedule: ['saturday'],
              priority: 'medium',
              category: 'work',
              isOneTime: false,
              completed: false,
              createdAt: now,
              updatedAt: now,
            }
          }
          state.hydrated = true
          state.todaysTasks = taskFilter(state.tasks)
        }
      },
    }
  )
)

export const useStoreTasks = () => useProjectStore((s) => s.tasks)
export const useStoreHydrated = () => useProjectStore((s) => s.hydrated)
