// Update NBAStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';
import { useCalendarStore } from './CalendarStore';
import { useProjectStore } from './ToDo';

export interface Game {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'live' | 'finished';
  season: number;
  teamCode: string;
}

interface CachedSchedule {
  timestamp: number;
  data: Game[];
}

interface NBAStore {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  teamCode: string;
  teamName: string;
  gameScheduleCache: Record<string, CachedSchedule>;
  setGames: (games: Game[]) => void;
  setTeamInfo: (code: string, name: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  syncGameTasks: () => void;
  deleteAllGameTasks: () => void;
  syncNBAGames: () => void;
  clearAllNBAData: () => void;
  clearNBACalendarEvents: () => void;
  cacheSchedule: (teamCode: string, season: number, data: Game[]) => void;
  getCachedSchedule: (teamCode: string, season: number) => Game[] | null;
}

export const useNBAStore = create<NBAStore>()(
  persist(
    (set, get) => ({
      games: [],
      isLoading: false,
      error: null,
      teamCode: 'OKC',
      teamName: 'Oklahoma City Thunder',
      gameScheduleCache: {},

      // Existing methods
      setGames: (games) => set({ games }),
      setTeamInfo: (code, name) => set({ teamCode: code, teamName: name }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // New caching methods
      cacheSchedule: (teamCode, season, data) => {
        const cacheKey = `${teamCode}-${season}`;
        set(state => ({
          gameScheduleCache: {
            ...state.gameScheduleCache,
            [cacheKey]: {
              timestamp: Date.now(),
              data
            }
          }
        }));
      },
      getCachedSchedule: (teamCode, season) => {
        const cacheKey = `${teamCode}-${season}`;
        const cached = get().gameScheduleCache[cacheKey];
        const maxAge = 1000 * 60 * 60; // 1 hour
        if (cached && Date.now() - cached.timestamp < maxAge) {
          return cached.data;
        }
        return null;
      },

      // Existing methods
      deleteAllGameTasks: () => {
        const { tasks, deleteTask } = useProjectStore.getState();
        Object.entries(tasks).forEach(([id, task]) => {
          if (task.name.startsWith('🏀') || task.name.includes('🏀')) {
            deleteTask(id);
          }
        });
      },
      clearAllNBAData: () => {
        // Clear all NBA games and cache
        set({
          games: [],
          gameScheduleCache: {},
          error: null
        });
        // Also delete any NBA tasks
        get().deleteAllGameTasks();
      },
      syncGameTasks: () => {
        get().deleteAllGameTasks();
        return;
      },
      clearNBACalendarEvents: () => {
        const { events } = useCalendarStore.getState();
        const calendarStore = useCalendarStore.getState();

        events.forEach(event => {
          if (event.type === 'nba') {
            calendarStore.deleteEvent(event.id);
          }
        });
      },
      syncNBAGames: () => {
        // NBA season ended - clear any existing calendar events and don't create new ones
        get().clearNBACalendarEvents();
        console.log('[NBA] syncNBAGames called but NBA season has ended, skipping calendar sync');
        return;
      },
    }),
    {
      name: 'nba-store',
      storage: createPersistStorage<NBAStore>(),
    }
  )
);