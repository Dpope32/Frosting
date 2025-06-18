import React from 'react';
import { isWeb, Text } from 'tamagui';
import { TouchableOpacity, Animated } from 'react-native';

interface FloatingContinueButtonProps {
  showContinueButton: boolean;
  scrollOffset: number;
  onComplete: () => void;
}

export const FloatingContinueButton = ({ 
  showContinueButton, 
  scrollOffset, 
  onComplete 
}: FloatingContinueButtonProps) => {
  if (!isWeb) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 30,
        right: 30,
        zIndex: 1000,
        transform: [
          {
            translateY: showContinueButton ? 0 : 100,
          },
          {
            scale: showContinueButton ? 1 : 0.8,
          }
        ],
        opacity: showContinueButton ? 1 : 0,
      }}
    >
      <TouchableOpacity
        onPress={onComplete}
        style={{
          backgroundColor: '#3b82f6',
          paddingHorizontal: 28,
          paddingVertical: 18,
          borderRadius: 50,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          boxShadow: `0 12px 40px rgba(0, 0, 0, 0.25), 0 4px 16px rgba(59, 130, 246, ${0.3 + Math.sin(scrollOffset * 0.005) * 0.1})`,
          cursor: 'pointer',
          transform: `translateY(${Math.sin(scrollOffset * 0.004) * 2}px)`,
        }}
      >
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 17, fontFamily: '$body' }}>
          Continue
        </Text>
        <Text style={{ color: 'white', fontSize: 16, fontFamily: '$body' }}>→</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}; 