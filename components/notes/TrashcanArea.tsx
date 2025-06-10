import React, { forwardRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { YStack } from 'tamagui';
import { isIpad } from '@/utils';

export interface TrashcanAreaProps {
  isVisible: boolean;
  onLayout?: (event: any) => void;
  isHovering?: boolean;
  height?: number;
}

const TrashcanArea = forwardRef<any, TrashcanAreaProps>(
  ({ isVisible, onLayout, isHovering = false, height }, ref) => {
    const containerHeight = height || (isIpad() ? 250 : 120);

    const animatedStyle = useAnimatedStyle(() => {
      try {
        return {
          opacity: withTiming(isVisible ? 1 : 0, { duration: 300 }),
          backgroundColor: withTiming(
            isHovering ? 'rgba(255, 59, 48, 0.9)' : 'rgba(255, 59, 48, 0.7)',
            { duration: 200 }
          ),
          transform: [
            { scale: withTiming(isHovering ? 1.1 : 1, { duration: 200 }) },
            { translateY: withTiming(isVisible ? 0 : 20, { duration: 300 }) }
          ]
        };
      } catch (error) {
        console.error("Error in TrashcanArea animated style:", error);
        // Return safe fallback values if animation fails
        return {
          opacity: isVisible ? 1 : 0,
          backgroundColor: isHovering ? 'rgba(255, 59, 48, 0.9)' : 'rgba(255, 59, 48, 0.7)',
          transform: [
            { scale: isHovering ? 1.1 : 1 },
            { translateY: isVisible ? 0 : 20 }
          ]
        };
      }
    });

    return (
      <Animated.View
        ref={ref}
        style={[styles.container, animatedStyle, { 
          height: containerHeight,
          zIndex: 1000 
        }]}
        onLayout={onLayout}
        testID="trashcan-drop-area"
        hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }}
      >
        <YStack alignItems="center" justifyContent="center" gap="$2" pointerEvents="none" height="100%">
          <MaterialIcons 
            name="delete" 
            size={isIpad() ? 60 : 48} 
            color="white" 
            style={{ 
              textShadowColor: 'rgba(0,0,0,0.3)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2 
            }} 
          />
          <YStack alignItems="center">
            <Text style={{
              color: 'white',
              fontSize: isIpad() ? 16 : 14,
              fontWeight: '600',
              textAlign: 'center',
              textShadowColor: 'rgba(0,0,0,0.3)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2
            }}>
              {isHovering ? 'Release to Delete' : 'Drag Here to Delete'}
            </Text>
          </YStack>
        </YStack>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: isIpad() ? 160 : 120,
    // Enhanced shadow for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    // Add border for better definition
    borderTopWidth: 2,
    borderTopColor: 'rgba(255, 59, 48, 0.3)',
  }
});

export default TrashcanArea;
