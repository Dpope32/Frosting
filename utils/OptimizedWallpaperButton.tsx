import React from 'react'
import { Image, ImageSourcePropType, Platform } from 'react-native' 
import { Button, YStack, Text} from 'tamagui';
import { BackgroundStyle } from '@/constants/Backgrounds';


let ImagePicker: any = null
if (Platform.OS !== 'web') {
  try {
    const imagePickerModule = 'expo-image-picker'
    ImagePicker = require(imagePickerModule)
  } catch (error) {
    console.warn('ImagePicker not available:', error)
  }
}

export const OptimizedWallpaperButton = React.memo(function OptimizedWallpaperButton({
    styleItem,
    isSelected,
    isDark,
    primaryColor,
    isWeb,
    onSelect,
    getWallpaperImageSource,
    index,
    totalInRow,
  }: {
    styleItem: { value: BackgroundStyle; label: string }
    isSelected: boolean
    isDark: boolean
    primaryColor: string
    isWeb: boolean
    onSelect: (value: BackgroundStyle) => void
    getWallpaperImageSource: (style: BackgroundStyle) => ImageSourcePropType | undefined
    index: number
    totalInRow: number
  }) {
    const borderColor = isSelected ? 'white' : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
    const isLastInRow = index === totalInRow - 1
    return (
      <YStack flex={1} height="100%" marginRight={isLastInRow ? 0 : 8} minWidth={isWeb ? 100 : undefined}>
        <Button
          size="$3"
          height="100%"
          width="100%"
          padding={0}
          backgroundColor={isSelected ? primaryColor : isDark ? '#333' : '#f5f5f5'}
          borderColor={borderColor}
          borderWidth={isSelected ? 2 : 1}
          scale={isSelected ? 1.05 : 1}
          onPress={() => onSelect(styleItem.value)}
        >
        {styleItem.value === 'gradient' ? (
          <YStack
            width="100%"
            height="100%"
            br={4}
            {...(isWeb
              ? {
                  style: {
                    background: 'linear-gradient(120deg, #3a7bd5, #00d2ff, #3a7bd5)',
                    backgroundSize: '200% 200%',
                    animation: 'gradientAnimation 5s ease infinite',
                    position: 'relative',
                  },
                }
              : { backgroundColor: '#3a7bd5' })}
          >
            {isWeb && (
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                  @keyframes gradientAnimation {
                    0% { background-position: 0% 50% }
                    50% { background-position: 100% 50% }
                    100% { background-position: 0% 50% }
                  }
                `,
                }}
              />
            )}
          </YStack>
        ) : (
          <YStack width="100%" height="100%" overflow="hidden" br={4} backgroundColor="#242424">
            {getWallpaperImageSource(styleItem.value) ? (
              <Image
                source={getWallpaperImageSource(styleItem.value)}
                style={{ width: '100%', height: '100%', borderRadius: 4 }}
                resizeMode="cover"
                {...(isWeb ? { loading: 'lazy' } : {})}
              />
            ) : (
              <Text color="white" fontSize={10} textAlign="center" padding="$2">
                {styleItem.label}
              </Text>
            )}
          </YStack>
        )}
        </Button>
      </YStack>
    )
  })