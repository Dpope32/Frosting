import { BackgroundStyle } from '@/constants';
export interface UserPreferences {
    username: string;
    /**
     * Profile picture of the user.
     */
    profilePicture?: string;
    /**
     * Primary color of the users theme.
     */
    primaryColor: string;
    /**
     * Custom background of the user.
     */
    customBackground?: string;
    /**
     * Zip code of the user.
     */
    zipCode: string;
    /**
     * Wallpaper on the homescreen
     */
    backgroundStyle?: BackgroundStyle;
    /**
     * Switches the user from rendering onboarding vs the drawer layout
     */
    hasCompletedOnboarding: boolean;
    /**
     * Toggles all notifications on the device.
     */
    notificationsEnabled: boolean;
    /**
     * Toggles the quote card on the home screen.
     */
    quoteEnabled: boolean;
    /**
     * Toggles the portfolio card on the home screen.
     */
    portfolioEnabled: boolean;
    /**
     * Toggles the temperature card on the home screen.
     */
    temperatureEnabled: boolean;
    /**
     * Toggles the wifi card on the home screen.
     */
    wifiEnabled: boolean;
     /**
     * NBA Features currently not available during the offseason. 
     */
    favoriteNBATeam?: string;
     /**
     * Set from the step 5 in the onboarding flow.
     */
    showNBAGamesInCalendar: boolean;
    /**
     * Toggles the NBA emojis in the calendar on gamedays
     */
    showNBAGameTasks: boolean;
      /**
     * Shows Tasks on Gameday to the user on the home screen
     */
    permissionsExplained: boolean;
    /**
     * Only premium users can use sync features. Default is false.
     */
    premium?: boolean;
  }