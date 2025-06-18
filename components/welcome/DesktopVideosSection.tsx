import React from 'react';
import { YStack, XStack, H2, Text, isWeb } from 'tamagui';
import { Animated } from 'react-native';
import { OptimizedVideo } from './OptimizedVideo';

interface DesktopVideosSectionProps {
  scrollOffset: number;
  syncSectionOpacity: Animated.Value;
  syncSectionTranslateY: Animated.Value;
}

export const DesktopVideosSection = ({ 
  scrollOffset, 
  syncSectionOpacity, 
  syncSectionTranslateY 
}: DesktopVideosSectionProps) => {
  if (!isWeb) return null;

  return (
    <Animated.View
      style={{
        opacity: syncSectionOpacity,
        transform: [{ translateY: syncSectionTranslateY }],
        width: '100%',
        paddingTop: 100,
        paddingBottom: 60,
      }}
    >
      <YStack alignItems="center" width="100%" paddingBottom="$8">
        <H2>
          From desktop to tablet.
        </H2>
        <Text 
          color="$onboardingLabel" 
          fontSize="$5" 
          textAlign="center" 
          opacity={0.85} 
          lineHeight="$7" 
          maxWidth={600} 
          fontWeight="400" 
          paddingTop="$4"
        >
          Experience the full power across all your devices.
        </Text>
      </YStack>

      <XStack 
        alignItems="center" 
        justifyContent="center"
        paddingBottom="$8"
        gap={40}
        width="100%"
      >
        <OptimizedVideo
          src={require('@/assets/videos/hero-ambient-1.mp4')}
          delay={0}
          style={{
            width: '55%',
            maxWidth: 700,
            height: "auto",
            borderRadius: 32,
            opacity: 0.95,
            objectFit: 'cover',
            boxShadow: '0 8px 48px #C080FF33, 0 2px 16px #4ADECD22',
            transform: `translateY(${Math.sin(scrollOffset * 0.001) * 3}px)`
          }}
        />
        <OptimizedVideo
          src={require('@/assets/videos/hero-2.mp4')}
          delay={200}
          style={{
            width: '30%',
            maxWidth: 400,
            height: "auto",
            borderRadius: 32,
            opacity: 0.95,
            objectFit: 'cover',
            boxShadow: '0 8px 48px #4ADECD33, 0 2px 16px #C080FF22',
            transform: `translateY(${Math.cos(scrollOffset * 0.0012) * 4}px)`
          }}
        />
      </XStack>
    </Animated.View>
  );
}; 