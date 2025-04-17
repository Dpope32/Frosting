import React from 'react';
import { useUserStore } from '@/store/UserStore';
import { useState, useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { YStack, XStack, Text } from 'tamagui';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  useSharedValue,
  Easing
} from 'react-native-reanimated';

export default function Index() {
  const [initializing, setInitializing] = useState(true);
  const hasCompletedOnboarding = useUserStore((state) => state.preferences.hasCompletedOnboarding);
  const hasHydrated = useUserStore((state) => (state as any).hydrated ?? false);

  // Call app initialization hook at the top level (per React rules)
  useAppInitialization();

  // Set a maximum initialization time of 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // If the store hasn't hydrated yet, show loading screen
  if (!hasHydrated) {
    return <LoadingScreen />;
  }

  // After hydration, proceed with normal flow
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
  
  // Get user preferences from store
  const username = useUserStore((state) => state.preferences.username);
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  
  // Derived colors
  const textColor = isDark ? "#A0A0A0" : "#707070";
  const logoBackgroundColor = isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(245, 245, 245, 0.9)';
  const logoBorderColor = primaryColor || "#00BFFF";
  const loadingMessage = username 
    ? `Getting things ready for you, ${username}...` 
    : "Getting things ready for you...";

  const opacity = useSharedValue(0.4);
  const scale = useSharedValue(0.95);
  const rotation = useSharedValue(0);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.6, { duration: 1000 })
      ),
      -1,
      true
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(0.95, { duration: 1000 })
      ),
      -1,
      true
    );

    rotation.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }]
    };
  });

  const borderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value * 360}deg` }]
    };
  });

  return (
    <View style={{
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%'
    }}>
      <YStack alignItems="center" gap="$5">
        <Animated.View style={logoStyle}>
          <XStack
            width={120}
            height={120}
            borderRadius={60}
            backgroundColor={logoBackgroundColor}
            borderWidth={2}
            borderColor={logoBorderColor}
            alignItems="center"
            justifyContent="center"
          >
            <Animated.View
              style={[{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: 60,
                borderWidth: 3,
                borderColor: logoBorderColor,
                borderTopColor: 'transparent',
                borderRightColor: 'transparent'
              }, borderStyle]}
            />
            <Text
              fontFamily="$heading"
              fontSize={30}
              fontWeight="bold"
              color={primaryColor}
            >
              Kaiba
            </Text>
          </XStack>
        </Animated.View>
        <YStack alignItems="center" gap="$3" marginTop="$3">
          <Text
            fontFamily="$body"
            fontSize={16}
            textAlign="center"
            color={textColor}
          >
            {loadingMessage}
          </Text>
        </YStack>
      </YStack>
    </View>
  );
}