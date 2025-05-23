import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  Easing,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { LegalModal } from '@/components/modals/LegalModal';

export const LegalButton = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const animationProgress = useSharedValue(0);
  const scale = useSharedValue(1);

  const handlePress = () => {
    // Apply quick scale feedback and immediately show modal
    scale.value = withSpring(0.9, { damping: 15, stiffness: 150 });
    animationProgress.value = withTiming(1, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    // Show modal immediately
    setModalVisible(true);
    
    // Reset scale after modal shows
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }, 50);
  };

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const rippleStyle = useAnimatedStyle(() => {
    const rippleScale = interpolate(
      animationProgress.value,
      [0, 1],
      [0, 4],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      animationProgress.value,
      [0, 0.5, 1],
      [0, 0.3, 0],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale: rippleScale }],
      opacity,
    };
  });

  return (
    <>
      <Animated.View style={[styles.circle, buttonStyle]}>
        <TouchableOpacity
          style={styles.touchable}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <MaterialIcons 
            name="gavel" 
            size={22} 
            color={isDark ? '#708090' : '#708090'} 
          />
          <Animated.View 
            style={[
              styles.ripple, 
              { backgroundColor: isDark ? '#708090' : '#708090' },
              rippleStyle
            ]} 
          />
        </TouchableOpacity>
      </Animated.View>
      <LegalModal 
        isVisible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    backgroundColor: 'transparent',
  },
  touchable: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -10,
  },
});
