import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/store';
import { Redirect } from 'expo-router';
import { useAppInitialization } from '@/hooks/useAppInitialization';

export default function Index() {
  const [showIntro, setShowIntro] = useState(true);
  const hasCompletedOnboarding = useUserStore((state) => state.preferences.hasCompletedOnboarding);

  useAppInitialization();
  useEffect(() => {
    setShowIntro(true);
    const timer = setTimeout(() => setShowIntro(false), 100);
    return () => clearTimeout(timer);
  }, []);
  

  if (!hasCompletedOnboarding) {
    return <Redirect href="/screens/onboarding" />;
  }
  
  return <Redirect href="/(drawer)/(tabs)" />;
}
