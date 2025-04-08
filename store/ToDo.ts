import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as Haptics from 'expo-haptics'
import { createPersistStorage } from './AsyncStorage'
import { Platform } from 'react-native'
import { Task, WeekDay, RecurrencePattern } from '@/types/task'
import { format } from 'date-fns'

// Enable debugging
const DEBUG = true;

function log(...args: any[]) {
  if (DEBUG) {
    console.log('[TaskStore]', ...args);
  }
}

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
}

const dayNames: WeekDay[] = [
  'sunday','monday','tuesday','wednesday','thursday','friday','saturday'
]

// This is the function that determines whether a task should be shown or not
const isTaskDue = (task: Task, date: Date): boolean => {
  const today = dayNames[date.getDay()]
  const currentDateStrLocal = format(date, 'yyyy-MM-dd')
  const fallbackRecDate = task.recurrenceDate ? new Date(task.recurrenceDate) : new Date(task.createdAt)
  
  // Debug specific tasks
  const shouldDebug = DEBUG && (task.name.includes("Thunder") || task.name.includes("Journal"))
  
  if (shouldDebug) {
    log("isTaskDue checking task:", task.id, task.name, task.recurrencePattern);
    log("- currentDateStrLocal:", currentDateStrLocal);
    log("- completionHistory:", JSON.stringify(task.completionHistory));
    log("- task.completed:", task.completed);
    if (task.scheduledDate) log("- scheduledDate:", task.scheduledDate);
  }
  
  // STEP 1: If completed today, always show it regardless of task type
  if (task.completionHistory[currentDateStrLocal] === true) {
    if (shouldDebug) log("- task was completed today, showing it");
    return true;
  }
  
  // STEP 2: Special handling for games and events (Basketball games, etc.)
  // Check if this is a game or event (special one-time task with scheduledDate)
  if ((task.name.includes(' vs ') || task.name.includes(' @ ')) && task.scheduledDate) {
    const gameDate = new Date(task.scheduledDate)
    const localGameDate = new Date(gameDate.getTime() - (gameDate.getTimezoneOffset() * 60000))
    const localGameDateStr = format(localGameDate, 'yyyy-MM-dd')
    
    // Only show game if it's scheduled for today and not completed
    const isGameDay = localGameDateStr === currentDateStrLocal && !task.completed
    
    if (shouldDebug) {
      log("- game check:");
      log("  - localGameDateStr:", localGameDateStr);
      log("  - currentDateStrLocal:", currentDateStrLocal);
      log("  - isGameDay:", isGameDay);
    }
    
    return isGameDay;
  }
  
  // STEP 3: Special handling for bills
  if (task.category === 'bills' && task.dueDate) {
    const isDueDate = date.getDate() === task.dueDate;
    if (shouldDebug) log("- bills check, isDueDate:", isDueDate);
    // Only show bills that are due today and not completed
    return isDueDate && !task.completed;
  }
  
  // STEP 4: Handle different recurrence patterns
  switch (task.recurrencePattern) {
    case 'one-time': {
      // Special handling for birthdays
      if ((task.name.includes('birthday') || task.name.includes('🎂') || task.name.includes('🎁')) && task.scheduledDate) {
        const bdayDateLocal = new Date(task.scheduledDate)
        const bdayStrLocal = format(bdayDateLocal, 'yyyy-MM-dd')
        const isBirthdayToday = bdayStrLocal === currentDateStrLocal && !task.completed;
        if (shouldDebug) log("- birthday check, isBirthdayToday:", isBirthdayToday);
        return isBirthdayToday;
      }
      
      // For regular one-time tasks, show if not completed
      const result = !task.completed;
      if (shouldDebug) log("- one-time regular task, showing:", result);
      return result;
    }
    
    case 'tomorrow': {
      const createdDateStr = new Date(task.createdAt).toISOString().split('T')[0]
      const yesterday = new Date(date)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      const result = createdDateStr === yesterdayStr && !task.completed;
      if (shouldDebug) log("- tomorrow check, result:", result);
      return result;
    }
    
    case 'everyday': {
      // For everyday tasks, show if not completed today
      if (shouldDebug) log("- everyday task, not completed yet today");
      return true;
    }
    
    case 'weekly': {
      // Only show weekly tasks on their scheduled days if not completed
      const isDueToday = task.schedule.includes(today);
      if (shouldDebug) {
        log("- weekly check:");
        log("  - schedule:", task.schedule);
        log("  - today:", today);
        log("  - isDueToday:", isDueToday);
      }
      return isDueToday;
    }
    
    case 'biweekly': {
      const startDate = fallbackRecDate
      const weekDiff = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      const isDueToday = task.schedule.includes(today) && (weekDiff % 2 === 0);
      if (shouldDebug) log("- biweekly check, isDueToday:", isDueToday);
      return isDueToday;
    }
    
    case 'monthly': {
      // Skip bills in monthly recurrence since we handle them separately
      if (task.category === 'bills') {
        if (shouldDebug) log("- monthly bills, skipping");
        return false;
      }
      const recDay = fallbackRecDate.getDate()
      const isDueToday = date.getDate() === recDay;
      if (shouldDebug) log("- monthly check, isDueToday:", isDueToday);
      return isDueToday;
    }
    
    case 'yearly': {
      const recMonth = fallbackRecDate.getMonth()
      const recDay = fallbackRecDate.getDate()
      const isDueToday = date.getMonth() === recMonth && date.getDate() === recDay;
      if (shouldDebug) log("- yearly check, isDueToday:", isDueToday);
      return isDueToday;
    }
    
    default:
      if (shouldDebug) log("- no matching recurrence pattern, returning false");
      return false;
  }
}

const createTaskFilter = () => {
  let lastToday: string | null = null
  let lastTasks: Record<string, Task> | null = null
  let lastResult: Task[] | null = null
  
  // Debug function for monitoring task filtering
  const debugTaskFilter = (stage: string, tasks: Task[]) => {
    if (!DEBUG) return;

    log(`Task filter stage: ${stage}`);
    log(`- tasks count: ${tasks.length}`);
    
    const monthlyCounts: Record<string, number> = {}
    
    tasks.forEach(task => {
      if (task.recurrencePattern === 'monthly') {
        const key = `${task.name}-${task.id}`
        monthlyCounts[key] = (monthlyCounts[key] || 0) + 1
      }
    })
    
    if (Object.keys(monthlyCounts).length > 0) {
      log("- monthly tasks counts:", monthlyCounts);
    }
  }
  
  return (tasks: Record<string, Task>): Task[] => {
    const currentDate = new Date()
    const dateStr = currentDate.toISOString().split('T')[0]
    const currentDateStrLocal = format(currentDate, 'yyyy-MM-dd')
    
    if (DEBUG) {
      log("========== RUNNING TASK FILTER ==========");
      log("- currentDateStrLocal:", currentDateStrLocal);
      log("- total tasks:", Object.keys(tasks).length);
    }
    
    if (lastToday === dateStr && lastTasks === tasks && lastResult !== null) {
      if (DEBUG) log("- returning cached result:", lastResult.length, "tasks");
      return lastResult
    }
    
    lastToday = dateStr
    lastTasks = tasks
    
    // Update completion status for recurring tasks based on local date
    Object.values(tasks).forEach(task => {
      if (task.recurrencePattern !== 'one-time') {
        const newCompletedState = task.completionHistory[currentDateStrLocal] || false;
        if (DEBUG && task.completed !== newCompletedState) {
          log(`Updating completion state for ${task.name} from ${task.completed} to ${newCompletedState}`);
        }
        task.completed = newCompletedState;
      }
    })
    
    // Filter tasks that are due today
    const filtered = Object.values(tasks).filter(task => {
      const isDue = isTaskDue(task, currentDate);
      if (DEBUG && (task.name.includes("Test") || task.name.includes("Pay"))) {
        log(`Final filter result for task ${task.name} (${task.id}): ${isDue}`);
      }
      return isDue;
    });
    
    debugTaskFilter('After initial filtering', filtered);
    
    // Map to track tasks we've already included
    const includedTaskMap: Record<string, boolean> = {}
    
    // More aggressive deduplication for monthly bills (using local date context if needed)
    const uniqueFiltered = filtered.filter(task => {
      // Create a unique key for each task based on identifying properties
      const taskKey = `${task.name}-${task.recurrencePattern}-${task.category}`;
      
      // If we've already seen this task, skip it
      if (includedTaskMap[taskKey]) {
        if (DEBUG) log(`- Removing duplicate: ${task.name} (${task.id})`);
        return false;
      }
      
      // Mark this task as included
      includedTaskMap[taskKey] = true;
      return true;
    });
    
    debugTaskFilter('After deduplication', uniqueFiltered);
    
    // Sort tasks - completed tasks go to the bottom
    const sorted = [...uniqueFiltered].sort((a, b) => {
      // First sort by completion status
      const aCompletedToday = a.completionHistory[currentDateStrLocal] || false;
      const bCompletedToday = b.completionHistory[currentDateStrLocal] || false;
      
      if (DEBUG && (a.name.includes("Test") || a.name.includes("Pay") || b.name.includes("Test") || b.name.includes("Pay"))) {
        log(`Sorting: ${a.name} (completed: ${aCompletedToday}) vs ${b.name} (completed: ${bCompletedToday})`);
      }
      
      if (aCompletedToday !== bCompletedToday) {
        return aCompletedToday ? 1 : -1;  // Completed tasks go to the bottom
      }
      
      // Keep existing time/priority sorting logic
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    if (DEBUG) {
      log("Final sorted task list:");
      sorted.forEach((task, index) => {
        const completedToday = task.completionHistory[currentDateStrLocal] || false;
        log(`${index + 1}. ${task.name} (${task.id}) - completed: ${completedToday}`);
      });
    }
    
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
        if (DEBUG) log(`Deleting task ${id}: ${tasks[id]?.name}`);
        delete tasks[id]
        set({ tasks, todaysTasks: taskFilter(tasks) })
      },
      toggleTaskCompletion: (id) => {
        if (DEBUG) log(`========== TOGGLING TASK COMPLETION: ${id} ==========`);
        
        const tasks = { ...get().tasks }
        if (tasks[id]) {
          const todayLocalStr = format(new Date(), 'yyyy-MM-dd')
          const currentStatus = tasks[id].completionHistory[todayLocalStr] || false
          
          if (DEBUG) {
            log(`Task: ${tasks[id].name} (${id})`);
            log(`Recurrence pattern: ${tasks[id].recurrencePattern}`);
            log(`Current completion status: ${currentStatus}`);
            log(`Current completionHistory:`, tasks[id].completionHistory);
          }
          
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const cleanedHistory = Object.entries(tasks[id].completionHistory)
            .filter(([date]) => new Date(date) >= thirtyDaysAgo)
            .reduce((acc, [date, value]) => ({ ...acc, [date]: value }), {})
          
          const newCompletionStatus = !currentStatus;
          tasks[id] = {
            ...tasks[id],
            completed: newCompletionStatus, // This reflects completion for the local day
            completionHistory: {
              ...cleanedHistory,
              [todayLocalStr]: newCompletionStatus // Store completion status with local date string key
            },
            updatedAt: new Date().toISOString()
          }
          
          if (DEBUG) {
            log(`New completion status: ${newCompletionStatus}`);
            log(`New completionHistory:`, tasks[id].completionHistory);
          }
          
          // Apply task filter to get updated list
          const updatedTodaysTasks = taskFilter(tasks);
          
          if (DEBUG) {
            log(`Task list after toggle - count: ${updatedTodaysTasks.length}`);
            log(`Task list IDs:`, updatedTodaysTasks.map(t => t.id));
            log(`Is our toggled task in the list? ${updatedTodaysTasks.some(t => t.id === id)}`);
          }
          
          set({ tasks, todaysTasks: updatedTodaysTasks });
        } else {
          if (DEBUG) log(`Task ${id} not found!`);
        }
        
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }
      },
      updateTask: (taskId, updatedData) => {
        if (DEBUG) log(`========== UPDATING TASK: ${taskId} ==========`);
        const tasks = { ...get().tasks };
        const task = tasks[taskId];

        if (task) {
          if (DEBUG) {
            log(`Original task data:`, task);
            log(`Update data received:`, updatedData);
          }

          // Ensure schedule is handled correctly based on recurrence pattern
          let finalSchedule = updatedData.schedule ?? task.schedule;
          if (updatedData.recurrencePattern === 'one-time') {
            finalSchedule = []; // One-time tasks should have an empty schedule array
            if (DEBUG) log(`Setting schedule to [] for one-time task.`);
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

          if (DEBUG) log(`Updated task data:`, updatedTask);

          // Recalculate todaysTasks after updating
          const updatedTodaysTasks = taskFilter(tasks);
          if (DEBUG) log(`Task list after update - count: ${updatedTodaysTasks.length}`);

          set({ tasks, todaysTasks: updatedTodaysTasks }); // Update state
        } else {
          if (DEBUG) log(`Task ${taskId} not found for update!`);
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
        if (DEBUG) log("Rehydrating store");
        
        if (state) {
          const tasks = state.tasks
          let needsMigration = false
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const todayLocalStr = format(new Date(), 'yyyy-MM-dd') // Use local date string
          
          if (DEBUG) log(`Total tasks in storage: ${Object.keys(tasks).length}`);
          
          Object.keys(tasks).forEach(id => {
            if (!tasks[id].recurrencePattern) {
              tasks[id].recurrencePattern = 'weekly' // Keep existing migration logic
              needsMigration = true
              if (DEBUG) log(`Migrated task ${id} to have recurrencePattern: weekly`);
            }
            
            if (!tasks[id].completionHistory) {
              needsMigration = true
              tasks[id].completionHistory = {}
              if (tasks[id].completed) {
                const completionDate = new Date(tasks[id].updatedAt).toISOString().split('T')[0]
                if (new Date(completionDate) >= thirtyDaysAgo) {
                  tasks[id].completionHistory[completionDate] = true
                  if (DEBUG) log(`Migrated task ${id} completion to history for date ${completionDate}`);
                }
              }
            } else {
              const oldHistorySize = Object.keys(tasks[id].completionHistory).length;
              tasks[id].completionHistory = Object.entries(tasks[id].completionHistory)
                .filter(([date]) => new Date(date) >= thirtyDaysAgo)
                .reduce((acc, [date, value]) => ({ ...acc, [date]: value }), {})
              const newHistorySize = Object.keys(tasks[id].completionHistory).length;
              
              if (oldHistorySize !== newHistorySize && DEBUG) {
                log(`Cleaned completion history for task ${id}, removed ${oldHistorySize - newHistorySize} old entries`);
              }
            }
            
            // Update completion status based on local date string
            if (tasks[id].recurrencePattern !== 'one-time') {
              const oldCompletedState = tasks[id].completed;
              tasks[id].completed = tasks[id].completionHistory[todayLocalStr] || false;
              
              if (oldCompletedState !== tasks[id].completed && DEBUG) {
                log(`Updated completion status for task ${id} from ${oldCompletedState} to ${tasks[id].completed}`);
              }
            }
          })
          
          if (needsMigration) {
            if (DEBUG) log("Migrations were applied to tasks data");
            state.tasks = tasks
          }
          
          state.hydrated = true
          
          // Update todaysTasks using the filter
          const todaysTasks = taskFilter(state.tasks)
          if (DEBUG) log(`After rehydration, found ${todaysTasks.length} tasks for today`);
          state.todaysTasks = todaysTasks
        } else {
          if (DEBUG) log("No state found during rehydration or error occurred");
          if (error) log("Rehydration error:", error);
          useProjectStore.setState({ hydrated: true })
        }
      }
    }
  )
)

export const useStoreTasks = () => useProjectStore((s) => s.tasks)
export const useStoreHydrated = () => useProjectStore((s) => s.hydrated)