import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { storage } from './MMKV';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: number; // 1-31
  createdAt: string;
  updatedAt: string;
}

interface BillStore {
  bills: Record<string, Bill>;
  addBill: (bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteBill: (id: string) => void;
  getBills: () => Bill[];
}

const mmkvStorage: StateStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

export const useBillStore = create<BillStore>()(
  persist(
    (set, get) => ({
      bills: {},

      addBill: (billData) => {
        const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const newBill: Bill = {
          ...billData,
          id,
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
    }),
    {
      name: 'bill-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
