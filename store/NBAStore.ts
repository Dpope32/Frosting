import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';
import { useProjectStore } from './ToDo';
import { useUserStore } from './UserStore';
import { nbaTeams } from '../constants/nba';
import { useCalendarStore } from './CalendarStore';
import { format } from 'date-fns';

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

interface NBAStore {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  teamCode: string; 
  teamName: string; 
  setGames: (games: Game[]) => void;
  setTeamInfo: (code: string, name: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  syncGameTasks: () => void;
  deleteAllGameTasks: () => void;
  syncNBAGames: () => void;
  clearNBACalendarEvents: () => void;
}

export const useNBAStore = create<NBAStore>()(
  persist(
    (set, get) => ({
      games: [],
      isLoading: false,
      error: null,
      teamCode: 'OKC', 
      teamName: 'Oklahoma City Thunder',
      setGames: (games) => set({ games }),
      setTeamInfo: (code, name) => set({ teamCode: code, teamName: name }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      deleteAllGameTasks: () => {
        const { tasks, deleteTask } = useProjectStore.getState();
        Object.entries(tasks).forEach(([id, task]) => {
          if (task.name.startsWith('🏀')) {
            deleteTask(id);
          }
        });
      },
      syncGameTasks: () => {
        get().deleteAllGameTasks();
        const { addTask } = useProjectStore.getState();
        const state = get();
        const now = new Date();

        // Sync NBA games
        state.games.forEach((game: Game) => {
          const gameDate = new Date(game.date);
          if (gameDate >= now) {
            const teamName = state.teamName.replace('Oklahoma City ', '');
            const isHome = game.homeTeam.includes(state.teamName);
            const opponent = (isHome ? game.awayTeam : game.homeTeam).replace(`${state.teamName} `, '');
            const location = isHome ? 'vs ' : '@ ';
            const taskName = `🏀 ${teamName} ${location}${opponent}`;
            
            const gameTime = new Date(game.date).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit'
            });

            addTask({
              name: taskName,
              schedule: [],
              priority: 'medium',
              category: 'personal',
              scheduledDate: game.date,
              time: gameTime,
              recurrencePattern: 'one-time'
            });
          }
        });
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
        get().clearNBACalendarEvents();
        
        const userPreferences = useUserStore.getState().preferences;
        if (!userPreferences.showNBAGamesInCalendar) {
          return; 
        }
        
        const state = get();
        const calendarStore = useCalendarStore.getState();
        const now = new Date();
        const team = nbaTeams.find(t => t.code === state.teamCode);
        
        if (!team) return;
        
        state.games.forEach((game: Game) => {
          const gameDate = new Date(game.date);
          if (gameDate >= now) {
            const isHome = game.homeTeam.includes(state.teamName);
            const opponent = (isHome ? game.awayTeam : game.homeTeam).replace(`${state.teamName} `, '');
            const location = isHome ? 'vs ' : '@ ';
            const gameTime = new Date(game.date).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit'
            });
            
            calendarStore.addEvent({
              date: format(gameDate, 'yyyy-MM-dd'),
              time: gameTime,
              title: `${state.teamName} ${location}${opponent}`,
              description: `${state.teamName} ${location}${opponent}`,
              type: 'nba',
              teamCode: state.teamCode
            });
          }
        });
      }
    }),
    {
      name: 'nba-store',
      storage: createPersistStorage<NBAStore>(),
    }
  )
);
