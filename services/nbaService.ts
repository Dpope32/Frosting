import { useUserStore } from '../store/UserStore';
import { espnTeamCodes, getCurrentNBASeason } from '../constants/nba';

export const getCurrentTeamCode = (): string => {
    const userPreferences = useUserStore().preferences;
    return userPreferences.favoriteNBATeam || 'OKC';
};
  
export const getESPNTeamCode = (teamCode: string): string => {
    return espnTeamCodes[teamCode] || 'okc'; 
};
  
export const getNBASeason = (): number => {
    return getCurrentNBASeason();
};