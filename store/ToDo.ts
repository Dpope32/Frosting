import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createPersistStorage } from './AsyncStorage'

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

const dayNames: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

const isTaskDue = (task: Task, date: Date): boolean => {
  const today = dayNames[date.getDay()];
  switch (task.recurrencePattern) {
    case 'one-time':
      // Check if this is an NBA game (contains team names with vs or @)
      if ((task.name.includes(' vs ') || task.name.includes(' @ ')) && task.scheduledDate) {
        // Only show NBA games on their scheduled date
        const gameDate = new Date(task.scheduledDate);
        const gameDateStr = gameDate.toISOString().split('T')[0];
        const currentDateStr = date.toISOString().split('T')[0];
        return gameDateStr === currentDateStr && !task.completed;
      }
      
      // Check if this is a birthday reminder
      if ((task.name.includes('birthday') || task.name.includes('🎂') || task.name.includes('🎁')) && task.scheduledDate) {
        // Only show birthday reminders on their scheduled date
        const birthdayDate = new Date(task.scheduledDate);
        const birthdayDateStr = birthdayDate.toISOString().split('T')[0];
        const currentDateStr = date.toISOString().split('T')[0];
        return birthdayDateStr === currentDateStr && !task.completed;
      }
      
      // Other one-time tasks should remain visible until completed
      return !task.completed;
    case 'tomorrow': {
      // Check if the task was created today
      const createdDate = new Date(task.createdAt);
      const createdStr = createdDate.toISOString().split('T')[0];
      const currentDateStr = date.toISOString().split('T')[0];
      
      // If the task was created yesterday, it should be visible today
      const yesterday = new Date(date);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      return createdStr === yesterdayStr;
    }
    case 'everyday':
      return true; // Everyday tasks are always due
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
      return date.getMonth() === recDate.getMonth() && date.getDate() === recDate.getDate();
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
        const existingTask = Object.values(tasks).find(task => 
          task.name === data.name && 
          task.scheduledDate === data.scheduledDate
        );
        
        if (!existingTask) {
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
