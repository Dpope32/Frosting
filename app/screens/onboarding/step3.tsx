import React from 'react'
import { YStack, XStack, Button, Text, Stack, isWeb } from 'tamagui'
import { Image, View, useWindowDimensions, Platform, ActivityIndicator } from 'react-native'
import FastImage from 'react-native-fast-image' 
import { BackgroundStyleOption, FormData } from '@/types'
import { BackgroundStyle } from '@/constants/Backgrounds'
import { preloadImage } from '@/services/s3Service'

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
  const [starsKey, setStarsKey] = React.useState(0)
  const [isImageLoading, setIsImageLoading] = React.useState(false)
  const [activeWallpaper, setActiveWallpaper] = React.useState<string | null>(null)
  
  const translateX = Platform.OS !== 'web' && useSharedValue ? useSharedValue(0) : null;
  const translateY = Platform.OS !== 'web' && useSharedValue ? useSharedValue(0) : null;
  
  // Preload the current wallpaper when it changes
  React.useEffect(() => {
    if (formData.backgroundStyle.startsWith('wallpaper-')) {
      const wallpaper = getWallpaperPath(formData.backgroundStyle);
      if (wallpaper && wallpaper.uri) {
        setIsImageLoading(true);
        setActiveWallpaper(wallpaper.uri);
        console.log('Loading wallpaper:', activeWallpaper);

        
        if (Platform.OS === 'web') {
          // Manually preload on web
          preloadImage(wallpaper.uri)
            .then(() => {
              setIsImageLoading(false);
              console.log(`Wallpaper loaded: ${formData.backgroundStyle}`);
            })
            .catch(error => {
              console.error(`Failed to load wallpaper: ${error}`);
              setIsImageLoading(false);
            });
        } else {
          // On native, we don't need to manually preload
          setIsImageLoading(false);
        }
      }
    }
    
    setStarsKey(prev => prev + 1);
  }, [formData.backgroundStyle, getWallpaperPath]);
  
  // Animate starfield in the background
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
  }, [screenWidth, screenHeight, translateX, translateY]);
  
  const starsAnimatedStyle = (
    Platform.OS !== 'web' &&
    useAnimatedStyle &&
    translateX &&
    translateY
  ) ? useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    })) : null;
  
  const createAnimatedStars = () => {
    // iOS/Android starfield
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
    
    // Web starfield
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
    
    // Fallback starfield (no animation)
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
  
  const stars = React.useMemo(() => createAnimatedStars(), [screenWidth, screenHeight, starsKey]);

  const adjustColor = React.useCallback((color: string, amount: number) => {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
    return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`
  }, [])
  
  /**
   * Renders the wallpaper background.
   * - On web: we keep <Image>.
   * - On native: <FastImage> for better caching/perf.
   */
  const renderWallpaperImage = (wallpaper: any) => {
    // Show loading spinner on web only, if needed
    if (isImageLoading && Platform.OS === 'web') {
      return (
        <Stack
          position="absolute"
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          backgroundColor="#121212"
        >
          <ActivityIndicator size="large" color={formData.primaryColor} />
        </Stack>
      );
    }
    
    return (
      <Stack position="absolute" width="100%" height="100%">
        {activeWallpaper && (
          Platform.OS === 'web' ? (
            <Image
              key={activeWallpaper}
              source={{ uri: activeWallpaper }}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                resizeMode: 'cover',
              }}
              onLoad={() => setIsImageLoading(false)}
              onError={(error) => {
                console.error('Image loading error:', error.nativeEvent.error);
                setIsImageLoading(false);
              }}
            />
          ) : (
            <FastImage
              key={activeWallpaper}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
              }}
              source={{
                uri: activeWallpaper,
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
              }}
              resizeMode={FastImage.resizeMode.cover}
              onLoad={() => setIsImageLoading(false)}
              onError={() => {
                console.error('Image loading error occurred');
                setIsImageLoading(false);
              }}
            />
          )
        )}
        
        {/** The blur overlay logic remains the same */}
        {Platform.OS === 'web' ? (
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
        ) : Platform.OS === 'ios' || Platform.OS === 'android' ? (
          BlurView ? (
            <BlurView
              intensity={isDark ? 20 : 30}
              tint="dark"
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
          ) : (
            <View
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              }}
            />
          )
        ) : (
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}
          />
        )}
      </Stack>
    );
  };
  
  const background = React.useMemo(() => {
    switch (formData.backgroundStyle) {
      case 'gradient': {
        const lighterColor = adjustColor(formData.primaryColor, 100);
        const darkerColor = adjustColor(formData.primaryColor, -250);

        // Native gradient
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

        // Web gradient
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

        // Fallback gradient
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
          const wallpaper = getWallpaperPath(formData.backgroundStyle);
          if (!wallpaper) {
            console.warn(`No wallpaper found for ${formData.backgroundStyle}`);
            return (
              <View
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#121212',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Text color="white">Wallpaper not found</Text>
              </View>
            );
          }
          return renderWallpaperImage(wallpaper);
        }
        // Fallback blank background
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
  }, [
    formData.backgroundStyle,
    formData.primaryColor,
    adjustColor,
    getWallpaperPath,
    isImageLoading,
    activeWallpaper
  ]);
  const borderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  const buttonTextColor = isDark ? "$gray11Dark" : "$gray11Light";
  const cardBackgroundColor = isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.6)";
  
  return (
    <Stack flex={1} backgroundColor="black">
      {background}
      {stars}
      <YStack flex={1} padding={isWeb ? "$4" : "$4"}>
        <YStack
          backgroundColor={cardBackgroundColor}
          borderRadius={isWeb ? 16 : 32}
          paddingVertical={isWeb ? "$3" : "$4"}
          paddingHorizontal={isWeb ? "$5" : "$4"}
          marginTop={isWeb ? 10 : 60}
          borderColor={borderColor}
          borderWidth={2}
          gap={isWeb ? "$2" : "$2"}
        >
          <XStack
            gap={isWeb ? "$5" : "$3"}
            justifyContent={isWeb ? "center" : "flex-start"}
            flexWrap="wrap"
            paddingBottom={isWeb ? "$6" : "$2"}
          >
            {backgroundStyles.map((style) => {
              const isSelected = formData.backgroundStyle === style.value;
              return (
                <Button
                  key={style.value}
                  size={isWeb ? "$4" : "$5"}
                  minWidth={isWeb ? 100 : 80}
                  backgroundColor={ isSelected ? formData.primaryColor : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                  borderColor={ isSelected ? formData.primaryColor : isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}
                  borderWidth={2}
                  pressStyle={{ scale: 0.97, opacity: 0.8 }}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      backgroundStyle: style.value as FormData['backgroundStyle'],
                    }))
                  }
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
