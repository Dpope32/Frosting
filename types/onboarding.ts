

export type FormData = {
  username: string;
  profilePicture: string;
  primaryColor: string;
  backgroundStyle: `wallpaper-${string}` | 'gradient'; 
  zipCode: string;
  favoriteNBATeam?: string;
  showNBAGamesInCalendar?: boolean;
  showNBAGameTasks?: boolean; // Added preference for showing NBA tasks
};

export type ColorOption = {
  label: string
  value: string
}
