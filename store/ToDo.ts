import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as Haptics from 'expo-haptics'
import { createPersistStorage } from './AsyncStorage'
import { Platform } from 'react-native'

export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskCategory = 'work' | 'health' | 'personal' | 'family' | 'wealth'
export type RecurrencePattern =  'one-time'| 'tomorrow' | 'everyday' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'
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
];

const isTaskDue = (task: Task, date: Date): boolean => {
  const today = dayNames[date.getDay()];
  const dateStr = date.toISOString().split('T')[0];

  // For monthly/yearly tasks that rely on `recurrenceDate` but it’s missing,
  // fallback to creation date so you’re never short-circuited by `return false`.
  const fallbackRecDate = task.recurrenceDate
    ? new Date(task.recurrenceDate)
    : new Date(task.createdAt);

  switch (task.recurrencePattern) {

    case 'one-time': {
      // Special NBA game check
      if ((task.name.includes(' vs ') || task.name.includes(' @ ')) && task.scheduledDate) {
        const gameDateStr = new Date(task.scheduledDate).toISOString().split('T')[0];
        return gameDateStr === dateStr && !task.completed;
      }
      // Special birthday check
      if ((task.name.includes('birthday') || task.name.includes('🎂') || task.name.includes('🎁'))
          && task.scheduledDate) {
        const bdayStr = new Date(task.scheduledDate).toISOString().split('T')[0];
        return bdayStr === dateStr && !task.completed;
      }
      // Generic one-time tasks
      if (task.completed) {
        return task.completionHistory[dateStr] === true;
      }
      return true;
    }

    case 'tomorrow': {
      // Visible exactly the day after creation
      const createdDateStr = new Date(task.createdAt).toISOString().split('T')[0];
      const yesterday = new Date(date);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      return createdDateStr === yesterdayStr;
    }

    case 'everyday':
      // Always appears
      return true;

    case 'weekly':
      // Must match today's weekday
      return task.schedule.includes(today);

    case 'biweekly': {
      // Must match weekday plus be every-other week from recurrenceDate
      const startDate = fallbackRecDate;
      const weekDiff = Math.floor(
        (date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      return task.schedule.includes(today) && (weekDiff % 2 === 0);
    }

    case 'monthly': {
      // Show if today’s weekday is in schedule OR it’s the same day-of-month as recurrenceDate
      // That allows “every 26th” OR “every Wednesday,” depending on which is relevant to you.
      const recDay = fallbackRecDate.getDate();
      return (
        task.schedule.includes(today) ||
        (date.getDate() === recDay)
      );
    }

    case 'yearly': {
      // Show if month/day match recurrenceDate OR if we also want to allow schedule-based day-of-week
      const recMonth = fallbackRecDate.getMonth();
      const recDay = fallbackRecDate.getDate();
      return (
        (date.getMonth() === recMonth && date.getDate() === recDay) ||
        task.schedule.includes(today)
      );
    }

    default:
      return false;
  }
};


const createTaskFilter = () => {
  let lastToday: string | null = null;
  let lastTasks: Record<string, Task> | null = null;
  let lastResult: Task[] | null = null;

  return (tasks: Record<string, Task>): Task[] => {
    const currentDate = new Date();
    const dateStr = currentDate.toISOString().split('T')[0];
    
    if (lastToday === dateStr && lastTasks === tasks && lastResult !== null) {
      return lastResult;
    }

    lastToday = dateStr;
    lastTasks = tasks;

    // Reset completed status for recurring tasks at the start of a new day
    Object.values(tasks).forEach(task => {
      if (task.recurrencePattern !== 'one-time') {
        // Only update the completed property based on today's completion status
        // This ensures recurring tasks start as uncompleted each day
        task.completed = task.completionHistory[dateStr] || false;
      }
    });

    const filtered = Object.values(tasks).filter(task => isTaskDue(task, currentDate));

    const uniqueFiltered = filtered.filter((task, index, self) => 
      index === self.findIndex((t) => 
        t.name === task.name && 
        t.scheduledDate === task.scheduledDate
      )
    );

    const sorted = [...uniqueFiltered].sort((a, b) => {
      const aCompletedToday = a.completionHistory[dateStr] || false;
      const bCompletedToday = b.completionHistory[dateStr] || false;
      if (aCompletedToday !== bCompletedToday) return aCompletedToday ? 1 : -1;
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    lastResult = sorted;
    return sorted;
  };
};

const taskFilter = createTaskFilter();

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
          const today = new Date().toISOString().split('T')[0];
          const currentStatus = tasks[id].completionHistory[today] || false;
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const cleanedHistory = Object.entries(tasks[id].completionHistory)
            .filter(([date]) => new Date(date) >= thirtyDaysAgo)
            .reduce((acc, [date, value]) => ({ ...acc, [date]: value }), {});
          
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
        // Only trigger haptic feedback on native platforms
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
          const tasks = state.tasks;
          let needsMigration = false;
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const today = new Date().toISOString().split('T')[0];
          
          Object.keys(tasks).forEach(id => {
            if (!tasks[id].recurrencePattern) {
              tasks[id].recurrencePattern = 'weekly';
              needsMigration = true;
            }
            
            if (!tasks[id].completionHistory) {
              needsMigration = true;
              tasks[id].completionHistory = {};
              if (tasks[id].completed) {
                const completionDate = new Date(tasks[id].updatedAt).toISOString().split('T')[0];
                if (new Date(completionDate) >= thirtyDaysAgo) {
                  tasks[id].completionHistory[completionDate] = true;
                }
              }
            } else {
              tasks[id].completionHistory = Object.entries(tasks[id].completionHistory)
                .filter(([date]) => new Date(date) >= thirtyDaysAgo)
                .reduce((acc, [date, value]) => ({ ...acc, [date]: value }), {});
            }
            
            // For recurring tasks, reset completed status based on today's completion
            if (tasks[id].recurrencePattern !== 'one-time') {
              // Only mark as completed if it was completed today
              tasks[id].completed = tasks[id].completionHistory[today] || false;
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

export const useStoreTasks = () => useProjectStore((s) => s.tasks)
export const useStoreHydrated = () => useProjectStore((s) => s.hydrated)
