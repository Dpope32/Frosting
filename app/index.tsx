import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/store/UserStore';
import { Redirect } from 'expo-router';
import { useAppInitialization } from '@/hooks/useAppInitialization';
//import { useRegistryStore } from '@/store/RegistryStore';

export default function Index() {
  const [showIntro, setShowIntro] = useState(true);
  const hasCompletedOnboarding = useUserStore((state) => state.preferences.hasCompletedOnboarding);
  const hasHydrated = useUserStore((state) => (state as any).hydrated ?? false);
  
  //const { logSyncStatus } = useRegistryStore();
  
  // Call app initialization hook at the top level (per React rules)
  useAppInitialization();
  
  // Set a timeout to ensure we don't get stuck in the intro state
  useEffect(() => {
    setShowIntro(true);
    
    // Log sync status when app starts
   // logSyncStatus();
    
    // Always proceed after 3 seconds, regardless of hydration status
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