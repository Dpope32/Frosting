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
