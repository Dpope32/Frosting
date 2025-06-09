import React, { useEffect, useState } from 'react';
import { View, Image, ImageProps, StyleProp, ViewStyle, Platform, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import MD5 from 'crypto-js/md5';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { addSyncLog } from '@/components/sync/syncUtils';

type Props = Omit<ImageProps, 'source'> & {
  uri: string;
  style?: StyleProp<ViewStyle>;
};

export const CachedImage: React.FC<Props> = ({ uri, style, ...rest }) => {
  const [source, setSource] = useState<{ uri: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const progress = useSharedValue(0);

  // Start shimmer animation on each URI change
  useEffect(() => {
    progress.value = 0;
    progress.value = withRepeat(withTiming(1, { duration: 800 }), -1, false);
  }, [uri]);

  // Cache logic (skip on web)
  useEffect(() => {
    let cancelled = false;
    setImageError(false);
    setLoading(true);
    
    (async () => {
      if (Platform.OS === 'web') {
        if (!cancelled) setSource({ uri });
        return;
      }
      try {
        const cacheDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
        const hash = MD5(uri).toString();
        const path = `${cacheDir}${hash}`;
        const info = await FileSystem.getInfoAsync(path);
        if (info.exists) {
          if (!cancelled) setSource({ uri: info.uri });
          return;
        }
        const { uri: downloadedUri } = await FileSystem.downloadAsync(uri, path);
        if (!cancelled) setSource({ uri: downloadedUri });
      } catch (e) {
        console.warn('[CachedImage] Failed to cache image, falling back to direct URI:', uri, e);
        addSyncLog(
          `Failed to load image: ${uri.substring(0, 50)}...`,
          'warning',
          `This may be due to workspace sync not including images from other clients. Error: ${e instanceof Error ? e.message : 'Unknown error'}`
        );
        if (!cancelled) setSource({ uri });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uri]);

  // Animated shimmer style
  const animatedStyle = useAnimatedStyle(() => {
    const translateX = progress.value * (layout.width * 2) - layout.width;
    return { transform: [{ translateX }] };
  });

  const handleLayout = (e: any) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ width, height });
  };

  const onLoadEnd = () => {
    setLoading(false);
  };

  const onError = (error: any) => {
    console.warn('[CachedImage] Image failed to load:', uri, error);
    addSyncLog(
      `Image not found: ${uri.substring(0, 50)}...`,
      'error',
      'This image may be missing after workspace sync. Images from other clients are not included in sync data.'
    );
    setImageError(true);
    setLoading(false);
  };

  // Don't render anything if there's an error
  if (imageError) {
    return null;
  }

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      {source && (
        <Image
          source={source}
          style={[StyleSheet.absoluteFill, { width: layout.width, height: layout.height }]}
          onLoadEnd={onLoadEnd}
          onError={onError}
          {...rest}
        />
      )}
      {loading && layout.width > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              width: layout.width * 2,
              height: layout.height,
              zIndex: 1,
            },
            animatedStyle,
          ]}
        >
          <LinearGradient
            colors={['rgba(80, 80, 80, 0.8)', 'rgba(120, 120, 120, 0.5)', 'rgba(255,255,255,0.5)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e1e1e1',
    overflow: 'hidden',
  },
}); 