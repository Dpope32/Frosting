import React, { useState, useEffect } from 'react';
import { YStack, XStack, H1, H2, H3, Text, Image, isWeb, ScrollView, Card, View, styled  } from 'tamagui';
import { features } from '@/constants/features';
import { Marquee, MarqueeStyles } from '@/components/welcome/marquee';
import { SyncSection } from '@/components/welcome/syncSection';
// @ts-ignore
import heroAmbient1 from '@/assets/videos/hero-ambient-1.mp4';
// @ts-ignore
import heroAmbient2 from '@/assets/videos/hero-2.mp4';
// @ts-ignore
import heroAmbient3 from '@/assets/videos/hero-3.mp4';


export default function WelcomeScreen({}: { onComplete: () => void }) {
  const [gradientPos, setGradientPos] = useState(0);

  useEffect(() => {
    if (!isWeb) return;
"Quick access to credentials"
    const interval = setInterval(() => {
      setGradientPos(prev => (prev + 0.5) % 100);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Ambient background style (applied to ScrollView container)
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
    paddingBottom: isWeb ? 80 : 0, 
    ...webBackgroundStyle 
  };

  const isMobileBrowser = isWeb && typeof window !== 'undefined' &&
    (window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent));

  return (
    <ScrollView contentContainerStyle={combinedContentContainerStyle}>
      {isWeb && <MarqueeStyles />}
      <YStack
        flex={1}
        paddingHorizontal="$4"
        paddingTop="$8"
        gap="$2"
        width="100%"
        position="relative"
        zi={1} 
        minHeight="100vh"
        justifyContent="space-between"
      >
        <YStack alignItems="center" gap="$4" marginVertical="$6" maxWidth={1200} marginHorizontal="auto" position="relative">
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
              top={-60}
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

          <XStack position="relative" alignItems="center" zIndex={1}>
            {isWeb && (
              <Image
                source={require('@/assets/images/icon.png')}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  position: 'absolute',
                  left: -120,
                  top: -48,
                }}
              />
            )}
            <H1
              color="$onboardingLabel"
              fontFamily="$heading"
              fontSize={isWeb ? (isMobileBrowser ? "$10" : "$13") : "$9"}
              style={{
                padding: 12,
                background: isWeb ? 'linear-gradient(90deg, #C080FF 30%, #4ADECD 70%)' : undefined,
                WebkitBackgroundClip: isWeb ? 'text' : undefined,
                WebkitTextFillColor: isWeb ? 'transparent' : undefined,
                marginBottom: isWeb ? 0 : 8, 
                marginTop: isWeb ? -45 : 8,
              }}
            >
              Kaiba Nexus
            </H1>
          </XStack>

          {isWeb && (
            <XStack
              width="100%"
              alignItems="center"
              justifyContent="center"
              marginTop={0}
              marginBottom={-50}
              gap={16}
              style={{ display: 'flex' }}
            >
              <video
                src={heroAmbient3}
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: '20%', 
                  aspectRatio: '9/19.5',
                  height: 380,
                  borderRadius: 32,
                  opacity: 0.95,
                  objectFit: 'cover',
                  boxShadow: '0 8px 48px #FF9D5C22, 0 2px 16px #6495ED22' 
                }}
              /> 
              <video
                src={heroAmbient1}
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: '50%',
                  height: 380,
                  borderRadius: 32,
                  opacity: 0.95,
                  objectFit: 'cover',
                  boxShadow: '0 8px 48px #C080FF33, 0 2px 16px #4ADECD22'
                }}
              />
              <video
                src={heroAmbient2}
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: '30%',
                  height: 380,
                  borderRadius: 32,
                  opacity: 0.95,
                  objectFit: 'cover',
                  boxShadow: '0 8px 48px #4ADECD22, 0 2px 16px #C080FF33'
                }}
              />
            </XStack>
          )}
        </YStack>

        {isWeb ? (
          <YStack
            width="100%"
            mb={isMobileBrowser ? "$-2" : "$-4"} 
            alignItems="center"
            justifyContent="flex-start"
            flex={1}
            minHeight="100vh"
            py={80}
          >
            <Marquee/>
            <SyncSection />
          </YStack>
        ) : (
          <XStack flexWrap="wrap" justifyContent="center" gap="$4" marginBottom="$4" maxWidth={1200} marginHorizontal="auto">
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
        )}
      </YStack>
    </ScrollView>
  );
}
