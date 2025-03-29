import React, { useState, useEffect } from 'react'
import { YStack, XStack, Button, Text, Stack, isWeb,Label } from 'tamagui'
import { Image, View, useWindowDimensions, Platform, ImageSourcePropType } from 'react-native'
import { BackgroundStyleOption, FormData } from '@/types'
import { BackgroundStyle, wallpapers } from '@/constants/Backgrounds'
import { useWallpaperStore } from '@/store/WallpaperStore'

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
  getWallpaperPath: (style: BackgroundStyle) => Promise<ImageSourcePropType | null>
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

  const stars = React.useMemo(() => createAnimatedStars(), [screenWidth, screenHeight, starsKey]);

  const adjustColor = React.useCallback((color: string, amount: number) => {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
    return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`
  }, [])

  const wallpaperStore = useWallpaperStore()
  const [wallpaperSource, setWallpaperSource] = useState<ImageSourcePropType | null>(null)
  const [loadingWallpaper, setLoadingWallpaper] = useState(false)
  // Removed wallpaperCache state and the useEffect that populated it.

  // Load selected wallpaper directly from the store's cache
  useEffect(() => {
    const loadSrc = async () => {
      if (formData.backgroundStyle.startsWith('wallpaper-')) {
        try {
          const cachedUri = await wallpaperStore.getCachedWallpaper(formData.backgroundStyle);
          if (cachedUri) {
            setWallpaperSource({ uri: cachedUri });
            setLoadingWallpaper(false);
          } else {
            console.warn(`[Step3] Wallpaper ${formData.backgroundStyle} not found in cache, falling back.`);
            setFormData(prev => ({ ...prev, backgroundStyle: 'gradient' }));
            setLoadingWallpaper(false);
          }
        } catch (error) {
          console.error(`[Step3] Error loading wallpaper ${formData.backgroundStyle}:`, error);
           setFormData(prev => ({ ...prev, backgroundStyle: 'gradient' }));
           setLoadingWallpaper(false);
        }
      } else {
        // Handle non-wallpaper styles like 'gradient'
        setWallpaperSource(null);
        setLoadingWallpaper(false);
      }
    };
    
    loadSrc();
    
  }, [formData.backgroundStyle, wallpaperStore]); 

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
      default:
        if (formData.backgroundStyle.startsWith('wallpaper-')) {
          let sourceMatchesSelection = false;
          if (wallpaperSource && typeof wallpaperSource === 'object' && !Array.isArray(wallpaperSource) && typeof wallpaperSource.uri === 'string') {
            const parts = wallpaperSource.uri.split('/');
            const filenameWithPotentialQuery = parts[parts.length - 1];
            const filename = filenameWithPotentialQuery.split('?')[0];
            sourceMatchesSelection = filename.startsWith(formData.backgroundStyle);
          }

          if (loadingWallpaper || !wallpaperSource || !sourceMatchesSelection) {
             return null;
          }

          if ((Platform.OS === 'ios' || Platform.OS === 'android') && BlurView) {
            return (
              <Stack position="absolute" width="100%" height="100%">
                <Image
                  source={wallpaperSource}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    resizeMode: 'cover',
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
                  source={wallpaperSource}
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
          return (
            <Stack position="absolute" width="100%" height="100%">
              <Image
                source={wallpaperSource}
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
  }, [formData.backgroundStyle, formData.primaryColor, adjustColor, wallpaperSource, loadingWallpaper]);

  const labelColor = isDark ? "$gray12Dark" : "$gray12Light";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  const buttonTextColor = isDark ? "$gray11Dark" : "$gray12Dark";
  const cardBackgroundColor = isDark ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.4)";

  return (
    <Stack flex={1} backgroundColor="black">
      {background}
      {stars}
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$5">
        <YStack 
          position="absolute" 
          top={isWeb ? "8%" : "25%"} 
          left={0} 
          right={0} 
          alignItems="center"
          py={isWeb ? "$4" : "$0"}
          my={isWeb ? "$10" : 0}
        >
          <Label 
            paddingBottom={20} 
            fontFamily="$heading" 
            fontWeight={isWeb ? "500" : "800"} 
            fontSize={isWeb ? "$9" : "$7"} 
            textAlign="center" 
            color={labelColor}
          >
            Choose your wallpaper
          </Label>
          <Text
            fontFamily="$body"
            fontSize="$3"
            textAlign="center"
            color={isWeb ? "#CCCCCC" : "#ccc"}
            opacity={0.8}
            fontWeight="400"
          >
            (you can always change this in the settings later)
          </Text>
        </YStack>

        <YStack
          backgroundColor={isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.3)"}
          br={24}
          borderColor={formData.primaryColor}
          borderWidth={2}
          padding="$4"
          maxWidth={isWeb ? 520 : "100%"}
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
        >
          <XStack 
            flexWrap="wrap" 
            justifyContent="center" 
            alignItems="center"
            gap="$3" 
            padding="$2"
          >
            {backgroundStyles.map((style) => {
              const isSelected = formData.backgroundStyle === style.value;
              return (
                <Button
                  key={style.value}
                  px={isWeb ? "$4" : "$3"}
                  py={isWeb ? "$3" : "$2"}
                  marginVertical="$2"
                  backgroundColor={
                    isSelected
                      ? formData.primaryColor
                      : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
                  }
                  borderColor={
                    isSelected 
                      ? adjustColor(formData.primaryColor, 100) 
                      : isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'
                  }
                  borderWidth={2}
                  br={16}
                  opacity={isSelected ? 1 : 0.8}

                  hoverStyle={{
                    backgroundColor: isSelected 
                      ? adjustColor(formData.primaryColor, 30)
                      : isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
                  }}
                  pressStyle={{
                    scale: 0.97,
                    opacity: 0.9
                  }}
                  onPress={() => {
                    const newStyle = style.value as FormData['backgroundStyle'];
                    
                    // If changing *to* a wallpaper style that isn't already selected,
                    // set loading and clear source immediately to prevent stale render.
                    if (newStyle.startsWith('wallpaper-') && newStyle !== formData.backgroundStyle) {
                      setLoadingWallpaper(true); 
                      setWallpaperSource(null); 
                    } else if (!newStyle.startsWith('wallpaper-') && formData.backgroundStyle.startsWith('wallpaper-')) {
                       // Handle switching *from* a wallpaper to something else (e.g., gradient)
                       setWallpaperSource(null); // Clear the source
                       setLoadingWallpaper(false); // Ensure loading is false
                    }

                    setFormData((prev) => ({
                      ...prev,
                      backgroundStyle: newStyle,
                    }));
                  }}
                >
                  <Text
                    fontFamily="$body" 
                    fontWeight={isSelected ? "700" : "500"}
                    fontSize={isWeb ? "$4" : "$3"} 
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
