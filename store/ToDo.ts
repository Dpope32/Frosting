import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as Haptics from 'expo-haptics'
import { createPersistStorage } from './AsyncStorage'
import { Platform } from 'react-native'
import { Task, WeekDay } from '@/types'
import { format } from 'date-fns'
import { generateUniqueId } from '@/utils';
import { addSyncLog } from '@/components/sync/syncUtils'
import { useUserStore, useRegistryStore } from '@/store'

// Enable debugging
const DEBUG = false;

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

  // Debug specific tasks
  const shouldDebug = DEBUG && (task.name.includes("Thunder") || task.name.includes("Journal"))

  if (shouldDebug) {
    log("isTaskDue checking task:", task.id, task.name, task.recurrencePattern);
    log("- currentDateStrLocal:", currentDateStrLocal);
    log("- completionHistory:", JSON.stringify(task.completionHistory));
    log("- task.completed:", task.completed);
    if (task.scheduledDate) log("- scheduledDate:", task.scheduledDate);
  }
  
  // ONE-TIME TASKS SPECIAL HANDLING
  if (task.recurrencePattern === 'one-time') {
    // If completed today, still show it (so user can untoggle if needed)
    if (task.completionHistory[currentDateStrLocal] === true) {
      if (shouldDebug) log("- one-time task completed today, showing it");
      return true;
    }
    
    // If completed on a previous day, hide it
    if (task.completed) {
      if (shouldDebug) log("- one-time task completed on a previous day, hiding it");
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
      
      //if (shouldDebug) {
      //  log("- game check:");
      //  log("  - localGameDateStr:", localGameDateStr);
      //  log("  - currentDateStrLocal:", currentDateStrLocal);
      //  log("  - isGameDay:", isGameDay);
      //}
      
      //return isGameDay;
    //}
    
    // Special handling for birthdays
    if ((task.name.includes('birthday') || task.name.includes('🎂') || task.name.includes('🎁')) && task.scheduledDate) {
      // Enable debug for all birthday tasks to troubleshoot issues
      const birthdayDebug = DEBUG && task.name.includes('birthday');
      
      if (birthdayDebug) {
        log("- birthday task detected:", task.name);
        log("- scheduledDate:", task.scheduledDate);
      }
      
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

      if (birthdayDebug) {
        log("- birthday check:");
        log("  - task scheduledDate:", task.scheduledDate);
        log("  - bdayDate:", bdayDate);
        log("  - currentDate:", date);
        log("  - isBirthdayToday (Y/M/D):", isBirthdayToday);
        log("  - isBirthdayTodayAlt (M/D):", isBirthdayTodayAlt);
        log("  - final result:", shouldShowBirthday);
      }

      return shouldShowBirthday;
    }

    // For regular one-time tasks, show if not completed
    if (shouldDebug) log("- one-time regular task, not completed, showing it");
    return true;
  }

  // RECURRING TASKS
  // If completed today, always show recurring tasks (so user can untoggle if needed)
  if (task.completionHistory[currentDateStrLocal] === true) {
    if (shouldDebug) log("- recurring task completed today, showing it");
    return true;
  }

  // STEP 3: Special handling for bills
  if (task.category === 'bills' && task.dueDate) {
    const isDueDate = date.getDate() === task.dueDate;
    if (shouldDebug) log("- bills check, isDueDate:", isDueDate);
    // Only show bills that are due today and not completed
    if (shouldDebug) log(`- bills check result for ${task.name}: ${isDueDate}`);
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
        if (shouldDebug) log(`- tomorrow task ${task.id} due today, converting to one-time`);

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

            if (DEBUG) log(`- converted tomorrow task ${task.id} to one-time`);
            storeUpdate.tasks = tasks;
            useProjectStore.setState({ tasks });
          }
        }, 0);
      }

      if (shouldDebug) log("- tomorrow check, result:", result);
      return result;
    }

    case 'everyday': {
      // For everyday tasks, always show
      if (shouldDebug) log("- everyday task, showing it");
      return true;
    }

    case 'weekly': {
      // Only show weekly tasks on their scheduled days
      const isDueToday = task.schedule.includes(today);
      if (shouldDebug) {
        log("- weekly check:");
        log("  - schedule:", task.schedule);
        log("  - today:", today);
        log("  - isDueToday:", isDueToday);
      }
      if (shouldDebug) log(`- weekly check result for ${task.name}: ${isDueToday}`);
      return isDueToday;
    }

    case 'biweekly': {
      const startDate = fallbackRecDate
      const weekDiff = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      const isDueToday = task.schedule.includes(today) && (weekDiff % 2 === 0);
      if (shouldDebug) log("- biweekly check, isDueToday:", isDueToday);
      if (shouldDebug) log(`- biweekly check result for ${task.name}: ${isDueToday}`);
      return isDueToday;
    }

    case 'monthly': {
      // Check if this is a bill (which was already handled above)
      if (task.category === 'bills') {
        if (shouldDebug) log("- monthly bills already handled earlier, skipping");
        return false;
      }
      
      // Compare day of the month for non-bill monthly tasks
      const recDay = fallbackRecDate.getDate();
      const isDueToday = date.getDate() === recDay;
      if (shouldDebug) log(`- monthly check result for ${task.name}: ${isDueToday} (today: ${date.getDate()}, recDay: ${recDay})`);
      return isDueToday;
    }

    case 'yearly': {
      // Compare month and day
      const recMonth = fallbackRecDate.getMonth();
      const recDay = fallbackRecDate.getDate();
      const isDueToday = date.getMonth() === recMonth && date.getDate() === recDay;
      if (shouldDebug) log(`- yearly check result for ${task.name}: ${isDueToday} (today: ${date.getMonth()+1}/${date.getDate()}, recDate: ${recMonth+1}/${recDay})`);
      return isDueToday;
    }

    default:
      if (shouldDebug) log("- no matching recurrence pattern, returning false");
      return false;
  }
}

const createTaskFilter = () => {
  let lastToday: string | null = null;
  let lastTasks: Record<string, Task> | null = null;
  let lastShowNBAGameTasks: boolean | null = null; // Add preference to cache key
  let lastResult: Task[] | null = null;

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
    const currentDate = new Date();
    const dateStr = currentDate.toISOString().split('T')[0];
    const currentDateStrLocal = format(currentDate, 'yyyy-MM-dd');
    //const currentShowNBAGameTasks = useUserStore.getState().preferences.showNBAGameTasks;

    if (DEBUG) {
      log("========== RUNNING TASK FILTER ==========");
      log("- currentDateStrLocal:", currentDateStrLocal);
      log("- total tasks:", Object.keys(tasks).length);
     // log("- currentShowNBAGameTasks:", currentShowNBAGameTasks); // Log preference state
    }

    // Check cache, including the preference state
    if (
      lastToday === dateStr &&
      lastTasks === tasks &&
      //lastShowNBAGameTasks === currentShowNBAGameTasks && // Check preference cache
      lastResult !== null
    ) {
      if (DEBUG) log("- returning cached result:", lastResult.length, "tasks");
      return lastResult;
    }

    lastToday = dateStr;
    lastTasks = tasks;
   // lastShowNBAGameTasks = currentShowNBAGameTasks; // Update preference cache

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
      if (DEBUG && (task.name.includes("birthday") || task.name.includes("🎂") || task.name.includes("🎁"))) {
        log(`Final filter result for task ${task.name} (${task.id}): ${isDue} - ${task.recurrencePattern} - ${task.schedule} - ${task.dueDate}`);
      }
      if (DEBUG && (task.name.includes("Test") || task.name.includes("Pay"))) {
        log(`Final filter result for task ${task.name} (${task.id}): ${isDue}`);
      }
      return isDue;
    });
    
    debugTaskFilter('After initial filtering', filtered);
    
    debugTaskFilter('After initial filtering', filtered);

    // Sort tasks - completed tasks go to the bottom
    const sorted = [...filtered].sort((a, b) => {
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
      const aPriority = priorityOrder[a.priority] ?? 99;
      const bPriority = priorityOrder[b.priority] ?? 99;
      return aPriority - bPriority;
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
    (set, get) => ({ // Added 'get' to access state within actions
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
        
        // SYNC INTEGRATION - Add sync functionality for premium users
        const isPremium = useUserStore.getState().preferences.premium === true;
        if (isPremium) {
          // Use setTimeout to not block the UI update
          setTimeout(async () => {
            try {
              // Set sync status to syncing for UI feedback
              useRegistryStore.getState().setSyncStatus('syncing');
              addSyncLog(`🔄 Syncing new task: ${newTask.name}`, 'info');
              
              // Import sync modules dynamically to avoid circular dependencies
              const { pushSnapshot } = await import('@/sync/snapshotPushPull.js');
              const { exportEncryptedState } = await import('@/sync/exportState.js');
              
              // Get all store states
              const allStates = useRegistryStore.getState().getAllStoreStates();
              
              // Export encrypted state
              await exportEncryptedState(allStates);
              
              // Push snapshot
              await pushSnapshot();
              
              // Update sync status to idle
              useRegistryStore.getState().setSyncStatus('idle');
              addSyncLog(`✅ New task synced: ${newTask.name}`, 'success');
            } catch (error) {
              useRegistryStore.getState().setSyncStatus('error');
              addSyncLog(
                `❌ Failed to sync new task: ${newTask.name}`,
                'error',
                error instanceof Error ? error.message : String(error)
              );
            }
          }, 100);
        }
      },
      deleteTask: (id) => {
        const tasks = { ...get().tasks }
        const taskName = tasks[id]?.name || 'Unknown';
        if (DEBUG) log(`Deleting task ${id}: ${taskName}`);
        delete tasks[id]
        set({ tasks, todaysTasks: taskFilter(tasks) })
        
        // SYNC INTEGRATION - Add sync functionality for premium users
        const isPremium = useUserStore.getState().preferences.premium === true;
        if (isPremium) {
          // Use setTimeout to not block the UI update
          setTimeout(async () => {
            try {
              // Set sync status to syncing for UI feedback
              useRegistryStore.getState().setSyncStatus('syncing');
              addSyncLog(`🔄 Syncing task deletion: ${taskName}`, 'info');
              
              // Import sync modules dynamically to avoid circular dependencies
              const { pushSnapshot } = await import('@/sync/snapshotPushPull.js');
              const { exportEncryptedState } = await import('@/sync/exportState.js');
              
              // Get all store states
              const allStates = useRegistryStore.getState().getAllStoreStates();
              
              // Export encrypted state
              await exportEncryptedState(allStates);
              
              // Push snapshot
              await pushSnapshot();
              
              // Update sync status to idle
              useRegistryStore.getState().setSyncStatus('idle');
              addSyncLog(`✅ Task deletion synced: ${taskName}`, 'success');
            } catch (error) {
              useRegistryStore.getState().setSyncStatus('error');
              addSyncLog(
                `❌ Failed to sync task deletion: ${taskName}`,
                'error',
                error instanceof Error ? error.message : String(error)
              );
            }
          }, 100);
        }
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
            
            // Check for duplicates with the same name
            const duplicates = Object.values(tasks).filter(t => t.name === tasks[id].name);
            if (duplicates.length > 1) {
              log(`⚠️ FOUND ${duplicates.length} TASKS WITH THE SAME NAME: "${tasks[id].name}"`);
              duplicates.forEach((dupe, i) => {
                log(`Duplicate #${i+1}: ID=${dupe.id}, Completed=${dupe.completionHistory[todayLocalStr] || false}`);
              });
            }
          }
          
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
          
          if (DEBUG) {
            log(`New completion status: ${newCompletionStatus}`);
            log(`New completionHistory:`, tasks[id].completionHistory);
          }
          
          const updatedTodaysTasks = taskFilter(tasks);
          
          if (DEBUG) {
            log(`Task list after toggle - count: ${updatedTodaysTasks.length}`);
            log(`Task list IDs:`, updatedTodaysTasks.map(t => t.id));
            log(`Is our toggled task in the list? ${updatedTodaysTasks.some(t => t.id === id)}`);
          }
          
          set({ tasks, todaysTasks: updatedTodaysTasks });
          
          // SYNC INTEGRATION - Add sync functionality for premium users
          const isPremium = useUserStore.getState().preferences.premium === true;
          if (isPremium) {
            setTimeout(async () => {
              try {
                useRegistryStore.getState().setSyncStatus('syncing');
                addSyncLog(`🔄 Syncing task toggle: ${tasks[id].name}`, 'info');
                
                // Fix: Import from the correct module path
                const { pushSnapshot } = await import('@/sync/snapshotPushPull.js');
                const { exportEncryptedState } = await import('@/sync/exportState.js');
                
                // Get all store states
                const allStates = useRegistryStore.getState().getAllStoreStates();
                
                // Export encrypted state and push snapshot
                await exportEncryptedState(allStates);
                await pushSnapshot();
                
                useRegistryStore.getState().setSyncStatus('idle');
                addSyncLog(`✅ Task toggle synced: ${tasks[id].name}`, 'success');
              } catch (error) {
                useRegistryStore.getState().setSyncStatus('error');
                addSyncLog(
                  `❌ Failed to sync task toggle: ${tasks[id].name}`,
                  'error',
                  error instanceof Error ? error.message : String(error)
                );
              }
            }, 100);
          }
        } else {
          if (DEBUG) log(`Task ${id} not found!`);
        }
        
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
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
            completed: task.completed,
            completionHistory: task.completionHistory || {}, // Ensure history is an object
          };

          tasks[taskId] = updatedTask; // Update the task in the tasks object

          if (DEBUG) log(`Updated task data:`, updatedTask);

          // Recalculate todaysTasks after updating
          const updatedTodaysTasks = taskFilter(tasks);
          if (DEBUG) log(`Task list after update - count: ${updatedTodaysTasks.length}`);

          set({ tasks, todaysTasks: updatedTodaysTasks }); // Update state
          
          // SYNC INTEGRATION - Add sync functionality for premium users
          const isPremium = useUserStore.getState().preferences.premium === true;
          if (isPremium) {
            // Use setTimeout to not block the UI update
            setTimeout(async () => {
              try {
                // Set sync status to syncing for UI feedback
                useRegistryStore.getState().setSyncStatus('syncing');
                addSyncLog(`🔄 Syncing task update: ${updatedTask.name}`, 'info');
                
                // Import sync modules dynamically to avoid circular dependencies
                const { pushSnapshot } = await import('@/sync/snapshotPushPull.js');
                const { exportEncryptedState } = await import('@/sync/exportState.js');
                
                // Get all store states
                const allStates = useRegistryStore.getState().getAllStoreStates();
                
                // Export encrypted state
                await exportEncryptedState(allStates);
                
                // Push snapshot
                await pushSnapshot();
                
                // Update sync status to idle
                useRegistryStore.getState().setSyncStatus('idle');
                addSyncLog(`✅ Task update synced: ${updatedTask.name}`, 'success');
              } catch (error) {
                useRegistryStore.getState().setSyncStatus('error');
                addSyncLog(
                  `❌ Failed to sync task update: ${updatedTask.name}`,
                  'error',
                  error instanceof Error ? error.message : String(error)
                );
              }
            }, 100);
          }
        } else {
          if (DEBUG) log(`Task ${taskId} not found for update!`);
        }
      },
      getTodaysTasks: () => get().todaysTasks,
      clearTasks: () => {
        set({ tasks: {}, todaysTasks: [] }) // Reset tasks and todaysTasks
      },
      recalculateTodaysTasks: () => { // Implement recalculation function
        const tasks = get().tasks;
        const filteredTasks = taskFilter(tasks);
        if (DEBUG) log("Recalculating todaysTasks due to preference change. New count:", filteredTasks.length);
        set({ todaysTasks: filteredTasks });
      },
      hydrateFromSync: (syncedData) => {
        if (DEBUG) log('========== HYDRATING TASKS FROM SYNC ==========');
        
        if (!syncedData || !syncedData.tasks) {
          if (DEBUG) log('No tasks data to hydrate from sync');
          return;
        }
        
        if (DEBUG) {
          log(`Received ${Object.keys(syncedData.tasks).length} tasks from sync`);
          log('First few tasks:', Object.values(syncedData.tasks).slice(0, 3).map(t => t.name));
        }
        
        // Complete replacement of tasks
        const newState = {
          tasks: { ...syncedData.tasks },
          hydrated: true,
          // Recalculate today's tasks based on the new tasks
        };
        
        // Apply the new state
        set(newState);
        
        // Recalculate today's tasks after state update
        setTimeout(() => {
          const tasks = get().tasks;
          const updatedTodaysTasks = taskFilter(tasks);
          set({ todaysTasks: updatedTodaysTasks });
          
          if (DEBUG) {
            log(`Hydration complete. Updated today's tasks: ${updatedTodaysTasks.length}`);
          }
        }, 0);
      },
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
              addSyncLog(`Migrated task ${id} to have recurrencePattern: weekly`, 'info');
            }
            
            if (!tasks[id].completionHistory) {
              needsMigration = true
              tasks[id].completionHistory = {}
              if (tasks[id].completed) {
                const completionDate = new Date(tasks[id].updatedAt).toISOString().split('T')[0]
                if (new Date(completionDate) >= thirtyDaysAgo) {
                  tasks[id].completionHistory[completionDate] = true
                  addSyncLog(`Migrated task ${id} completion to history for date ${completionDate}`, 'info');
                }
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
          addSyncLog(`Rehydrated tasks store`, 'info');
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
