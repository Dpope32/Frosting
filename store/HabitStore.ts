import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TaskCategory } from '@/types/task';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationTime = 'morning' | 'afternoon' | 'evening' | 'night' | 'none';

export interface Habit {
  id: string;
  title: string;
  category: TaskCategory;
  createdAt: string; // ISO date string
  completionHistory: Record<string, boolean>; // date string -> completed
  notificationTime: NotificationTime;
}

interface HabitStore {
  habits: Record<string, Habit>;
  hydrated: boolean;
  addHabit: (title: string, category: TaskCategory, notificationTime: NotificationTime) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  deleteHabit: (habitId: string) => void;
  editHabit: (habitId: string, updates: Partial<Habit>) => void;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      habits: {},
      hydrated: false,
      
      addHabit: (title: string, category: TaskCategory, notificationTime: NotificationTime) => set((state) => {
        const id = Math.random().toString(36).substring(2, 9);
        const today = new Date().toISOString().split('T')[0];
        
        return {
          habits: {
            ...state.habits,
            [id]: {
              id,
              title,
              category,
              createdAt: today,
              completionHistory: {},
              notificationTime
            }
          }
        };
      }),

      toggleHabitCompletion: (habitId: string, date: string) => set((state) => {
        const habit = state.habits[habitId];
        if (!habit) return state;

        return {
          habits: {
            ...state.habits,
            [habitId]: {
              ...habit,
              completionHistory: {
                ...habit.completionHistory,
                [date]: !habit.completionHistory[date]
              }
            }
          }
        };
      }),

      deleteHabit: (habitId: string) => set((state) => {
        const { [habitId]: _, ...rest } = state.habits;
        return { habits: rest };
      }),

      editHabit: (habitId: string, updates: Partial<Habit>) => set((state) => {
        const habit = state.habits[habitId];
        if (!habit) return state;

        return {
          habits: {
            ...state.habits,
            [habitId]: {
              ...habit,
              ...updates
            }
          }
        };
      })
    }),
    {
      name: 'habit-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        console.log('HabitStore hydration started');
        if (state) {
          state.hydrated = true;
          console.log('HabitStore hydration completed', state.habits);
        }
      },
      partialize: (state) => ({ habits: state.habits }),
    }
  )
); 