import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { Stack } from 'tamagui';
import { getWallpapers } from '@/services/s3Service';
import { useWallpaperStore } from '@/store/WallpaperStore';

export interface WallpaperPreloaderProps {
  onComplete: () => void;
  primaryColor: string;
}

export async function preloadWallpapers(onComplete?: () => void) {
  const wallpaperStore = useWallpaperStore.getState();
  try {
    const wallpapers = getWallpapers();
    
    // Preload images without blocking UI
    // Preload images in parallel
    await Promise.all(wallpapers.map(async (wallpaper) => {
      const style = `wallpaper-${wallpaper.name}`;
      try {
        // Check if already cached (awaiting the async check)
        const isCached = await wallpaperStore.getCachedWallpaper(style);
        if (!isCached) {
          console.log(`[wpPreload] Caching ${style}`);
          await wallpaperStore.cacheWallpaper(style, wallpaper.uri);
        } else {
          console.log(`[wpPreload] Already cached: ${style}`);
        }
      } catch (err) {
        console.error(`[wpPreload] Failed to cache wallpaper ${wallpaper.name}:`, err);
      }
    }));
    
    onComplete?.();
  } catch (err) {
    console.error('Error caching wallpapers:', err);
    onComplete?.();
  }
}

// Removed the WallpaperPreloader component as it's not used directly
// The preloadWallpapers function is called from onboarding/index.tsx
