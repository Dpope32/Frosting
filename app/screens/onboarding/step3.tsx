import React from 'react'
import { YStack, XStack, Button, Text, Label, Stack } from 'tamagui'
import { Image, View, useWindowDimensions, Platform } from 'react-native'
import { BackgroundStyleOption, FormData } from '@/types'
import { BackgroundStyle } from '@/constants/Backgrounds'

// Conditionally import components that might not be web-compatible
let LinearGradient: any = null;
let BlurView: any = null;
let Animated: any = null;
let useAnimatedStyle: any = null;
let withRepeat: any = null;
let withTiming: any = null;
let useSharedValue: any = null;

// Only import these components on native platforms
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
    // Import for native platforms
    LinearGradient = require('expo-linear-gradient').LinearGradient;
    BlurView = require('expo-blur').BlurView;
    const Reanimated = require('react-native-reanimated');
    Animated = Reanimated.default;
    useAnimatedStyle = Reanimated.useAnimatedStyle;
    withRepeat = Reanimated.withRepeat;
    withTiming = Reanimated.withTiming;
    useSharedValue = Reanimated.useSharedValue;
  } catch (error) {
    console.warn('Some native components could not be loaded:', error);
  }
}

export default function Step3({
  formData,
  setFormData,
  backgroundStyles,
  getWallpaperPath,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  backgroundStyles: BackgroundStyleOption[]
  getWallpaperPath: (style: BackgroundStyle) => any
}) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const [starsKey, setStarsKey] = React.useState(0);
  
  // Initialize animation values at the top level
  const translateX = Platform.OS !== 'web' && useSharedValue ? useSharedValue(0) : null;
  const translateY = Platform.OS !== 'web' && useSharedValue ? useSharedValue(0) : null;
  
  // Handle animations at the top level
  React.useEffect(() => {
    if (Platform.OS !== 'web' && translateX && translateY && withRepeat && withTiming) {
      const animationConfig = { duration: 60000 };
      translateX.value = withRepeat(withTiming(-screenWidth, animationConfig), -1, false);
      translateY.value = withRepeat(withTiming(-screenHeight / 2, animationConfig), -1, false);
      return () => {
        translateX.value = 0;
        translateY.value = 0;
      };
    }
  }, [screenWidth, screenHeight, translateX, translateY, withRepeat, withTiming]);
  
  // Create animated style at the top level
  const starsAnimatedStyle = Platform.OS !== 'web' && useAnimatedStyle && translateX && translateY
    ? useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
      }))
    : null;
  
  // Create animated stars for native platforms
  const createAnimatedStars = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      if (Animated && starsAnimatedStyle) {
        return (
          <Animated.View
            pointerEvents="none"
            style={[
              { position: 'absolute', width: screenWidth * 2, height: screenHeight * 2, zIndex: 1 },
              starsAnimatedStyle,
            ]}
          >
            {[...Array(100)].map((_, i) => (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  width: i % 3 === 0 ? 3 : 2,
                  height: i % 3 === 0 ? 3 : 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: 1,
                  left: Math.random() * screenWidth * 2,
                  top: Math.random() * screenHeight * 2,
                }}
              />
            ))}
          </Animated.View>
        );
      }
    }
    
    // Enhanced animated stars for web using CSS animations
    if (Platform.OS === 'web') {
      // Create multiple layers of stars with different animation speeds
      return (
        <>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              zIndex: 1,
              overflow: 'hidden'
            }}
          >
            {/* Layer 1 - Slow moving stars */}
            <div
              style={{
                position: 'absolute',
                width: '150%',
                height: '150%',
                animation: 'moveStarsSlow 120s linear infinite',
                left: '-50%',
                top: '-50%'
              }}
            >
              {[...Array(30)].map((_, i) => (
                <div
                  key={`slow-${i}`}
                  style={{
                    position: 'absolute',
                    width: i % 5 === 0 ? '3px' : '2px',
                    height: i % 5 === 0 ? '3px' : '2px',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '50%',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    boxShadow: i % 5 === 0 ? '0 0 3px 1px rgba(255, 255, 255, 0.3)' : 'none'
                  }}
                />
              ))}
            </div>
            
            {/* Layer 2 - Medium moving stars */}
            <div
              style={{
                position: 'absolute',
                width: '125%',
                height: '125%',
                animation: 'moveStarsMedium 80s linear infinite',
                left: '-50%',
                top: '-50%'
              }}
            >
              {[...Array(40)].map((_, i) => (
                <div
                  key={`medium-${i}`}
                  style={{
                    position: 'absolute',
                    width: i % 7 === 0 ? '2px' : '1px',
                    height: i % 7 === 0 ? '2px' : '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '50%',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    boxShadow: i % 10 === 0 ? '0 0 2px 1px rgba(255, 255, 255, 0.2)' : 'none'
                  }}
                />
              ))}
            </div>
            
            {/* Layer 3 - Fast twinkling stars */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%'
              }}
            >
              {[...Array(25)].map((_, i) => (
                <div
                  key={`twinkle-${i}`}
                  style={{
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '50%',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `twinkle ${3 + Math.random() * 5}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 5}s`
                  }}
                />
              ))}
            </div>
          </View>
          
          {/* CSS Animations */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes moveStarsSlow {
              0% { transform: translate(0, 0); }
              100% { transform: translate(-25%, -25%); }
            }
            
            @keyframes moveStarsMedium {
              0% { transform: translate(0, 0); }
              100% { transform: translate(-50%, -25%); }
            }
            
            @keyframes twinkle {
              0%, 100% { opacity: 0.2; }
              50% { opacity: 1; box-shadow: 0 0 3px 1px rgba(255, 255, 255, 0.5); }
            }
          `}} />
        </>
      );
    }
    
    // Fallback static stars
    return (
      <View
        pointerEvents="none"
        style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }}
      >
        {[...Array(50)].map((_, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </View>
    );
  };
  
  // Refresh stars when background changes
  React.useEffect(() => {
    setStarsKey(prev => prev + 1);
  }, [formData.backgroundStyle]);
  
  const stars = React.useMemo(() => createAnimatedStars(), [screenWidth, screenHeight, starsKey]);

  const adjustColor = React.useCallback((color: string, amount: number) => {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
    return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`
  }, [])

  const background = React.useMemo(() => {
    switch (formData.backgroundStyle) {
      case 'gradient': {
        const lighterColor = adjustColor(formData.primaryColor, 100);
        const darkerColor = adjustColor(formData.primaryColor, -250);
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          if (LinearGradient) {
            return (
              <LinearGradient
                colors={[lighterColor, formData.primaryColor, darkerColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
                locations={[0, 0.5, 1]}
              />
            );
          }
        }
        
        // Enhanced CSS gradient for web
        if (Platform.OS === 'web') {
          return (
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: `linear-gradient(135deg, ${lighterColor} 0%, ${formData.primaryColor} 50%, ${darkerColor} 100%)`,
              }}
            />
          );
        }
        
        // Fallback for other platforms
        return (
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: formData.primaryColor,
            }}
          >
            <View style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: '50%', 
              backgroundColor: lighterColor,
              opacity: 0.7 
            }} />
            <View style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              height: '50%', 
              backgroundColor: darkerColor,
              opacity: 0.7 
            }} />
          </View>
        );
      }
      
      case 'space': {
        // Enhanced space background for web
        if (Platform.OS === 'web') {
          return (
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(180deg, #0A0E21 0%, #191930 50%, #2C1E4F 100%)',
              }}
            />
          );
        }
        
        // Fallback for other platforms
        return (
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: '#0A0E21',
            }}
          />
        );
      }
      
      case 'silhouette': {
        // Silhouette effect for web
        if (Platform.OS === 'web') {
          return (
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: `linear-gradient(180deg, ${adjustColor(formData.primaryColor, -100)} 0%, #000000 100%)`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  height: '30%',
                  backgroundImage: 'url("https://svgsilh.com/svg/3169476-000000.svg")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'bottom center',
                  backgroundRepeat: 'no-repeat',
                  opacity: 0.7,
                }}
              />
            </div>
          );
        }
        
        // Fallback
        return (
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: '#000000',
            }}
          />
        );
      }
      
      default:
        if (formData.backgroundStyle.startsWith('wallpaper-')) {
          const wallpaper = getWallpaperPath(formData.backgroundStyle);
          if (!wallpaper) return null;
          
          if (Platform.OS === 'ios' || Platform.OS === 'android' && BlurView) {
            return (
              <Stack position="absolute" width="100%" height="100%">
                <Image
                  source={wallpaper}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    resizeMode: 'cover',
                  }}
                />
                <BlurView
                  intensity={10}
                  tint="dark"
                  style={{ position: 'absolute', width: '100%', height: '100%' }}
                />
              </Stack>
            );
          }
          
          // Enhanced version for web with CSS backdrop filter
          if (Platform.OS === 'web') {
            return (
              <Stack position="absolute" width="100%" height="100%">
                <Image
                  source={wallpaper}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    resizeMode: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                />
              </Stack>
            );
          }
          
          // Fallback
          return (
            <Stack position="absolute" width="100%" height="100%">
              <Image
                source={wallpaper}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  resizeMode: 'cover',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
              />
            </Stack>
          );
        }
        
        // Default fallback - dark background
        return (
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: '#121212',
            }}
          />
        );
    }
  }, [formData.backgroundStyle, formData.primaryColor, adjustColor, getWallpaperPath]);

  return (
    <Stack flex={1} backgroundColor="black">
      {background}
      {stars}
      <YStack flex={1} padding="$4">
        <YStack
          backgroundColor="rgba(0, 0, 0, 0.7)"
          borderRadius={16}
          paddingVertical="$2"
          paddingHorizontal="$5"
          marginTop={10}
          borderColor="rgba(255, 255, 255, 0.1)"
          borderWidth={2}
          gap="$2"
        >
          <Label size="$8" textAlign="center" color="$gray12Dark">
            Background
          </Label>
          <XStack gap="$5" justifyContent="center" flexWrap="wrap" paddingBottom="$6">
            {backgroundStyles.map((style) => {
              const isSelected = formData.backgroundStyle === style.value;
              return (
                <Button
                  key={style.value}
                  size="$4"
                  minWidth={100}
                  backgroundColor={
                    isSelected
                      ? formData.primaryColor
                      : 'rgba(255, 255, 255, 0.1)'
                  }
                  borderColor={isSelected ? formData.primaryColor : 'rgba(255, 255, 255, 0.2)'}
                  borderWidth={2}
                  pressStyle={{
                    scale: 0.97,
                    opacity: 0.8
                  }}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      backgroundStyle: style.value as FormData['backgroundStyle'],
                    }))
                  }
                >
                  <Text
                    color={isSelected ? 'white' : '$gray11Dark'}
                    textAlign="center"
                  >
                    {style.label}
                  </Text>
                </Button>
              );
            })}
          </XStack>
        </YStack>
      </YStack>
    </Stack>
  )
}
