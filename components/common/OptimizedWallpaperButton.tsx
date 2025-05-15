import React, { useMemo } from 'react';
import { Image, ImageSourcePropType, Platform, TouchableOpacity, View } from 'react-native';
import { YStack, Text } from 'tamagui';
import { BackgroundStyle } from '@/constants/Backgrounds';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Sentry from '@sentry/react-native';
import { isIpad } from '@/utils/deviceUtils';

let ImagePicker: any = null
if (Platform.OS !== 'web') {
  try {
    const imagePickerModule = 'expo-image-picker'
    ImagePicker = require(imagePickerModule)
  } catch (error) {
    console.warn('ImagePicker not available:', error)
  }
}

// Simple helper to adjust hex color brightness
const adjustColor = (hex: string, percent: number): string => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust brightness
  const adjustment = percent < 0 ? (100 + percent) / 100 : (100 + percent) / 100;
  
  // Clamp values
  const adjustR = Math.min(255, Math.max(0, Math.round(r * adjustment)));
  const adjustG = Math.min(255, Math.max(0, Math.round(g * adjustment)));
  const adjustB = Math.min(255, Math.max(0, Math.round(b * adjustment)));
  
  // Convert back to hex
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(adjustR)}${toHex(adjustG)}${toHex(adjustB)}`;
};

export const OptimizedWallpaperButton = ({
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
}) => {
  const source = useMemo(() => {
    try {
      return getWallpaperImageSource(styleItem.value);
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          styleItem,
          operation: 'getWallpaperImageSource',
        },
      });
      return null;
    }
  }, [styleItem.value, getWallpaperImageSource]);

  // Memoize the glossy gradient colors based on dark mode
  const glossColors = useMemo(() => {
    if (isDark) {
      return ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(0,0,0,0.2)'] as const;
    }
    return ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)'] as const;
  }, [isDark]);

  // Memoize gradient colors
  const gradientColors = useMemo(() => {
    const adjustedColor = adjustColor(primaryColor, isDark ? -40 : 40);
    return [primaryColor, adjustedColor] as const;
  }, [primaryColor, isDark]);

  const marginRight = index < totalInRow - 1 ? 8 : 2;

  return (
    <TouchableOpacity
      onPress={() => onSelect(styleItem.value)}
      style={{
        flex: 1,
        height: '100%',
        marginRight,
        borderRadius: isIpad() ? 30 : 8,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: isSelected ? primaryColor : 'transparent',
      }}
    >
      <YStack
        flex={1}
        backgroundColor={isDark ? '#222' : '#f5f5f5'}
        overflow="hidden"
        position="relative"
      >
        {styleItem.value === 'gradient' ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderRadius: isIpad() ? 30 : 8 }}
          />
        ) : source ? (
          <View style={{ flex: 1 }}>
            <Image
              source={source}
              style={{ width: '100%', height: '100%', position: 'absolute', borderRadius: isIpad() ? 30 : 8 }}
              onError={(error) => {
                Sentry.captureException(error, {
                  extra: {
                    styleItem,
                    source,
                    operation: 'WallpaperImage_onError',
                  },
                });
              }}
            />
            <LinearGradient
              colors={glossColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                opacity: 0.8,
              }}
            />
          </View>
        ) : (
          <YStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            backgroundColor={isDark ? '#333' : '#e0e0e0'}
          >
            <Text
              color={isDark ? '#666' : '#999'}
              fontSize={10}
              textAlign="center"
              padding={4}
            >
              {styleItem.label}
            </Text>
          </YStack>
        )}
        {isSelected && (
          <BlurView
            intensity={isDark ? 40 : 20}
            tint={isDark ? "dark" : "light"}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 24,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              color={isDark ? '#fff' : '#000'}
              fontSize={10}
              fontWeight="500"
              fontFamily="$body"
            >
              Selected
            </Text>
          </BlurView>
        )}
      </YStack>
    </TouchableOpacity>
  );
};