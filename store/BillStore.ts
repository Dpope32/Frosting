import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';
import { Bill } from '@/types/bills';
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
          const newBills = { ...state.bills };
          delete newBills[id];
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
