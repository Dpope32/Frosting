import React from 'react'
import { YStack, XStack, Button, Text, Label, Stack } from 'tamagui'
import { Image, View, useWindowDimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import Animated, { useAnimatedStyle, withRepeat, withTiming, useSharedValue } from 'react-native-reanimated'
import { BackgroundStyleOption, FormData } from '@/types'
import { BackgroundStyle } from '@/constants/Backgrounds'

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
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)

  React.useEffect(() => {
    const animationConfig = { duration: 60000 }
    translateX.value = withRepeat(withTiming(-screenWidth, animationConfig), -1, false)
    translateY.value = withRepeat(withTiming(-screenHeight / 2, animationConfig), -1, false)
    return () => {
      translateX.value = 0
      translateY.value = 0
    }
  }, [screenWidth, screenHeight])

  const starsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }))

  const stars = React.useMemo(() => (
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
  ), [screenWidth, screenHeight, starsAnimatedStyle])

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
        const lighterColor = adjustColor(formData.primaryColor, 100)
        const darkerColor = adjustColor(formData.primaryColor, -250)
        return (
          <LinearGradient
            colors={[lighterColor, formData.primaryColor, darkerColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
            locations={[0, 0.5, 1]}
          />
        )
      }
      default:
        if (formData.backgroundStyle.startsWith('wallpaper-')) {
          const wallpaper = getWallpaperPath(formData.backgroundStyle)
          return wallpaper ? (
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
          ) : null
        }
        return null
    }
  }, [formData.backgroundStyle, formData.primaryColor, adjustColor, getWallpaperPath])
  return (
    <Stack flex={1} backgroundColor="black">
      {background}
      {stars}
      <YStack flex={1} padding="$4">
        <YStack
          backgroundColor="rgba(0, 0, 0, 0.7)"
          borderRadius={16}
          padding="$6"
          marginTop={40}
          borderColor="rgba(255, 255, 255, 0.1)"
          borderWidth={2}
          gap="$6"
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
