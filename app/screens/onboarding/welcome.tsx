import React, { useState, useEffect, useRef } from 'react';
import { YStack, XStack, H1, H2, H3, Text, isWeb, ScrollView, Card, View, styled, Button } from 'tamagui';
import { Linking, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { features } from '@/constants/features';
import { Marquee, MarqueeStyles } from '@/components/welcome/marquee';
import { SyncSection } from '@/components/welcome/syncSection';
import { useToastStore } from '@/store';
// @ts-ignore
import heroAmbient1 from '@/assets/videos/hero-ambient-1.mp4';
// @ts-ignore
import heroAmbient2 from '@/assets/videos/hero-2.mp4';
// @ts-ignore
import heroAmbient3 from '@/assets/videos/hero-3.mp4';

export default function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const [gradientPos, setGradientPos] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showContinueButton, setShowContinueButton] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  
  // Animation refs for sections
  const marqueeOpacity = useRef(new Animated.Value(0)).current;
  const marqueeTranslateY = useRef(new Animated.Value(50)).current;
  const descriptionOpacity = useRef(new Animated.Value(0)).current;
  const descriptionTranslateY = useRef(new Animated.Value(50)).current;
  const syncSectionOpacity = useRef(new Animated.Value(0)).current;
  const syncSectionTranslateY = useRef(new Animated.Value(50)).current;

  // Track animation states to prevent re-triggering
  const animationStates = useRef({
    marquee: false,
    description: false,
    sync: false
  });

  useEffect(() => {
    if (!isWeb) return;

    const interval = setInterval(() => {
      setGradientPos(prev => (prev + 0.5) % 100);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Optimized scroll listener with throttling and animation state tracking
  useEffect(() => {
    if (!isWeb) return;

    const listener = scrollY.addListener(({ value }) => {
      // Show button after scrolling 300px
      setShowContinueButton(value > 300);
      
      // Animate marquee section (around 400px scroll)
      if (value > 400 && !animationStates.current.marquee) {
        animationStates.current.marquee = true;
        Animated.parallel([
          Animated.timing(marqueeOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(marqueeTranslateY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }
      
      // Animate description section (around 500px scroll)
      if (value > 500 && !animationStates.current.description) {
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
      
      // Animate sync section (around 1200px scroll)
      if (value > 1200 && !animationStates.current.sync) {
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
  }, [scrollY, marqueeOpacity, marqueeTranslateY, descriptionOpacity, descriptionTranslateY, syncSectionOpacity, syncSectionTranslateY]);

  // Ambient background style
  const webBackgroundStyle = isWeb ? {
    backgroundImage: [
      'radial-gradient(circle at 10% 20%, rgba(192, 128, 255, 0.15) 0%, transparent 35%)',
      'radial-gradient(circle at 80% 70%, rgba(74, 222, 205, 0.1) 0%, transparent 30%)',
      'radial-gradient(circle at 20% 80%, rgba(100, 149, 237, 0.1) 0%, transparent 30%)',
      'radial-gradient(circle at 80% 20%, rgba(255, 157, 92, 0.1) 0%, transparent 30%)',
      'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 25%)',
      'linear-gradient(135deg, transparent 40%, rgba(255, 215, 0, 0.05) 50%, transparent 60%)',
      'linear-gradient(45deg, transparent 45%, rgba(200, 200, 255, 0.04) 50%, transparent 55%)',
      'linear-gradient(225deg, transparent 45%, rgba(192, 128, 255, 0.04) 50%, transparent 55%)',
      'linear-gradient(315deg, transparent 45%, rgba(74, 222, 205, 0.04) 50%, transparent 55%)',
      'linear-gradient(160deg, #0E1120 0%, #1E2140 50%, #030308 100%)'
    ].join(', '),
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    backgroundPosition: `${gradientPos}% 50%`
  } : {};

  const combinedContentContainerStyle = {
    flexGrow: 1,
    paddingVertical: isWeb ? 80 : 0, 
    ...webBackgroundStyle 
  };

  const isMobileBrowser = isWeb && typeof window !== 'undefined' &&
    (window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent));

  const handleSignUp = React.useCallback(async () => {
    try {
      await Linking.openURL('https://kaiba.lemonsqueezy.com/');
    } catch (error) {
      useToastStore.getState().showToast('Failed to open signup page', 'error');
    }
  }, []);

  return (
    <>
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
        scrollEventThrottle={32}
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
          {/* Hero Section */}
          <YStack alignItems="center" gap="$4" paddingVertical="$2" maxWidth={1400} marginHorizontal="auto" position="relative">
            {isWeb && (
              <View
                position="absolute"
                top={-60}
                left={-80}
                width={340}
                height={340}
                style={{
                  zIndex: 0,
                  pointerEvents: 'none',
                  background: 'radial-gradient(circle at 60% 40%, #C080FF33 0%, transparent 70%)',
                  filter: 'blur(24px)',
                }}
              />
            )}
            {isWeb && (
              <View
                position="absolute"
                top={-40}
                right={-100}
                width={260}
                height={260}
                style={{
                  zIndex: 0,
                  pointerEvents: 'none',
                  background: 'radial-gradient(circle at 40% 60%, #4ADECD22 0%, transparent 70%)',
                  filter: 'blur(18px)',
                }}
              />
            )}

            <H1
              color="$onboardingLabel"
              fontFamily="$heading"
              fontSize={isWeb ? (isMobileBrowser ? "$9" : screenWidth * 0.05) : "$8"}
              fontWeight="500"
              textAlign="center"
              style={{
                background: isWeb ? 'linear-gradient(90deg, #C080FF 30%, #4ADECD 70%)' : undefined,
                WebkitBackgroundClip: isWeb ? 'text' : undefined,
                backgroundClip: isWeb ? 'text' : undefined,
                WebkitTextFillColor: isWeb ? 'transparent' : undefined,
                color: isWeb ? 'transparent' : '$onboardingLabel',
                letterSpacing: '-0.02em',
                maxWidth: '100%',
                overflow: 'visible',
                lineHeight: 1.2,
                minHeight: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Kaiba
            </H1>
            <H2 
              color="$onboardingLabel" 
              fontFamily="$heading" 
              fontSize="$9" 
              fontWeight="800"
              textAlign="center"
              opacity={0.95}
              letterSpacing={0.9}
            >
              Your Personal Productivity Nexus
            </H2>
          </YStack>

          <Text 
            color="$onboardingLabel" 
            fontSize="$6" 
            textAlign="center" 
            opacity={0.85}
            lineHeight="$7"
            maxWidth={600}
            fontWeight="400"
          >
            Manage your calendar, tasks, passwords, and habits across all your devices with military-grade encryption.
          </Text>

          {isWeb && (
            <Button
              size="$6"
              backgroundColor="$blue10"
              color="white"
              fontWeight="700"
              borderRadius="$8"
              paddingHorizontal="$20"
              marginLeft={20}
              paddingVertical="$5"
              onPress={onComplete}
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
              style={{
                boxShadow: isWeb ? '0 12px 40px rgba(59, 130, 246, 0.4)' : undefined,
                cursor: 'pointer',
              }}
            >
              <Text fontSize="$5" fontWeight="700" color="white" letterSpacing={0.5}>
                Continue
              </Text>
            </Button>
          )}

          {/* Web Content */}
          {isWeb ? (
            <YStack
              width="100%"
              alignItems="center"
              justifyContent="center"
              gap="$6"
              maxWidth={screenWidth}
              marginHorizontal="auto"
            >

                <YStack width="100%" alignItems="center">
                  <Marquee/>
                </YStack>
              <Animated.View
                style={{
                  opacity: descriptionOpacity,
                  transform: [{ translateY: descriptionTranslateY }],
                  width: '100%',
                  paddingTop: 40,
                }}
              >
                <YStack alignItems="center" width="100%" paddingBottom="$6">
                  <H2>
                    Different screen sizes? No problem.
                  </H2>
                  <Text color="$onboardingLabel" fontSize="$5" textAlign="center" opacity={0.85} lineHeight="$7" maxWidth={600} fontWeight="400" paddingTop="$4">
                    Kaiba is designed to be used on any screen size.
                    Many of our features include different layout options
                    to ensure you get the most out of your device.
                  </Text>
                </YStack>

                {/* Web Video Showcase */}
                <YStack alignItems="center" width="100%" paddingBottom="$6" gap="$4">
                  <H2 color="$onboardingLabel" fontFamily="$heading" fontSize="$7" fontWeight="800" textAlign="center" marginBottom="$2">
                    Showcase of Features
                  </H2>
                  <Text color="$onboardingLabel" fontSize="$5" textAlign="center" opacity={0.85} lineHeight="$7" maxWidth={600} fontWeight="400">
                    Explore some of Kaiba's key features in action.
                  </Text>
                  <XStack
                    width="100%"
                    alignItems="center"
                    justifyContent="center"
                    marginLeft={20}
                    marginBottom="$6"
                    gap={30}
                    style={{ display: 'flex', perspective: 1000 }}
                  >
                    <View style={{ width: '35%', height: '60vh', borderRadius: 24, overflow: 'hidden', transform: 'rotateY(-10deg) rotateX(5deg)', boxShadow: '0 20px 60px rgba(74, 222, 205, 0.5), 0 8px 24px rgba(192, 128, 255, 0.4)' }}>
                      <video
                        src={heroAmbient2}
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </View>
                    <View style={{ width: '45%', height: '65vh', borderRadius: 24, overflow: 'hidden', transform: 'rotateY(10deg) rotateX(-5deg)', boxShadow: '0 20px 60px rgba(192, 128, 255, 0.5), 0 8px 24px rgba(74, 222, 205, 0.4)' }}>
                      <video
                        src={heroAmbient1}
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </View>
                  </XStack>

                </YStack>

                <YStack alignItems="center">
                  <video
                    src={heroAmbient1}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                      width: '45%',
                      height: "85%",
                      borderRadius: 32,
                      opacity: 0.95,
                      objectFit: 'cover',
                      boxShadow: '0 8px 48px #C080FF33, 0 2px 16px #4ADECD22'
                    }}
                  />
                </YStack>
              </Animated.View>
              
              {/* Sync Section */}
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
            </YStack>
          ) : (
            /* Mobile Content */
            <YStack width="100%" alignItems="center" paddingVertical="$8">
              <XStack flexWrap="wrap" justifyContent="center" gap="$4" maxWidth={1200} width="100%">
                {features.map((feature) => (
                  <Card
                    key={feature.id}
                    width="100%"
                    minWidth={300}
                    padding="$4"
                    marginBottom="$4"
                    backgroundColor="$onboardingCardBackground"
                    borderColor="$onboardingCardBorder"
                    borderWidth={1}
                  >
                    <H3
                      color="$onboardingLabel"
                      fontFamily="$heading"
                      fontSize="$6"
                      marginBottom="$3"
                    >
                      {feature.title}
                    </H3>
                    <YStack gap="$2" marginBottom="$3">
                      {feature.items.map((item, i) => (
                        <XStack key={i} alignItems="center" gap="$2">
                          <Text fontFamily="$body" color="$onboardingButtonSecondaryText">•</Text>
                          <Text fontFamily="$body" color="$onboardingLabel">{item}</Text>
                        </XStack>
                      ))}
                    </YStack>
                  </Card>
                ))}
              </XStack>

              {/* Mobile Video Showcase */}
              <YStack width="100%" alignItems="center" paddingVertical="$8">
                <H2 color="$onboardingLabel" fontFamily="$heading" fontSize="$7" fontWeight="800" textAlign="center" marginBottom="$4">
                  See Kaiba in Action
                </H2>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 20 }}>
                  {[heroAmbient2, heroAmbient3, require('@/assets/videos/mobilehomescreen.mp4'), require('@/assets/videos/calVaultBillsMobile.mp4'), require('@/assets/videos/notesMobile.mp4'), require('@/assets/videos/syncmobile.mp4'), require('@/assets/videos/habitsAndProjectsMobile.mp4')].map((videoSource, index) => (
                    <View key={index} style={{ width: 220, aspectRatio: '9/19', borderRadius: 20, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)' }}>
                      <video
                        src={videoSource}
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </View>
                  ))}
                </ScrollView>
              </YStack>

            </YStack>
          )}
        </YStack>
      </ScrollView>

      {/* Floating Continue Button - Web Only */}
      {isWeb && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 30,
            right: 30,
            zIndex: 1000,
            transform: [
              {
                translateY: showContinueButton ? 0 : 100,
              },
              {
                scale: showContinueButton ? 1 : 0.8,
              }
            ],
            opacity: showContinueButton ? 1 : 0,
          }}
        >
          <TouchableOpacity
            onPress={onComplete}
            style={{
              backgroundColor: '#3b82f6',
              paddingHorizontal: 28,
              paddingVertical: 18,
              borderRadius: 50,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
              cursor: 'pointer',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 17, fontFamily: '$body' }}>
              Continue
            </Text>
            <Text style={{ color: 'white', fontSize: 16, fontFamily: '$body' }}>→</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
  );
}
