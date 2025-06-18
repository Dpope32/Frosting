import React, { useState, useEffect, useRef } from 'react';
import { YStack, isWeb, ScrollView } from 'tamagui';
import { Animated } from 'react-native';
import { Marquee, MarqueeStyles } from '@/components/welcome/marquee';
import { SyncSection } from '@/components/welcome/syncSection';
import { ParticleBackground } from '@/components/welcome/ParticleBackground';
import { HeroSection } from '@/components/welcome/HeroSection';
import { MobileVideosSection } from '@/components/welcome/MobileVideosSection';
import { DesktopVideosSection } from '@/components/welcome/DesktopVideosSection';
import { FloatingContinueButton } from '@/components/welcome/FloatingContinueButton';
import { MobileFeaturesSection } from '@/components/welcome/MobileFeaturesSection';

export default function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showContinueButton, setShowContinueButton] = useState(false);
  
  // Animation refs for sections
  const descriptionOpacity = useRef(new Animated.Value(0)).current;
  const descriptionTranslateY = useRef(new Animated.Value(50)).current;
  const syncSectionOpacity = useRef(new Animated.Value(0)).current;
  const syncSectionTranslateY = useRef(new Animated.Value(50)).current;

  // Track animation states to prevent re-triggering
  const animationStates = useRef({
    description: false,
    sync: false
  });

  // Scroll-reactive background
  const getDynamicBackground = (scrollY: number) => {
    const progress = Math.min(scrollY / 2000, 1);
    const hue1 = 220 + (progress * 80); // Blue to purple
    const hue2 = 180 + (progress * 120); // Cyan to magenta
    
    return {
      backgroundImage: [
        `radial-gradient(circle at ${20 + progress * 30}% ${30 + progress * 20}%, hsla(${hue1}, 70%, 60%, ${0.15 + progress * 0.1}) 0%, transparent 40%)`,
        `radial-gradient(circle at ${80 - progress * 20}% ${70 - progress * 10}%, hsla(${hue2}, 60%, 70%, ${0.1 + progress * 0.05}) 0%, transparent 35%)`,
        `radial-gradient(circle at 50% 50%, hsla(${200 + progress * 40}, 50%, 65%, ${0.08 + progress * 0.04}) 0%, transparent 30%)`,
        `linear-gradient(${135 + progress * 90}deg, #0E1120 0%, hsl(${220 + progress * 20}, 30%, 25%) 50%, #030308 100%)`
      ].join(', '),
      backgroundSize: `${100 + progress * 20}% ${100 + progress * 20}%`,
      backgroundPosition: `${progress * 20}% ${progress * 15}%`,
      backgroundAttachment: 'fixed',
    };
  };

  // Optimized scroll listener
  useEffect(() => {
    if (!isWeb) return;

    const listener = scrollY.addListener(({ value }) => {
      setScrollOffset(value);
      setShowContinueButton(value > 300);
      
      // Animate mobile videos section
      if (value > 600 && !animationStates.current.description) {
        animationStates.current.description = true;
        Animated.parallel([
          Animated.timing(descriptionOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(descriptionTranslateY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }
      
      // Animate desktop videos section
      if (value > 1400 && !animationStates.current.sync) {
        animationStates.current.sync = true;
        Animated.parallel([
          Animated.timing(syncSectionOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(syncSectionTranslateY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, [scrollY, descriptionOpacity, descriptionTranslateY, syncSectionOpacity, syncSectionTranslateY]);

  const combinedContentContainerStyle = {
    flexGrow: 1,
    paddingVertical: isWeb ? 80 : 0, 
    ...(isWeb ? getDynamicBackground(scrollOffset) : {})
  };

  return (
    <>
      <ParticleBackground scrollY={scrollOffset} />
      
      <ScrollView 
        contentContainerStyle={{
          ...combinedContentContainerStyle,
          paddingVertical: isWeb ? 80 : 80, 
          paddingLeft: 20,
        }}
        onScroll={isWeb ? Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        ) : undefined}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {isWeb && <MarqueeStyles />}
        
        <YStack
          flex={1}
          paddingHorizontal="$4"
          paddingTop="$12"
          gap="$8"
          width="100%"
          position="relative"
          zi={1} 
          minHeight="100vh"
          justifyContent="flex-start"
          alignItems="center"
        >
          <HeroSection 
            scrollOffset={scrollOffset} 
            onComplete={onComplete} 
          />
          
          {isWeb && (
            <YStack width="100%" alignItems="center" paddingTop="$8">
              <Marquee/>
            </YStack>
          )}

          <MobileVideosSection
            scrollOffset={scrollOffset}
            descriptionOpacity={descriptionOpacity}
            descriptionTranslateY={descriptionTranslateY}
          />

          <DesktopVideosSection
            scrollOffset={scrollOffset}
            syncSectionOpacity={syncSectionOpacity}
            syncSectionTranslateY={syncSectionTranslateY}
          />

          {isWeb ? (
            <Animated.View
              style={{
                opacity: syncSectionOpacity,
                transform: [{ translateY: syncSectionTranslateY }],
                width: '100%',
                paddingTop: 40,
                paddingBottom: 120,
              }}
            >
              <YStack alignItems="center" width="100%">
                <SyncSection />
              </YStack>
            </Animated.View>
          ) : (
            <MobileFeaturesSection />
          )}
        </YStack>
      </ScrollView> 

      <FloatingContinueButton
        showContinueButton={showContinueButton}
        scrollOffset={scrollOffset}
        onComplete={onComplete}
      />
    </>
  );
}
