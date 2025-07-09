import { useUserStore } from '@/store'
import { addDevTasks } from './devTasks'
import { router } from 'expo-router'

export const skipOnboardingInDev = async (): Promise<void> => {
  if (!__DEV__) {
    console.warn('skipOnboardingInDev called in production - ignoring')
    return
  }

  try {
    const setPreferences = useUserStore.getState().setPreferences
    setPreferences({
      username: 'DevUser',
      profilePicture: 'https://picsum.photos/200',
      primaryColor: '#007AFF',
      zipCode: '90210',
      backgroundStyle: 'gradient',
      hasCompletedOnboarding: true,
      notificationsEnabled: true,
      quoteEnabled: true,
      showQuoteOnHome: false,
      portfolioEnabled: true,
      temperatureEnabled: true,
      wifiEnabled: true,
      showNBAGamesInCalendar: false,
      showNBAGameTasks: false,
      permissionsExplained: true,
      calendarPermission: false,
    })
    addDevTasks()
    await new Promise(resolve => setTimeout(resolve, 100))
    router.replace('/(drawer)/(tabs)')
  } catch (error) {
    console.error('❌ Error skipping onboarding:', error)
    throw error
  }
} 