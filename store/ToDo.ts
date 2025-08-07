import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createPersistStorage } from './AsyncStorage'
import { Platform, InteractionManager } from 'react-native'
import { Task, WeekDay } from '@/types'
import { format } from 'date-fns'
import { generateUniqueId } from '@/utils';
import { addSyncLog } from '@/components/sync/syncUtils'
import { useUserStore } from '@/store/UserStore'
import { dayNames, getLocalDateString } from '@/services/tasks/taskHelpers'

let debug = false;


interface ProjectStore {
  tasks: Record<string, Task>
  hydrated: boolean
  todaysTasks: Task[]
  addTask: (data: Omit<Task, 'id' | 'completed' | 'completionHistory' | 'createdAt' | 'updatedAt'>) => void
  deleteTask: (id: string) => void
  toggleTaskCompletion: (id: string, options?: { silent?: boolean }) => void
  updateTask: (taskId: string, updatedData: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'completionHistory'>>) => void
  getTodaysTasks: () => Task[]
  clearTasks: () => void
  recalculateTodaysTasks: () => void
  hydrateFromSync: (syncedData: {tasks?: Record<string, Task>}) => void
  debugSyncState: () => void;
}

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
    
    // Check if completed on ANY previous day by looking at completion history
    const hasBeenCompleted = Object.entries(task.completionHistory || {}).some(([date, completed]) => {
      return completed === true && date !== currentDateStrLocal;
    });
    
    if (hasBeenCompleted) {
      return false;
    }
    
    // Special handling for birthdays
    if ((task.name.includes('birthday') || task.name.includes('🎂') || task.name.includes('🎁')) && task.scheduledDate) {
      const [bYear, bMonth, bDay] = task.scheduledDate.split('-').map(Number);
      const bdayDate = new Date(bYear, bMonth - 1, bDay);
      const isBirthdayToday = 
        date.getDate() === bdayDate.getDate() &&
        date.getMonth() === bdayDate.getMonth() &&
        date.getFullYear() === bdayDate.getFullYear();

      const isBirthdayTodayAlt = 
        date.getDate() === bdayDate.getDate() &&
        date.getMonth() === bdayDate.getMonth();

      const shouldShowBirthday = isBirthdayToday || isBirthdayTodayAlt;
      return shouldShowBirthday;
    }
    
    // Only show uncompleted one-time tasks
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
      // FIX: Use local timezone for both creation date and yesterday calculation
      const createdDateStr = getLocalDateString(task.createdAt);
      const yesterday = new Date(date);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
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
            const newTimestamp = new Date().toISOString();
            tasks[task.id] = {
              ...tasks[task.id],
              recurrencePattern: 'one-time',
              updatedAt: newTimestamp
            };
            storeUpdate.tasks = tasks;
            useProjectStore.setState({ tasks });

            if (debug) {
              addSyncLog(
                `[CONVERSION COMPLETE] "${task.name.slice(0, 25)}" is now one-time`,
                'success',
                `Task will now behave as one-time task. Completion will be permanent. Updated at: ${newTimestamp}`
              );
            }
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
  let lastResult: Task[] | null = null;

  return (tasks: Record<string, Task>): Task[] => {
    const currentDate = new Date();
    const dateStr = currentDate.toISOString().split('T')[0];
    const currentDateStrLocal = format(currentDate, 'yyyy-MM-dd');

    // Only cache if same day AND same tasks reference
    if (
      lastToday === dateStr &&
      lastTasks === tasks &&
      lastResult !== null
    ) {
      return lastResult;
    }

    lastToday = dateStr;
    lastTasks = tasks;

    // CRITICAL FIX: Update completion status in the actual store, not just the filtered view
    const completionUpdates: string[] = [];
    const completionConflicts: string[] = [];
    let tasksNeedUpdate = false;
    const updatedTasks: Record<string, Task> = {};

    // Check each task and update completion status if needed
    Object.entries(tasks).forEach(([id, task]) => {
      if (task.recurrencePattern !== 'one-time') {
        const newCompletedState = task.completionHistory[currentDateStrLocal] === true;
        const oldCompletedState = task.completed;
        
        if (newCompletedState !== oldCompletedState) {
          completionUpdates.push(`${task.name.slice(0, 20)}: ${oldCompletedState}→${newCompletedState}`);
          tasksNeedUpdate = true;
          
          // Update the task in our copy
          updatedTasks[id] = {
            ...task,
            completed: newCompletedState
          };
        } else {
          // No change needed, keep original
          updatedTasks[id] = task;
        }
        
        // Check for potential completion conflicts
        if (task.completed !== newCompletedState && task.completionHistory[currentDateStrLocal] !== undefined) {
          completionConflicts.push(`${task.name.slice(0, 20)}: stored=${task.completed} vs history=${newCompletedState}`);
        }
        if (completionUpdates.length > 0) {
          if (debug) {
            addSyncLog(`[COMPLETION SYNC] Updated ${completionUpdates.length} task completion states`, 'info');
          }
        }

      } else {
        // For one-time tasks, log if there's a completion history entry for today but completed is false
        const historyToday = task.completionHistory[currentDateStrLocal];
        if (historyToday && !task.completed) {
          addSyncLog(
            `[One-time Conflict] "${task.name.slice(0, 20)}": completed=${task.completed} but history[${currentDateStrLocal}]=${historyToday}`,
            'warning',
            `This suggests a sync issue with one-time task completion. Task ID: ${task.id.slice(-8)}`
          );
        }
        // Keep one-time tasks as-is
        updatedTasks[id] = task;
      }
    });

    // CRITICAL: If tasks need updates, persist them back to the store
    if (tasksNeedUpdate) {
              // Use setTimeout to avoid updating during the filter operation
        setTimeout(() => {
          const currentState = useProjectStore.getState();
          // More robust check - update if our changes are still relevant
          if (Object.keys(currentState.tasks).length === Object.keys(updatedTasks).length) {
            useProjectStore.setState({ tasks: updatedTasks });
            if (debug) {
              addSyncLog(`[COMPLETION SYNC] Updated ${completionUpdates.length} task completion states`, 'info');
            }
          }
        }, 0);
    }
    
    // Log completion conflicts only if they exist
    if (completionConflicts.length > 0) {
      if (debug) {
        addSyncLog(
          `[FILTER COMPLETION CONFLICTS] ${completionConflicts.length} tasks have conflicting completion states`,
          'warning',
          completionConflicts.slice(0, 3).join(', ') + (completionConflicts.length > 3 ? '...' : '')
        );
      }
    }
    
    // Filter tasks that are due today using the updated tasks
    const filtered = Object.values(updatedTasks).filter(task => {
      return isTaskDue(task, currentDate);
    });
    
    // Sort tasks - completed tasks go to the bottom
    const sorted = [...filtered].sort((a, b) => {
      const aCompletedToday = a.completionHistory[currentDateStrLocal] || false;
      const bCompletedToday = b.completionHistory[currentDateStrLocal] || false;
      if (aCompletedToday !== bCompletedToday) {
        return aCompletedToday ? 1 : -1;
      }
      
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

// Debounced, idle-time snapshot push to avoid blocking UI interactions
let scheduledPushTimer: ReturnType<typeof setTimeout> | null = null;
const scheduleSnapshotPush = () => {
  if (!useUserStore.getState().preferences.premium) return;
  if (scheduledPushTimer) {
    clearTimeout(scheduledPushTimer);
  }
  // Wait for user to pause interactions, then push during idle time
  scheduledPushTimer = setTimeout(() => {
    const runPush = async () => {
      try {
        const { pushSnapshot } = await import('@/sync/snapshotPushPull');
        await pushSnapshot();
      } catch (err) {
        // Swallow errors here; sync logs/Sentry handle details inside pushSnapshot
      }
    };
    if (Platform.OS !== 'web') {
      InteractionManager.runAfterInteractions(() => {
        // Small delay to ensure animations/haptics complete
        setTimeout(runPush, 150);
      });
    } else if (typeof (globalThis as any).requestIdleCallback === 'function') {
      (globalThis as any).requestIdleCallback(() => runPush());
    } else {
      setTimeout(runPush, 0);
    }
  }, 1500); // debounce multiple rapid toggles into a single push
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({ 
      tasks: {},
      hydrated: false,
      todaysTasks: [],
      addTask: (data) => {
        const tasks = { ...get().tasks }
        const id = generateUniqueId();
        
        // FIX: Use local timezone instead of UTC
        const now = new Date();
        const localISOString = format(now, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
        
        const newTask: Task = {
          ...data,
          id,
          completed: false,
          completionHistory: {},
          createdAt: localISOString, // Use local timezone
          updatedAt: localISOString, // Use local timezone
          recurrencePattern: data.recurrencePattern || (data.category === 'bills' ? 'monthly' : 'one-time'),
          dueDate: data.category === 'bills' ? data.dueDate : undefined
        }
        tasks[id] = newTask
        set({ tasks, todaysTasks: taskFilter(tasks) })
      },
      deleteTask: (id) => {
        const tasks = { ...get().tasks }
        const existed = !!tasks[id];
        delete tasks[id]
        set({ tasks, todaysTasks: taskFilter(tasks) })
      },
      toggleTaskCompletion: (id, _options) => {
        // Completed tasks still display until midnight, then custom logic makes it not display the next day 
        // if it is one-time. Otherwise, it follows the recurrence pattern.
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
          
          // 🚨 COMPLETION TRACKING: Log every completion/toggle for sync debugging
          if (debug) {
            addSyncLog(
              `[TASK TOGGLE] "${tasks[id].name.slice(0, 20)}" ${currentStatus ? 'UN' : ''}COMPLETED`,
              'error',
              `🚨 TOGGLE: ${currentStatus} → ${newCompletionStatus} on ${todayLocalStr} | Pattern: ${tasks[id].recurrencePattern} | ID: ${id.slice(-8)}`
            );
          }
          
          // Verify the completion history was set correctly
          const actualHistoryValue = tasks[id].completionHistory[todayLocalStr];
          if (actualHistoryValue !== newCompletionStatus) {
            if (debug) {
              addSyncLog(
                `[TOGGLE VERIFICATION FAILED] Completion history mismatch!`,
                'error',
                `🚨 Expected: ${newCompletionStatus}, Actual: ${actualHistoryValue} for ${todayLocalStr}`
              );
            }
          }
          
          // Log only significant completion changes
          if (tasks[id].recurrencePattern === 'one-time' && newCompletionStatus) {
            if (debug) {
              addSyncLog(
                `[ONE-TIME COMPLETED] "${tasks[id].name.slice(0, 25)}" marked complete - will stay completed`,
                'success',
                `One-time tasks remain completed permanently. Completed on: ${todayLocalStr}`
              );
            }
          }
          
          const updatedTodaysTasks = taskFilter(tasks);
          set({ tasks, todaysTasks: updatedTodaysTasks });

          // mark registry dirty so pushSnapshot can see it
          if (debug) {
            addSyncLog(
              'SYNC_DIRTY',
              'info',
              `id=${id.slice(-8)} ts=${Date.now()} completed=${newCompletionStatus}`
            );
          }

          // Schedule a debounced, idle-time sync push so UI stays snappy during rapid taps
          scheduleSnapshotPush();
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
      debugSyncState: () => {
        const tasks = get().tasks;
        const today = format(new Date(), 'yyyy-MM-dd');
        
        if (debug) {
          addSyncLog('=== SYNC STATE DEBUG REPORT ===', 'info');
          addSyncLog(`Total tasks in store: ${Object.keys(tasks).length}`, 'info');
        }
        
        // Check for completion conflicts
        const completionConflicts: string[] = [];
        const tasksWithTodayHistory: string[] = [];
        const completedTasks: string[] = [];
        
        Object.entries(tasks).forEach(([id, task]) => {
          const historyToday = task.completionHistory[today];
          const isCompleted = task.completed;
          
          if (historyToday !== undefined) {
            tasksWithTodayHistory.push(`${task.name.slice(0, 20)}(${id.slice(-6)}): H=${historyToday}`);
          }
          
          if (isCompleted) {
            completedTasks.push(`${task.name.slice(0, 20)}(${id.slice(-6)}): C=${isCompleted}`);
          }
          
          // Check for conflicts between completed flag and today's history
          if (task.recurrencePattern !== 'one-time') {
            // For recurring tasks, completed should match today's history
            if (historyToday !== undefined && historyToday !== isCompleted) {
              completionConflicts.push(`${task.name.slice(0, 20)}: completed=${isCompleted} vs history[${today}]=${historyToday}`);
            }
          } else {
            // For one-time tasks, if there's history for today, completed should be true
            if (historyToday && !isCompleted) {
              completionConflicts.push(`${task.name.slice(0, 20)} (one-time): completed=false but history[${today}]=${historyToday}`);
            }
          }
          
          // Log detailed state for tasks with completion data
          if (historyToday !== undefined || isCompleted) {
            if (debug) {
              addSyncLog(
                `[TASK STATE] "${task.name.slice(0, 25)}"`,
                'verbose',
                `ID: ${id.slice(-8)} | Pattern: ${task.recurrencePattern} | Completed: ${isCompleted} | History[${today}]: ${historyToday} | UpdatedAt: ${task.updatedAt} | Full history: ${JSON.stringify(task.completionHistory)}`
              );
            }
          }
        });
        
        if (debug) {
          addSyncLog(`Tasks with today's history (${today}): ${tasksWithTodayHistory.length}`, 'info', 
            tasksWithTodayHistory.slice(0, 5).join(', ') + (tasksWithTodayHistory.length > 5 ? '...' : ''));
          
          addSyncLog(`Completed tasks: ${completedTasks.length}`, 'info',
            completedTasks.slice(0, 5).join(', ') + (completedTasks.length > 5 ? '...' : ''));
          
          if (completionConflicts.length > 0) {
            addSyncLog(`COMPLETION CONFLICTS FOUND: ${completionConflicts.length}`, 'error',
              completionConflicts.slice(0, 3).join(' | ') + (completionConflicts.length > 3 ? '...' : ''));
          } else {
            addSyncLog('No completion conflicts detected', 'success');
          }
          
          // Check today's filtered tasks
          const todaysTasks = get().todaysTasks;
          const completedToday = todaysTasks.filter(t => t.completed || t.completionHistory[today]).length;
          
          addSyncLog(`Today's filtered tasks: ${todaysTasks.length} total, ${completedToday} completed`, 'info');
          addSyncLog('=== END DEBUG REPORT ===', 'info');
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
        if (debug) {
          addSyncLog(`[Tasks] recalc: ${before} ➜ ${after}`, 'info');
        }
        set({ todaysTasks });
      },
      
    // Key section from store/ToDo.ts - hydrateFromSync method fix
    hydrateFromSync: (syncedData?: { tasks?: Record<string, Task> }) => {
      if (!syncedData?.tasks) {
        if (debug) {
          addSyncLog('[Tasks] No tasks field – skip', 'warning');
        }
        return;
      }
      if (debug) {
        addSyncLog(`[Tasks] incoming tasks from the db: ${Object.keys(syncedData.tasks).length} tasks`, 'info');
      }
      const incoming = syncedData.tasks as Record<string, Task>;
      const existing = get().tasks;
      if (debug) {
        addSyncLog(`[Tasks] existing tasks in the store: ${Object.keys(existing).length} tasks`, 'info');
      }
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
            if (debug) {
              addSyncLog(`[Tasks] +${inc.name}`, 'verbose');
            }
          }
          if (isBillTask) billTasksProcessed++;
          merged[id] = inc;
          addedCount++;
          return;
        }

        // 🔧 CRITICAL FIX: Better completion history merging WITH BULLETPROOF DEBUG
        const currHistory = curr.completionHistory || {};
        const incHistory = inc.completionHistory || {};
        const mergedHistory: Record<string, boolean> = { ...currHistory };
        const today = format(new Date(), 'yyyy-MM-dd');
        
        // Special tracking for today's completion data
        const incTodayValue = incHistory[today];
        const currTodayValue = currHistory[today];
        if (incTodayValue !== undefined || currTodayValue !== undefined) {
          if (debug) {
            addSyncLog(
              `[TODAY COMPLETION] "${inc.name.slice(0, 20)}" - Incoming[${today}]: ${incTodayValue}, Local[${today}]: ${currTodayValue}`,
              'info',
              `🚨 CRITICAL: This task has completion data for today - tracking merge result`
            );
          }
        }
        
        // Priority-based merging: 
        // 1. Most recent device timestamp wins
        // 2. BUT completion (true) beats non-completion (false) if timestamps are close
        // 3. Untoggle operations (false) always respected if newer
        Object.entries(incHistory).forEach(([date, value]) => {
          const hasLocalEntry = currHistory[date] !== undefined;
          const localValue = currHistory[date];
          
          // 🚨 DEBUG: Track every merge decision
          if (date === today) {
            if (debug) {
              addSyncLog(
                `[TODAY MERGE DECISION] "${inc.name.slice(0, 20)}" - Processing ${date}`,
                'info',
                `🚨 Incoming: ${value}, Local: ${localValue}, HasLocal: ${hasLocalEntry} | Task ID: ${id.slice(-8)}`
              );
            }
          }
          
          if (!hasLocalEntry) {
            // No local entry, safe to add incoming
            mergedHistory[date] = value;
            if (date === today) {
              if (debug) {
                addSyncLog(
                  `[TODAY MERGE RESULT] "${inc.name.slice(0, 20)}" - Added incoming: ${value}`,
                  'info',
                  `🚨 No local entry for ${date}, took incoming value`
                );
              }
            }
          } else if (value === false && localValue === true) {
            // Incoming is an untoggle (false), check timestamps
            if (inc.updatedAt >= curr.updatedAt) {
              mergedHistory[date] = false;
              if (debug) {
                addSyncLog(`[History Merge] '${inc.name.slice(0, 20)}': untoggle on ${date} (newer device)`, 'info');
              }
              if (date === today) {
                if (debug) {
                  addSyncLog(
                    `[TODAY MERGE RESULT] "${inc.name.slice(0, 20)}" - Untoggled: true → false`,
                    'info',
                    `🚨 Incoming untoggle took precedence for ${date}`
                  );
                }
              }
            } else if (date === today) {
              if (debug) {
                addSyncLog(
                  `[TODAY MERGE RESULT] "${inc.name.slice(0, 20)}" - Kept local: ${localValue}`,
                  'info',
                  `🚨 Local timestamp newer, kept local value for ${date}`
                );
              }
            }
          } else if (value === true && localValue === false) {
            // Incoming is a completion (true), check timestamps with bias toward completion
            const timeDiff = new Date(inc.updatedAt).getTime() - new Date(curr.updatedAt).getTime();
            // If incoming is newer OR within 10 seconds and is a completion, take it
            if (inc.updatedAt > curr.updatedAt || (Math.abs(timeDiff) < 10000 && value === true)) {
              mergedHistory[date] = true;
              if (debug) {
                addSyncLog(`[History Merge] '${inc.name.slice(0, 20)}': completion on ${date} (completion priority)`, 'info');
              }
              if (date === today) {
                if (debug) {
                  addSyncLog(
                    `[TODAY MERGE RESULT] "${inc.name.slice(0, 20)}" - Completed: false → true`,
                    'info',
                    `🚨 Incoming completion took precedence for ${date} (timeDiff: ${timeDiff}ms)`
                  );
                }
              }
            } else if (date === today) {
              if (debug) {
                addSyncLog(
                  `[TODAY MERGE RESULT] "${inc.name.slice(0, 20)}" - Kept local: ${localValue}`,
                  'info',
                  `🚨 Local timestamp newer, kept local value for ${date}`
                );
              }
            }
          } else if (inc.updatedAt > curr.updatedAt) {
            // For same values or other cases, newer timestamp wins
            mergedHistory[date] = value;
            if (date === today) {
              if (debug) {
                addSyncLog(
                  `[TODAY MERGE RESULT] "${inc.name.slice(0, 20)}" - Timestamp win: ${localValue} → ${value}`,
                  'info',
                  `🚨 Newer timestamp, took incoming value for ${date}`
                );
              }
            }
          } else if (date === today) {
            if (debug) {
              addSyncLog(
                `[TODAY MERGE RESULT] "${inc.name.slice(0, 20)}" - No change: ${localValue}`,
                'info',
                `🚨 Same values or local newer, kept existing for ${date}`
              );
            }
          }
        });
        
        // 🚨 FINAL MERGE VERIFICATION: Log the final merged history
        const finalTodayValue = mergedHistory[today];
        if (incTodayValue !== undefined || currTodayValue !== undefined) {
          if (debug) {
            addSyncLog(
              `[MERGE COMPLETE] "${inc.name.slice(0, 20)}" - Final[${today}]: ${finalTodayValue}`,
              'info',
              `🚨 FINAL RESULT: Started with Incoming=${incTodayValue}, Local=${currTodayValue}, Final=${finalTodayValue}`
            );
          }
        }
        
        // 🔧 CRITICAL FIX: Better completion status resolution
        const resolvedCompleted = (() => {
          if (inc.recurrencePattern === 'one-time') {
            // ONE-TIME TASKS: Once completed anywhere, stay completed everywhere
            // BUT respect untoggle operations from newer devices
            const localCompleted = curr.completed;
            const syncCompleted = inc.completed;
            const historyCompleted = mergedHistory[today] || false;
            
            // If there's explicit history for today, use that
            if (mergedHistory[today] !== undefined) {
              const resolved = mergedHistory[today];
              if (debug) {
                addSyncLog(
                  `[One-time Resolution] '${inc.name.slice(0, 24)}': resolved=${resolved} (from today's history)`,
                  resolved ? 'info' : 'warning',
                  `Using explicit history value for ${today}`
                );
              }
              return resolved;
            }
            
            // Otherwise, bias toward completion unless there's a clear untoggle
            const resolved = localCompleted || syncCompleted;
            if (resolved !== localCompleted || resolved !== syncCompleted) {
              if (debug) {
                addSyncLog(
                  `[One-time Resolution] '${inc.name.slice(0, 24)}': resolved=${resolved} (local=${localCompleted}, sync=${syncCompleted})`,
                  'info',
                  `Biased toward completion | Task ID: ${id.slice(-8)}`
                );
              }
            }
            return resolved;
          }
      
          // RECURRING TASKS: Completion is date-specific, use today's merged history
          const resolved = !!(mergedHistory[today]);
          
          // Log recurring task resolution if there's a conflict
          //if (curr.completed !== inc.completed) {
          //  addSyncLog(
          //    `[Recurring Resolution] '${inc.name.slice(0, 24)}': resolved=${resolved} (local=${curr.completed}, sync=${inc.completed}, today_history=${!!mergedHistory[today]})`,
          //    'verbose'
          //  );
          //}
          
          return resolved;
        })();
        
        // Log significant completion changes for debugging
        if (curr.completed !== resolvedCompleted && !isBillTask) {
          if (debug) {
            addSyncLog(
              `[Completion Change] '${inc.name.slice(0, 24)}': ${curr.completed}→${resolvedCompleted}`,
              resolvedCompleted ? 'success' : 'warning',
              `Pattern: ${inc.recurrencePattern} | Local updated: ${curr.updatedAt} | Sync updated: ${inc.updatedAt}`
            );
          }
        }
        
        // 🚨 FINAL TASK STATE LOGGING: Track the exact task that gets stored
        const finalTask = { 
          ...inc, 
          completionHistory: mergedHistory, 
          completed: resolvedCompleted,
          updatedAt: curr.updatedAt > inc.updatedAt ? curr.updatedAt : inc.updatedAt // Keep latest timestamp
        };
        
        // Log final task state for debugging if it has today's completion data
        if (finalTask.completionHistory[today] !== undefined || resolvedCompleted !== curr.completed) {
          if (debug) {
            addSyncLog(
              `[FINAL TASK STATE] "${inc.name.slice(0, 20)}" stored in merge`,
              'info',
              `🚨 STORED: completed=${finalTask.completed}, history[${today}]=${finalTask.completionHistory[today]}, pattern=${finalTask.recurrencePattern}`
            );
          }
        }
        
        merged[id] = finalTask;
        mergedCount++;
      });

      // Preserve any local-only tasks that aren't in incoming
      Object.entries(existing).forEach(([id, task]) => {
        if (!incoming[id]) {
          merged[id] = task;
          keptLocalCount++;
        }
      });

      // 🚨 PRE-STORE DEBUG: Verify completion data before storing
      const today = format(new Date(), 'yyyy-MM-dd');
      const tasksWithTodayCompletion = Object.entries(merged).filter(([id, task]) => 
        task.completionHistory[today] !== undefined
      );
      
      if (tasksWithTodayCompletion.length > 0) {
        if (debug) {
          addSyncLog(
            `[PRE-STORE VERIFICATION] About to store ${tasksWithTodayCompletion.length} tasks with today's completion data`,
            'info'
          );
        }
      }

      set({ tasks: merged, hydrated: true });

      // 🚨 POST-STORE DEBUG: Verify completion data after storing
      setTimeout(() => {
        const storedTasks = get().tasks;
        const storedTasksWithTodayCompletion = Object.entries(storedTasks).filter(([id, task]) => 
          task.completionHistory[today] !== undefined
        );
        
        if (tasksWithTodayCompletion.length !== storedTasksWithTodayCompletion.length) {
          if (debug) {
            addSyncLog(
              `[STORE VERIFICATION FAILED] Completion data lost during store!`,
              'info',
              `🚨 Before store: ${tasksWithTodayCompletion.length} tasks, After store: ${storedTasksWithTodayCompletion.length} tasks`
            );
          }
        } else if (storedTasksWithTodayCompletion.length > 0) {
          if (debug) {
            addSyncLog(
              `[STORE VERIFICATION PASSED] ${storedTasksWithTodayCompletion.length} tasks with today's completion data successfully stored`,
              'success',
              `🎯 Tasks: ${storedTasksWithTodayCompletion.map(([id, task]) => 
                `${task.name.slice(0, 15)}[${today}]=${task.completionHistory[today]}`
              ).join(', ')}`
            );
          }
        }
        
        const final = taskFilter(storedTasks);
        set({ todaysTasks: final });
        if (debug) {
          addSyncLog(`[Tasks] hydrate done → ${Object.keys(merged).length} total, ${final.length} today`, 'info');
          addSyncLog(`[Tasks] Stats when it was all said and done: +${addedCount} new, ~${mergedCount} merged, ${keptLocalCount} kept local`, 'info');
        }
      }, 0);

      // Summary log instead of thousands of individual ones
      if (billTasksProcessed > 10) {
        if (debug) {
          addSyncLog(`[Tasks] Processed ${billTasksProcessed} bill tasks (showing first 2 + last 2 only)`, 'info');
        }
      }
      
      if (importantMerges.length > 0) {
        if (debug) {
          addSyncLog(`[Tasks] Key merges: ${importantMerges.slice(0, 3).join(', ')}${importantMerges.length > 3 ? '...' : ''}`, 'info');
        }
      }
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
          if (debug) {
            addSyncLog(`Total tasks in storage before migration: ${Object.keys(tasks).length}`, 'info');
          }
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
            
             // if (oldHistorySize !== newHistorySize) {
             //   addSyncLog(`Cleaned completion history for task ${id}, removed ${oldHistorySize - newHistorySize} old entries`, 'info');
             // }
            }
            
            // Update completion status based on local date string
            if (tasks[id].recurrencePattern !== 'one-time') {
              const oldCompletedState = tasks[id].completed;
              tasks[id].completed = tasks[id].completionHistory[todayLocalStr] || false;

            } else {
              // For one-time tasks, preserve their completed status
              // Don't reset based on today's date - they stay completed once completed
              // The completion date is stored in completionHistory for reference
            }
          })
          
          if (needsMigration) {
            state.tasks = tasks
          }
          if (debug) {
            addSyncLog(`Rehydrated tasks store after migration`, 'info', Object.keys(state.tasks).length.toString());
          }
          state.hydrated = true
          const todaysTasks = taskFilter(state.tasks)
          state.todaysTasks = todaysTasks
        } else {
          useProjectStore.setState({ hydrated: true })
          if (debug) {
            addSyncLog(`Rehydrated tasks store`, 'info', '0');
          }
        }
      }
    }
  )
)

export const useStoreTasks = () => useProjectStore((s) => s.tasks)
export const useStoreHydrated = () => useProjectStore((s) => s.hydrated)
