import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TaskCategory } from '@/types/task';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cancelHabitNotification } from '@/services';
import { Habit } from '@/types/habits';

interface HabitStore {
  habits: Record<string, Habit>;
  hydrated: boolean;
  addHabit: (title: string, category: TaskCategory, notificationTimeValue: string, customMessage: string, description: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  deleteHabit: (habitId: string) => void;
  editHabit: (habitId: string, updates: Partial<Habit>) => void;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      habits: {},
      hydrated: false,
      
      addHabit: (title: string, category: TaskCategory, notificationTimeValue: string, customMessage: string, description: string) => set((state) => {
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
              notificationTimeValue,
              customMessage,
              description
            }
          }
        };
      }),

      toggleHabitCompletion: (habitId: string, date: string) => set((state) => {
        const habit = state.habits[habitId];
        if (!habit) return state;

        const newCompletionStatus = !habit.completionHistory[date];
        // Only update completionHistory, do not cancel notification here
        return {
          habits: {
            ...state.habits,
            [habitId]: {
              ...habit,
              completionHistory: {
                ...habit.completionHistory,
                [date]: newCompletionStatus
              }
            }
          }
        };
      }),

      deleteHabit: (habitId: string) => set((state) => {
        const habit = state.habits[habitId];
        if (habit) {
          // Cancel the scheduled notification for this habit
          // Use both identifier formats just to be safe
          const identifier = `${habit.title}-${habit.notificationTimeValue}`;
          cancelHabitNotification(identifier);
          
          // Also try canceling by just the habit title as a fallback
          // This helps clean up any stray notifications
          cancelHabitNotification(habit.title);
        }
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
        if (state) {
          state.hydrated = true;
        }
      },
      partialize: (state) => ({ habits: state.habits }),
    }
  )
);
