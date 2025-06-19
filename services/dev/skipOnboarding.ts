import { useUserStore } from '@/store'
import { addDevTasks } from './devTasks'
import { router } from 'expo-router'

export const skipOnboardingInDev = async (): Promise<void> => {
  if (!__DEV__) {
    console.warn('skipOnboardingInDev called in production - ignoring')
    return
  }

  try {
    console.log('🚀 Starting dev onboarding skip...')
    
    const setPreferences = useUserStore.getState().setPreferences

    // Set all the required onboarding data with sensible defaults
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

    console.log('✅ User preferences set')

    // Add some dev tasks to make the home screen more interesting
    addDevTasks()
    console.log('✅ Dev tasks added')

    // Small delay to ensure store updates are processed
    await new Promise(resolve => setTimeout(resolve, 100))

    // Force navigation to the main app
    console.log('🔄 Navigating to main app...')
    router.replace('/(drawer)/(tabs)')
    
    console.log('🚀 Onboarding skipped in dev mode!')
  } catch (error) {
    console.error('❌ Error skipping onboarding:', error)
    throw error
  }
} 