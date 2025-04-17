import React from 'react';
import { useUserStore } from '@/store/UserStore';
import { useState, useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { View, Text } from 'react-native';

export default function Index() {
  const [initializing, setInitializing] = useState(true);
  const hasCompletedOnboarding = useUserStore((state) => state.preferences.hasCompletedOnboarding);

  // Call app initialization hook at the top level (per React rules)
  useAppInitialization();
  useEffect(() => {
    setInitializing(false);
  }, []);

  if (initializing) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%'
      }}>
        <Text style={{ color: 'white', fontSize: 20 }}>Loading...</Text>
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/screens/onboarding" />;
  }
  return <Redirect href="/(drawer)/(tabs)" />;
}
