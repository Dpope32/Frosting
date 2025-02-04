import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StorageUtils } from './MMKV';
import { useProjectStore, WeekDay } from './ToDo';
import { preloadedOUSchedule } from '@/constants/ouschedule';

export interface Game {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'live' | 'finished';
  season: number;
}

interface ThunderStore {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  setGames: (games: Game[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  syncGameTasks: () => void;
}

// Create MMKV storage adapter
const mmkvStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = StorageUtils.get<string>(name);
    return value ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    StorageUtils.set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    StorageUtils.delete(name);
  },
};

export const useThunderStore = create<ThunderStore>()(
  persist(
    (set, get) => ({
      games: [],
      isLoading: false,
      error: null,
      setGames: (games) => set({ games }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      syncGameTasks: () => {
        const addTask = useProjectStore.getState().addTask;
        const state = get();
        const now = new Date();
        const weekDays: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        // Sync Thunder games
        state.games.forEach((game: Game) => {
          const gameDate = new Date(game.date);
          if (gameDate >= now) {
            const isHome = game.homeTeam === 'Oklahoma City Thunder';
            const opponent = isHome ? game.awayTeam : game.homeTeam;
            const location = isHome ? 'home' : '@ ';
            
            addTask({
              name: `🏀 Thunder ${location}${opponent}`,
              schedule: [weekDays[gameDate.getDay()]],
              priority: 'medium',
              category: 'personal',
              isOneTime: true,
              scheduledDate: game.date,
              time: new Date(game.date).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit'
              })
            });
          }
        });

        // Sync OU games
        preloadedOUSchedule.forEach(game => {
          const gameDate = new Date(game.date);
          if (gameDate >= now && game.competitions?.[0]) {
            const competition = game.competitions[0];
            const ouTeam = competition.competitors?.find(c => c.id === '201');
            const opponent = competition.competitors?.find(c => c.id !== '201');
            const isHome = ouTeam?.homeAway === 'home';
            const location = isHome ? 'vs' : '@';
            const gameTime = competition.status?.type?.shortDetail;
            
            addTask({
              name: `🏈 OU ${location} ${opponent?.team?.shortDisplayName ?? 'TBD'}`,
              schedule: [weekDays[gameDate.getDay()]],
              priority: 'medium',
              category: 'personal',
              isOneTime: true,
              scheduledDate: game.date,
              time: gameTime !== 'TBD' ? gameTime : 'TBD'
            });
          }
        });
      }
    }),
    {
      name: 'thunder-store',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
