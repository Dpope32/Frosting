// types/espn.ts
export interface Competitor {
    id: string;
    homeAway: 'home' | 'away';
    team: {
      shortDisplayName: string;
    };
  }
  
 export interface Competition {
    competitors: Competitor[];
    venue: {
      fullName: string;
    };
  }
  
 export interface GameStatus {
    type: {
      shortDetail: string;
    };
  }
  
 export interface Game {
    id: string;
    date: string;
    name?: string;
    shortName?: string;
    competitions?: Competition[];
    status?: GameStatus;
  }