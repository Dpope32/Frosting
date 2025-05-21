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
  isSyncEnabled: boolean;
  addBill: (bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteBill: (id: string) => void;
  getBills: () => Bill[];
  clearBills: () => void;
  setMonthlyIncome: (income: number) => void;
  toggleBillSync: () => void;
  hydrateFromSync?: (syncedData: { bills?: Record<string, Bill>, monthlyIncome?: number }) => void;
}

const asyncStorage = createPersistStorage<BillStore>();
const getAddSyncLog = () => require('@/components/sync/syncUtils').addSyncLog;

export const useBillStore = create<BillStore>()(
  persist(
    (set, get) => ({
      bills: {},
      monthlyIncome: 0,
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
        // Ensure income is not negative
        const validIncome = Math.max(0, income);
        set({ monthlyIncome: validIncome });
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

      hydrateFromSync: (syncedData: { bills?: Record<string, Bill>, monthlyIncome?: number }) => {
        const addSyncLog = getAddSyncLog();
        const currentSyncEnabledState = get().isSyncEnabled;
        addSyncLog(`[Hydrate Attempt] BillStore sync is currently ${currentSyncEnabledState ? 'ENABLED' : 'DISABLED'}.`, 'verbose');

        if (!currentSyncEnabledState) {
          addSyncLog('Bill sync is disabled, skipping hydration for BillStore.', 'info');
          return;
        }

        addSyncLog('🔄 Hydrating BillStore from sync...', 'info');
        let billsMergedCount = 0;
        let billsAddedCount = 0;

        set((state) => {
          let newBills = { ...state.bills };
          let newMonthlyIncome = state.monthlyIncome;

          if (syncedData.bills) {
            for (const billId in syncedData.bills) {
              const incomingBill = syncedData.bills[billId];
              if (state.bills[billId]) {
                // Bill exists, merge/update (last write wins for the whole object)
                newBills[billId] = { ...state.bills[billId], ...incomingBill, updatedAt: new Date().toISOString() };
                billsMergedCount++;
              } else {
                // New bill, add it
                newBills[billId] = { ...incomingBill, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
                billsAddedCount++;
              }
            }
            addSyncLog(`Bills hydrated: ${billsAddedCount} added, ${billsMergedCount} merged. Total bills: ${Object.keys(newBills).length}`, 'success');
          } else {
            addSyncLog('No bills data in snapshot for BillStore.', 'info');
          }

          if (typeof syncedData.monthlyIncome === 'number') {
            newMonthlyIncome = Math.max(0, syncedData.monthlyIncome); // Ensure non-negative
            if (state.monthlyIncome !== newMonthlyIncome) {
              addSyncLog(`Monthly income updated from ${state.monthlyIncome} to ${newMonthlyIncome} via sync.`, 'info');
            }
          } else {
            addSyncLog('No monthly income data in snapshot for BillStore.', 'info');
          }
          
          return { bills: newBills, monthlyIncome: newMonthlyIncome };
        });
        addSyncLog('✅ BillStore hydration complete.', 'success');
      },
    }),
    {
      name: 'bill-storage',
      storage: asyncStorage,
    }
  )
);
