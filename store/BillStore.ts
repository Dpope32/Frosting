import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';
import { Bill } from '@/types';

export { getOrdinalSuffix };

const getOrdinalSuffix = (day: number): string => {
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
  lastIncomeUpdate: number; // ADD: Timestamp for conflict resolution
  isSyncEnabled: boolean;
  addBill: (bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBill: (id: string, updates: Partial<Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteBill: (id: string) => void;
  getBills: () => Bill[];
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
      lastIncomeUpdate: 0, // ADD: Initialize timestamp
      isSyncEnabled: false,

      addBill: (billData) => {
        const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const dueDate = billData.dueDate;
        const newBill: Bill = {
          ...billData,
          id,
          dueDate: dueDate,
          name: billData.name,
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
        console.log('🏪 BillStore.updateBill called with:', { id, updates });
        set((state) => {
          const existingBill = state.bills[id];
          if (!existingBill) {
            console.error(`❌ BillStore: Bill with id ${id} not found`);
            return state;
          }

          console.log('📋 BillStore: Existing bill:', existingBill);

          const updatedBill: Bill = {
            ...existingBill,
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          console.log('🆕 BillStore: Updated bill:', updatedBill);

          return {
            bills: {
              ...state.bills,
              [id]: updatedBill,
            },
          };
        });
        console.log('✅ BillStore: Bill updated successfully');
      },

      deleteBill: (id) => {
        set((state) => {
          // Store the bill info before deleting
          const billToDelete = state.bills[id];
          const newBills = { ...state.bills };
          delete newBills[id];

          // Use setTimeout to break the circular dependency
          if (billToDelete) {
            setTimeout(() => {
              try {
                // Dynamic import to avoid circular dependency
                const { useProjectStore } = require('./ToDo');
                const { tasks, deleteTask, recalculateTodaysTasks } = useProjectStore.getState();
                
                // Delete associated tasks
                Object.entries(tasks).forEach(([taskId, task]: [string, any]) => {
                  if (task?.category === 'bills' && 
                      (task?.name === billToDelete.name || 
                       task?.name === `${billToDelete.name} Bill ($${billToDelete.amount.toFixed(0)})`)) {
                    deleteTask(taskId);
                  }
                });

                // Force recalculation
                recalculateTodaysTasks();
              } catch (error) {
                console.error('Error cleaning up tasks:', error);
              }
            }, 0);
          }

          return { bills: newBills };
        });
      },

      getBills: () => {
        const state = get();
        return Object.values(state.bills).sort((a, b) => a.dueDate - b.dueDate);
      },

      clearBills: () => {
        set({ bills: {} });
        try {
          getAddSyncLog()('Bills cleared locally', 'info');
        } catch (e) { /* ignore if logger not available */ }
      },

      setMonthlyIncome: (income: number) => {
        // Ensure income is not negative and update timestamp
        const validIncome = Math.max(0, income);
        const now = Date.now();
        set({ 
          monthlyIncome: validIncome,
          lastIncomeUpdate: now
        });
        
        try {
          getAddSyncLog()(`Monthly income set to ${validIncome} locally`, 'info');
        } catch (e) { /* ignore if logger not available */ }
      },

      toggleBillSync: () => {
        set((state) => {
          const newSyncState = !state.isSyncEnabled;
          try {
            getAddSyncLog()(`Bill sync ${newSyncState ? 'enabled' : 'disabled'}`, 'info');
          } catch (e) { /* ignore if logger not available */ }
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

          // Handle bills sync
          if (syncedData.bills && typeof syncedData.bills === 'object') {
            const existingBillsMap = new Map(Object.entries(state.bills));
            const newBillsObject = { ...state.bills };

            for (const [billId, incomingBill] of Object.entries(syncedData.bills)) {
              if (existingBillsMap.has(billId)) {
                const existingBill = existingBillsMap.get(billId)!;
                const incomingTimestamp = new Date(incomingBill.updatedAt || incomingBill.createdAt || Date.now()).getTime();
                const existingTimestamp = new Date(existingBill.updatedAt || existingBill.createdAt || Date.now()).getTime();
                
                if (incomingTimestamp >= existingTimestamp) {
                  newBillsObject[billId] = { ...existingBill, ...incomingBill };
                  billsMergedCount++;
                }
              } else {
                newBillsObject[billId] = incomingBill;
                billsAddedCount++;
              }
            }
            newState.bills = newBillsObject;
          }

          // SMART MONTHLY INCOME CONFLICT RESOLUTION
          if (typeof syncedData.monthlyIncome === 'number') {
            const currentIncome = state.monthlyIncome;
            const incomingIncome = syncedData.monthlyIncome;
            const currentUpdate = state.lastIncomeUpdate || 0;
            const incomingUpdate = syncedData.lastIncomeUpdate || 0;

            // Smart conflict resolution rules:
            // 1. Never overwrite a non-zero value with zero unless explicitly newer by a significant margin (30+ seconds)
            // 2. Always prefer non-zero values over zero values
            // 3. If both are non-zero, use timestamp
            
            let shouldUpdate = false;
            let reason = '';

            if (currentIncome === 0 && incomingIncome > 0) {
              // Current is 0, incoming is positive - always update
              shouldUpdate = true;
              reason = 'current is 0, incoming is positive';
            } else if (currentIncome > 0 && incomingIncome === 0) {
              // Current is positive, incoming is 0 - only update if incoming is significantly newer (30+ seconds)
              const timeDiff = incomingUpdate - currentUpdate;
              if (timeDiff > 30000) { // 30 seconds
                shouldUpdate = true;
                reason = `incoming zero is significantly newer by ${Math.round(timeDiff/1000)}s`;
              } else {
                reason = `keeping non-zero value, incoming zero not significantly newer (${Math.round(timeDiff/1000)}s)`;
              }
            } else if (currentIncome !== incomingIncome) {
              // Both non-zero or both zero - use timestamp
              if (incomingUpdate > currentUpdate) {
                shouldUpdate = true;
                reason = 'incoming timestamp is newer';
              } else {
                reason = 'current timestamp is newer or equal';
              }
            }

            if (shouldUpdate) {
              addSyncLog(`Monthly income updated from ${currentIncome} to ${incomingIncome} via sync (${reason}).`, 'info');
              newState.monthlyIncome = Math.max(0, incomingIncome); // Ensure non-negative
              newState.lastIncomeUpdate = incomingUpdate;
            } else {
              addSyncLog(`Monthly income kept at ${currentIncome}, not updating to ${incomingIncome} (${reason}).`, 'verbose');
            }
          }

          return newState;
        });

        addSyncLog(`Bills hydrated: ${billsAddedCount} added, ${billsMergedCount} merged. Total bills: ${Object.keys(get().bills).length}`, 'success');
      },
    }),
    {
      name: 'bill-storage',
      storage: asyncStorage,
    }
  )
);