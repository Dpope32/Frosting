import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Image, ImageSourcePropType, Platform, Switch, useColorScheme, Alert, View, ActivityIndicator, StyleSheet, Modal } from 'react-native' 
import { BaseCardModal } from './BaseCardModal'
import { StorageUtils } from '@/store/AsyncStorage'
import { router } from 'expo-router';
import { Button, YStack, XStack, Text, Circle, Spinner, isWeb } from 'tamagui';
import { useUserStore } from '@/store/UserStore';
import { useBillStore } from '@/store/BillStore'; 
import { useProjectStore } from '@/store/ToDo'; 
import { usePeopleStore } from '@/store/People'; 
import { useWallpaperStore } from '@/store/WallpaperStore';
import { useNoteStore } from '@/store/NoteStore';
import { colorOptions } from '../../constants/Colors';
import { backgroundStyles, BackgroundStyle, getWallpaperPath, wallpapers } from '../../constants/Backgrounds'; 
import { ColorPickerModal } from '../cardModals/ColorPickerModal'
import { DebouncedInput } from '../shared/debouncedInput'
import { BlurView } from 'expo-blur'
import { OptimizedWallpaperButton } from '@/components/common/OptimizedWallpaperButton'
import * as Sentry from '@sentry/react-native';
import { ImageURISource } from 'react-native';
import { useToastStore } from '@/store/ToastStore';
import { useCustomWallpaper } from '@/hooks/useCustomWallpaper';
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

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface WallpaperSource extends ImageURISource {
  failed?: boolean;
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
  const { showToast } = useToastStore();
  const filteredBackgroundStyles = useMemo(() => {
    return backgroundStyles
  }, [])
  const buildImageSource = useCallback((uri?: string): ImageSourcePropType | undefined => {
    if (!uri) return undefined
    return { uri }
  }, [])

  const pickImage = useCallback(async () => {
    if (isWeb) {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event: ProgressEvent<FileReader>) => {
            const target = event.target as FileReader
            if (target?.result) {
              setSettings((prev) => ({ ...prev, profilePicture: String(target.result) }))
            }
          }
          reader.readAsDataURL(file)
        }
      }
      input.click()
    } else if (ImagePicker) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      })
      if (!result.canceled) {
        setSettings((prev) => ({ ...prev, profilePicture: result.assets[0].uri }))
      }
    }
  }, [isWeb])

  const handleSave = useCallback(() => {
    setPreferences({ ...settings })
    onOpenChange(false)
    showToast("Settings saved successfully", "success");
  }, [settings, setPreferences, onOpenChange])
  
  const handleSelectBackground = useCallback(async (value: BackgroundStyle) => {
    if (value.startsWith('wallpaper-')) {
      const wallpaperStore = useWallpaperStore.getState();
      try {
        const cachedUri = await wallpaperStore.getCachedWallpaper(value);
        if (!cachedUri) {
          const wallpaperPath = await getWallpaperPath(value);
          if (wallpaperPath && typeof wallpaperPath === 'object' && 'uri' in wallpaperPath && wallpaperPath.uri) {
            await wallpaperStore.cacheWallpaper(value, wallpaperPath.uri);
          }
        }
        wallpaperStore.setCurrentWallpaper(value);
      } catch (error) {
        console.error(`Failed to cache wallpaper ${value}:`, error);
      }
    }
    
    setSettings((prev) => ({ ...prev, backgroundStyle: value }))
  }, [])
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

  const getWallpaperImageSource = useCallback((style: BackgroundStyle): WallpaperSource | undefined => {
    if (style === 'gradient') {
      return { uri: '' };
    }
    return wallpaperSources[style];
  }, [wallpaperSources]);

  const { uploadCustomWallpaper, isUploading } = useCustomWallpaper();

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
      snapPoints={isWeb ? [90] : isIpad() ? [60] : [75]}
      zIndex={100000}
      hideHandle={true}
      showCloseButton={!isSigningOut}
    >
      <YStack flex={1} gap="$2" paddingBottom="$1" paddingHorizontal={isWeb ? '$5' : isIpad() ? '$3' : '$2'}>
        <XStack gap="$3" flexWrap="wrap">
          <YStack width={isWeb ? 100 : isIpad() ? 80 : 60} gap="$2" alignItems="center">
            <Circle size={isWeb ? 80 : isIpad() ? 60 : 60} borderWidth={1} borderColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} borderStyle="dashed" backgroundColor={isDark ? '#555' : '#f5f5f5'} onPress={pickImage} overflow="hidden">
              {settings.profilePicture ? (
                  <Image source={buildImageSource(settings.profilePicture)} style={{ width: 60, height: 60, borderRadius: 30 }} />
                ) : (
                  <Text color={isDark ? '#fff' : '#000'} fontSize={11} fontFamily="$body">
                    Profile
                  </Text>
                )}
              </Circle>
            </YStack>
            <YStack gap="$3" flex={1}>
              <XStack gap="$2" flexWrap="wrap">
                <YStack width={110} gap="$1">
                  <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                    Username
                  </Text>
                  <DebouncedInput
                    size="$3"
                    placeholder="Enter username"
                    value={settings.username}
                    onDebouncedChange={(text) => setSettings((prev) => ({ ...prev, username: text }))}
                    backgroundColor={isDark ? '#222' : '#f5f5f5'}
                    color={isDark ? '#fff' : '#000'}
                    borderWidth={isDark ? 0 : 1}
                    borderColor={isDark ? undefined : 'rgba(0,0,0,0.1)'}
                  />
                </YStack>
                <YStack width={110} gap="$1">
                  <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                    Zip Code
                  </Text>
                  <DebouncedInput
                    size="$3"
                    placeholder="Enter zip code"
                    value={settings.zipCode}
                    onDebouncedChange={(text) => setSettings((prev) => ({ ...prev, zipCode: text }))}
                    backgroundColor={isDark ? '#222' : '#f5f5f5'}
                    color={isDark ? '#fff' : '#000'}
                    borderWidth={isDark ? 0 : 1}
                    borderColor={isDark ? undefined : 'rgba(0,0,0,0.1)'}
                  />
                </YStack>
              </XStack>
            </YStack>
          </XStack>
          {Platform.OS !== 'web' && isIpad() && (
            <YStack mt="$2" py="$1">
              <XStack gap="$4" justifyContent="center">
                <YStack alignItems="center" gap={4} flex={1}>
                  <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">Quote</Text>
                  <Switch value={settings.quoteEnabled} onValueChange={(val) => setSettings((prev) => ({ ...prev, quoteEnabled: val }))} />
                </YStack>
                <YStack alignItems="center" gap={4} flex={1}>
                  <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">Stocks</Text>
                  <Switch value={settings.portfolioEnabled} onValueChange={(val) => setSettings((prev) => ({ ...prev, portfolioEnabled: val }))} />
                </YStack>
                <YStack alignItems="center" gap={4} flex={1}>
                  <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">Weather</Text>
                  <Switch value={settings.temperatureEnabled} onValueChange={(val) => setSettings((prev) => ({ ...prev, temperatureEnabled: val }))} />
                </YStack>
                <YStack alignItems="center" gap={4} flex={1}>
                  <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">Network</Text>
                  <Switch value={settings.wifiEnabled} onValueChange={(val) => setSettings((prev) => ({ ...prev, wifiEnabled: val }))} />
                </YStack>
                <YStack alignItems="center" gap={4} flex={1}>
                  <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">Notifications</Text>
                  <Switch value={settings.notificationsEnabled} onValueChange={(val) => setSettings((prev) => ({ ...prev, notificationsEnabled: val }))} />
                </YStack>
                <YStack alignItems="center" gap={4} flex={1}>
                  <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">Primary Color</Text>
                  <Circle size={36} backgroundColor={settings.primaryColor} pressStyle={{ scale: 0.97 }} onPress={() => setColorPickerOpen(true)} />
                </YStack>
              </XStack>
            </YStack>
          )}
          <YStack gap="$2" px={isWeb ? '$4' : '$3'} py={isWeb ? '$4' : '$3'}>
            <Text fontSize={14} color={isDark ? '#ccc' : '#000'} fontFamily="$body">
              Wallpaper
            </Text>
            <YStack>
              {Array.from({ length: Math.ceil((filteredBackgroundStyles.length + 1) / 3) }).map((_, rowIndex) => {
                const itemsForRow = filteredBackgroundStyles.slice(rowIndex * 3, rowIndex * 3 + 3);
                // Add custom wallpaper button to the last row if there's space, or create a new row
                if (rowIndex === Math.ceil((filteredBackgroundStyles.length + 1) / 3) - 1) {
                  while (itemsForRow.length < 3) {
                    if (itemsForRow.length === 0 || (rowIndex * 3 + itemsForRow.length) === filteredBackgroundStyles.length) {
                      itemsForRow.push({
                        label: "Custom Wallpaper",
                        value: "wallpaper-custom-upload"
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
                                handleSelectBackground(wallpaperKey);
                                setSettings((prev) => ({ ...prev, backgroundStyle: wallpaperKey }));
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
        </YStack>
      <XStack 
        justifyContent="space-between"
        paddingHorizontal={isWeb ? '$7' : '$6'}
        paddingVertical={isWeb ? '$4' : '$3'}
        paddingTop={isWeb ? '$15' : '$3'}
        marginTop={isWeb ? 0 : 12}
      >
        <Button
          backgroundColor="transparent" borderColor={'$red10'} height={40} paddingHorizontal={20} pressStyle={{ opacity: 0.8 }}
          disabled={isSigningOut}
          onPress={async () => {
            const message = "Are you sure you want to reset all your data? This cannot be undone..."
            const shouldReset = isWeb
              ? window.confirm(message)
              : await new Promise(resolve => {
                Alert.alert(
                  "Confirm Reset",
                  message,
                  [
                    { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                    { text: "Reset", style: "destructive", onPress: () => resolve(true) },
                  ],
                  { cancelable: false }
                )
              });
          
            if (shouldReset) {
              setIsSigningOut(true);
              
              try {
                useBillStore.getState().clearBills();
                useProjectStore.getState().clearTasks();
                usePeopleStore.getState().clearContacts();
                useUserStore.getState().clearPreferences();
                useNoteStore.getState().clearNotes();

                await StorageUtils.clear();

                
                setTimeout(() => {
                  if (isWeb) {
                    window.location.href = '/screens/onboarding';
                  } else {
                    router.replace('/screens/onboarding');
                  }
                }, 300);
              } catch (error) {
                console.error("[SignOut] Error during sign out:", error);
                Alert.alert("Error", "Failed to sign out. Please try again.");
                setIsSigningOut(false);
              }
            }
          }}
          >
            <Text color="$red10" fontWeight="bold" fontFamily="$body" fontSize={14}>
              Sign Out
            </Text>
          </Button>
          <Button
            backgroundColor={settings.primaryColor}
            height={40}
            paddingHorizontal={20}
            pressStyle={{ opacity: 0.8 }}
            onPress={handleSave}
            disabled={isSigningOut}
          >
            <Text color="#fff" fontWeight="500" fontSize={14} fontFamily="$body">
              Save
            </Text>
          </Button>
        </XStack>
      </BaseCardModal>
    <ColorPickerModal
      open={colorPickerOpen}
      onOpenChange={setColorPickerOpen}
      selectedColor={settings.primaryColor}
      onColorChange={(color) => setSettings((prev) => ({ ...prev, primaryColor: color }))}
      colorOptions={colorOptions}
      isDark={isDark}
    />
    <Modal
      visible={isSigningOut}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}} 
    >
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
