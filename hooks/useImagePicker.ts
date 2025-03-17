import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerOptions {
  mediaTypes?: ImagePicker.MediaTypeOptions;
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
 *     // Do something with the image URI
 *   }
 * };
 * ```
 */
export function useImagePicker(
  defaultOptions: ImagePickerOptions = {}
): UseImagePickerResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const pickImage = async (
    options: ImagePickerOptions = {}
  ): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const mergedOptions: ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1] as [number, number],
        quality: 1,
        ...defaultOptions,
        ...options,
      };
      
      const result = await ImagePicker.launchImageLibraryAsync(mergedOptions);
      
      if (!result.canceled && result.assets && result.assets[0]) {
        return result.assets[0].uri;
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
