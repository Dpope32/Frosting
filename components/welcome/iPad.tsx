import React from 'react';
import { YStack, XStack, H2, Text, isWeb } from 'tamagui';
import { Animated } from 'react-native';
import { OptimizedVideo } from './OptimizedVideo';

interface DesktopVideosSectionProps {
  scrollOffset: number;
  syncSectionTranslateY: Animated.Value;
}

export const IPad = ({ 
  scrollOffset, 
  syncSectionTranslateY 
}: DesktopVideosSectionProps) => {
  if (!isWeb) return null;

  return (  
    <YStack
      width="100%"
      height="auto"
      overflow="hidden"
      paddingHorizontal="$2"
    >
      <YStack alignItems="center" width="100%" paddingBottom="$4">
        <H2 textAlign="center" fontSize="$7" lineHeight="$8">
          iPad Users, rejoice.
        </H2>
      </YStack>
      <YStack 
        alignItems="center" 
        justifyContent="center"
        paddingBottom="$4"
        width="100%"
        maxWidth="100%"
        overflow="hidden"
        objectFit="contain"
        borderRadius={24}
      >
        <OptimizedVideo
          src={require('@/assets/videos/hero-2.mp4')}
          delay={200}
          style={{
            width: '100%',
            maxWidth: "350px",
            height: "auto",
            borderRadius: 36,
            opacity: 0.95,
            objectFit: 'cover',
            transform: `translateY(${Math.cos(scrollOffset * 0.0012) * 4}px)`,
            boxShadow: "0 6px 32px #C080FF33, 0 2px 12px #4ADECD22",
          }}
        />
      </YStack>
    </YStack>
  );
};