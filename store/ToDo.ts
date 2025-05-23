import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as Haptics from 'expo-haptics'
import { createPersistStorage } from './AsyncStorage'
import { Platform } from 'react-native'
import { Task, WeekDay } from '@/types'
import { format } from 'date-fns'
import { generateUniqueId } from '@/utils';
import { addSyncLog } from '@/components/sync/syncUtils'


interface ProjectStore {
  tasks: Record<string, Task>
  hydrated: boolean
  todaysTasks: Task[]
  addTask: (data: Omit<Task, 'id' | 'completed' | 'completionHistory' | 'createdAt' | 'updatedAt'>) => void
  deleteTask: (id: string) => void
  toggleTaskCompletion: (id: string) => void
  updateTask: (taskId: string, updatedData: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'completionHistory'>>) => void
  getTodaysTasks: () => Task[]
  clearTasks: () => void
  recalculateTodaysTasks: () => void
  hydrateFromSync: (syncedData: {tasks?: Record<string, Task>}) => void
}

const dayNames: WeekDay[] = [
  'sunday','monday','tuesday','wednesday','thursday','friday','saturday'
]

// This is the function that determines whether a task should be shown or not
const isTaskDue = (task: Task, date: Date): boolean => {
  const today = dayNames[date.getDay()]
  const currentDateStrLocal = format(date, 'yyyy-MM-dd')
  const fallbackRecDate = task.recurrenceDate
    ? (() => { const [year, month, day] = task.recurrenceDate.split('-').map(Number); return new Date(year, month - 1, day); })()
    : new Date(task.createdAt)

  // ONE-TIME TASKS SPECIAL HANDLING
  if (task.recurrencePattern === 'one-time') {
    // If completed today, still show it (so user can untoggle if needed)
    if (task.completionHistory[currentDateStrLocal] === true) {
      return true;
    }
    
    // If completed on a previous day, hide it
    if (task.completed) {
      return false;
    }
    
    // Special handling for games
    //if ((task.name.includes(' vs ') || task.name.includes(' @ ')) && task.scheduledDate) {
      // Check user preference first
     // const gameDate = new Date(task.scheduledDate)
     // const localGameDate = new Date(gameDate.getTime() - (gameDate.getTimezoneOffset() * 60000))
    //  const localGameDateStr = format(localGameDate, 'yyyy-MM-dd')
      // Only show game if it's scheduled for today
      //const isGameDay = localGameDateStr === currentDateStrLocal;
      //return isGameDay;
    //}
    
    // Special handling for birthdays
    if ((task.name.includes('birthday') || task.name.includes('🎂') || task.name.includes('🎁')) && task.scheduledDate) {
      
      // Compare year, month, and day for birthdays
      const [bYear, bMonth, bDay] = task.scheduledDate.split('-').map(Number);
      const bdayDate = new Date(bYear, bMonth - 1, bDay);
      const isBirthdayToday = 
        date.getDate() === bdayDate.getDate() &&
        date.getMonth() === bdayDate.getMonth() &&
        date.getFullYear() === bdayDate.getFullYear();

      // Fallback: compare month and day only
      const isBirthdayTodayAlt = 
        date.getDate() === bdayDate.getDate() &&
        date.getMonth() === bdayDate.getMonth();

      const shouldShowBirthday = isBirthdayToday || isBirthdayTodayAlt;
      return shouldShowBirthday;
    }
    return true;
  }

  // RECURRING TASKS
  // If completed today, always show recurring tasks (so user can untoggle if needed)
  if (task.completionHistory[currentDateStrLocal] === true) {
    return true;
  }

  // STEP 3: Special handling for bills
  if (task.category === 'bills' && task.dueDate) {
    const isDueDate = date.getDate() === task.dueDate;
    return isDueDate;
  }

  // STEP 4: Handle different recurrence patterns
  switch (task.recurrencePattern) {
    case 'tomorrow': {
      const createdDateStr = new Date(task.createdAt).toISOString().split('T')[0]
      const yesterday = new Date(date)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      const result = createdDateStr === yesterdayStr;

      if (result === true) {
        // If the task is due today (creation date was yesterday),
        // convert it to a one-time task

        // We need to modify the task in the store, not just the local copy
        // This needs to be done asynchronously to avoid mutating during filtering
        setTimeout(() => {
          const storeUpdate = useProjectStore.getState();
          const tasks = { ...storeUpdate.tasks };

          if (tasks[task.id] && tasks[task.id].recurrencePattern === 'tomorrow') {
            tasks[task.id] = {
              ...tasks[task.id],
              recurrencePattern: 'one-time',
              updatedAt: new Date().toISOString()
            };
            storeUpdate.tasks = tasks;
            useProjectStore.setState({ tasks });
          }
        }, 0);
      }

      return result;
    }

    case 'everyday': {
      // For everyday tasks, always show
      return true;
    }

    case 'weekly': {
      // Only show weekly tasks on their scheduled days
      const isDueToday = task.schedule.includes(today);
      return isDueToday;
    }

    case 'biweekly': {
      const startDate = fallbackRecDate
      const weekDiff = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      const isDueToday = task.schedule.includes(today) && (weekDiff % 2 === 0);
      return isDueToday;
    }

    case 'monthly': {
      // Check if this is a bill (which was already handled above)
      if (task.category === 'bills') {
        return false;
      }
      
      // Compare day of the month for non-bill monthly tasks
      const recDay = fallbackRecDate.getDate();
      const isDueToday = date.getDate() === recDay;
      return isDueToday;
    }

    case 'yearly': {
      // Compare month and day
      const recMonth = fallbackRecDate.getMonth();
      const recDay = fallbackRecDate.getDate();
      const isDueToday = date.getMonth() === recMonth && date.getDate() === recDay;
      return isDueToday;
    }

    default:
      return false;
  }
}

const createTaskFilter = () => {
  let lastToday: string | null = null;
  let lastTasks: Record<string, Task> | null = null;
  let lastShowNBAGameTasks: boolean | null = null; 
  let lastResult: Task[] | null = null;

  
  return (tasks: Record<string, Task>): Task[] => {
    const currentDate = new Date();
    const dateStr = currentDate.toISOString().split('T')[0];
    const currentDateStrLocal = format(currentDate, 'yyyy-MM-dd');
    //const currentShowNBAGameTasks = useUserStore.getState().preferences.showNBAGameTasks;

    if (
      lastToday === dateStr &&
      lastTasks === tasks &&
      //lastShowNBAGameTasks === currentShowNBAGameTasks && // Check preference cache
      lastResult !== null
    ) {
      return lastResult;
    }

    lastToday = dateStr;
    lastTasks = tasks;
   // lastShowNBAGameTasks = currentShowNBAGameTasks; // Update preference cache

    // Update completion status for recurring tasks based on local date
    Object.values(tasks).forEach(task => {
      if (task.recurrencePattern !== 'one-time') {
        const newCompletedState = task.completionHistory[currentDateStrLocal] || false;
        task.completed = newCompletedState;
      }
    })
    
    // Filter tasks that are due today
    const filtered = Object.values(tasks).filter(task => {
      const isDue = isTaskDue(task, currentDate);
      return isDue;
    });
    

    // Sort tasks - completed tasks go to the bottom
    const sorted = [...filtered].sort((a, b) => {
      // First sort by completion status
      const aCompletedToday = a.completionHistory[currentDateStrLocal] || false;
      const bCompletedToday = b.completionHistory[currentDateStrLocal] || false;
      if (aCompletedToday !== bCompletedToday) {
        return aCompletedToday ? 1 : -1;  // Completed tasks go to the bottom
      }
      
      // Keep existing time/priority sorting logic
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const aPriority = priorityOrder[a.priority] ?? 99;
      const bPriority = priorityOrder[b.priority] ?? 99;
      return aPriority - bPriority;
    });
    
    lastResult = sorted;
    return sorted;
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
        const id = generateUniqueId(); // Use the new utility function
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
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const cleanedHistory = Object.entries(tasks[id].completionHistory)
            .filter(([date]) => new Date(date) >= thirtyDaysAgo)
            .reduce((acc, [date, value]) => ({ ...acc, [date]: value }), {})
          
          const newCompletionStatus = !currentStatus;
          tasks[id] = {
            ...tasks[id],
            completed: newCompletionStatus, 
            completionHistory: {
              ...cleanedHistory,
              [todayLocalStr]: newCompletionStatus 
            },
            updatedAt: new Date().toISOString()
          }
          
          const updatedTodaysTasks = taskFilter(tasks);
          // UNCOMMENT THIS TO SEE THE TASK LIST TO DEBUG CROSS PLATFORM COMPLETION HISTORY
          //addSyncLog(`Task list: ${updatedTodaysTasks.map(t => `${t.name}(${t.id.slice(-6)})`).join(', ')}`, 'info');
          set({ tasks, todaysTasks: updatedTodaysTasks });
        } else {
        }
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
        }
      },
      updateTask: (taskId, updatedData) => {
        const tasks = { ...get().tasks };
        const task = tasks[taskId];

        if (task) {
          let finalSchedule = updatedData.schedule ?? task.schedule;
          if (updatedData.recurrencePattern === 'one-time') {
            finalSchedule = []; // One-time tasks should have an empty schedule array
          }

          const updatedTask: Task = {
            ...task, // Spread existing task data
            ...updatedData, // Spread updated data (overwrites existing fields)
            schedule: finalSchedule, // Apply potentially modified schedule
            updatedAt: new Date().toISOString(), // Update the timestamp
            // Ensure read-only/managed fields are preserved correctly
            id: task.id, // Keep original ID
            createdAt: task.createdAt, // Keep original creation date
            // Preserve existing completion status and history unless explicitly part of updatedData
            // (which is unlikely based on the Omit in the function signature)
            completed: task.completed,
            completionHistory: task.completionHistory || {}, // Ensure history is an object
          };

          tasks[taskId] = updatedTask; // Update the task in the tasks object
          // Recalculate todaysTasks after updating
          const updatedTodaysTasks = taskFilter(tasks);

          set({ tasks, todaysTasks: updatedTodaysTasks }); // Update state
        } else {
        }
      },
      getTodaysTasks: () => get().todaysTasks,
      clearTasks: () => {
        set({ tasks: {}, todaysTasks: [] }) // Reset tasks and todaysTasks
      },
      recalculateTodaysTasks: () => {
        const { tasks } = get();
        const before = Object.keys(tasks).length;
        const todaysTasks = taskFilter(tasks);
        const after = todaysTasks.length;
        addSyncLog(`[Tasks] recalc: ${before} ➜ ${after}`, 'info');
        set({ todaysTasks });
      },
      
      hydrateFromSync: (syncedData?: { tasks?: Record<string, Task> }) => {
        if (!syncedData?.tasks) {
          addSyncLog('[Tasks] No tasks field – skip', 'warning');
          return;
        }
      
        const incoming = syncedData.tasks as Record<string, Task>;
        const existing = get().tasks;
        const merged: Record<string, Task> = {};
        
        // Counters for surgical logging
        let addedCount = 0;
        let mergedCount = 0;
        let keptLocalCount = 0;
        let billTasksProcessed = 0;
        let importantMerges: string[] = [];
      
        // Process incoming tasks
        Object.entries(incoming).forEach(([id, inc]) => {
          const curr = existing[id];
          const isBillTask = inc.name.includes('($') || inc.name.toLowerCase().includes('pay ');
      
          if (!curr) {
            // Only log non-bill additions or first few bill tasks
            if (!isBillTask || addedCount < 2) {
              addSyncLog(`[Tasks] +${inc.name}`, 'verbose');
            }
            if (isBillTask) billTasksProcessed++;
            merged[id] = inc;
            addedCount++;
            return;
          }
      
          // Merge logic - FIX THE COMPLETION RESOLUTION
          const mergedHistory: Record<string, boolean> = { ...curr.completionHistory, ...inc.completionHistory };
          
          const today = format(new Date(), 'yyyy-MM-dd');
          const resolvedCompleted = inc.recurrencePattern === 'one-time'
            ? (curr.completed || inc.completed) // Preserve ANY completion for one-time tasks
            : !!(mergedHistory[today] || curr.completed); // For recurring, check today's history OR current completion
          
          // Add focused completion tracking log
          if (curr.completed !== inc.completed || curr.completed !== resolvedCompleted) {
            addSyncLog(`[Completion] ${inc.name.slice(0, 20)}: local=${curr.completed} sync=${inc.completed} final=${resolvedCompleted}`, 'info');
          }
          
          merged[id] = { 
            ...inc, 
            completionHistory: mergedHistory, 
            completed: resolvedCompleted,
            updatedAt: curr.updatedAt > inc.updatedAt ? curr.updatedAt : inc.updatedAt // Keep latest timestamp
          };
          mergedCount++;
        });
      
        // Preserve any local-only tasks that aren't in incoming
        Object.entries(existing).forEach(([id, task]) => {
          if (!incoming[id]) {
            merged[id] = task;
            keptLocalCount++;
          }
        });
      
        set({ tasks: merged, hydrated: true });
      
        // Summary log instead of thousands of individual ones
        if (billTasksProcessed > 10) {
          addSyncLog(`[Tasks] Processed ${billTasksProcessed} bill tasks (showing first 2 + last 2 only)`, 'info');
        }
        
        if (importantMerges.length > 0) {
          addSyncLog(`[Tasks] Key merges: ${importantMerges.slice(0, 3).join(', ')}${importantMerges.length > 3 ? '...' : ''}`, 'info');
        }
      
        setTimeout(() => {
          const final = taskFilter(get().tasks);
          set({ todaysTasks: final });
          addSyncLog(`[Tasks] hydrate done → ${Object.keys(merged).length} total, ${final.length} today`, 'info');
          addSyncLog(`[Tasks] Stats: +${addedCount} new, ~${mergedCount} merged, ${keptLocalCount} kept local`, 'info');
        }, 0);
      },    
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
          const todayLocalStr = format(new Date(), 'yyyy-MM-dd')
          addSyncLog(`Total tasks in storage before migration: ${Object.keys(tasks).length}`, 'info');
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
              const oldHistorySize = Object.keys(tasks[id].completionHistory).length;
              tasks[id].completionHistory = Object.entries(tasks[id].completionHistory)
                .filter(([date]) => new Date(date) >= thirtyDaysAgo)
                .reduce((acc, [date, value]) => ({ ...acc, [date]: value }), {})
              const newHistorySize = Object.keys(tasks[id].completionHistory).length;
            
              if (oldHistorySize !== newHistorySize) {
                addSyncLog(`Cleaned completion history for task ${id}, removed ${oldHistorySize - newHistorySize} old entries`, 'info');
              }
            }
            
            // Update completion status based on local date string
            if (tasks[id].recurrencePattern !== 'one-time') {
              const oldCompletedState = tasks[id].completed;
              tasks[id].completed = tasks[id].completionHistory[todayLocalStr] || false;

              if (oldCompletedState !== tasks[id].completed) {
                addSyncLog(`Updated completion status for task ${id} from ${oldCompletedState} to ${tasks[id].completed}`, 'info');
              }
            } else {
              // For one-time tasks, preserve their completed status
              // Don't reset based on today's date - they stay completed once completed
              // The completion date is stored in completionHistory for reference
            }
          })
          
          if (needsMigration) {
            state.tasks = tasks
          }
          addSyncLog(`Rehydrated tasks store after migration`, 'info', useStoreTasks().length.toString());
          state.hydrated = true
          const todaysTasks = taskFilter(state.tasks)
          state.todaysTasks = todaysTasks
        } else {
          useProjectStore.setState({ hydrated: true })
          addSyncLog(`Rehydrated tasks store`, 'info', useStoreTasks().length.toString());
        }
      }
    }
  )
)

export const useStoreTasks = () => useProjectStore((s) => s.tasks)
export const useStoreHydrated = () => useProjectStore((s) => s.hydrated)
