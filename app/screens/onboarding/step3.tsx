import React, { useState, useEffect } from 'react'
import { YStack, XStack, Button, Text, Stack, isWeb,Label } from 'tamagui'
import { Image, View, useWindowDimensions, Platform, ImageSourcePropType, useColorScheme } from 'react-native' 
import { FormData } from '@/types/onboarding'
import { BackgroundStyleOption } from '@/types/background'
import { BackgroundStyle } from '@/constants/Backgrounds'
import { useWallpaperStore } from '@/store/WallpaperStore'
import { useCustomWallpaper } from '@/hooks/useCustomWallpaper'
import { useOrientationStore } from '@/store/OrientationStore'
import { isIpad } from '@/utils/deviceUtils';
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
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  backgroundStyles: BackgroundStyleOption[]
  getWallpaperPath: (style: BackgroundStyle) => Promise<ImageSourcePropType | null>
}) {
  const colorScheme = useColorScheme(); 
  const isDark = colorScheme === 'dark'; 
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const { isPortrait } = useOrientationStore();
  const [starsKey, setStarsKey] = React.useState(0);
  const translateX = Platform.OS !== 'web' && useSharedValue ? useSharedValue(0) : null;
  const translateY = Platform.OS !== 'web' && useSharedValue ? useSharedValue(0) : null;
  const { uploadCustomWallpaper, isUploading } = useCustomWallpaper();

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


useEffect(() => {
  const loadWallpaper = async () => {
    // Check if the current background style is a wallpaper type
    if (formData.backgroundStyle.startsWith('wallpaper-')) {
      try {
        setLoadingWallpaper(true);
        
        // This is the key - use the style name directly without adding another 'wallpaper-' prefix
        const wallpaperKey = formData.backgroundStyle;
        
        const cachedUri = await wallpaperStore.getCachedWallpaper(wallpaperKey);
        
        if (cachedUri) {
          setWallpaperSource({ uri: cachedUri });
        } else {
          console.warn(`[Step3] Wallpaper ${wallpaperKey} not found in cache, falling back to gradient`);
          setFormData(prev => ({ ...prev, backgroundStyle: 'gradient' }));
        }
      } catch (error) {
        console.error(`[Step3] Error loading wallpaper:`, error);
        setFormData(prev => ({ ...prev, backgroundStyle: 'gradient' }));
      } finally {
        setLoadingWallpaper(false);
      }
    } else {
      setWallpaperSource(null);
      setLoadingWallpaper(false);
    }
  };
  
  loadWallpaper();
}, [formData.backgroundStyle]);

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
          const wallpaperName = formData.backgroundStyle.replace('wallpaper-', '');
          sourceMatchesSelection = filename.includes(wallpaperName);
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
                  intensity={isDark ? 60 : 30}
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

  const buttonHoverBackgroundColor = '$onboardingButtonSecondaryBackground'; 
  const buttonSelectedBorderColor = adjustColor(formData.primaryColor, 100);

  return (
    <Stack flex={1} backgroundColor="black">
      {background}
      {stars}
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$5">
        <YStack 
          position="absolute" 
          top={isWeb ? "20%" : isIpad() ?  isPortrait ? "32%" : "25%" : "29%"} 
          left={0} 
          right={0} 
          alignItems="center"
          py={isWeb ? "$4" : "$0"}
          my={isWeb ? "$10" : 0}
        >
          <XStack alignItems="center" gap="$2" alignSelf="center" alignContent="center" justifyContent="center" >
          {formData.profilePicture && (
            <Image
              source={{ uri: formData.profilePicture }}
              style={{ width: 56, height: 56, borderRadius: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 4 }}
            />
          )}
          <Label 
            pl={isWeb ? 0 : 10}
            fontFamily="$heading" 
            fontWeight={isWeb ? "500" : "800"} 
            fontSize={isWeb ? "$9" : "$7"} 
            textAlign="center" 
            color="$onboardingLabel"
          >
            Which wallpaper {formData.username}?
          </Label>
          </XStack>
        </YStack>

        <YStack
          backgroundColor="$onboardingCardBackground" 
          br={24}
          borderColor={formData.primaryColor} 
          borderWidth={2}
          padding={isWeb ? "$3" : isIpad() ? "$2" : "$2"}
          maxWidth={isWeb ? 520 : isIpad() ? 520 : "100%"}
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
        >
          <XStack 
            flexWrap="wrap" 
            justifyContent="center" 
            alignItems="center"
            gap={isWeb ? "$3" : isIpad() ? "$3" : "$2"} 
            padding={isWeb ? "$2" : isIpad() ? "$2" : "$0"}
          >
            {backgroundStyles.map((style) => {
              const isSelected = formData.backgroundStyle === style.value;
              return (
                <Button
                  key={style.value}
                  px={isWeb ? "$4" : isIpad() ? "$5" : "$2"}
                  py={isWeb ? "$3" : isIpad() ? "$2" : "$2"}
                  marginVertical="$3"
                  backgroundColor={
                    isSelected
                      ? formData.primaryColor
                      : "$onboardingButtonSecondaryBackground" 
                  }
                  borderColor={
                    isSelected 
                      ? buttonSelectedBorderColor 
                      : "$onboardingButtonSecondaryBorder"
                  }
                  borderWidth={2}
                  br={16}
                  opacity={isSelected ? 1 : 0.8}
                  disabled={isUploading}
                  hoverStyle={{
                    backgroundColor: isSelected 
                      ? adjustColor(formData.primaryColor, 30) 
                      : buttonHoverBackgroundColor 
                  }}
                  pressStyle={{
                    scale: 0.97,
                    opacity: 0.9
                  }}
                  onPress={async () => {
                    if (style.value === "wallpaper-custom-upload") {
                      const wallpaperKey = await uploadCustomWallpaper();
                      if (wallpaperKey) {
                        setFormData(prev => ({ ...prev, backgroundStyle: wallpaperKey }));
                      }
                    } else {
                      const newStyle = style.value as FormData['backgroundStyle'];
                      
                      if (newStyle.startsWith('wallpaper-') && newStyle !== formData.backgroundStyle) {
                        setLoadingWallpaper(true);
                        setWallpaperSource(null);
                      } else if (!newStyle.startsWith('wallpaper-') && formData.backgroundStyle.startsWith('wallpaper-')) {
                        setWallpaperSource(null);
                        setLoadingWallpaper(false);
                      }
                      
                      setFormData((prev) => ({
                        ...prev,
                        backgroundStyle: newStyle, 
                      }));
                    }
                  }}
                >
                  <Text
                    fontFamily="$body" 
                    fontWeight={isSelected ? "700" : "500"}
                    fontSize={isWeb ? "$4" : isIpad() ? "$4" : "$3"} 
                    color={isSelected ? 'white' : "$onboardingButtonSecondaryText"} 
                    textAlign="center"
                    letterSpacing={0.5}  
                  >
                    {style.label}
                  </Text>
                </Button>
              );
            })}
            <Button
              px={isWeb ? "$4" : isIpad() ? "$5" : "$2"}
              py={isWeb ? "$3" : isIpad() ? "$2" : "$2"}
              marginVertical="$3"
              backgroundColor={
                formData.backgroundStyle.startsWith('wallpaper-custom-')
                  ? formData.primaryColor
                  : "$onboardingButtonSecondaryBackground"
              }
              borderColor={
                formData.backgroundStyle.startsWith('wallpaper-custom-')
                  ? buttonSelectedBorderColor
                  : "$onboardingButtonSecondaryBorder"
              }
              borderWidth={2}
              br={16}
              opacity={formData.backgroundStyle.startsWith('wallpaper-custom-') ? 1 : 0.8}
              disabled={isUploading}
              hoverStyle={{
                backgroundColor: formData.backgroundStyle.startsWith('wallpaper-custom-')
                  ? adjustColor(formData.primaryColor, 30)
                  : buttonHoverBackgroundColor
              }}
              pressStyle={{
                scale: 0.97,
                opacity: 0.9
              }}
              onPress={async () => {
                const wallpaperKey = await uploadCustomWallpaper();
                if (wallpaperKey) {
                  setFormData(prev => ({ ...prev, backgroundStyle: wallpaperKey }));
                }
              }}
            >
              <Text
                fontFamily="$body" 
                fontWeight={formData.backgroundStyle.startsWith('wallpaper-custom-') ? "700" : "500"}
                fontSize={isWeb ? "$4" : isIpad() ? "$4" : "$3"} 
                color={formData.backgroundStyle.startsWith('wallpaper-custom-') ? 'white' : "$onboardingButtonSecondaryText"}
                textAlign="center"
                letterSpacing={0.5}  
              >
                Custom Wallpaper
              </Text>
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </Stack>
  )
}
