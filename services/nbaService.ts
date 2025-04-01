
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
        console.log(`[NBA API] Attempt ${attempt + 1}/${maxRetries}: ${url}`);
        const response = await fetch(url, options);
        if (response.ok) return response;
        
        // Only retry if we get certain error codes
        if (response.status === 429 || response.status >= 500) {
          // Exponential backoff
          const waitTime = 1000 * Math.pow(2, attempt);
          console.log(`[NBA API] Rate limited or server error. Waiting ${waitTime}ms before retry...`);
          await new Promise(r => setTimeout(r, waitTime));
          continue;
        }
        
        return response; // Return non-retryable error responses
      } catch (error) {
        lastError = error;
        console.error(`[NBA API] Network error on attempt ${attempt + 1}:`, error);
        // Only retry network errors
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
      console.warn(`[NBA API] Invalid team code: ${teamCode}, using default`);
      return 'okc';
    }
    
    // Already fixed in constants/nba.ts
    return espnTeamCodes[teamCode] || 'okc';
  };
    
  export const getNBASeason = (): number => {
    return getCurrentNBASeason();
  };
