// components/home/InitialSyncIndicator.tsx

import React, { useEffect, useState, useRef } from 'react';
import { Platform, Animated, View } from 'react-native';
import { YStack, XStack, Text, Stack, isWeb } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { useUserStore, useRegistryStore } from '@/store';
import { isIpad } from '@/utils';

// Conditional BlurView import to prevent crashes
let BlurView: any = null;
try {
  if (Platform.OS !== 'web') {
    BlurView = require('expo-blur').BlurView;
  }
} catch (error) {
  console.warn('BlurView not available:', error);
}

interface InitialSyncIndicatorProps {
  isDark: boolean;
}

export function InitialSyncIndicator({ isDark }: InitialSyncIndicatorProps) {
  const premium = useUserStore(s => s.preferences?.premium === true);
  const isInitialSyncInProgress = useRegistryStore(s => s.isInitialSyncInProgress);
  const primaryColor = useUserStore(s => s.preferences?.primaryColor) || '#007AFF';
  
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [dots, setDots] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const shouldShow = premium && isInitialSyncInProgress;

  // Safe mounting
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Rotation animation for sync icon
  useEffect(() => {
    if (!isMounted || !shouldShow) return;

    const startRotation = () => {
      rotateAnim.setValue(0);
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    };

    startRotation();

    return () => {
      rotateAnim.stopAnimation();
    };
  }, [rotateAnim, isMounted, shouldShow]);

  // Fade in animation
  useEffect(() => {
    if (!isMounted || !shouldShow) return;

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    return () => {
      fadeAnim.stopAnimation();
    };
  }, [fadeAnim, isMounted, shouldShow]);

  // Animated dots
  useEffect(() => {
    if (!isMounted || !shouldShow) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isMounted, shouldShow]);

  // Early return AFTER all hooks - but return an invisible, non-blocking container
  if (!shouldShow || !isMounted) {
    return (
      <View style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none', // Critical: Don't block touches when hidden
        zIndex: -1, // Move behind everything when hidden
      }} />
    );
  }

  const backgroundColor = isDark ? "rgba(14, 14, 15, 0.75)" : "rgba(0, 0, 0, 0.35)";
  
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const ContentComponent = () => (
    <XStack alignItems="center" justifyContent="center" gap="$3" paddingVertical="$2">
      <Animated.View
        style={{
          transform: [{ rotate: rotation }],
        }}
      >
        <MaterialIcons 
          name="sync" 
          size={isWeb ? 24 : isIpad() ? 22 : 20} 
          color={primaryColor} 
        />
      </Animated.View>
      
      <YStack alignItems="center" gap="$1">
        <Text 
          color="white" 
          fontSize={isWeb ? 16 : isIpad() ? 15 : 14} 
          fontWeight="600" 
          fontFamily="$body"
        >
          Syncing with workspace{dots}
        </Text>
        <Text 
          color={isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.8)"} 
          fontSize={isWeb ? 13 : isIpad() ? 12 : 11} 
          fontFamily="$body"
        >
          Pulling latest data from your devices
        </Text>
      </YStack>
    </XStack>
  );

  return (
    <Animated.View style={{ 
      opacity: fadeAnim, 
      pointerEvents: shouldShow ? 'auto' : 'none',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
    }}>
      {Platform.OS === 'web' || !BlurView ? (
        <Stack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          justifyContent="center"
          alignItems="center"
          style={{ 
            backdropFilter: 'blur(20px)', 
            backgroundColor: backgroundColor,
          }}
        >
          <Stack    
            backgroundColor={isDark ? 'rgba(35, 38, 47, 0.95)' : 'rgba(247, 248, 250, 0.95)'} 
            borderRadius={16} 
            padding="$3" 
            borderColor={isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.1)"} 
            borderWidth={1}
            style={{ 
              boxShadow: isDark 
                ? '0px 4px 24px rgba(0, 0, 0, 0.45), inset 0px 0px 1px rgba(255, 255, 255, 0.12)' 
                : '0px 4px 24px rgba(0, 0, 0, 0.15), inset 0px 0px 1px rgba(255, 255, 255, 0.2)',
              width: isIpad() ? 400 : 380,
              maxWidth: isIpad() ? 400 : 380,
            }}
          >
            <ContentComponent />
          </Stack>
        </Stack>
      ) : (
        <BlurView 
          intensity={Platform.OS === 'ios' ? 80 : 120} 
          tint={isDark ? 'dark' : 'light'} 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View style={{
            backgroundColor: isDark ? 'rgba(35, 38, 47, 0.95)' : 'rgba(247, 248, 250, 0.95)', 
            padding: 12, 
            borderRadius: 16,
            borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.1)",
            borderWidth: 1,
            shadowColor: isDark ? "#000" : "rgba(0, 0, 0, 0.15)", 
            shadowOffset: { width: 0, height: 4 }, 
            shadowOpacity: 0.35,  
            shadowRadius: 12,
            elevation: 5, 
            width: '90%', 
            maxWidth: isIpad() ? 400 : 380, 
          }}>
            <ContentComponent />
          </View>
        </BlurView>
      )}
    </Animated.View>
  );
}