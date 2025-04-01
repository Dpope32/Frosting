// Update useSportsAPI.tsx
import { useQueries } from '@tanstack/react-query';
import { getCurrentTeamCode, getESPNTeamCode, getNBASeason, fetchWithRetry } from '../services/nbaService';
import type { Game } from '../store/NBAStore';
import { useNBAStore } from '../store/NBAStore';
import { useUserStore } from '../store/UserStore';
import { nbaTeams } from '../constants/nba';
import React from 'react';

export const useSportsAPI = () => {
  const { setGames, setLoading, setError, setTeamInfo, cacheSchedule, getCachedSchedule } = useNBAStore();
  const teamCode = getCurrentTeamCode();
  const espnTeamCode = getESPNTeamCode(teamCode);
  const season = getNBASeason();
  const hasCompletedOnboarding = useUserStore((state) => state.preferences.hasCompletedOnboarding); 
  const team = nbaTeams.find(t => t.code === teamCode);
  const teamName = team?.name || 'Oklahoma City Thunder';

  React.useEffect(() => {
    if (hasCompletedOnboarding && team) {
      setTeamInfo(teamCode, teamName);
    }
  }, [teamCode, teamName, setTeamInfo]);
  
  const ESPN_API_URL = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${espnTeamCode.toLowerCase()}/schedule`;
  const ESPN_TEAM_API_URL = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${espnTeamCode.toLowerCase()}`;
  
  const fetchNBASchedule = async (): Promise<Game[]> => {
    try {
      setLoading(true);
      setError(null);
      // Check cache first - only if onboarding is complete
      const cachedData = getCachedSchedule(teamCode, season);
      if (cachedData) {
        console.log(`[NBA API] Using cached schedule for ${teamCode} (${season})`);
        setGames(cachedData);
        return cachedData;
      }
      
      console.log(`[NBA API] Fetching schedule for ${teamCode} (${espnTeamCode}) - Season: ${season}`);
      
      const requestHeaders = {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; NBA/1.0)'
      };
      
      // Try with current season
      const response = await fetchWithRetry(
        `${ESPN_API_URL}?season=${season}`,
        { headers: requestHeaders }
      );
      
      if (response.status === 400) {
        console.log(`[NBA API] Bad request for ${teamCode} with season ${season}. Trying previous season...`);
        // Try with previous season as fallback
        const fallbackSeason = season - 1;
        const fallbackResponse = await fetchWithRetry(
          `${ESPN_API_URL}?season=${fallbackSeason}`,
          { headers: requestHeaders }
        );
        
        if (!fallbackResponse.ok) {
          throw new Error(`Failed to fetch data for ${teamName}: ${fallbackResponse.status}`);
        }
        
        const data = await fallbackResponse.json();
        const games = processScheduleData(data);
        cacheSchedule(teamCode, fallbackSeason, games);
        return games;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const games = processScheduleData(data);
      cacheSchedule(teamCode, season, games);
      return games;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch ${teamName} schedule`;
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const processScheduleData = (data: any): Game[] => {
    if (!data.events || !Array.isArray(data.events)) {
      throw new Error('Invalid response format from API');
    }
    
    const today = new Date();
    const games: Game[] = data.events
      .filter((event: any) => new Date(event.date) >= today)
      .map((event: any) => {
        const isHomeGame = event.name.includes(`at ${teamName}`);
        const teams = event.name.split(" at ");
        let homeTeam, awayTeam;
        
        if (isHomeGame) {
          homeTeam = teamName;
          awayTeam = teams[0];
        } else {
          homeTeam = teams[1];
          awayTeam = teamName;
        }
        
        let homeScore, awayScore;
        if (event.competitions?.[0]?.competitors) {
          const homeCompetitor = event.competitions[0].competitors.find((c: any) => c.homeAway === 'home');
          const awayCompetitor = event.competitions[0].competitors.find((c: any) => c.homeAway === 'away');
          homeScore = homeCompetitor?.score ? parseInt(homeCompetitor.score) : undefined;
          awayScore = awayCompetitor?.score ? parseInt(awayCompetitor.score) : undefined;
        }
        
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
          season,
          teamCode
        };
      });
    
    setGames(games);
    useNBAStore.getState().syncGameTasks();
    return games;
  };
  
  const fetchTeamStats = async () => {
    try {
      console.log(`[NBA API] Fetching team stats for ${teamCode} (${espnTeamCode})`);
      const response = await fetchWithRetry(
        ESPN_TEAM_API_URL,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; NBA/1.0)'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`[NBA API] Error fetching team stats:`, error);
      return null;
    }
  };
  
  // Update the query parameters for better performance
  const results = useQueries({
    queries: [
      {
        queryKey: [`nba-schedule-${teamCode}-${season}`], 
        queryFn: fetchNBASchedule,
        enabled: hasCompletedOnboarding && !!teamCode && !!espnTeamCode, 
        staleTime: 1000 * 60 * 60 * 2, 
        gcTime: 1000 * 60 * 60 * 24,
        refetchInterval: 1000 * 60 * 60 * 2,
        refetchOnWindowFocus: true,
        retry: 3,
      },
      {
        queryKey: [`nba-team-stats-${teamCode}`],
        queryFn: fetchTeamStats,
        enabled: hasCompletedOnboarding && !!teamCode && !!espnTeamCode, 
        staleTime: 1000 * 60 * 60 * 2, 
        gcTime: 1000 * 60 * 60 * 24,
        refetchInterval: 1000 * 60 * 60 * 2,
        retry: 3,
      }
    ]
  });
  
  const [scheduleQuery, statsQuery] = results;
  
  const throttledRefetch = React.useCallback(
    (() => {
      let lastCall = 0;
      const throttleTime = 5000;
      
      return () => {
        const now = Date.now();
        if (now - lastCall >= throttleTime) {
          lastCall = now;
          scheduleQuery.refetch();
          statsQuery.refetch();
        } 
      };
    })(),
    [scheduleQuery, statsQuery]
  );
  
  return {
    data: scheduleQuery.data,
    isLoading: scheduleQuery.isLoading || scheduleQuery.isFetching,
    error: scheduleQuery.error,
    refetch: throttledRefetch,
    teamStats: statsQuery.data
  };
};
