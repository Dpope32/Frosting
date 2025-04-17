import React from 'react';
import { useUserStore } from '@/store/UserStore';
import { useState, useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { View } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  useSharedValue,
  Easing
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
export default function Index() {
  const [initializing, setInitializing] = useState(true);
  const hasCompletedOnboarding = useUserStore((state) => state.preferences.hasCompletedOnboarding);
  const isDark = useColorScheme()
  const username = useUserStore((state) => state.preferences.username);
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const logoBackgroundColor = isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(245, 245, 245, 0.9)';
  const logoBorderColor = primaryColor || "#00BFFF";
  const loadingMessage = username 
    ? `Getting things ready for you, ${username}...` 
    : "Getting things ready for you...";

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
  const opacity = useSharedValue(0.4);
  const scale = useSharedValue(0.95);
  const rotation = useSharedValue(0);
  // Initialize app in parallel with store hydration
  useEffect(() => {
    const initialize = async () => {
      await Promise.all([
        new Promise(resolve => {
          const unsubscribe = useUserStore.subscribe((state) => {
            if (state.hydrated) {
              unsubscribe();
              resolve(null);
            }
          });
        }),
        useAppInitialization()
      ]);
      setInitializing(false);
    };

    initialize();
  }, []);

  if (initializing) {
    const rotation = useSharedValue(0);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));

    useEffect(() => {
      rotation.value = withRepeat(
        withSequence(
          withTiming(360, { duration: 1000, easing: Easing.linear }),
          withTiming(0, { duration: 0 })
        ),
        -1
      );
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
                color="#f9f9f9"
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
              color="$gray10"
            >
              {loadingMessage}
            </Text>
          </YStack>
        </YStack>
      </View>
    );
  }

  return hasCompletedOnboarding ? <Redirect href="/(drawer)/home" /> : <Redirect href="/onboarding" />;
}
