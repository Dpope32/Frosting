
import { useUserStore } from '@/store/UserStore';
import { useState, useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAppInitialization, preloadTheme } from '@/hooks/useAppInitialization';

// Pre-load theme as early as possible to prevent theme bounce
preloadTheme().catch(error => console.error('Error pre-loading theme:', error));

export default function Index() {
  const [showIntro, setShowIntro] = useState(true);
  const hasCompletedOnboarding = useUserStore((state) => state.preferences.hasCompletedOnboarding);
  
  // Initialize the app (loads NBA and Thunder schedules, syncs games to tasks and calendar)
  useAppInitialization();

  useEffect(() => {
    // Hide intro after 1 seconds
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // If onboarding is not completed, go to onboarding 
  if (!hasCompletedOnboarding) {
    return <Redirect href="/screens/onboarding" />;
  }
  
  // If onboarding is completed, go to drawer tabs layout
  return <Redirect href="/(drawer)/(tabs)" />;
}
