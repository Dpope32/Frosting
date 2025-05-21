import React, { useState, useEffect, useRef } from 'react';
import { YStack, XStack, H1, H2, H3, Text, Image, isWeb, ScrollView, Card, View, styled  } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

// @ts-ignore
import heroAmbient1 from '@/assets/videos/hero-ambient-1.mp4';

// Component to inject keyframes CSS
const MarqueeStyles = () => {
  if (!isWeb) return null;
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes marquee {
        0% { transform: translateX(0%); }
        100% { transform: translateX(-50%); }
      }
      .marquee-content {
        animation: marquee 80s linear infinite;
        will-change: transform;
        animation-play-state: running;
      }
    `}} />
  );
};
const MarqueeContainer = styled(XStack, {
  name: 'MarqueeContainer',
  overflow: 'hidden',
  width: '100%',
  position: 'relative',
});

const MarqueeContent = styled(XStack, {
  name: 'MarqueeContent',
  display: 'flex',
  flexDirection: 'row',
  width: '200%',
  gap: '$4',
  className: 'marquee-content',
});

export default function WelcomeScreen({}: { onComplete: () => void }) {
  // Removed mousePos state for performance optimization
  const [rotation, setRotation] = useState(0);
  const targetRotation = useRef(0);
  const animationRef = useRef<number>();
  const screenCenter = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isWeb) return;

    const animate = () => {
      setRotation(prev => {
        const diff = targetRotation.current - prev;
        // Add a check to prevent NaN if diff is extremely small
        const step = !isNaN(diff) ? diff * 0.1 : 0;
        return prev + step;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);

    const updateScreenCenter = () => {
      screenCenter.current = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
    };
    updateScreenCenter();
    window.addEventListener('resize', updateScreenCenter);

    const handleMouseMove = (event: MouseEvent) => {
      // Update CSS custom properties for spotlight instead of state
      document.documentElement.style.setProperty('--mouse-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${event.clientY}px`);

      // Existing rotation logic
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      const deltaX = mouseX - screenCenter.current.x;
      const deltaY = mouseY - screenCenter.current.y;
      targetRotation.current = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateScreenCenter);
      // Clean up CSS variables
      document.documentElement.style.removeProperty('--mouse-x');
      document.documentElement.style.removeProperty('--mouse-y');
    };
  }, []);

  const iconStyle = {
    width: 120,
    height: 120,
    borderRadius: 60,
    transform: isWeb ? [{ rotate: `${rotation}deg` }] : [],
  };

  const features = [
    {
      id: 1,
      title: "Privacy First",
      items: [
        "Your data stays safe and private",
        "Stored directly on your device",
        "No server data collection",
        "End-to-end encryption",
        "Control your own information"
      ],
      titleColor: "#C080FF",
      icon: "shield-checkmark-outline" as any,
      iconColor: "#C080FF"
    },
    {
      id: 2,
      title: "Task Management",
      items: [
        "Track recurring tasks",
        "Manage one-time todos",
        "Stay organized",
        "Prioritize your work",
        "Set reminders easily"
      ],
      titleColor: "#6495ED",
      icon: "list-outline" as any,
      iconColor: "#6495ED"
    },
    {
      id: 3,
      title: "Calendar",
      items: [
        "Track birthdays & events",
        "NBA schedules",
        "Bill reminders",
        "Sync with external calendars",
        "Custom event notifications"
      ],
      titleColor: "#4ADECD",
      icon: "calendar-outline" as any,
      iconColor: "#4ADECD"
    },
    {
      id: 4,
      title: "Finance Tracking",
      items: [
        "Monitor portfolio",
        "Real-time stock updates",
        "Financial insights",
        "Expense categorization",
        "Budget planning tools"
      ],
      titleColor: "#FF9D5C",
      icon: "stats-chart-outline" as any,
      iconColor: "#FF9D5C"
    },
    {
      id: 5,
      title: "CRM",
      items: [
        "Manage contacts with custom attributes",
        "Track payment methods and addresses",
        "Organize your professional network",
        "Add notes to contacts",
        "Follow up reminders"
      ],
      titleColor: "#4CAF50",
      icon: "people-outline" as any,
      iconColor: "#4CAF50"
    },
    {
      id: 6,
      title: "Password Vault",
      items: [
        "Securely store passwords locally",
        "Private encrypted storage",
        "Quick access to credentials",
        "Generate strong passwords",
        "Autofill login details"
      ],
      titleColor: "#FFD700",
      icon: "lock-closed-outline" as any,
      iconColor: "#FFD700"
    },
    {
      id: 7,
      title: "Habit Tracking",
      items: [
        "Track your habits",
        "Set goals and achieve them",
        "Stay motivated",
        "Visualize your progress",
        "Daily streaks"
      ],
      titleColor: "#74BDCB",
      icon: "checkmark-circle-outline" as any,
      iconColor: "#74BDCB"
    },
  ];

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
      // Removed spotlight from here
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

  // Spotlight style (applied directly to the main YStack) - using CSS variables
  const spotlightStyle = isWeb ? {
    // Using CSS variables for mouse position and adjusted gradient for concentration
    backgroundImage: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.15) 0%, transparent 15%)`,
    backgroundAttachment: 'fixed', // Keep spotlight fixed relative to viewport
    backgroundSize: 'cover',      // Ensure gradient covers the area
  } : {};


  // Use paddingBottom to create space for the fixed button at the bottom
  const combinedContentContainerStyle = {
    flexGrow: 1,
    paddingBottom: isWeb ? 80 : 0, // Add padding at the bottom to prevent content from being hidden behind the button
    ...webBackgroundStyle // Apply ambient background here
  };

  // Check if device is a mobile browser
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
        style={spotlightStyle}
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
          <H2
            color="$onboardingLabel"
            fontFamily="$heading"
            fontSize={isWeb ? (isMobileBrowser ? "$6" : "$8") : "$6"}
            fontWeight="500"
            opacity={0.8}
            pt={isWeb ? "$-1" : "$0"}
            zIndex={1}
            style={{
              textShadow: isWeb ? '0 2px 24px #C080FF22' : undefined,
            }}
          >
            Your world, all in one place
          </H2>
          {isWeb && (
            <XStack
              width="100%"
              alignItems="center"
              justifyContent="center"
              marginTop={0}
              marginBottom={-50}
              gap={32}
              style={{ display: 'flex' }}
            >
              <video
                src={heroAmbient1}
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: '60vw',
                  maxWidth: 900,
                  minWidth: 320,
                  height: 'auto',
                  borderRadius: 32,
                  opacity: 0.95,
                  objectFit: 'cover',
                  boxShadow: '0 8px 48px #C080FF33, 0 2px 16px #4ADECD22'
                }}
              />
              {/* Uncomment and import heroAmbient2 when available
              <video
                src={heroAmbient2}
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: '60vw',
                  maxWidth: 900,
                  minWidth: 320,
                  height: 'auto',
                  borderRadius: 32,
                  opacity: 0.95,
                  objectFit: 'cover',
                  boxShadow: '0 8px 48px #4ADECD22, 0 2px 16px #C080FF33'
                }}
              />
              */}
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
            pt={isWeb ? 40 : 0} 
          >
            <MarqueeContainer
              height={isMobileBrowser ? 220 : 240} 
              alignItems="center"
              justifyContent="center"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: isMobileBrowser ? 220 : 280,
              }}
            >
              <MarqueeContent
                style={{
                  height: isMobileBrowser ? 200 : 250,
                  alignItems: 'center',
                }}
              >
                {[...features, ...features].map((feature, index) => {
                  const bgColor = feature.titleColor + "20";
                  const uniqueKey = `${feature.id}-${index}`;
                  return (
                    <YStack
                      key={uniqueKey}
                      minWidth={isMobileBrowser ? 320 : 380}
                      maxWidth={isMobileBrowser ? 340 : 400}
                      height={isMobileBrowser ? 180 : 240} 
                      bc={bgColor}
                      br="$10"
                      overflow="hidden"
                      position="relative"
                      animation="bouncy"
                      justifyContent="flex-start"
                      px="$4"
                      py="$3"
                      style={{ boxShadow: isWeb ? '0 2px 16px #0002' : undefined }}
                    >

                      <XStack alignItems="center" justifyContent="center" gap="$3" mb="$2" mt="$2" position="relative">
                        <View
                          width={32}
                          height={32}
                          backgroundColor="rgba(0,0,0,0.10)"
                          br={16}
                          justifyContent="center"
                          alignItems="center"
                          style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}
                        >
                          <Ionicons name={feature.icon} size={20} color={feature.iconColor} />
                        </View>
                        <H3
                          fontFamily="$heading"
                          fontWeight="800"
                          fontSize={isMobileBrowser ? "$6" : "$7"} // Smaller title
                          color={feature.titleColor}
                          marginBottom={0}
                          marginTop={0}
                          textAlign="center"
                          width="100%"
                          style={{
                            marginLeft: 32, // Space for icon
                          }}
                        >
                          {feature.title}
                        </H3>
                      </XStack>
                      <XStack flex={1} padding={0} justifyContent="space-between" alignItems="flex-start">
                        <YStack flex={1} justifyContent="center" pr="$2">
                          <YStack gap="$2" marginBottom={0}>
                            {feature.items.map((item, i) => (
                              <XStack key={i} alignItems="flex-start" gap="$2" flexShrink={1}>
                                <Text fontFamily="$body" color={feature.iconColor} mt={1} fontSize="$5">•</Text>
                                <Text
                                  fontFamily="$body"
                                  fontSize={isMobileBrowser ? "$4" : "$5"}
                                  color="$onboardingLabel"
                                  flex={1}
                                  whiteSpace="normal"
                                >{item}</Text>
                              </XStack>
                            ))}
                          </YStack>
                          {/* Add a bit of padding below the bullet points */}
                          <View height={12} />
                        </YStack>
                      </XStack>
                    </YStack>
                  );
                })}
              </MarqueeContent>
            </MarqueeContainer>
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
