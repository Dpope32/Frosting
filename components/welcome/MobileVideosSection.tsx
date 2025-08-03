import React from 'react';
import { YStack, XStack, H2, Text, isWeb } from 'tamagui';
import { Animated } from 'react-native';
import { OptimizedVideo } from './OptimizedVideo';

interface MobileVideosSectionProps {
  scrollOffset: number;
  descriptionTranslateY: Animated.Value;
}

export const MobileVideosSection = ({ 
  scrollOffset, 
}: MobileVideosSectionProps) => {
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
          You can do it on the go.
        </H2>
      </YStack>

      <YStack alignItems="center" width="100%" paddingBottom="$6">
        <YStack
          width="100%"
          alignItems="center" 
          justifyContent="center"
          maxWidth="100%"
          overflow="hidden"
          borderRadius={24}
        >
          <OptimizedVideo
            src={require('@/assets/videos/mobilehomescreen.mp4')}
            delay={0}
            style={{
              width: '100%',
              maxWidth: '280px',
              height: 'auto',
              objectFit: 'contain',
              aspectRatio: 'auto',
              borderRadius: 20,
              overflow: 'hidden',
              transform: `rotateY(${-8 + scrollOffset * 0.01}deg) rotateX(2deg)`,
              boxShadow: "0 6px 32px #C080FF33, 0 2px 12px #4ADECD22",
            }}
          />
        </YStack>
      </YStack>
    </YStack>
  );
};