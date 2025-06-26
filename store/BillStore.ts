import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';
import { Bill } from '@/types';
import { format } from 'date-fns';
import type { Task, WeekDay } from '@/types';

const getDayName = (date: Date): WeekDay => {
  const days: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

export const getOrdinalSuffix = (day: number): string => {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

interface BillStore {
  bills: Record<string, Bill>;
  monthlyIncome: number;
  lastIncomeUpdate: number;
  isSyncEnabled: boolean;
  addBill: (bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBill: (id: string, updates: Partial<Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteBill: (id: string) => void;
  getBills: () => Bill[];
  getActiveBills: () => Bill[];
  clearBills: () => void;
  setMonthlyIncome: (income: number) => void;
  toggleBillSync: () => void;
  hydrateFromSync?: (syncedData: { bills?: Record<string, Bill>, monthlyIncome?: number, lastIncomeUpdate?: number }) => void;
}

const asyncStorage = createPersistStorage<BillStore>();
const getAddSyncLog = () => require('@/components/sync/syncUtils').addSyncLog;

export const useBillStore = create<BillStore>()(
  persist(
    (set, get) => ({
      bills: {},
      monthlyIncome: 0,
      lastIncomeUpdate: 0,
      isSyncEnabled: false,

      addBill: (billData) => {
        const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const newBill: Bill = {
          ...billData,
          id,
          createTask: billData.createTask ?? true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          bills: {
            ...state.bills,
            [id]: newBill,
          },
        }));
        return newBill;
      },

      updateBill: (id, updates) => {
        const existingBill = get().bills[id];
        if (!existingBill) {
          console.error(`❌ BillStore: Bill with id ${id} not found`);
          return;
        }

        // Update the bill in store first
        const updatedBill: Bill = {
          ...existingBill,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          bills: {
            ...state.bills,
            [id]: updatedBill,
          },
        }));

        // Handle task creation/deletion AFTER store update, completely outside set()
        const needsTaskUpdate = existingBill.createTask !== updatedBill.createTask ||
                               (updatedBill.createTask && (
                                 existingBill.name !== updatedBill.name ||
                                 existingBill.amount !== updatedBill.amount ||
                                 existingBill.dueDate !== updatedBill.dueDate
                               ));
        
        if (needsTaskUpdate) {
          setTimeout(() => {
            try {
              const { useProjectStore } = require('./ToDo');
              const store = useProjectStore.getState();

              // If tasks currently exist for this bill, delete them first
              if (existingBill.createTask) {
                const allTasks = store.tasks;
                const taskIdsToDelete = Object.entries(allTasks)
                  .filter(([_, task]: [string, any]) => {
                    if (task?.category !== 'bills') return false;
                    const taskName = task.name || '';
                    const billName = existingBill.name;
                    
                    return taskName === billName ||
                           taskName === `${billName} Bill` ||
                           taskName === `${billName} ($${existingBill.amount.toFixed(0)})` ||
                           taskName === `${billName} Bill ($${existingBill.amount.toFixed(0)})` ||
                           taskName.includes(billName);
                  })
                  .map(([taskId]) => taskId);
                
                if (taskIdsToDelete.length > 0) {
                  // Optimistic UI update
                  const updatedTodaysTasks = store.todaysTasks.filter((task: Task) => !taskIdsToDelete.includes(task.id));
                  useProjectStore.setState({ todaysTasks: updatedTodaysTasks });
                  
                  // Bulk delete
                  store.bulkDeleteTasks(taskIdsToDelete);
                }
              }

              if (updatedBill.createTask) {
                const tasksToCreate: Array<{
                  name: string;
                  schedule: string[];
                  priority: string;
                  category: string;
                  scheduledDate: string;
                  dueDate: number;
                  recurrencePattern: string;
                }> = [];
                const start = new Date();
                const end = new Date(start.getFullYear() + 5, 11, 31);
                let currentDate = new Date(start.getFullYear(), start.getMonth(), updatedBill.dueDate);
                
                while (currentDate <= end) {
                  const formattedDate = format(currentDate, 'yyyy-MM-dd');
                  const weekDay = getDayName(currentDate);
                  
                  tasksToCreate.push({
                    name: `${updatedBill.name} Bill ($${updatedBill.amount.toFixed(0)})`,
                    schedule: [weekDay],
                    priority: 'high',
                    category: 'bills',
                    scheduledDate: formattedDate,
                    dueDate: updatedBill.dueDate,
                    recurrencePattern: 'monthly'
                  });
                  
                  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, updatedBill.dueDate);
                }
                
                // Create tasks in batches to prevent UI freezing
                const batchSize = 10;
                let createdCount = 0;
                
                const createBatch = async (startIndex: number) => {
                  const batch = tasksToCreate.slice(startIndex, startIndex + batchSize);
                  
                  for (const taskData of batch) {
                    store.addTask(taskData);
                    createdCount++;
                  }
                  
                  // Small delay between batches to prevent UI freezing
                  if (startIndex + batchSize < tasksToCreate.length) {
                    await new Promise(resolve => setTimeout(resolve, 5));
                    await createBatch(startIndex + batchSize);
                  }
                };
                
                createBatch(0).then(() => {
                  console.log(`✅ CREATED NEW TASKS: Added ${createdCount} new tasks for bill "${updatedBill.name}"`);
                });
              }
            } catch (error) {
              console.error('Error handling task update:', error);
            }
          }, 0);
        }
        
      },

      deleteBill: (id) => {
        const existingBill = get().bills[id];
        if (!existingBill) {
          console.error(`❌ BillStore: Bill with id ${id} not found`);
          return;
        }

        // Soft delete by setting deletedAt timestamp
        const deletedBill: Bill = {
          ...existingBill,
          deletedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          bills: {
            ...state.bills,
            [id]: deletedBill,
          },
        }));

        // Clean up associated tasks
        setTimeout(() => {
          try {
            const { useProjectStore } = require('./ToDo');
            const { tasks, deleteTask, recalculateTodaysTasks } = useProjectStore.getState();
            
            Object.entries(tasks).forEach(([taskId, task]: [string, any]) => {
              if (task?.category === 'bills' && 
                  (task?.name === existingBill.name || 
                   task?.name === `${existingBill.name} Bill ($${existingBill.amount.toFixed(0)})`)) {
                deleteTask(taskId);
              }
            });

            recalculateTodaysTasks();
          } catch (error) {
            console.error('Error cleaning up tasks:', error);
          }
        }, 0);

        try {
          getAddSyncLog()(`Bill "${existingBill.name}" soft deleted locally`, 'info');
        } catch (e) {}
      },

      getBills: () => {
        const state = get();
        return Object.values(state.bills)
          .filter(bill => !bill.deletedAt)
          .sort((a, b) => a.dueDate - b.dueDate);
      },

      getActiveBills: () => {
        const state = get();
        return Object.values(state.bills).filter(bill => !bill.deletedAt);
      },

      clearBills: () => {
        set({ bills: {} });
        try {
          getAddSyncLog()('Bills cleared locally', 'info');
        } catch (e) {}
      },

      setMonthlyIncome: (income: number) => {
        const validIncome = Math.max(0, income);
        const now = Date.now();
        set({ 
          monthlyIncome: validIncome,
          lastIncomeUpdate: now
        });
        
        try {
          getAddSyncLog()(`Monthly income set to ${validIncome} locally`, 'info');
        } catch (e) {}
      },

      toggleBillSync: () => {
        set((state) => {
          const newSyncState = !state.isSyncEnabled;
          try {
            getAddSyncLog()(`Bill sync ${newSyncState ? 'enabled' : 'disabled'}`, 'info');
          } catch (e) {}
          return { isSyncEnabled: newSyncState };
        });
      },

      hydrateFromSync: (syncedData: { bills?: Record<string, Bill>, monthlyIncome?: number, lastIncomeUpdate?: number }) => {
        const addSyncLog = getAddSyncLog();
        const currentSyncEnabledState = get().isSyncEnabled;
        if (!currentSyncEnabledState) {
          addSyncLog('Bill sync is disabled, skipping hydration for BillStore.', 'info');
          return;
        }

        if (!syncedData) {
          addSyncLog('No data provided for BillStore hydration.', 'warning');
          return;
        }

        addSyncLog('🔄 Hydrating BillStore from sync...', 'info');
        let billsMergedCount = 0;
        let billsAddedCount = 0;

        set((state) => {
          const newState = { ...state };

          if (syncedData.bills && typeof syncedData.bills === 'object') {
            const existingBillsMap = new Map(Object.entries(state.bills));
            const newBillsObject = { ...state.bills };
            let deletionsAppliedCount = 0;

            for (const [billId, incomingBill] of Object.entries(syncedData.bills)) {
              if (existingBillsMap.has(billId)) {
                const existingBill = existingBillsMap.get(billId)!;
                const incomingTimestamp = new Date(incomingBill.updatedAt || incomingBill.createdAt || Date.now()).getTime();
                const existingTimestamp = new Date(existingBill.updatedAt || existingBill.createdAt || Date.now()).getTime();
                
                if (incomingTimestamp >= existingTimestamp) {
                  newBillsObject[billId] = { ...existingBill, ...incomingBill };
                  billsMergedCount++;
                  
                  // Check if this is a deletion being applied
                  if (incomingBill.deletedAt && !existingBill.deletedAt) {
                    deletionsAppliedCount++;
                    addSyncLog(`Bill "${incomingBill.name}" marked as deleted from sync`, 'info');
                  }
                }
              } else {
                newBillsObject[billId] = incomingBill;
                billsAddedCount++;
                
                // Log if we're adding a deleted bill
                if (incomingBill.deletedAt) {
                  addSyncLog(`Adding already-deleted bill "${incomingBill.name}" from sync`, 'verbose');
                }
              }
            }
            newState.bills = newBillsObject;
            
            if (deletionsAppliedCount > 0) {
              addSyncLog(`Applied ${deletionsAppliedCount} bill deletions from sync`, 'success');
            }
          }

          if (typeof syncedData.monthlyIncome === 'number') {
            const currentIncome = state.monthlyIncome;
            const incomingIncome = syncedData.monthlyIncome;
            const currentUpdate = state.lastIncomeUpdate || 0;
            const incomingUpdate = syncedData.lastIncomeUpdate || 0;

            let shouldUpdate = false;
            let reason = '';

            if (currentIncome === 0 && incomingIncome > 0) {
              shouldUpdate = true;
              reason = 'current is 0, incoming is positive';
            } else if (currentIncome > 0 && incomingIncome === 0) {
              const timeDiff = incomingUpdate - currentUpdate;
              if (timeDiff > 30000) {
                shouldUpdate = true;
                reason = `incoming zero is significantly newer by ${Math.round(timeDiff/1000)}s`;
              } else {
                reason = `keeping non-zero value, incoming zero not significantly newer (${Math.round(timeDiff/1000)}s)`;
              }
            } else if (currentIncome !== incomingIncome) {
              if (incomingUpdate > currentUpdate) {
                shouldUpdate = true;
                reason = 'incoming timestamp is newer';
              } else {
                reason = 'current timestamp is newer or equal';
              }
            }

            if (shouldUpdate) {
              addSyncLog(`Monthly income updated from ${currentIncome} to ${incomingIncome} via sync (${reason}).`, 'info');
              newState.monthlyIncome = Math.max(0, incomingIncome);
              newState.lastIncomeUpdate = incomingUpdate;
            } else {
              addSyncLog(`Monthly income kept at ${currentIncome}, not updating to ${incomingIncome} (${reason}).`, 'verbose');
            }
          }

          return newState;
        });

        const totalBills = Object.keys(get().bills).length;
        const activeBills = Object.values(get().bills).filter(bill => !bill.deletedAt).length;
        addSyncLog(`Bills hydrated: ${billsAddedCount} added, ${billsMergedCount} merged. Total bills: ${totalBills} (${activeBills} active)`, 'success');
      },
    }),
    {
      name: 'bill-storage',
      storage: asyncStorage,
      onRehydrateStorage: (state) => {
        return (rehydratedState, error) => {
          if (error) {
            console.error('Error during rehydration:', error);
          }
        };
      },
    }
  )
);