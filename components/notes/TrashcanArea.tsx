import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Trash2 } from '@tamagui/lucide-icons';
import { Text, YStack } from 'tamagui';
import { isIpad } from '@/utils/deviceUtils';

interface TrashcanAreaProps {
  isVisible: boolean;
  onLayout?: (event: any) => void;
  isHovering?: boolean;
  height?: number;
}

export const TrashcanArea: React.FC<TrashcanAreaProps> = ({
  isVisible,
  onLayout,
  isHovering = false,
  height
}) => {
  const containerHeight = height || (isIpad() ? 250 : 120);

  const animatedStyle = useAnimatedStyle(() => {
    try {
      return {
        opacity: withTiming(isVisible ? 1 : 0, { duration: 200 }),
        backgroundColor: withTiming(
          isHovering ? 'rgba(255, 50, 50, 0.8)' : 'rgba(255, 50, 50, 0.6)',
          { duration: 150 }
        ),
        transform: [
          { scale: withTiming(isHovering ? 1.05 : 1, { duration: 150 }) }
        ]
      };
    } catch (error) {
      console.error("Error in TrashcanArea animated style:", error);
      // Return safe fallback values if animation fails
      return {
        opacity: isVisible ? 1 : 0,
        backgroundColor: isHovering ? 'rgba(255, 50, 50, 0.8)' : 'rgba(255, 50, 50, 0.6)',
        transform: [{ scale: isHovering ? 1.05 : 1 }]
      };
    }
  });

  return (
    <Animated.View
      style={[styles.container, animatedStyle, { 
        height: containerHeight,
        // Ensure trashcan has enough z-index to be visible above other elements
        zIndex: 1000 
      }]}
      onLayout={onLayout}
      testID="trashcan-drop-area"
      // Add a large hit area to ensure touch events are captured
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <YStack alignItems="center" gap="$2" pointerEvents="none">
        <Trash2 size={isIpad() ? 50 : 40} color="$red11" />
      </YStack>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 50, 50, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: isIpad() ? 200 : 120,
    // Add shadow to make it more visible
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  }
});
