import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TaskCategory, Habit as HabitType } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cancelHabitNotification } from '@/services';

let debug = false;
const getAddSyncLog = () => {
  if (debug) {
    return require('@/components/sync/syncUtils').addSyncLog;
  }
  return () => {};
}

export interface Habit extends HabitType {
  updatedAt?: string;
  deletedAt?: string; // Add deletedAt field for soft deletion
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
  getActiveHabits: () => Habit[]; // Add helper to get active habits
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
        getAddSyncLog()(`[HabitStore] Habit added locally: ${title}`, 'info');
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
        getAddSyncLog()(`[HabitStore] Habit completion toggled: ${habit.title}, Date: ${date}, Status: ${newCompletionStatus}`, 'info');
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
          
          getAddSyncLog()(`[HabitStore] 🗑️ Starting deletion process for habit: ${habit.title} (ID: ${habitId})`, 'info');
          getAddSyncLog()(`[HabitStore] Habit before deletion - deletedAt: ${habit.deletedAt || 'null'}`, 'verbose');
          
          const updatedHabit = {
            ...habit,
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          const newState = {
            habits: {
              ...state.habits,
              [habitId]: updatedHabit
            }
          };
          
          getAddSyncLog()(`[HabitStore] ✅ Habit soft-deleted: ${habit.title} - deletedAt: ${updatedHabit.deletedAt}`, 'info');
          getAddSyncLog()(`[HabitStore] Active habits after deletion: ${Object.values(newState.habits).filter(h => !h.deletedAt).length}`, 'info');
          
          return newState;
        }
        getAddSyncLog()(`[HabitStore] ⚠️ Attempted to delete non-existent habit with ID: ${habitId}`, 'warning');
        return state;
      }),

      editHabit: (habitId: string, updates: Partial<Habit>) => set((state) => {
        const habit = state.habits[habitId];
        if (!habit) return state;
        getAddSyncLog()(`[HabitStore] Habit edited locally: ${habit.title}`, 'info');
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
          getAddSyncLog()(`[HabitStore] Habits sync ${newSyncState ? 'enabled' : 'disabled'}.`, 'info');
          return { isSyncEnabled: newSyncState };
        });
      },

      // Add helper function to get only active habits
      getActiveHabits: () => {
        return Object.values(get().habits).filter(habit => !habit.deletedAt);
      },

      hydrateFromSync: (syncedData: { habits?: Record<string, Habit>, isSyncEnabled?: boolean }) => {
        const localStore = get();
        if (!localStore.isSyncEnabled) {
          getAddSyncLog()('[HabitStore] Local habits sync is OFF. Skipping hydration.', 'info');
          return;
        }

        if (syncedData.isSyncEnabled === false) {
          getAddSyncLog()('[HabitStore] Incoming snapshot for habits has sync turned OFF. Skipping hydration.', 'warning');
          return;
        }

        if (!syncedData.habits || typeof syncedData.habits !== 'object') {
          getAddSyncLog()('[HabitStore] No habits data in snapshot or data is malformed. Skipping hydration.', 'info');
          return;
        }

        getAddSyncLog()('[HabitStore] 🔄 Hydrating habits from sync...', 'info');
        let itemsMergedCount = 0;
        let itemsAddedCount = 0;
        let itemsDeletedCount = 0;

        const currentHabits = { ...localStore.habits }; 
        const incomingHabits = syncedData.habits;

        for (const id in incomingHabits) {
          const incomingHabit = incomingHabits[id];
          const localHabit = currentHabits[id];

          if (localHabit) {
            const localUpdatedAt = new Date(localHabit.updatedAt || localHabit.createdAt || 0).getTime();
            const incomingUpdatedAt = new Date(incomingHabit.updatedAt || incomingHabit.createdAt || 0).getTime();

            // Handle deletion sync - if incoming is deleted and local is not
            if (incomingHabit.deletedAt && !localHabit.deletedAt) {
              // Cancel notifications for deleted habit
              const identifier = `${localHabit.title}-${localHabit.notificationTimeValue}`;
              cancelHabitNotification(identifier);
              cancelHabitNotification(localHabit.title);
              
              currentHabits[id] = { ...localHabit, ...incomingHabit };
              itemsDeletedCount++;  
              getAddSyncLog()(
                `[HabitStore] Habit marked as deleted from sync: ${localHabit.title}`, 
                'info'
              );
            } else if (incomingUpdatedAt > localUpdatedAt) {
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
            if (incomingHabit.deletedAt) {
              itemsDeletedCount++;
            } else {
              itemsAddedCount++;
            }
          }
        }
        
        set({ habits: currentHabits });
        
        const activeHabits = Object.values(currentHabits).filter(habit => !habit.deletedAt).length;
        const totalHabits = Object.keys(currentHabits).length;
        
        getAddSyncLog()(
          `[HabitStore] Habits hydrated: ${itemsAddedCount} added, ${itemsMergedCount} updated, ${itemsDeletedCount} deleted. Active: ${activeHabits}/${totalHabits}.`, 
          'info'
        );
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
