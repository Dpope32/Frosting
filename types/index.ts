export interface Stock {
    symbol: string;
    quantity: number;
    name: string;
    purchasePrice?: number; // Optional purchase price for calculating all-time returns
  }

export type FormData = {
  username: string;
  profilePicture: string;
  primaryColor: string;
  backgroundStyle: `wallpaper-${string}` | 'gradient'; // Use template literal for dynamic wallpaper names
  zipCode: string;
  favoriteNBATeam?: string; // Team code (e.g., "OKC")
  showNBAGamesInCalendar?: boolean; // Whether to show NBA games in the calendar
};

export type ColorOption = {
  label: string
  value: string
}

export type BackgroundStyleOption = {
  label: string
  value: string
}
