import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AnimatedIntro from '@/components/AnimatedIntro';
import { useUserStore } from '@/store/UserStore';
import Onboarding from '../screens/onboarding';
import { LandingPage } from '@/components/LandingPage';
import { Colors } from '@/constants/Colors';

export default function Page() {
  const [showIntro, setShowIntro] = useState(true);
  const hasCompletedOnboarding = useUserStore((state) => state.preferences.hasCompletedOnboarding);

  useEffect(() => {
    // Hide intro after 5 seconds
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return (
      <View style={styles.container}>
        <AnimatedIntro />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hasCompletedOnboarding ? <LandingPage /> : <Onboarding />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});
