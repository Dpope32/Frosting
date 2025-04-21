import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Trash2 } from '@tamagui/lucide-icons';
import { Text, YStack } from 'tamagui';

interface TrashcanAreaProps {
  isVisible: boolean;
  onLayout?: (event: any) => void;
  isHovering?: boolean;
}

export const TrashcanArea: React.FC<TrashcanAreaProps> = ({
  isVisible,
  onLayout,
  isHovering = false
}) => {
  const animatedStyle = useAnimatedStyle(() => {
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
  });

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      onLayout={onLayout}
      testID="trashcan-drop-area"
    >
      <YStack alignItems="center" gap="$2">
        <Trash2 size={40} color="$red11" />
        {isHovering && (
          <Text color="$red11" fontWeight="bold">
            Drop to delete
          </Text>
        )}
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
    height: 120,
    backgroundColor: 'rgba(255, 50, 50, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  }
});