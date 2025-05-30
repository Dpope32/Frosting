// components/home/InitialSyncIndicator.tsx

import React, { useEffect, useState } from 'react';
import { Platform, Animated } from 'react-native';
import { YStack, XStack, Text, Stack, isWeb } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { useUserStore, useRegistryStore } from '@/store';
import { BlurView } from 'expo-blur';
import { isIpad } from '@/utils';

interface InitialSyncIndicatorProps {
  isDark: boolean;
}

export function InitialSyncIndicator({ isDark }: InitialSyncIndicatorProps) {
  const premium = useUserStore(s => s.preferences.premium === true);
  const isInitialSyncInProgress = useRegistryStore(s => s.isInitialSyncInProgress);
  const primaryColor = useUserStore(s => s.preferences.primaryColor);
  
  const [rotateAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [dots, setDots] = useState('');

  // Don't show for non-premium users or when not syncing
  if (!premium || !isInitialSyncInProgress) {
    return null;
  }

  // Rotation animation for sync icon
  useEffect(() => {
    const startRotation = () => {
      rotateAnim.setValue(0);
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: Platform.OS !== 'web',
        })
      ).start();
    };

    startRotation();
  }, [rotateAnim]);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [fadeAnim]);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const backgroundColor = isDark ? "rgba(14, 14, 15, 0.95)" : "rgba(0, 0, 0, 0.45)";
  
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <BlurView 
        intensity={100}
        style={{
          borderRadius: 16,
          padding: 12,
          marginBottom: 12,
          backgroundColor: backgroundColor,
          borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          backdropFilter: 'blur(12px)',
          boxShadow: isDark 
            ? '0px 4px 24px rgba(0, 0, 0, 0.45), inset 0px 0px 1px rgba(255, 255, 255, 0.12)' 
            : '0px 4px 24px rgba(0, 0, 0, 0.15), inset 0px 0px 1px rgba(255, 255, 255, 0.2)' 
        }}
      >
        </BlurView>
      <Stack    
        backgroundColor={backgroundColor}
        borderRadius={16} 
        padding="$3" 
        marginBottom="$3"
        borderColor={isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.1)"} 
        borderWidth={1}
        style={Platform.OS === 'web' ? { 
          backdropFilter: 'blur(12px)',
          boxShadow: isDark 
            ? '0px 4px 24px rgba(0, 0, 0, 0.45), inset 0px 0px 1px rgba(255, 255, 255, 0.12)' 
            : '0px 4px 24px rgba(0, 0, 0, 0.15), inset 0px 0px 1px rgba(255, 255, 255, 0.2)' 
        } : {  
          shadowColor: isDark ? "#000" : "rgba(0, 0, 0, 0.15)", 
          shadowOffset: { width: 0, height: 4 }, 
          shadowOpacity: 0.35,  
          shadowRadius: 12  
        }}
      >
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
      </Stack>
    </Animated.View>
  );
}