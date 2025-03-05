import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';
import { useProjectStore, WeekDay } from './ToDo';
import { useUserStore } from './UserStore';
import { espnTeamCodes, getCurrentNBASeason, nbaTeams } from '../constants/nba';
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
  teamCode: string; // The team code (e.g., "OKC")
}

interface NBAStore {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  teamCode: string; // The team code (e.g., "OKC")
  teamName: string; // The team name (e.g., "Oklahoma City Thunder")
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
      teamCode: 'OKC', // Default to OKC Thunder
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
        // First delete all existing game tasks
        get().deleteAllGameTasks();
        const { addTask } = useProjectStore.getState();
        const state = get();
        const now = new Date();
        const weekDays: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

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

            // Add task - the addTask function now handles deduplication
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
      
      // Clear all NBA calendar events
      clearNBACalendarEvents: () => {
        const { events } = useCalendarStore.getState();
        const calendarStore = useCalendarStore.getState();
        
        // Filter out NBA events
        events.forEach(event => {
          if (event.type === 'nba') {
            calendarStore.deleteEvent(event.id);
          }
        });
      },
      
      // Sync NBA games to calendar
      syncNBAGames: () => {
        // First clear existing NBA events
        get().clearNBACalendarEvents();
        
        // Check if user wants to show NBA games in calendar
        const userPreferences = useUserStore.getState().preferences;
        if (!userPreferences.showNBAGamesInCalendar) {
          console.log('NBA games in calendar disabled by user preference');
          return; // Exit if user doesn't want to show NBA games in calendar
        }
        
        const state = get();
        const calendarStore = useCalendarStore.getState();
        const now = new Date();
        const team = nbaTeams.find(t => t.code === state.teamCode);
        
        if (!team) return;
        
        console.log('Syncing NBA games to calendar for team:', state.teamCode);
        
        // Add each game as a calendar event
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
        
        console.log('NBA games sync complete');
      }
    }),
    {
      name: 'nba-store',
      storage: createPersistStorage<NBAStore>(),
    }
  )
);

// Helper function to get the current team code from user preferences
export const getCurrentTeamCode = (): string => {
  const userPreferences = useUserStore.getState().preferences;
  return userPreferences.favoriteNBATeam || 'OKC'; // Default to OKC if not set
};

// Helper function to get the ESPN API team code
export const getESPNTeamCode = (teamCode: string): string => {
  return espnTeamCodes[teamCode] || 'okc'; // Default to OKC if not found
};

// Helper function to get the current NBA season
export const getNBASeason = (): number => {
  return getCurrentNBASeason();
};
