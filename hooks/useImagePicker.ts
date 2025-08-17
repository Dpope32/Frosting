import { useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { addSyncLog } from '@/components/sync/syncUtils';

interface ImagePickerOptions {
  mediaTypes?: ImagePicker.MediaType | ImagePicker.MediaType[];
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}

interface UseImagePickerResult {
  pickImage: () => Promise<string | null>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * A custom hook for handling image picking functionality using expo-image-picker.
 * This hook strictly uses launchImageLibraryAsync and does NOT invoke camera access.
 * 
 * IMPORTANT: This hook automatically copies images from volatile cache to persistent
 * document directory to prevent image disappearing when iOS clears cache.
 *
 * @param defaultOptions Default options for the image picker
 * @returns An object containing the pickImage function, loading state, and error state
 *
 * @example
 * ```tsx
 * const { pickImage, isLoading, error } = useImagePicker();
 *
 * const handleSelectImage = async () => {
 *   const imageUri = await pickImage();
 *   if (imageUri) {
 *     // Do something with the image URI (now in persistent storage!)
 *   }
 * };
 * ```
 */
export function useImagePicker(
  defaultOptions: ImagePickerOptions = {}
): UseImagePickerResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Copies an image from ImagePicker's volatile cache to persistent document directory
   */
  const copyImageToPersistentStorage = async (tempUri: string): Promise<string> => {
    try {
      // Create persistent directory for profile images
      const profileImagesDir = `${FileSystem.documentDirectory}profile_images/`;
      const dirInfo = await FileSystem.getInfoAsync(profileImagesDir);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(profileImagesDir, { intermediates: true });
        addSyncLog('📁 [ImagePicker] Created persistent profile images directory', 'success');
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const extension = tempUri.split('.').pop() || 'jpg';
      const filename = `profile_${timestamp}.${extension}`;
      const persistentUri = `${profileImagesDir}${filename}`;
      
      // Copy from volatile cache to persistent storage
      await FileSystem.copyAsync({
        from: tempUri,
        to: persistentUri
      });
      
      addSyncLog(
        '📁 [ImagePicker] Copied image to persistent storage',
        'success',
        `From: ${tempUri} | To: ${persistentUri}`
      );
      
      // Clean up old profile images (keep only last 5)
      try {
        const files = await FileSystem.readDirectoryAsync(profileImagesDir);
        const profileFiles = files
          .filter(file => file.startsWith('profile_'))
          .sort()
          .reverse(); // Most recent first
        
        if (profileFiles.length > 5) {
          const filesToDelete = profileFiles.slice(5);
          for (const file of filesToDelete) {
            await FileSystem.deleteAsync(`${profileImagesDir}${file}`, { idempotent: true });
          }
          addSyncLog(`🗑️ [ImagePicker] Cleaned up ${filesToDelete.length} old profile images`, 'info');
        }
      } catch (cleanupError) {
        addSyncLog('⚠️ [ImagePicker] Failed to cleanup old profile images', 'warning', `Error: ${cleanupError instanceof Error ? cleanupError.message : 'Unknown error'}`);
      }
      
      return persistentUri;
    } catch (copyError) {
      addSyncLog(
        '❌ [ImagePicker] Failed to copy image to persistent storage',
        'error',
        `Error: ${copyError instanceof Error ? copyError.message : 'Unknown error'} | Temp URI: ${tempUri}`
      );
      throw copyError;
    }
  };

  const pickImage = async (
    options: ImagePickerOptions = {}
  ): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      addSyncLog('📸 [ImagePicker] Starting image selection', 'info');
      
      // Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        addSyncLog('❌ [ImagePicker] Media library permission denied', 'warning');
        
        if (Platform.OS !== 'web') { // Linking.openSettings() is not available on web
          Alert.alert(
            "Permission Required",
            "Media library permission is needed to select images. Please enable it in your device settings.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Settings",
                onPress: () => Linking.openSettings()
              }
            ]
          );
        } else {
          alert("Media library permission is required to select images. Please enable it in your browser settings.");
        }
        return null; // Don't proceed if permission denied
      }
      
      // Permissions granted, proceed with picking
      const mergedOptions: ImagePickerOptions = {
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        ...defaultOptions,
        ...options,
      };
      
      // launchImageLibraryAsync ONLY. No camera invocation.
      const result = await ImagePicker.launchImageLibraryAsync(mergedOptions);
      
      if (!result.canceled && result.assets && result.assets[0]) {
        const tempUri = result.assets[0].uri;
        
        if (tempUri.includes('/cache/') || tempUri.includes('/Caches/')) {
          const persistentUri = await copyImageToPersistentStorage(tempUri);
          return persistentUri;
        } else {
          return tempUri;
        }
      }
      
      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to pick image');
      setError(error);
      console.error('Error picking image:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { pickImage, isLoading, error };
}