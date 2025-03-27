import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, useColorScheme, Platform } from 'react-native';
import { Text, YStack, XStack } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  Easing,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { useUserStore } from '@/store/UserStore';
import { LegalModal } from '@/components/modals/LegalModal';

export const LegalButton = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const animationProgress = useSharedValue(0);
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSpring(0.9, { damping: 10 });
    
    setTimeout(() => {
      scale.value = withSpring(1);
      
      animationProgress.value = withTiming(1, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      
      setTimeout(() => {
        setModalVisible(true);
      }, 400);
    }, 100);
  };
  
  // Animated styles for the button
  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  // Animated styles for the ripple effect
  const rippleStyle = useAnimatedStyle(() => {
    const rippleScale = interpolate(
      animationProgress.value,
      [0, 1],
      [0, 4],
      Extrapolate.CLAMP
    );
    
    const opacity = interpolate(
      animationProgress.value,
      [0, 0.5, 1],
      [0, 0.3, 0],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ scale: rippleScale }],
      opacity,
    };
  });
  
  return (
    <>
      <YStack style={styles.container}>
        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isDark ? '#1e1e1e' : '#f0f0f0' }
            ]}
            onPress={handlePress}
            activeOpacity={0.8}
          >
            <XStack alignItems="center" gap={16}>
              <MaterialIcons 
                name="gavel" 
                size={16} 
                color={primaryColor} 
              />
              <Text 
                color={isDark ? '#fff' : '#000'} 
                fontSize={14}
                fontWeight="500"
                fontFamily="$body"
              >
                Legal & Privacy
              </Text>
            </XStack>
            
            {/* Ripple effect container */}
            <Animated.View 
              style={[
                styles.ripple, 
                { backgroundColor: primaryColor },
                rippleStyle
              ]} 
            />
          </TouchableOpacity>
        </Animated.View>
      </YStack>
      
      <LegalModal 
        isVisible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 'auto',
    marginBottom: 30,
  },
  buttonContainer: {
    overflow: 'hidden',
    borderRadius: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
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
  }
});
