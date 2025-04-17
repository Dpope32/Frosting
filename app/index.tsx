import React from 'react';
import { useUserStore } from '@/store/UserStore';
import { useState, useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAppInitialization } from '@/hooks/useAppInitialization';

export default function Index() {
  const [showIntro, setShowIntro] = useState(true);
  const hasCompletedOnboarding = useUserStore((state) => state.preferences.hasCompletedOnboarding);
  useAppInitialization();
  useEffect(() => {
    setShowIntro(true);
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  
  // If onboarding is not completed, go to onboarding
  if (!hasCompletedOnboarding) {
    return <Redirect href="/screens/onboarding" />;
  }
  
  // If onboarding is completed, go to drawer tabs layout
  return <Redirect href="/(drawer)/(tabs)" />;
}