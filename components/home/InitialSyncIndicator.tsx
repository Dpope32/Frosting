// components/home/InitialSyncIndicator.tsx

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Platform, Animated, View, Modal } from 'react-native';
import { YStack, XStack, Text, Stack, isWeb, Spinner } from 'tamagui';
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
  // Check if user store is hydrated
  const userHydrated = useUserStore(s => s.hydrated);
  
  // Early return if user store not hydrated - this prevents crashes
  if (!userHydrated) {
    return null;
  }
  
  const premium = useUserStore(s => s.preferences?.premium === true);
  const isInitialSyncInProgress = useRegistryStore(s => s.isInitialSyncInProgress);
  const primaryColor = useUserStore(s => s.preferences?.primaryColor) || '#007AFF';
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [dots, setDots] = useState('');
  const isComponentMounted = useRef(true); // For interval cleanup

  const shouldShow = premium && isInitialSyncInProgress;

  // Defensive: ensure isIpad() always returns a boolean
  const isIpadDevice = !!isIpad(); 
  const safeWidth = isIpadDevice ? 400 : 380;
  const safeMaxWidth = isIpadDevice ? 400 : 380;

  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  // Fade in animation
  useEffect(() => {
    if (!shouldShow) {
      fadeAnim.stopAnimation();
      fadeAnim.setValue(0); // Reset fade to ensure it's hidden
      return;
    }
    const animation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    });
    animation.start();
    return () => {
      animation.stop();
    };
  }, [fadeAnim, shouldShow]);

  // Animated dots
  useEffect(() => {
    if (!shouldShow) {
      setDots(''); // Reset dots when not showing
      return;
    }
    const interval = setInterval(() => {
      if (!isComponentMounted.current) return; // Check if component is still mounted
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);
    return () => clearInterval(interval);
  }, [shouldShow]);

  const animatedViewStyle = useMemo(() => ({
    opacity: fadeAnim,
    pointerEvents: shouldShow ? 'auto' : 'none' as 'auto' | 'none',
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center' as 'center',
    alignItems: 'center' as 'center',
    zIndex: 99999,
  }), [fadeAnim, shouldShow]);

  // Early return if not showing - AFTER ALL HOOKS
  if (!shouldShow) {
    return null;
  }

  const backgroundColor = isDark ? "rgba(14, 14, 15, 0.75)" : "rgba(0, 0, 0, 0.35)";

  const ContentComponent = () => {
    return (
      <XStack alignItems="center" justifyContent="center" gap="$3" paddingVertical="$2">
        <Spinner 
          size="large" 
          color={primaryColor}
          opacity={0.9}
        />
        
        <YStack alignItems="center" gap="$1">
          <Text 
            fontFamily="$body"
            fontSize={isWeb ? 16 : 14}
            fontWeight="600"
            color="$color"
            opacity={0.9}
          >
            Syncing with workspace{dots}
          </Text>
          <Text
            fontFamily="$body"
            fontSize={isWeb ? 13 : 11}
            color="$color"
            opacity={0.7}
          >
            Pulling latest data from your devices
          </Text>
        </YStack>
      </XStack>
    );
  };

  return (
    <Modal visible={shouldShow} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={animatedViewStyle}>
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
              width: safeWidth,
              maxWidth: safeMaxWidth,
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
            width: safeWidth, 
            maxWidth: safeMaxWidth, 
          }}>
            <ContentComponent />
          </View>
        </BlurView>
      )}
    </Animated.View>
    </Modal>
  );
}
