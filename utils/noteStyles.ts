import { StyleSheet, Dimensions, ViewStyle } from 'react-native';
import { SharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export const createTrashAnimatedStyle = (isTrashVisible: SharedValue<boolean>) => {
  return useAnimatedStyle(() => {
    return {
      opacity: withTiming(isTrashVisible.value ? 1 : 0, { duration: 300 }),
      transform: [
        { translateY: withTiming(isTrashVisible.value ? 0 : 100, { duration: 300 }) }
      ]
    };
  });
};

export const getGhostNoteStyle = (): ViewStyle => {
  return {
    position: 'absolute' as const,
    top: Dimensions.get('window').height - 160,
    left: 20,
    right: 20,
    zIndex: 9999,
    opacity: 0.9
  };
};

export const noteStyles = StyleSheet.create({
  itemContainer: {
    width: '100%',
    padding: 8,
    paddingHorizontal: 12,
  },
  webContainer: {
    overflow: 'visible',
  },
  trashOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999
  }
}); 