import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StorageUtils } from './MMKV';

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
    (set) => ({
      games: [],
      isLoading: false,
      error: null,
      setGames: (games) => set({ games }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'thunder-store',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
