import React from 'react';
import { useUserStore } from '@/store/UserStore';
import { useState, useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { View, Animated } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { YStack, XStack, Text, Spinner } from 'tamagui';
import { useRef } from 'react';

export default function Index() {
  const [initializing, setInitializing] = useState(true);
  const hasCompletedOnboarding = useUserStore((state) => state.preferences.hasCompletedOnboarding);

  // Call app initialization hook at the top level (per React rules)
  useAppInitialization();
  useEffect(() => {
    setInitializing(false);
  }, []);

  if (initializing) {
    return <LoadingScreen />;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/screens/onboarding" />;
  }
  return <Redirect href="/(drawer)/(tabs)" />;
}

function LoadingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark' || !colorScheme;
  const fadeAnim = useRef(new Animated.Value(0.4)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    });
    
    const fadeOut = Animated.timing(fadeAnim, {
      toValue: 0.4,
      duration: 1000,
      useNativeDriver: true
    });
    
    const scaleUp = Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    });
    
    const scaleDown = Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 1000,
      useNativeDriver: true
    });

    Animated.loop(
      Animated.parallel([
        Animated.sequence([fadeIn, fadeOut]),
        Animated.sequence([scaleUp, scaleDown])
      ])
    ).start();
  }, []);

  return (
    <View style={{
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%'
    }}>
      <YStack alignItems="center" gap="$4">
        <Animated.View style={{ 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }}>
          <XStack 
            width={120} 
            height={120} 
            borderRadius={60} 
            backgroundColor={isDark ? '#111111' : '#F5F5F5'}
            borderWidth={2}
            borderColor="#dbd0c6"
            alignItems="center" 
            justifyContent="center"
          >
            <Text 
              fontFamily="$heading"
              fontSize={30}
              fontWeight="bold"
              style={{ color: '#dbd0c6' }}
            >
              Kaiba
            </Text>
          </XStack>
        </Animated.View>
        <YStack alignItems="center" gap="$2" marginTop="$2">
          <Text 
            fontFamily="$body"
            fontSize={14}
            style={{ color: isDark ? "rgba(0, 255, 238, 0.7)" : "rgba(219, 208, 198, 0.8)" }}
          >
            Getting things ready for you...
          </Text>
          <Spinner size="large" color={isDark ? "white" : "black"} />
        </YStack>
      </YStack>
    </View>
  );
}
