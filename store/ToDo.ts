import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StorageUtils } from './MMKV';

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'work' | 'health' | 'personal' | 'career' | 'wealth' | 'skills';
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Task {
  id: string;
  name: string;
  schedule: WeekDay[];
  time?: string;
  priority: TaskPriority;
  category: TaskCategory;
  isOneTime: boolean;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  scheduledDate?: string;
}

interface ProjectStore {
  tasks: Record<string, Task>;
  hydrated: boolean;
  todaysTasks: Task[];
  addTask: (data: Omit<Task, 'id' | 'completed' | 'createdAt' | 'updatedAt'>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  updateTask: (id: string, updateData: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  getTodaysTasks: () => Task[];
  findDuplicateTask: (taskName: string, date: string) => Task | undefined;
}

const dayNames: WeekDay[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const isSameDay = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

// Helper to normalize task names
const normalizeTaskName = (name: string): string => {
  return name
    .replace('Thunder home', 'Thunder vs ')
    .replace('Thunder vsPhoenix', 'Thunder vs Phoenix')
    .replace('Thunder @ ', 'Thunder @');
};

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
      if (!task.scheduledDate) return false;
      
      return isSameDay(task.scheduledDate, new Date().toISOString());
    });

    const sorted = [...filtered].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    lastResult = sorted;
    console.log('Today\'s tasks:', sorted);
    return sorted;
  };
};

const taskFilter = createTaskFilter();

const mmkvStorage = {
  getItem: (name: string) => {
    const value = StorageUtils.get<string>(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    StorageUtils.set(name, value);
  },
  removeItem: (name: string) => {
    StorageUtils.delete(name);
  },
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      tasks: {},
      hydrated: false,
      todaysTasks: [],
      findDuplicateTask: (taskName: string, date: string) => {
        const tasks = Object.values(get().tasks);
        const normalizedName = normalizeTaskName(taskName);
        return tasks.find(task => 
          (normalizeTaskName(task.name) === normalizedName) && 
          task.scheduledDate && 
          isSameDay(task.scheduledDate, date)
        );
      },
      addTask: (data) => {
        const tasks = { ...get().tasks };
        
        // Check for duplicates before adding
        if (data.isOneTime && data.scheduledDate) {
          const duplicate = get().findDuplicateTask(data.name, data.scheduledDate);
          if (duplicate) {
            // If duplicate exists, just update it if needed
            if (data.time && duplicate.time !== data.time) {
              get().updateTask(duplicate.id, { time: data.time });
            }
            // Update the name to the new format if needed
            if (duplicate.name !== data.name) {
              get().updateTask(duplicate.id, { name: data.name });
            }
            return;
          }
        }

        const id = Date.now().toString();
        const newTask: Task = {
          ...data,
          id,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        tasks[id] = newTask;
        set({ tasks, todaysTasks: taskFilter(tasks) });
      },
      deleteTask: (id) => {
        const tasks = { ...get().tasks };
        delete tasks[id];
        set({ tasks, todaysTasks: taskFilter(tasks) });
      },
      toggleTaskCompletion: (id) => {
        const tasks = { ...get().tasks };
        if (tasks[id]) {
          tasks[id] = {
            ...tasks[id],
            completed: !tasks[id].completed,
            updatedAt: new Date().toISOString(),
          };
          set({ tasks, todaysTasks: taskFilter(tasks) });
        }
      },
      updateTask: (id, updateData) => {
        const tasks = { ...get().tasks };
        if (tasks[id]) {
          tasks[id] = {
            ...tasks[id],
            ...updateData,
            updatedAt: new Date().toISOString(),
          };
          set({ tasks, todaysTasks: taskFilter(tasks) });
        }
      },
      getTodaysTasks: () => get().todaysTasks,
    }),
    {
      name: 'tasks-store',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

export const useStoreTasks = () => useProjectStore((s) => s.tasks);
export const useStoreHydrated = () => useProjectStore((s) => s.hydrated);