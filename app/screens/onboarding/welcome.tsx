import React, { useState, useEffect, useRef } from 'react';
import {  YStack, XStack,  H1,  H2,  H3, Text, Image, isWeb, ScrollView, Card, View } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const [rotation, setRotation] = useState(0);
  const targetRotation = useRef(0);
  const animationRef = useRef<number>();
  const screenCenter = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isWeb) return;

    const animate = () => {
      setRotation(prev => {
        const diff = targetRotation.current - prev;
        return prev + diff * 0.1;
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

  // Use paddingBottom to create space for the fixed button at the bottom
  const combinedContentContainerStyle = {
    flexGrow: 1,
    paddingBottom: isWeb ? 80 : 0, // Add padding at the bottom to prevent content from being hidden behind the button
    ...webBackgroundStyle
  };

  // Check if device is a mobile browser
  const isMobileBrowser = isWeb && typeof window !== 'undefined' && 
    (window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent));

  return (
    <ScrollView contentContainerStyle={combinedContentContainerStyle}>
      <YStack flex={1} padding="$4" gap="$4" maxWidth={1200} marginHorizontal="auto" position="relative" zi={1}>
        <YStack alignItems="center" gap="$4" marginVertical="$6">
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
            pt={isWeb ? "$1" : "$0"}
          >
            Your world, all in one place
          </H2>
        </YStack>

        <XStack flexWrap="wrap" justifyContent="center" gap="$4" marginBottom="$4">
          {features.map((feature) => {
            if (isWeb) {
              const bgColor = feature.titleColor + "20";
              const isCRM = feature.title === "CRM";
              return (
                <YStack
                  key={feature.id}
                  width={isMobileBrowser ? "100%" : "49%"}
                  minWidth={isMobileBrowser ? 250 : 300}
                  height={isMobileBrowser ? (isCRM ? 180 : 160) : 160}
                  bc={bgColor}
                  br="$8"
                  overflow="hidden"
                  position="relative"
                  marginBottom="$4"
                >
                  <XStack flex={1} padding="$4" justifyContent="space-between" alignItems="center">
                    <YStack flex={1} justifyContent="center">
                      <H3
                        fontFamily="$heading"
                        fontWeight="700"
                        fontSize={isMobileBrowser ? "$6" : "$7"}
                        color={feature.titleColor}
                        marginBottom="$2"
                      >
                        {feature.title}
                      </H3>
                      <YStack gap="$1.5" marginBottom="$3">
                        {feature.items.map((item, i) => (
                          <XStack key={i} alignItems="flex-start" gap="$2">
                            <Text fontFamily="$body" color={feature.iconColor} mt={1}>•</Text>
                            <Text 
                              fontFamily="$body" 
                              fontSize={isMobileBrowser ? "$4" : "$5"} 
                              color="$onboardingLabel" 
                              flex={1}
                            >{item}</Text>
                          </XStack>
                        ))}
                      </YStack>
                    </YStack>
                    <View
                      width={50}
                      height={50}
                      backgroundColor="rgba(0,0,0,0.2)"
                      br={25}
                      justifyContent="center"
                      alignItems="center"
                      marginLeft="$3"
                    >
                      <Ionicons name={feature.icon} size={28} color={feature.iconColor} />
                    </View>
                  </XStack>
                </YStack>
              );
            } else {
              return (
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
              );
            }
          })}
        </XStack>

      </YStack>
    </ScrollView>
  );
}