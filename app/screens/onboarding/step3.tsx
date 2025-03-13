import React, { useState, useEffect } from 'react'
import { YStack, XStack, Button, Text, Stack, isWeb, Spinner } from 'tamagui'
import { Image, View, useWindowDimensions, Platform } from 'react-native'
import { BackgroundStyleOption, FormData } from '@/types'
import { BackgroundStyle } from '@/constants/Backgrounds'
import { preloadWallpaperByStyle } from '@/services/s3Service'
let LinearGradient: any = null;
let BlurView: any = null;
let Animated: any = null;
let useAnimatedStyle: any = null;
let withRepeat: any = null;
let withTiming: any = null;
let useSharedValue: any = null;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
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
  isDark = true,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  backgroundStyles: BackgroundStyleOption[]
  getWallpaperPath: (style: BackgroundStyle) => any
  isDark?: boolean
}) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const [starsKey, setStarsKey] = React.useState(0);
  const translateX = Platform.OS !== 'web' && useSharedValue ? useSharedValue(0) : null;
  const translateY = Platform.OS !== 'web' && useSharedValue ? useSharedValue(0) : null;
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
  const starsAnimatedStyle = Platform.OS !== 'web' && useAnimatedStyle && translateX && translateY
    ? useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
      }))
    : null;
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
            {[...Array(200)].map((_, i) => (
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
    if (Platform.OS === 'web') {
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
    return (
      <View
        pointerEvents="none"
        style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }}
      >
        {[...Array(200)].map((_, i) => (
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
  React.useEffect(() => {
    setStarsKey(prev => prev + 1);
  }, [formData.backgroundStyle]);
  // Track loading state and timing for wallpapers
  const [isWallpaperLoading, setIsWallpaperLoading] = useState(false);
  const [wallpaperError, setWallpaperError] = useState<string | null>(null);
  const [loadStartTimes, setLoadStartTimes] = useState<Record<string, number>>({});
  
  // Simplified re-render logic when wallpaper changes
  useEffect(() => {
    if (formData.backgroundStyle.startsWith('wallpaper-')) {
      const startTime = Date.now();
      console.log(`[Wallpaper] [${startTime}] PROCESS START for: ${formData.backgroundStyle}`);
      
      setIsWallpaperLoading(true);
      setWallpaperError(null);
      
      try {
        // Pre-validate the wallpaper path
        const wallpaper = getWallpaperPath(formData.backgroundStyle);
        
        if (!wallpaper) {
          console.warn(`[Wallpaper] No wallpaper found for ${formData.backgroundStyle}`);
          setWallpaperError('Wallpaper not found');
          setIsWallpaperLoading(false);
          return;
        }
        
        // No need for forced re-renders with timeouts - React will handle this naturally
        // The starsKey update in the other useEffect is sufficient
        
      } catch (error) {
        console.error(`[Wallpaper] Error processing wallpaper: ${error}`);
        setWallpaperError('Error loading wallpaper');
        setIsWallpaperLoading(false);
      }
    }
  }, [formData.backgroundStyle, getWallpaperPath]);
  
  const stars = React.useMemo(() => createAnimatedStars(), [screenWidth, screenHeight, starsKey]);
  const adjustColor = React.useCallback((color: string, amount: number) => {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
    return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`
  }, [])
  // Use the original wallpaper path without adding additional cache-busting parameters
  const getEnhancedWallpaperPath = (style: BackgroundStyle) => {
    if (!style.startsWith('wallpaper-')) return null;
    
    // Get the wallpaper path from the passed function
    const wallpaper = getWallpaperPath(style);
    
    if (!wallpaper) {
      console.warn(`[Wallpaper] No wallpaper found for ${style}`);
      return null;
    }
    
    // Log the wallpaper path for debugging but don't add additional cache-busting
    console.log(`[Wallpaper] Path for ${style}:`, JSON.stringify(wallpaper));
    
    return wallpaper;
  };
  
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
          // Use enhanced wallpaper path
          const wallpaper = getEnhancedWallpaperPath(formData.backgroundStyle);
          
          if (!wallpaper) {
            console.warn(`[Wallpaper] No wallpaper found for ${formData.backgroundStyle}`);
            return null;
          }
          
          if ((Platform.OS === 'ios' || Platform.OS === 'android') && BlurView) {
            return (
              <Stack position="absolute" width="100%" height="100%">
                <Image
                  key={`wallpaper-${formData.backgroundStyle}-${starsKey}`} // Force re-render with unique key tied to starsKey
                  source={wallpaper}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    resizeMode: 'cover',
                  }}
                  onLoadStart={() => {
                    const loadStartTime = Date.now();
                    console.log(`[Wallpaper] [${loadStartTime}] LOAD START for: ${formData.backgroundStyle}`);
                    setIsWallpaperLoading(true);
                    
                    // Store the start time in component state
                    setLoadStartTimes(prev => ({
                      ...prev,
                      [formData.backgroundStyle]: loadStartTime
                    }));
                  }}
                  onLoad={() => {
                    const loadEndTime = Date.now();
                    const startTime = loadStartTimes[formData.backgroundStyle] || loadEndTime - 100;
                    console.log(`[Wallpaper] [${loadEndTime}] LOAD COMPLETE for: ${formData.backgroundStyle}`);
                    console.log(`[Wallpaper] Total loading time: ${loadEndTime - startTime}ms for ${formData.backgroundStyle}`);
                    setIsWallpaperLoading(false);
                  }}
                  onError={(error) => {
                    const errorTime = Date.now();
                    const errorMsg = error.nativeEvent.error || 'Unknown error';
                    console.error(`[Wallpaper] [${errorTime}] LOAD ERROR for: ${formData.backgroundStyle}`, errorMsg);
                    console.error(`[Wallpaper] Error details:`, JSON.stringify(error.nativeEvent));
                    setWallpaperError(errorMsg);
                    setIsWallpaperLoading(false);
                  }}
                />
                <BlurView
                  intensity={isDark ? 20 : 30}
                  tint="dark"
                  style={{ position: 'absolute', width: '100%', height: '100%' }}
                />
              </Stack>
            );
          }
          if (Platform.OS === 'web') {
            return (
              <Stack position="absolute" width="100%" height="100%">
                <Image
                  key={`wallpaper-${formData.backgroundStyle}-${starsKey}`} // Force re-render with unique key tied to starsKey
                  source={wallpaper}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    resizeMode: 'cover',
                  }}
                  onLoadStart={() => {
                    const loadStartTime = Date.now();
                    console.log(`[Wallpaper] [${loadStartTime}] LOAD START for: ${formData.backgroundStyle}`);
                    setIsWallpaperLoading(true);
                  }}
                  onLoad={() => {
                    const loadEndTime = Date.now();
                    console.log(`[Wallpaper] [${loadEndTime}] LOAD COMPLETE for: ${formData.backgroundStyle}`);
                    // Store the start time in a ref for this component
                  
                    setIsWallpaperLoading(false);
                  }}
                  onError={(error) => {
                    const errorTime = Date.now();
                    const errorMsg = error.nativeEvent.error || 'Unknown error';
                    console.error(`[Wallpaper] [${errorTime}] LOAD ERROR for: ${formData.backgroundStyle}`, errorMsg);
                    console.error(`[Wallpaper] Error details:`, JSON.stringify(error.nativeEvent));
                    setWallpaperError(errorMsg);
                    setIsWallpaperLoading(false);
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
          return (
            <Stack position="absolute" width="100%" height="100%">
              <Image
                key={`wallpaper-${formData.backgroundStyle}-${starsKey}`} // Force re-render with unique key tied to starsKey
                source={wallpaper}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  resizeMode: 'cover',
                }}
                onLoadStart={() => {
                  const loadStartTime = Date.now();
                  console.log(`[Wallpaper] [${loadStartTime}] LOAD START for: ${formData.backgroundStyle}`);
                  setIsWallpaperLoading(true);
                  
                  // Store the start time in component state
                  setLoadStartTimes(prev => ({
                    ...prev,
                    [formData.backgroundStyle]: loadStartTime
                  }));
                }}
                onLoad={() => {
                  const loadEndTime = Date.now();
                  const startTime = loadStartTimes[formData.backgroundStyle] || loadEndTime - 100;
                  console.log(`[Wallpaper] [${loadEndTime}] LOAD COMPLETE for: ${formData.backgroundStyle}`);
                  console.log(`[Wallpaper] Total loading time: ${loadEndTime - startTime}ms for ${formData.backgroundStyle}`);
                  setIsWallpaperLoading(false);
                }}
                onError={(error) => {
                  const errorTime = Date.now();
                  const errorMsg = error.nativeEvent.error || 'Unknown error';
                  console.error(`[Wallpaper] [${errorTime}] LOAD ERROR for: ${formData.backgroundStyle}`, errorMsg);
                  console.error(`[Wallpaper] Error details:`, JSON.stringify(error.nativeEvent));
                  setWallpaperError(errorMsg);
                  setIsWallpaperLoading(false);
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
  }, [formData.backgroundStyle, formData.primaryColor, adjustColor, getWallpaperPath, isDark, starsKey]);
  const labelColor = isDark ? "$gray12Dark" : "$gray12Light";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  const buttonTextColor = isDark ? "$gray11Dark" : "$gray11Light";
  const cardBackgroundColor = isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.6)";
  return (
    <Stack flex={1} backgroundColor="black">
      {background}
      {stars}
      <YStack flex={1} padding={isWeb ? "$4" : "$3"} position="relative">
        {/* Loading indicator for wallpapers */}
        {isWallpaperLoading && formData.backgroundStyle.startsWith('wallpaper-') && (
          <Stack 
            position="absolute" 
            top={10} 
            right={10} 
            backgroundColor="rgba(0,0,0,0.7)" 
            padding="$2" 
            borderRadius={8}
            zIndex={10}
          >
            <Spinner size="small" color="white" />
          </Stack>
        )}
        
        {/* Error message for wallpaper loading failures */}
        {wallpaperError && (
          <Stack 
            position="absolute" 
            top={10} 
            left={10} 
            backgroundColor="rgba(255,0,0,0.7)" 
            padding="$2" 
            borderRadius={8}
            zIndex={10}
          >
            <Text color="white" fontSize={12}>Failed to load wallpaper</Text>
          </Stack>
        )}
        <YStack
          backgroundColor={cardBackgroundColor}
          borderRadius={isWeb ? 16 : 32}
          paddingVertical={isWeb ? "$3" : "$4"}
          paddingHorizontal={isWeb ? "$5" : "$3"}
          marginTop={isWeb ? 10 : 60}
          borderColor={borderColor}
          borderWidth={2}
          gap={isWeb ? "$2" : "$2"}
        >
          <XStack gap={isWeb ? "$5" : "$3"} justifyContent={isWeb ? "center" : "flex-start"} flexWrap="wrap" paddingBottom={isWeb ? "$6" : "$2"}>
            {backgroundStyles.map((style) => {
              const isSelected = formData.backgroundStyle === style.value;
              return (
                <Button
                  key={style.value}
                  size={isWeb ? "$4" : "$5"}
                  minWidth={isWeb ? 100 : 80}
                  backgroundColor={
                    isSelected
                      ? formData.primaryColor
                      : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                  }
                  borderColor={isSelected ? formData.primaryColor : isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}
                  borderWidth={2}
                  pressStyle={{
                    scale: 0.97,
                    opacity: 0.8
                  }}
                  onPress={() => {
                    // If this is a wallpaper style, preload it before setting it
                    if (style.value.startsWith('wallpaper-')) {
                      console.log(`[Wallpaper] Preloading wallpaper before setting: ${style.value}`);
                      // Preload the wallpaper in the background
                      preloadWallpaperByStyle(style.value)
                        .catch(err => console.warn(`Failed to preload wallpaper ${style.value}:`, err));
                    }
                    
                    // Update the form data with the selected style
                    setFormData((prev) => ({
                      ...prev,
                      backgroundStyle: style.value as FormData['backgroundStyle'],
                    }));
                  }}
                >
                  <Text
                    fontFamily="$heading" 
                    fontWeight="700" 
                    fontSize={isWeb ? "$6" : "$5"} 
                    color={isSelected ? 'white' : buttonTextColor}
                    textAlign="center"
                    letterSpacing={0.5}  
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
