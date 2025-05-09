import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { isWeb } from 'tamagui';
import { OptimizedWallpaperButton } from '@/components/common/OptimizedWallpaperButton';
import { BackgroundStyle } from '@/constants/Backgrounds';
import { ImageURISource } from 'react-native';
import { isIpad } from '@/utils/deviceUtils';
import type { Settings } from './utils';
interface WallpaperSource extends ImageURISource {
  failed?: boolean;
}

interface SettingsWallpaperProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  isDark: boolean;
  filteredBackgroundStyles: Array<{label: string, value: BackgroundStyle}>;
  handleSelectBackground: (value: BackgroundStyle) => void;
  getWallpaperImageSource: (style: BackgroundStyle) => WallpaperSource | undefined;
  uploadCustomWallpaper: () => Promise<string | undefined>;
  setPreferences: (preferences: any) => void;
  preferences: any;
  onOpenChange: (open: boolean) => void;
}

export function SettingsWallpaper({ 
  settings, 
  setSettings, 
  isDark, 
  filteredBackgroundStyles,
  handleSelectBackground,
  getWallpaperImageSource,
  uploadCustomWallpaper,
  setPreferences,
  preferences,
  onOpenChange
}: SettingsWallpaperProps) {
  return (
    <YStack gap="$2" px={isWeb ? '$4' : '$3'} py={isWeb ? '$4' : '$3'}>
      <Text fontSize={14} color={isDark ? '#ccc' : '#000'} fontFamily="$body">
        Wallpaper
      </Text>
      <YStack>
        {Array.from({ length: Math.ceil((filteredBackgroundStyles.length + 1) / 3) }).map((_, rowIndex) => {
          const itemsForRow = filteredBackgroundStyles.slice(rowIndex * 3, rowIndex * 3 + 3);
          if (rowIndex === Math.ceil((filteredBackgroundStyles.length + 1) / 3) - 1) {
            while (itemsForRow.length < 3) {
              if (itemsForRow.length === 0 || (rowIndex * 3 + itemsForRow.length) === filteredBackgroundStyles.length) {
                itemsForRow.push({
                  label: "Custom Wallpaper",
                  value: "wallpaper-custom-upload" as BackgroundStyle
                });
                break;
              } else {
                itemsForRow.push(filteredBackgroundStyles[rowIndex * 3 + itemsForRow.length]);
              }
            }
          }
          
          return (
            <XStack key={`row-${rowIndex}`} height={isWeb ? 80 : isIpad() ? 100 : 60} marginBottom={8}>
              {itemsForRow.map((styleItem, index) => (
                <OptimizedWallpaperButton
                  key={styleItem.value}
                  styleItem={styleItem}
                  isSelected={settings.backgroundStyle === styleItem.value}
                  isDark={isDark}
                  primaryColor={settings.primaryColor}
                  isWeb={isWeb}
                  onSelect={styleItem.value === "wallpaper-custom-upload" 
                    ? async () => {
                        const wallpaperKey = await uploadCustomWallpaper();
                        if (wallpaperKey) {
                          handleSelectBackground(wallpaperKey as BackgroundStyle);
                          setSettings((prev) => ({ ...prev, backgroundStyle: wallpaperKey as BackgroundStyle }));
                          setPreferences({ ...preferences, backgroundStyle: wallpaperKey });
                          onOpenChange(false);
                        }
                      }
                    : handleSelectBackground
                  }
                  getWallpaperImageSource={getWallpaperImageSource}
                  index={index}
                  totalInRow={3}
                />
              ))}
            </XStack>
          );
        })}
      </YStack>
    </YStack>
  );
}
