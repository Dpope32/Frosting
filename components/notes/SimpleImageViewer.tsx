// @ts-nocheck
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Platform, TouchableWithoutFeedback, useColorScheme, NativeSyntheticEvent, Image, ImageErrorEventData, ImageProps } from 'react-native'; 
import { X } from '@tamagui/lucide-icons';
import { useToastStore } from '@/store';
import { PanGestureHandler, PinchGestureHandler, State, PanGestureHandlerGestureEvent, PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface SimpleImageViewerProps {
  imageUrl: string | null;
  onClose: () => void;
  isDark: boolean;
}

/**
 * A simpler image viewer that uses React Native's Modal directly
 * instead of potentially problematic Tamagui Dialog/AnimatePresence
 */
export const SimpleImageViewer: React.FC<SimpleImageViewerProps> = ({ imageUrl, onClose, isDark }) => {
  const showToast = useToastStore((state) => state.showToast);
  const isOpen = !!imageUrl;

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const onPanGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    translateX.value += event.nativeEvent.translationX;
    translateY.value += event.nativeEvent.translationY;
  };

  const onPinchGestureEvent = (event: PinchGestureHandlerGestureEvent) => {
    scale.value = event.nativeEvent.scale;
  };

  const onPanHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      // Optional: Add inertia or bounds checking here
    }
  };

  const onPinchHandlerStateChange = (event: PinchGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
      // Optional: Add max scale limit
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  if (!isOpen || !imageUrl) return null;

  const backgroundColor = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)';

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <PinchGestureHandler onGestureEvent={onPinchGestureEvent} onHandlerStateChange={onPinchHandlerStateChange}>
            <Animated.View style={styles.imageWrapper}>
              <PanGestureHandler onGestureEvent={onPanGestureEvent} onHandlerStateChange={onPanHandlerStateChange}>
                <Animated.View style={styles.imageContainer}>
                  {/* Apply animatedStyle directly to Image */}
                  <Image
                    source={{ uri: imageUrl }}
                    style={[styles.image, animatedStyle]}
                    // Removed cachePolicy prop
                    onError={(e: NativeSyntheticEvent<ImageErrorEventData>) => { // Corrected type for react-native Image
                      console.error('Image loading error:', e.nativeEvent.error); // Access error from nativeEvent
                      showToast("Error loading image", "error");
                    }}
                  />
                </Animated.View>
              </PanGestureHandler>
            </Animated.View>
          </PinchGestureHandler>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color="white" size={24} />
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  debugInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 4,
  },
});

export default SimpleImageViewer;
