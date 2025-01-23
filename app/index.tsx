
import { useUserStore } from '@/store/UserStore';
import { useState, useEffect } from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  const [showIntro, setShowIntro] = useState(true);
  const hasCompletedOnboarding = useUserStore((state) => state.preferences.hasCompletedOnboarding);

  useEffect(() => {
    // Hide intro after 5 seconds
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // If onboarding is not completed, go to onboarding
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }
  
  // If onboarding is completed, go to drawer layout
  return <Redirect href="/(drawer)" />;
}
