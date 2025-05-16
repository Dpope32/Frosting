import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet, Modal, useColorScheme, Platform } from 'react-native' 
import { BaseCardModal } from '@/components/baseModals/BaseCardModal'
import { YStack, Text, Spinner, isWeb } from 'tamagui';
import { useUserStore, useWallpaperStore } from '@/store'
import { colorOptions } from '../../../constants/Colors';
import { backgroundStyles, wallpapers, BackgroundStyle } from '../../../constants/Backgrounds'; 
import { ColorPickerModal } from '../shared/ColorPickerModal'
import { BlurView } from 'expo-blur'
import * as Sentry from '@sentry/react-native';
import { useCustomWallpaper } from '@/hooks/useCustomWallpaper';
import { isIpad } from '@/utils';
import { TopSection } from './topSection';
import { Switches } from './switches';
import { MobileSwitches } from './mobileSwitches';
import { SettingsWallpaper } from './settingsWallpaper';
import { SettingsModalFooter } from './footer';
import { buildImageSource,  pickImage,  handleSelectBackground, getWallpaperImageSource, initImagePicker, WallpaperSource } from './utils';

const ImagePicker = initImagePicker();

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { preferences, setPreferences } = useUserStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [settings, setSettings] = useState({
    username: preferences.username,
    primaryColor: preferences.primaryColor,
    profilePicture: preferences.profilePicture || undefined,
    zipCode: preferences.zipCode,
    backgroundStyle: preferences.backgroundStyle || 'gradient',
    notificationsEnabled: preferences.notificationsEnabled,
    quoteEnabled: preferences.quoteEnabled ?? true,
    portfolioEnabled: preferences.portfolioEnabled ?? true,
    temperatureEnabled: preferences.temperatureEnabled ?? true,
    wifiEnabled: preferences.wifiEnabled ?? true,
  })
  const filteredBackgroundStyles = useMemo(() => {
    return backgroundStyles
  }, [])

  const memoizedBuildImageSource = useCallback(buildImageSource, []);
  
  const memoizedPickImage = useCallback(() => {
    pickImage(isWeb, ImagePicker, setSettings);
  }, [isWeb, setSettings]);
  
  const memoizedHandleSelectBackground = useCallback(async (value: BackgroundStyle) => {
    await handleSelectBackground(value, setSettings);
  }, [setSettings]);
  const [wallpaperSources, setWallpaperSources] = useState<Record<string, WallpaperSource>>({});

  useEffect(() => {
    const loadWallpapers = async () => {
      const sources: Record<string, WallpaperSource> = {
        'gradient': { uri: '' }
      };
      
      Sentry.addBreadcrumb({
        category: 'wallpaper',
        message: 'Starting wallpaper load in SettingsModal',
        level: 'info',
      });
      
      for (const style of backgroundStyles) {
        if (style.value === 'gradient') continue;
        
        try {
          const wallpaperStore = useWallpaperStore.getState();
          const wallpaperKey = style.value;
          const cachedUri = await wallpaperStore.getCachedWallpaper(wallpaperKey);
          
          if (cachedUri) {
            sources[wallpaperKey] = { uri: cachedUri };
          } else {
            // If not cached, get the original URI from the imported wallpapers object
            const originalWallpaperData = wallpapers[wallpaperKey];
            if (originalWallpaperData && originalWallpaperData.uri) {
              sources[wallpaperKey] = { uri: originalWallpaperData.uri };
              // Attempt to cache the original URI
              try {
                await wallpaperStore.cacheWallpaper(wallpaperKey, originalWallpaperData.uri);
              } catch (cacheError) {
                console.error(`Failed to cache wallpaper ${wallpaperKey} during load:`, cacheError);
                Sentry.captureException(cacheError, {
                  extra: {
                    wallpaperKey: wallpaperKey,
                    operation: 'cacheWallpaperInLoad',
                  },
                });
                // sources[wallpaperKey] = { uri: '', failed: true }; 
              }
            } else {
              console.error(`Original wallpaper data not found for key: ${wallpaperKey}`);
              Sentry.captureMessage('Missing original wallpaper definition', {
                level: 'error',
                extra: { wallpaperKey: wallpaperKey, operation: 'loadWallpapers' },
              });
              sources[wallpaperKey] = { uri: '', failed: true };
            }
          }
        } catch (error) {
          // Catch errors from getCachedWallpaper or other unexpected issues
          console.error(`Error processing wallpaper ${style.value}:`, error);
          Sentry.captureException(error, {
            extra: {
              wallpaperKey: style.value, // Use style.value as wallpaperKey might not be set yet
              operation: 'loadWallpapers',
            },
          });
          
          sources[style.value] = { 
            uri: '',
            failed: true
          };
        }
      }
      
      setWallpaperSources(sources);
    };
    
    loadWallpapers();
  }, [settings.primaryColor]);

  const memoizedGetWallpaperImageSource = useCallback((style: BackgroundStyle) => {
    return getWallpaperImageSource(style, wallpaperSources);
  }, [wallpaperSources]);

  // Get the custom wallpaper hook with type adjustment
  const { uploadCustomWallpaper: rawUploadCustomWallpaper, isUploading } = useCustomWallpaper();
  const uploadCustomWallpaper = useCallback(async (): Promise<string | undefined> => {
    const result = await rawUploadCustomWallpaper();
    return result || undefined;
  }, [rawUploadCustomWallpaper]);

  return (
    <>
    <BaseCardModal
      open={open}
      onOpenChange={(newOpen) => {
        if (!isSigningOut) {
          onOpenChange(newOpen)
        }
      }}
      title="Settings"
      snapPoints={isWeb ? [90] : isIpad() ? [70] : [75]}
      zIndex={100000}
      hideHandle={true}
      showCloseButton={!isSigningOut}
      footer={
        <SettingsModalFooter onOpenChange={onOpenChange} settings={settings} />
      }
    >
      <YStack flex={1} gap="$2" paddingVertical={isWeb ? "$3" : "$2"} paddingHorizontal={isWeb ? '$5' : isIpad() ? '$3' : '$1.5'}>
        <TopSection
          settings={settings}
          setSettings={setSettings}
          pickImage={memoizedPickImage}
          buildImageSource={memoizedBuildImageSource}
          setColorPickerOpen={setColorPickerOpen}
        />
          {Platform.OS !== 'web' && isIpad() && (
            <Switches settings={settings} setSettings={setSettings} isDark={isDark} setColorPickerOpen={setColorPickerOpen} />
          )}
          {!isWeb && !isIpad() && (
            <MobileSwitches settings={settings} setSettings={setSettings} isDark={isDark} />
          )}
          <SettingsWallpaper 
            settings={settings}
            setSettings={setSettings}
            isDark={isDark}
            filteredBackgroundStyles={filteredBackgroundStyles}
            handleSelectBackground={memoizedHandleSelectBackground}
            getWallpaperImageSource={memoizedGetWallpaperImageSource}
            uploadCustomWallpaper={uploadCustomWallpaper}
            setPreferences={setPreferences}
            preferences={preferences}
            onOpenChange={onOpenChange}
          />
        </YStack>
      </BaseCardModal>
    <ColorPickerModal
      open={colorPickerOpen}
      onOpenChange={setColorPickerOpen}
      selectedColor={settings.primaryColor}
      onColorChange={(color) => setSettings((prev) => ({ ...prev, primaryColor: color }))}
      colorOptions={colorOptions}
      isDark={isDark}
    />
    <Modal visible={isSigningOut} transparent={true} animationType="fade" onRequestClose={() => {}} >
      <View style={styles.overlayContainer}>
        {isWeb ? (
          <View style={styles.webOverlayBackground} />
        ) : (
          <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        )}
        {isWeb ? <ActivityIndicator size="large" color={isDark ? "#FFFFFF" : "#000000"} /> : <Spinner size="large" color="$color" />}
        <Text mt="$3" color={isDark ? '#fff' : '#000'} fontSize={16} fontFamily="$body">Signing Out...</Text>
      </View>
    </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  webOverlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
})
