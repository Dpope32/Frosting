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
  debugSyncState: () => void;
}

const dayNames: WeekDay[] = [
  'sunday','monday','tuesday','wednesday','thursday','friday','saturday'
]

// Helper function to extract local date string from any timestamp
const getLocalDateString = (timestamp: string): string => {
  // Parse the timestamp and format it in local timezone
  return format(new Date(timestamp), 'yyyy-MM-dd');
};

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

            addSyncLog(
              `[CONVERSION COMPLETE] "${task.name.slice(0, 25)}" is now one-time`,
              'success',
              `Task will now behave as one-time task. Completion will be permanent. Updated at: ${newTimestamp}`
            );
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

    // ENHANCED LOGGING: Track completion state updates during filtering
    const completionUpdates: string[] = [];
    const completionConflicts: string[] = [];

    // Create task copies with updated completion status instead of mutating originals
    const tasksWithUpdatedCompletion = Object.values(tasks).map(task => {
      if (task.recurrencePattern !== 'one-time') {
        const newCompletedState = task.completionHistory[currentDateStrLocal] || false;
        const oldCompletedState = task.completed;
        
        if (newCompletedState !== oldCompletedState) {
          const updateMsg = `${task.name.slice(0, 20)}(${task.id.slice(-6)}): ${oldCompletedState}→${newCompletedState}`;
          completionUpdates.push(updateMsg);
          
          if (!task.name.includes('$') && !task.name.includes('"')) {
            addSyncLog(
              `[Filter Update] '${task.name.slice(0, 20)}': completion=${oldCompletedState}→${newCompletedState} based on today's history`,
              'info',
              `Date: ${currentDateStrLocal} | History entry: ${task.completionHistory[currentDateStrLocal]} | Pattern: ${task.recurrencePattern} | Task ID: ${task.id.slice(-8)}`
            );
          }
        }
        
        // ENHANCED LOGGING: Check for potential completion conflicts
        if (task.completed !== newCompletedState && task.completionHistory[currentDateStrLocal] !== undefined) {
          completionConflicts.push(`${task.name.slice(0, 20)}: stored=${task.completed} vs history=${newCompletedState}`);
        }
        
        return {
          ...task,
          completed: newCompletedState
        };
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
      }
      return task;
    });
    
    // Log completion update summary
    if (completionUpdates.length > 0) {
      addSyncLog(
        `[FILTER COMPLETION UPDATES] ${completionUpdates.length} tasks updated completion state`,
        'info',
        completionUpdates.slice(0, 3).join(', ') + (completionUpdates.length > 3 ? '...' : '')
      );
    }
    
    if (completionConflicts.length > 0) {
      addSyncLog(
        `[FILTER COMPLETION CONFLICTS] ${completionConflicts.length} tasks have conflicting completion states`,
        'warning',
        completionConflicts.slice(0, 3).join(', ') + (completionConflicts.length > 3 ? '...' : '')
      );
    }
    
    // Filter tasks that are due today
    const filtered = tasksWithUpdatedCompletion.filter(task => {
      const isDue = isTaskDue(task, currentDate);
      
      // Log completion state for due tasks
      if (isDue && (task.completionHistory[currentDateStrLocal] !== undefined || task.completed)) {
        addSyncLog(
          `[DUE TASK COMPLETION] "${task.name.slice(0, 20)}" due today with completion data`,
          'verbose',
          `Completed: ${task.completed} | History[${currentDateStrLocal}]: ${task.completionHistory[currentDateStrLocal]} | Pattern: ${task.recurrencePattern}`
        );
      }
      
      return isDue;
    });
    
    addSyncLog(
      `[POST-FILTER] ${filtered.length} tasks after filtering`,
      'verbose', 
      `Date: ${currentDateStrLocal} | Completed tasks: ${filtered.filter(t => t.completed).length} | Tasks with today's history: ${filtered.filter(t => t.completionHistory[currentDateStrLocal]).length}`
    );
    
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
    
    // Final result logging
    const completedInResult = sorted.filter(t => t.completed || t.completionHistory[currentDateStrLocal]).length;
    if (completedInResult > 0) {
      addSyncLog(
        `[FILTER RESULT] ${completedInResult} completed tasks in final result of ${sorted.length}`,
        'info',
        sorted.filter(t => t.completed || t.completionHistory[currentDateStrLocal])
          .slice(0, 3)
          .map(t => `"${t.name.slice(0, 15)}"(${t.completed ? 'C' : ''}${t.completionHistory[currentDateStrLocal] ? 'H' : ''})`)
          .join(', ')
      );
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
        console.log('[ToDo.deleteTask] Attempting to delete task:', id, 'Existed:', existed);
        if (existed) {
          console.log('[ToDo.deleteTask] Task details:', JSON.stringify(tasks[id], null, 2));
        }
        delete tasks[id]
        set({ tasks, todaysTasks: taskFilter(tasks) })
        console.log('[ToDo.deleteTask] After deletion, task exists?', !!tasks[id]);
        console.log('[ToDo.deleteTask] Current tasks count:', Object.keys(tasks).length);
      },
      toggleTaskCompletion: (id) => {
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
          const taskName = tasks[id].name.slice(0, 25);
          const pattern = tasks[id].recurrencePattern;
          const timestamp = new Date().toISOString();
          
          addSyncLog(
            `[TOGGLE START] "${taskName}" (${pattern}) toggle initiated`,
            'info',
            `Date: ${todayLocalStr} | Current status: ${currentStatus} | Will become: ${newCompletionStatus} | Current history: ${JSON.stringify(tasks[id].completionHistory)} | Device timestamp: ${timestamp} | Task ID: ${id.slice(-8)}`
          );

          tasks[id] = {
            ...tasks[id],
            completed: newCompletionStatus, 
            completionHistory: {
              ...cleanedHistory,
              [todayLocalStr]: newCompletionStatus 
            },
            updatedAt: new Date().toISOString()
          }
          // 🚨 DEBUG LOGGING: Track completion changes for tomorrow and one-time tasks
          if (tasks[id].recurrencePattern === 'tomorrow' || tasks[id].recurrencePattern === 'one-time') {
            const taskName = tasks[id].name.slice(0, 25);
            const pattern = tasks[id].recurrencePattern;
            const timestamp = new Date().toISOString();
            
            addSyncLog(
              `[COMPLETION TOGGLE] "${taskName}" (${pattern}) ${currentStatus ? 'uncompleted' : 'completed'}`,
              newCompletionStatus ? 'success' : 'info',
              `Date: ${todayLocalStr} | Previous status: ${currentStatus} | New status: ${newCompletionStatus} | Pattern: ${pattern} | Timestamp: ${timestamp} | Task ID: ${id.slice(-8)}`
            );
            
            // Special logging for one-time task completion
            if (pattern === 'one-time' && newCompletionStatus) {
              addSyncLog(
                `[ONE-TIME COMPLETED] "${taskName}" marked complete - will stay completed`,
                'success',
                `One-time tasks remain completed permanently. Completed on: ${todayLocalStr} at ${timestamp}`
              );
            }
            
            // Special logging for tomorrow task completion
            if (pattern === 'tomorrow') {
              const createdDate = getLocalDateString(tasks[id].createdAt);
              addSyncLog(
                `[TOMORROW TASK TOGGLE] "${taskName}" completion changed`,
                newCompletionStatus ? 'success' : 'warning',
                `Created (local): ${createdDate} | Toggled on: ${todayLocalStr} | Status: ${newCompletionStatus ? 'completed' : 'uncompleted'} | May convert to one-time after midnight`
              );
            }
          }
          
          addSyncLog(
            `[TOGGLE COMPLETE] "${taskName}" state updated`,
            'success',
            `Final completed: ${tasks[id].completed} | Final history: ${JSON.stringify(tasks[id].completionHistory)} | Final updatedAt: ${tasks[id].updatedAt}`
          );
          
          const updatedTodaysTasks = taskFilter(tasks);
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
      debugSyncState: () => {
        const tasks = get().tasks;
        const today = format(new Date(), 'yyyy-MM-dd');
        
        addSyncLog('=== SYNC STATE DEBUG REPORT ===', 'info');
        addSyncLog(`Total tasks in store: ${Object.keys(tasks).length}`, 'info');
        
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
            addSyncLog(
              `[TASK STATE] "${task.name.slice(0, 25)}"`,
              'verbose',
              `ID: ${id.slice(-8)} | Pattern: ${task.recurrencePattern} | Completed: ${isCompleted} | History[${today}]: ${historyToday} | UpdatedAt: ${task.updatedAt} | Full history: ${JSON.stringify(task.completionHistory)}`
            );
          }
        });
        
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
        addSyncLog(`[Tasks] incoming tasks from the db: ${Object.keys(syncedData.tasks).length} tasks`, 'info');
        const incoming = syncedData.tasks as Record<string, Task>;
        const existing = get().tasks;
        addSyncLog(`[Tasks] existing tasks in the store: ${Object.keys(existing).length} tasks`, 'info');
        const merged: Record<string, Task> = {};
        
        let addedCount = 0;
        let mergedCount = 0;
        let keptLocalCount = 0;
        let billTasksProcessed = 0;
        let importantMerges: string[] = [];
        let completionConflicts: string[] = [];
      
        // Process incoming tasks
        Object.entries(incoming).forEach(([id, inc]) => {
          const curr = existing[id];
          const isBillTask = inc.name.includes('($') || inc.name.toLowerCase().includes('pay ');
          
          // 🚨 DEBUG LOGGING: Track tomorrow/one-time tasks during sync
          if ((inc.recurrencePattern === 'tomorrow' || inc.recurrencePattern === 'one-time') && !isBillTask) {
            if (!curr) {
              addSyncLog(
                `[SYNC NEW] "${inc.name.slice(0, 25)}" (${inc.recurrencePattern}) from sync`,
                'info',
                `New ${inc.recurrencePattern} task from sync | Created: ${inc.createdAt} | Updated: ${inc.updatedAt} | Task ID: ${id.slice(-8)}`
              );
            } else {
              addSyncLog(
                `[SYNC MERGE] "${inc.name.slice(0, 25)}" (${inc.recurrencePattern}) merging`,
                'verbose',
                `Local pattern: ${curr.recurrencePattern} | Sync pattern: ${inc.recurrencePattern} | Local updated: ${curr.updatedAt} | Sync updated: ${inc.updatedAt}`
              );
            }
          }
        
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
      
        // FIXED MERGE LOGIC: 🚨 CRITICAL BUG FIX
          // The previous logic had a gap where completion history entries could be lost
          const mergedHistory: Record<string, boolean> = { ...curr.completionHistory };
          
          // Merge incoming history with improved logic
          Object.entries(inc.completionHistory || {}).forEach(([date, value]) => {
            const hasLocalEntry = curr.completionHistory[date] !== undefined;
            const localValue = curr.completionHistory[date];
            
            if (!hasLocalEntry) {
              // No local entry, always add incoming data
              mergedHistory[date] = value;
              addSyncLog(`[History Merge] '${inc.name.slice(0, 20)}': added new date ${date} = ${value}`, 'info');
            } else if (value === false && localValue === true) {
              // Incoming is an untoggle (false), always respect this
              mergedHistory[date] = false;
              addSyncLog(`[History Merge] '${inc.name.slice(0, 20)}': untoggle on ${date} (local=true, inc=false)`, 'info');
            } else if (value === true && localValue === false) {
              // Incoming is a completion (true), and local is false
              // Check timestamps to decide which to keep
              if (inc.updatedAt > curr.updatedAt) {
                mergedHistory[date] = true;
                addSyncLog(`[History Merge] '${inc.name.slice(0, 20)}': newer completion on ${date} (${value})`, 'info');
              } else {
                // Keep local false value, but log it
                addSyncLog(`[History Merge] '${inc.name.slice(0, 20)}': kept local value ${date} = ${localValue} (local is newer)`, 'verbose');
              }
            } else if (inc.updatedAt > curr.updatedAt) {
              // Incoming is newer, use its value
              mergedHistory[date] = value;
              addSyncLog(`[History Merge] '${inc.name.slice(0, 20)}': newer timestamp on ${date} (${value})`, 'verbose');
            } else {
              // Local is same or newer, keep local value
              addSyncLog(`[History Merge] '${inc.name.slice(0, 20)}': kept local value ${date} = ${localValue} (local is newer or same)`, 'verbose');
            }
          });
                  
          
          const today = format(new Date(), 'yyyy-MM-dd');
          
          // IMPROVED COMPLETION RESOLUTION LOGIC
          const resolvedCompleted = (() => {
            if (inc.recurrencePattern === 'one-time') {
              // ONE-TIME TASKS: Once completed anywhere, stay completed everywhere
              const localCompleted = curr.completed;
              const syncCompleted = inc.completed;
              const historyCompleted = mergedHistory[today] || false;
              const resolved = localCompleted || syncCompleted || historyCompleted;
              
              // Log the resolution decision with source tracking
              if (resolved) {
                const sources = [];
                if (localCompleted) sources.push('local=true');
                if (syncCompleted) sources.push('sync=true');
                if (historyCompleted) sources.push('history=true');
                
              } else {
              }
              return resolved;
            }

            // RECURRING TASKS: Completion is date-specific
            // For recurring tasks, the completion state should be based on today's history
            const todayHistoryValue = mergedHistory[today];
            const resolved = !!(todayHistoryValue);
            
            // Enhanced logging for recurring task resolution
            if (curr.completed !== inc.completed || todayHistoryValue !== undefined) {
              addSyncLog(
                `[Recurring Resolution] '${inc.name.slice(0, 24)}': resolved=${resolved}`,
                'info', 
                `Local completed: ${curr.completed} | Sync completed: ${inc.completed} | Today history: ${todayHistoryValue} | Final: ${resolved} | Pattern: ${inc.recurrencePattern}`
              );
            }
            
            return resolved;
          })();
          
 
        // Log completion state changes for debugging
        if (curr.completed !== inc.completed || curr.completed !== resolvedCompleted) {
          addSyncLog(
            `[COMPLETION MERGE] '${inc.name.slice(0, 24)}': final resolution`,
            'info',
            `Local: ${curr.completed} | Sync: ${inc.completed} | Resolved: ${resolvedCompleted} | History today: ${mergedHistory[today]} | Final history: ${JSON.stringify(mergedHistory)}`
          );
        }
        
        merged[id] = { 
          ...inc, 
          completionHistory: mergedHistory, 
          completed: resolvedCompleted,
          updatedAt: curr.updatedAt > inc.updatedAt ? curr.updatedAt : inc.updatedAt
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
      
        // Enhanced summary logging
        if (completionConflicts.length > 0) {
          addSyncLog(
            `[COMPLETION CONFLICTS] ${completionConflicts.length} completion conflicts resolved`,
            'warning',
            completionConflicts.slice(0, 5).join(' | ') + (completionConflicts.length > 5 ? '...' : '')
          );
        }
      
        setTimeout(() => {
          const final = taskFilter(get().tasks);
          set({ todaysTasks: final });
          addSyncLog(`[Tasks] hydrate done → ${Object.keys(merged).length} total, ${final.length} today`, 'info');
          addSyncLog(`[Tasks] Stats: +${addedCount} new, ~${mergedCount} merged, ${keptLocalCount} kept local, ${completionConflicts.length} conflicts`, 'info');
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

            } else {
              // For one-time tasks, preserve their completed status
              // Don't reset based on today's date - they stay completed once completed
              // The completion date is stored in completionHistory for reference
            }
          })
          
          if (needsMigration) {
            state.tasks = tasks
          }
          addSyncLog(`Rehydrated tasks store after migration`, 'info', Object.keys(state.tasks).length.toString());
          state.hydrated = true
          const todaysTasks = taskFilter(state.tasks)
          state.todaysTasks = todaysTasks
        } else {
          useProjectStore.setState({ hydrated: true })
          addSyncLog(`Rehydrated tasks store`, 'info', '0');
        }
      }
    }
  )
)

export const useStoreTasks = () => useProjectStore((s) => s.tasks)
export const useStoreHydrated = () => useProjectStore((s) => s.hydrated)
