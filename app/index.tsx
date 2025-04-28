import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useUserStore } from '@/store/UserStore';
import { useAppInitialization } from '@/hooks/useAppInitialization';

export default function Index() {
  // only a cheap selector
  const hasCompletedOnboarding = useUserStore(
    (s) => s.preferences.hasCompletedOnboarding
  );

  // kick off your "I do not care about holding up navigation" init
  useEffect(() => {
    // fire-and-forget
    useAppInitialization();
  }, []);

  // instant redirect, no waiting
  if (!hasCompletedOnboarding) {
    return <Redirect href="/screens/onboarding" />;
  }
  return <Redirect href="/(drawer)/(tabs)" />;
}