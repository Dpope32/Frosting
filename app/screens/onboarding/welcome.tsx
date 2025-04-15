import React, { useState, useEffect, useRef } from 'react';
import { YStack, XStack, H1, H2, H3, Text, Image, isWeb, ScrollView, Card, View, styled, createStyledContext, useTheme } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

// Define CSS keyframes for the marquee animation
const marqueeAnimation = `
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
`;

// Inject the keyframes into the document head (runs once)
if (isWeb && typeof window !== 'undefined') {
  const styleSheet = document.styleSheets[0];
  try {
    // Check if the animation already exists to avoid duplicates during HMR
    let marqueeRuleExists = false;
    let hoverRuleExists = false;
    if (styleSheet) {
      for (let i = 0; i < styleSheet.cssRules.length; i++) {
        const rule = styleSheet.cssRules[i];
        // Check for keyframes rule
        if (rule instanceof CSSKeyframesRule && rule.name === 'marquee') {
          marqueeRuleExists = true;
        }
        // Check for hover rule (adjust selector if className changes)
        if (rule instanceof CSSStyleRule && rule.selectorText === '.marquee-content:hover') {
           hoverRuleExists = true;
        }
        if (marqueeRuleExists && hoverRuleExists) break; // Found both, no need to continue loop
      }
    }
    // Insert marquee animation if it doesn't exist
    if (!marqueeRuleExists && styleSheet) {
       styleSheet.insertRule(marqueeAnimation, styleSheet.cssRules.length);
    }
    // Insert hover pause rule if it doesn't exist
    const hoverPauseRule = `.marquee-content:hover { animation-play-state: paused; }`;
    if (!hoverRuleExists && styleSheet) {
       styleSheet.insertRule(hoverPauseRule, styleSheet.cssRules.length);
    }

  } catch (e) {
    console.error("Could not insert CSS rules:", e);
    // Fallback: Add a style tag to the head for both rules if insertion fails
    const hoverPauseRuleString = `.marquee-content:hover { animation-play-state: paused; }`;
    const style = document.createElement('style');
    style.textContent = marqueeAnimation + '\n' + hoverPauseRuleString;
    document.head.appendChild(style);
  }
}


// Styled component for the marquee container
const MarqueeContainer = styled(XStack, {
  name: 'MarqueeContainer',
  overflow: 'hidden',
  width: '100%',
  position: 'relative',
  // Add fading edges using maskImage (requires -webkit- prefix for broader compatibility)
  maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
  // @ts-ignore - Tamagui doesn't type this CSS property well
  '-webkit-mask-image': 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
});

const MarqueeContent = styled(XStack, {
  name: 'MarqueeContent',
  display: 'flex', // Use flex for web layout
  flexDirection: 'row',
  width: '200%', // Double width because we duplicate the content
  // Animation properties are applied via CSS using the className
  gap: '$4', // Keep the gap between cards consistent
  className: 'marquee-content', // Add class name for CSS targeting
});

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

        {/* Feature Cards Section */}
        {isWeb ? (
          <MarqueeContainer>
            <MarqueeContent>
              {/* Render features twice for seamless loop */}
              {[...features, ...features].map((feature, index) => {
                const bgColor = feature.titleColor + "20";
                const isCRM = feature.title === "CRM";
                // Use a unique key for React rendering
                const uniqueKey = `${feature.id}-${index}`; 
                return (
                  <YStack
                    key={uniqueKey}
                    // Adjust width to show ~3 cards. 30% * 3 = 90% + gaps
                    width="30%" 
                    minWidth={280} // Ensure minimum width for content
                    height={isMobileBrowser ? (isCRM ? 180 : 160) : 180} // Increased height slightly for web
                    bc={bgColor}
                    br="$8"
                    overflow="hidden"
                    position="relative"
                    // Add animation prop for smooth transitions on hover
                    animation="bouncy" 
                    hoverStyle={{
                      scale: 1.05, // Scale up slightly
                      // Add a subtle tilt effect
                      // Note: perspective needs to be on the parent (MarqueeContainer) or applied directly if possible
                      // Tamagui might not directly support perspective in transform array easily, let's try elevation/shadow first
                      elevation: '$6', // Increase elevation
                      shadowColor: feature.titleColor, // Use feature color for shadow
                      shadowOpacity: 0.5,
                      shadowRadius: 10,
                      shadowOffset: { width: 0, height: 4 },
                      // transform: [{ perspective: 1000 }, { rotateY: '3deg' }], // Tilt effect - might require CSS
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
                                fontSize={isMobileBrowser ? "$3" : "$4"} // Smaller font size
                                color="$onboardingLabel" 
                                flex={1}
                                // Allow text to wrap within the smaller card
                                whiteSpace="normal" 
                              >{item}</Text>
                            </XStack>
                          ))}
                        </YStack>
                      </YStack>
                      <View
                        width={45} // Slightly smaller icon container
                        height={45}
                        backgroundColor="rgba(0,0,0,0.2)"
                        br={22.5}
                        justifyContent="center"
                        alignItems="center"
                        // Removed marginLeft, rely on paddingRight of text container
                      >
                        <Ionicons name={feature.icon} size={24} color={feature.iconColor} /> 
                      </View>
                    </XStack>
                  </YStack>
                );
              })}
            </MarqueeContent>
          </MarqueeContainer>
        ) : (
          // Original Mobile Layout (Grid)
          <XStack flexWrap="wrap" justifyContent="center" gap="$4" marginBottom="$4">
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
