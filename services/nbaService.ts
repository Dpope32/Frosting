
import { espnTeamCodes, getCurrentNBASeason } from '../constants/nba';
import { useUserStore } from '../store/UserStore';

export const fetchWithRetry = async (
    url: string, 
    options: RequestInit, 
    maxRetries = 3
  ): Promise<Response> => {
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
        if (response.status === 429 || response.status >= 500) {
          const waitTime = 1000 * Math.pow(2, attempt);
          await new Promise(r => setTimeout(r, waitTime));
          continue;
        }
        
        return response; 
      } catch (error) {
        lastError = error;
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
    throw lastError || new Error(`Failed after ${maxRetries} attempts`);
  };
  
  export const getCurrentTeamCode = (): string => {
    const userPreferences = useUserStore.getState().preferences;
    return userPreferences.favoriteNBATeam || 'OKC';
  };
    
  export const getESPNTeamCode = (teamCode: string): string => {
    if (!teamCode || typeof teamCode !== 'string') {
      return 'okc';
    }
    
    return espnTeamCodes[teamCode] || 'okc';
  };
    
  export const getNBASeason = (): number => {
    return getCurrentNBASeason();
  };
