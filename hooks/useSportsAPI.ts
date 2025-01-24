import { useQuery } from '@tanstack/react-query';
import { useThunderStore } from '../store/ThunderStore';
import type { Game } from '../store/ThunderStore';

const ESPN_API_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/okc/schedule';

export const useSportsAPI = () => {
  const { setGames, setLoading, setError } = useThunderStore();

  const fetchThunderSchedule = async (): Promise<Game[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${ESPN_API_URL}?season=2025`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; NBA/1.0)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.events || !Array.isArray(data.events)) {
        throw new Error('Invalid response format from API');
      }

      // Filter games from today onwards
      const today = new Date();
      const games: Game[] = data.events
        .filter((event: any) => new Date(event.date) >= today)
        .map((event: any) => {
          const isHomeGame = event.name.includes("at Oklahoma City Thunder");
          const teams = event.name.split(" at ");
          let homeTeam, awayTeam;
          
          if (isHomeGame) {
            homeTeam = "Oklahoma City Thunder";
            awayTeam = teams[0];
          } else {
            homeTeam = teams[1];
            awayTeam = "Oklahoma City Thunder";
          }

          // Parse scores if available
          let homeScore, awayScore;
          if (event.competitions?.[0]?.competitors) {
            const homeCompetitor = event.competitions[0].competitors.find((c: any) => c.homeAway === 'home');
            const awayCompetitor = event.competitions[0].competitors.find((c: any) => c.homeAway === 'away');
            homeScore = homeCompetitor?.score ? parseInt(homeCompetitor.score) : undefined;
            awayScore = awayCompetitor?.score ? parseInt(awayCompetitor.score) : undefined;
          }

          // Parse game status
          let status: 'scheduled' | 'live' | 'finished' = 'scheduled';
          if (event.status?.type) {
            if (event.status.type.completed) {
              status = 'finished';
            } else if (event.status.type.state === 'in') {
              status = 'live';
            }
          }

          return {
            id: parseInt(event.id),
            date: event.date,
            homeTeam,
            awayTeam,
            homeScore,
            awayScore,
            status,
            season: 2025
          };
      });

      setGames(games);
      return games;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Thunder schedule';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return useQuery<Game[], Error>({
    queryKey: ['thunder-schedule'],
    queryFn: fetchThunderSchedule,
    staleTime: 1000 * 60 * 60 * 6,
    gcTime: 1000 * 60 * 60 * 12,
    refetchInterval: 1000 * 60 * 60 * 24,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
