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
  addBill: (bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteBill: (id: string) => void;
  getBills: () => Bill[];
  clearBills: () => void;
  setMonthlyIncome: (income: number) => void;
}

const asyncStorage = createPersistStorage<BillStore>();

export const useBillStore = create<BillStore>()(
  persist(
    (set, get) => ({
      bills: {},
      monthlyIncome: 0,

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
      },

      setMonthlyIncome: (income: number) => {
        // Ensure income is not negative
        const validIncome = Math.max(0, income);
        set({ monthlyIncome: validIncome });
      },
    }),
    {
      name: 'bill-storage',
      storage: asyncStorage,
    }
  )
);
