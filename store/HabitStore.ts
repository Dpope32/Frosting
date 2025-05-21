import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TaskCategory, Habit as HabitType } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cancelHabitNotification } from '@/services';
import { addSyncLog } from '@/components/sync/syncUtils';

export interface Habit extends HabitType {
  updatedAt?: string;
}

interface HabitStore {
  habits: Record<string, Habit>;
  hydrated: boolean;
  isSyncEnabled: boolean;
  addHabit: (title: string, category: TaskCategory, notificationTimeValue: string, customMessage: string, description: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  deleteHabit: (habitId: string) => void;
  editHabit: (habitId: string, updates: Partial<Habit>) => void;
  toggleHabitSync: () => void;
  hydrateFromSync?: (syncedData: { habits?: Record<string, Habit>, isSyncEnabled?: boolean }) => void;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: {},
      hydrated: false,
      isSyncEnabled: false,
      
      addHabit: (title: string, category: TaskCategory, notificationTimeValue: string, customMessage: string, description: string) => set((state) => {
        const id = Math.random().toString(36).substring(2, 9);
        const now = new Date().toISOString();
        const today = now.split('T')[0];
        
        const newHabit: Habit = {
          id,
          title,
          category,
          createdAt: today,
          completionHistory: {},
          notificationTimeValue,
          customMessage,
          description,
          updatedAt: now,
        };
        addSyncLog(`[HabitStore] Habit added locally: ${title}`, 'info');
        return {
          habits: {
            ...state.habits,
            [id]: newHabit,
          }
        };
      }),

      toggleHabitCompletion: (habitId: string, date: string) => set((state) => {
        const habit = state.habits[habitId];
        if (!habit) return state;

        const newCompletionStatus = !habit.completionHistory[date];
        addSyncLog(`[HabitStore] Habit completion toggled: ${habit.title}, Date: ${date}, Status: ${newCompletionStatus}`, 'info');
        return {
          habits: {
            ...state.habits,
            [habitId]: {
              ...habit,
              completionHistory: {
                ...habit.completionHistory,
                [date]: newCompletionStatus
              },
              updatedAt: new Date().toISOString(),
            }
          }
        };
      }),

      deleteHabit: (habitId: string) => set((state) => {
        const habit = state.habits[habitId];
        if (habit) {
          const identifier = `${habit.title}-${habit.notificationTimeValue}`;
          cancelHabitNotification(identifier);
          cancelHabitNotification(habit.title);
          addSyncLog(`[HabitStore] Habit deleted locally: ${habit.title}`, 'info');
        }
        const { [habitId]: _, ...rest } = state.habits;
        return { habits: rest };
      }),

      editHabit: (habitId: string, updates: Partial<Habit>) => set((state) => {
        const habit = state.habits[habitId];
        if (!habit) return state;
        addSyncLog(`[HabitStore] Habit edited locally: ${habit.title}`, 'info');
        return {
          habits: {
            ...state.habits,
            [habitId]: {
              ...habit,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          }
        };
      }),

      toggleHabitSync: () => {
        set((state) => {
          const newSyncState = !state.isSyncEnabled;
          addSyncLog(`[HabitStore] Habits sync ${newSyncState ? 'enabled' : 'disabled'}.`, 'info');
          return { isSyncEnabled: newSyncState };
        });
      },

      hydrateFromSync: (syncedData: { habits?: Record<string, Habit>, isSyncEnabled?: boolean }) => {
        const localStore = get();
        addSyncLog(`[Hydrate Attempt] HabitStore sync is currently ${localStore.isSyncEnabled ? 'ENABLED' : 'DISABLED'}.`, 'verbose');

        if (!localStore.isSyncEnabled) {
          addSyncLog('[HabitStore] Local habits sync is OFF. Skipping hydration.', 'info');
          return;
        }

        if (syncedData.isSyncEnabled === false) {
          addSyncLog('[HabitStore] Incoming snapshot for habits has sync turned OFF. Skipping hydration.', 'warning');
          return;
        }

        if (!syncedData.habits || typeof syncedData.habits !== 'object') {
          addSyncLog('[HabitStore] No habits data in snapshot or data is malformed. Skipping hydration.', 'info');
          return;
        }

        addSyncLog('[HabitStore] 🔄 Hydrating habits from sync...', 'info');
        let itemsMergedCount = 0;
        let itemsAddedCount = 0;

        const currentHabits = { ...localStore.habits }; 
        const incomingHabits = syncedData.habits;

        for (const id in incomingHabits) {
          const incomingHabit = incomingHabits[id];
          const localHabit = currentHabits[id];

          if (localHabit) {
            const localUpdatedAt = new Date(localHabit.updatedAt || localHabit.createdAt || 0).getTime();
            const incomingUpdatedAt = new Date(incomingHabit.updatedAt || incomingHabit.createdAt || 0).getTime();

            if (incomingUpdatedAt > localUpdatedAt) {
              const mergedCompletionHistory = { ...localHabit.completionHistory, ...incomingHabit.completionHistory }; 
              currentHabits[id] = { 
                ...localHabit,
                ...incomingHabit,
                completionHistory: mergedCompletionHistory,
              };
              itemsMergedCount++;
            } else if (incomingUpdatedAt === localUpdatedAt && localHabit.id === incomingHabit.id) {
              const mergedCompletionHistory = { ...localHabit.completionHistory, ...incomingHabit.completionHistory }; 
              currentHabits[id] = {
                 ...localHabit, 
                 ...incomingHabit,
                 completionHistory: mergedCompletionHistory,
              };
            }
          } else {
            currentHabits[id] = incomingHabit;
            itemsAddedCount++;
          }
        }
        
        set({ habits: currentHabits });
        addSyncLog(`[HabitStore] Habits hydrated: ${itemsAddedCount} added, ${itemsMergedCount} updated based on timestamp. Total habits: ${Object.keys(currentHabits).length}.`, 'success');
      },
    }),
    {
      name: 'habit-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
        }
      },
      partialize: (state) => ({ 
        habits: state.habits, 
        isSyncEnabled: state.isSyncEnabled
      }),
    }
  )
);
