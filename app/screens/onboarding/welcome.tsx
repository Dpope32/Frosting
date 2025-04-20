import React, { useState, useEffect, useRef } from 'react';
import { YStack, XStack, H1, H2, H3, Text, Image, isWeb, ScrollView, Card, View, styled, createStyledContext, useTheme } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

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
        animation: marquee 40s linear infinite;
        will-change: transform;
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
    width: 90,
    height: 90,
    borderRadius: 45,
    transform: isWeb ? [{ rotate: `${rotation}deg` }] : [],
  };

  const features = [
    {
      id: 1,
      title: "Privacy First",
      items: [
        "Your data stays safe and private",
        "Stored directly on your device",
        "No server data collection"
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
        "Stay organized"
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
        "Bill reminders"
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
        "Financial insights"
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
        "Organize your professional network"
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
        "Quick access to credentials"
      ],
      titleColor: "#FFD700",
      icon: "lock-closed-outline" as any,
      iconColor: "#FFD700"
    }
  ];

  const [gradientPos, setGradientPos] = useState(0);

  useEffect(() => {
    if (!isWeb) return;

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
      {/* Inject the keyframes CSS */}
      {isWeb && <MarqueeStyles />}
      <YStack
        flex={1}
        paddingHorizontal="$4"
        paddingTop="$4"
        gap="$2"
        width="100%"
        position="relative"
        zi={1} // Ensure content is above the ScrollView background but potentially below other absolute elements if needed
        minHeight="100vh"
        justifyContent="space-between"
        // Apply spotlight style directly to this container
        style={spotlightStyle}
      >
        <YStack alignItems="center" gap="$4" marginVertical="$6" maxWidth={1200} marginHorizontal="auto">
          <XStack position="relative" alignItems="center">
            {isWeb && (
            <Image
                source={require('@/assets/images/icon.png')}
                style={[iconStyle, {
                  position: 'absolute',
                  left: -125,
                  top: -20,
                  transform: [
                    { rotate: `${rotation}deg` },
                    { translateY: Math.sin(Date.now() / 600) * 10 }
                  ]
                }]}
              />
            )}
            <H1
              color="$onboardingLabel"
              fontFamily="$heading"
              fontSize={isWeb ? (isMobileBrowser ? "$10" : "$12") : "$9"}
              letterSpacing={1}
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
          >
            Your world, all in one place
          </H2>
        </YStack>

        {isWeb && (
          <YStack alignItems="center" paddingVertical="$-2" flexGrow={1} justifyContent="center">
            <Image
              source={require('@/assets/screenshots/web/web1.png')}
              width={800}
              height={400}
              objectFit="contain"
              alt="App Screenshot"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$borderColor"
            />
          </YStack>
        )}

        {isWeb ? (
          <YStack width="100%" mb="$16">
             <MarqueeContainer>
               <MarqueeContent>
              {[...features, ...features].map((feature, index) => {
                const bgColor = feature.titleColor + "20";
                const isCRM = feature.title === "CRM";
                const uniqueKey = `${feature.id}-${index}`;
                return (
                  <YStack
                    key={uniqueKey}
                    minWidth={320}
                    maxWidth={360}
                    height={isMobileBrowser ? (isCRM ? 180 : 160) : 180}
                    bc={bgColor}
                    br="$8"
                    overflow="hidden"
                    position="relative"
                    // Add animation prop for smooth transitions on hover
                    animation="bouncy"
                    // Simplified hoverStyle: removed scale, adjusted shadow
                    hoverStyle={{
                      // scale: 1.05, // Removed scale to prevent potential glitches/clipping
                      elevation: '$6',
                      shadowColor: feature.titleColor,
                      shadowOpacity: 0.3, // Reduced opacity
                      shadowRadius: 8,   // Reduced radius
                      shadowOffset: { width: 0, height: 2 }, // Reduced offset
                      // transform: [{ perspective: 1000 }, { rotateY: '3deg' }], // Keep commented out
                    }}
                    // No marginBottom needed here as gap is handled by MarqueeContent
                  >
                    <XStack flex={1} padding="$4" justifyContent="space-between" alignItems="center">
                      <YStack flex={1} justifyContent="center" pr="$3"> {/* Added padding right */}
                        <H3
                          fontFamily="$heading"
                          fontWeight="700"
                          fontSize={isMobileBrowser ? "$5" : "$6"} // Slightly smaller font for smaller cards
                          color={feature.titleColor}
                          marginBottom="$2"
                          numberOfLines={1} // Prevent title wrapping issues
                          ellipsizeMode="tail"
                        >
                          {feature.title}
                        </H3>
                        <YStack gap="$1.5" marginBottom="$3">
                          {feature.items.map((item, i) => (
                            <XStack key={i} alignItems="flex-start" gap="$2" flexShrink={1}>
                              <Text fontFamily="$body" color={feature.iconColor} mt={1} fontSize="$5">•</Text>
                              <Text
                                fontFamily="$body"
                                fontSize={isMobileBrowser ? "$3" : "$4"}
                                color="$onboardingLabel"
                                flex={1}
                                whiteSpace="normal"
                              >{item}</Text>
                            </XStack>
                          ))}
                        </YStack>
                      </YStack>
                      <View
                        width={45}
                        height={45}
                        backgroundColor="rgba(0,0,0,0.2)"
                        br={22.5}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Ionicons name={feature.icon} size={24} color={feature.iconColor} />
                      </View>
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
        {/* End Feature Cards Section */}

      </YStack>
    </ScrollView>
  );
}
