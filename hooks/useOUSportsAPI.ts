// hooks/useOUSportsAPI.ts
import { useQuery } from '@tanstack/react-query';
import type { Game } from '../types/espn';

const ESPN_API_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/201/schedule';

interface ESPNResponse {
  events: Game[];
}

export const useOUSportsAPI = () => {
  const fetchOUSchedule = async (): Promise<Game[]> => {
    try {
      const response = await fetch(`${ESPN_API_URL}?season=2025`);
      if (!response.ok) throw new Error('Failed to fetch schedule');
      
      const data: ESPNResponse = await response.json();
      return data.events;
    } catch (error) {
      throw error;
    }
  };

  return useQuery<Game[], Error>({
    queryKey: ['ou-schedule'],
    queryFn: fetchOUSchedule,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};
