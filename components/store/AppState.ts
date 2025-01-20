import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storage } from './MMKV';

// Define your store's state type
interface AppState {
  // Example state
  counter: number;
  // Example actions
  increment: () => void;
  decrement: () => void;
}

// Create store with persistence
export const useStore = create<AppState>()(
  persist(
    (set) => ({
      counter: 0,
      increment: () => set((state) => ({ counter: state.counter + 1 })),
      decrement: () => set((state) => ({ counter: state.counter - 1 })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          const value = storage.getString(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          storage.set(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          storage.delete(name);
        },
      })),
    }
  )
);
