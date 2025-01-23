import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { storage } from './MMKV';

// Create a storage adapter that implements the StateStorage interface
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

interface BusyDays {
  [key: string]: boolean;
}

interface CalendarState {
  busyDays: BusyDays;
  toggleBusyDay: (date: string) => void;
  clearBusyDays: () => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      busyDays: {},
      toggleBusyDay: (date) =>
        set((state) => ({
          busyDays: {
            ...state.busyDays,
            [date]: !state.busyDays[date],
          },
        })),
      clearBusyDays: () => set({ busyDays: {} }),
    }),
    {
      name: 'calendar-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
