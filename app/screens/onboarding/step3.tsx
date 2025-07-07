import React, { useState, useEffect } from 'react'
import { YStack, XStack, Button, Text, Stack, isWeb, Label } from 'tamagui'
import { Image, Platform, ImageSourcePropType } from 'react-native' 
import { useColorScheme } from '@/hooks/useColorScheme'
import { FormData, BackgroundStyleOption } from '@/types'
import { useWallpaperStore } from '@/store'
import { useCustomWallpaper } from '@/hooks'
import { isIpad } from '@/utils';
import StarField from '@/components/onboarding/StarField'
import BackgroundRenderer from '@/components/onboarding/BackgroundRenderer'

export default function Step3({
  formData,
  setFormData,
  backgroundStyles,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  backgroundStyles: BackgroundStyleOption[]
}) {
  const [starsKey, setStarsKey] = React.useState(0);
  const { uploadCustomWallpaper, isUploading } = useCustomWallpaper();

  React.useEffect(() => {
    setStarsKey(prev => prev + 1);
  }, [formData.backgroundStyle]);

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



  const buttonHoverBackgroundColor = '$onboardingButtonSecondaryBackground'; 
  const buttonSelectedBorderColor = adjustColor(formData.primaryColor, 100);

  return (
    <Stack flex={1} backgroundColor="black">
      <BackgroundRenderer backgroundStyle={formData.backgroundStyle} primaryColor={formData.primaryColor} wallpaperSource={wallpaperSource} loadingWallpaper={loadingWallpaper} />
      <StarField starsKey={starsKey} />
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$5">
        <YStack 
          position="absolute" 
          top={isWeb ? "25%" : isIpad() ? "30%" : "32%"} 
          left={0} 
          right={0} 
          alignItems="center"
          py={isWeb ? "$4" : "$0"}
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
            Which wallpaper?
          </Label>
          </XStack>
        </YStack>

        <YStack
          backgroundColor="$onboardingCardBackground" 
          br={24}
          borderColor={formData.primaryColor} 
          marginBottom={-40}
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
            rowGap={"$0"} 
            columnGap={isWeb ? "$3" : isIpad() ? "$3" : "$2"} 
            padding={isWeb ? "$2" : isIpad() ? "$2" : "$0"}
          >
            {backgroundStyles.map((style) => {
              const isSelected = formData.backgroundStyle === style.value;
              return (
                <Button
                  key={style.value}
                  px={isWeb ? "$4" : isIpad() ? "$5" : "$2"}
                  py={isWeb ? "$2" : isIpad() ? "$2" : "$2"}
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
