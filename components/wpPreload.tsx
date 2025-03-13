import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { Stack } from 'tamagui';
import { preloadAllWallpapers } from '@/services/s3Service';

export interface WallpaperPreloaderProps {
  onComplete: () => void;
  primaryColor: string;
}

export default function WallpaperPreloader({ onComplete, primaryColor }: WallpaperPreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadWallpapers = async () => {
      try {
        await preloadAllWallpapers();
        setProgress(100);
        // Short delay to ensure UI renders properly
        setTimeout(() => {
          onComplete();
        }, 500);
      } catch (err) {
        console.error('Error preloading wallpapers:', err);
        setError('Failed to preload wallpapers. Continuing anyway...');
        setTimeout(() => {
          onComplete();
        }, 2000);
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