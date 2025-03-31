import React from 'react';
import { View, Platform } from 'react-native';

let Animated: any = null;
let useAnimatedStyle: any = null;
let withRepeat: any = null;
let withTiming: any = null;
let useSharedValue: any = null;

if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
    const Reanimated = require('react-native-reanimated');
    Animated = Reanimated.default;
    useAnimatedStyle = Reanimated.useAnimatedStyle;
    withRepeat = Reanimated.withRepeat;
    withTiming = Reanimated.withTiming;
    useSharedValue = Reanimated.useSharedValue;
  } catch (error) {
    console.warn('Reanimated could not be loaded:', error);
  }
}

interface StarsBackgroundProps {
  width: number;
  height: number;
  key?: number;
}

export const StarsBackground = ({ width, height, key }: StarsBackgroundProps) => {
  const translateX = Platform.OS !== 'web' && useSharedValue ? useSharedValue(0) : null;
  const translateY = Platform.OS !== 'web' && useSharedValue ? useSharedValue(0) : null;

  React.useEffect(() => {
    if (Platform.OS !== 'web' && translateX && translateY && withRepeat && withTiming) {
      const animationConfig = { duration: 60000 };
      translateX.value = withRepeat(withTiming(-width, animationConfig), -1, false);
      translateY.value = withRepeat(withTiming(-height / 2, animationConfig), -1, false);
      return () => {
        translateX.value = 0;
        translateY.value = 0;
      };
    }
  }, [width, height, translateX, translateY]);

  const starsAnimatedStyle = Platform.OS !== 'web' && useAnimatedStyle && translateX && translateY
    ? useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
      }))
    : null;

  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    if (Animated && starsAnimatedStyle) {
      return (
        <Animated.View
          pointerEvents="none"
          style={[
            { position: 'absolute', width: width * 2, height: height * 2, zIndex: 1 },
            starsAnimatedStyle,
          ]}
        >
          {[...Array(200)].map((_, i) => (
            <View
              key={`${key}-${i}`}
              style={{
                position: 'absolute',
                width: i % 3 === 0 ? 3 : 2,
                height: i % 3 === 0 ? 3 : 2,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 1,
                left: Math.random() * width * 2,
                top: Math.random() * height * 2,
              }}
            />
          ))}
        </Animated.View>
      );
    }
  }
    
  if (Platform.OS === 'web') {
    return (
      <>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: 1,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: '150%',
              height: '150%',
              animation: 'moveStarsSlow 120s linear infinite',
              left: '-50%',
              top: '-50%'
            }}
          >
            {[...Array(30)].map((_, i) => (
              <div
                key={`slow-${key}-${i}`}
                style={{
                  position: 'absolute',
                  width: i % 5 === 0 ? '3px' : '2px',
                  height: i % 5 === 0 ? '3px' : '2px',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '50%',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  boxShadow: i % 5 === 0 ? '0 0 3px 1px rgba(255, 255, 255, 0.3)' : 'none'
                }}
              />
            ))}
          </div>
          <div
            style={{
              position: 'absolute',
              width: '125%',
              height: '125%',
              animation: 'moveStarsMedium 80s linear infinite',
              left: '-50%',
              top: '-50%'
            }}
          >
            {[...Array(40)].map((_, i) => (
              <div
                key={`medium-${key}-${i}`}
                style={{
                  position: 'absolute',
                  width: i % 7 === 0 ? '2px' : '1px',
                  height: i % 7 === 0 ? '2px' : '1px',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '50%',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  boxShadow: i % 10 === 0 ? '0 0 2px 1px rgba(255, 255, 255, 0.2)' : 'none'
                }}
              />
            ))}
          </div>
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%'
            }}
          >
            {[...Array(25)].map((_, i) => (
              <div
                key={`twinkle-${key}-${i}`}
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '50%',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `twinkle ${3 + Math.random() * 5}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
          </div>
        </View>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes moveStarsSlow {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-25%, -25%); }
          }
          @keyframes moveStarsMedium {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-50%, -25%); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; box-shadow: 0 0 3px 1px rgba(255, 255, 255, 0.5); }
          }
        `}} />
      </>
    );
  }
  
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }}
    >
      {[...Array(200)].map((_, i) => (
        <View
          key={`${key}-${i}`}
          style={{
            position: 'absolute',
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </View>
  );
};
