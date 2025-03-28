import { useQueries } from '@tanstack/react-query';
import { getCurrentTeamCode, getESPNTeamCode, getNBASeason } from '../services/nbaService';
import type { Game } from '../store/NBAStore';
import { useNBAStore } from '../store/NBAStore';
import { nbaTeams } from '../constants/nba';
import React from 'react';

export const useSportsAPI = () => {
  const { setGames, setLoading, setError, setTeamInfo } = useNBAStore();
  const teamCode = getCurrentTeamCode();
  const espnTeamCode = getESPNTeamCode(teamCode);
  const season = getNBASeason();
  const team = nbaTeams.find(t => t.code === teamCode);
  const teamName = team?.name || 'Oklahoma City Thunder';
  
  React.useEffect(() => {if (team) { setTeamInfo(teamCode, teamName)}},
   [teamCode, teamName, setTeamInfo]);
  
  const ESPN_API_URL = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${espnTeamCode.toLowerCase()}/schedule`;
  const ESPN_TEAM_API_URL = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${espnTeamCode.toLowerCase()}`;
  
  const fetchNBASchedule = async (): Promise<Game[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${ESPN_API_URL}?season=${season}`, {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch ${teamName} schedule`;
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTeamStats = async () => {
    try {
      const response = await fetch(ESPN_TEAM_API_URL, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; NBA/1.0)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching team stats:", error);
      return null;
    }
  };
  
  const results = useQueries({
    queries: [
      {
        queryKey: [`nba-schedule-${teamCode}`],
        queryFn: fetchNBASchedule,
        staleTime: 1000 * 60 * 60 * 24, 
        gcTime: 1000 * 60 * 60 * 24, 
        refetchInterval: 1000 * 60 * 60 * 24, 
      },
      {
        queryKey: [`nba-team-stats-${teamCode}`],
        queryFn: fetchTeamStats,
        staleTime: 1000 * 60 * 60 * 6,
        gcTime: 1000 * 60 * 60 * 24, 
        refetchInterval: 1000 * 60 * 60 * 6, 
      }
    ]
  });
  
  const [scheduleQuery, statsQuery] = results;

  return {
    data: scheduleQuery.data,
    isLoading: scheduleQuery.isLoading,
    error: scheduleQuery.error,
    refetch: () => {
      scheduleQuery.refetch();
      statsQuery.refetch();
    },
    teamStats: statsQuery.data
  };
};