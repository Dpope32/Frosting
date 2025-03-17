import { Dimensions, Platform } from 'react-native';

export const isIpad = () => {
    const { width, height } = Dimensions.get('window');
    return (
      Platform.OS === 'ios' &&
      Math.min(width, height) >= 768 &&
      Math.max(width, height) >= 1024
    );
  };