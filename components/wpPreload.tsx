import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { Stack } from 'tamagui';
import { getWallpapers } from '@/services/s3Service';
import { useWallpaperStore } from '@/store/WallpaperStore';

export interface WallpaperPreloaderProps {
  onComplete: () => void;
  primaryColor: string;
}

export async function preloadWallpapers(onComplete: () => void) {
  const wallpaperStore = useWallpaperStore();
  try {
    const wallpapers = getWallpapers();
    
    // Cache each wallpaper silently
    for (const wallpaper of wallpapers) {
      try {
        const style = `wallpaper-${wallpaper.name}`;
        await wallpaperStore.cacheWallpaper(style, wallpaper.uri);
      } catch (err) {
        console.error(`Failed to cache wallpaper ${wallpaper.name}:`, err);
      }
    }
    
    onComplete();
  } catch (err) {
    console.error('Error caching wallpapers:', err);
    onComplete();
  }
}

export default function WallpaperPreloader({ onComplete, primaryColor }: WallpaperPreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const wallpaperStore = useWallpaperStore();
  
  useEffect(() => {
    const loadWallpapers = async () => {
      try {
        const wallpapers = getWallpapers();
        let count = 0;
        
        // Cache each wallpaper
        for (const wallpaper of wallpapers) {
          try {
            const style = `wallpaper-${wallpaper.name}`;
            await wallpaperStore.cacheWallpaper(style, wallpaper.uri);
            count++;
            setProgress(Math.floor((count / wallpapers.length) * 100));
          } catch (err) {
            console.error(`Failed to cache wallpaper ${wallpaper.name}:`, err);
          }
        }
        
        setProgress(100);
        setTimeout(() => onComplete(), 500);
      } catch (err) {
        console.error('Error caching wallpapers:', err);
        setError('Failed to cache wallpapers. Continuing anyway...');
        setTimeout(() => onComplete(), 2000);
      }
    };
    
    // Start with a small delay to allow UI to render
    setTimeout(() => {
      setProgress(10);
      loadWallpapers();
    }, 100);
  }, [onComplete]);
  
  return (
    <Stack
      flex={1}
      backgroundColor="#121212"
      justifyContent="center"
      alignItems="center"
      gap={20}
    >
      <Text style={{ color: 'white', fontSize: 18, marginBottom: 20 }}>
        Loading wallpapers...
      </Text>
      <ActivityIndicator size="large" color={primaryColor || "#4A90E2"} />
      {error ? (
        <Text style={{ color: 'red', marginTop: 20, textAlign: 'center', padding: 20 }}>
          {error}
        </Text>
      ) : (
        <Text style={{ color: 'white', marginTop: 10 }}>
          {progress}% complete
        </Text>
      )}
    </Stack>
  );
}
