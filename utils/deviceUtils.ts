import { Dimensions, Platform } from 'react-native';
import { isWeb } from 'tamagui';

export const isIpad = () => {
    const { width, height } = Dimensions.get('window');
    return (
      Platform.OS === 'ios' &&
      Math.min(width, height) >= 768 &&
      Math.max(width, height) >= 1024
    );
  };

export const isMobileBrowser = isWeb && typeof window !== 'undefined' && 
(window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent));

/**
 * Generates a simple unique ID by combining timestamp and a random number.
 * Useful for scenarios where a robust UUID is not strictly necessary but
 * a higher degree of uniqueness than Date.now() is required.
 */
export const generateUniqueId = (): string => {
  const timestamp = Date.now();
  const randomNumber = Math.floor(Math.random() * 1000000); // Add a random number
  return `${timestamp}-${randomNumber}`;
};
