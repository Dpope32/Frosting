import React, { useEffect } from 'react'
import { View, useWindowDimensions, Platform } from 'react-native'
import Animated, { useAnimatedStyle, withRepeat, withTiming, useSharedValue } from 'react-native-reanimated'
import { useUserStore } from '@/store/UserStore'

export const StarsAnimation = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const primaryColor = useUserStore(s => s.preferences.primaryColor)
  
  // Create multiple shared values for different star groups
  const translateX1 = useSharedValue(0)
  const translateY1 = useSharedValue(0)
  const translateX2 = useSharedValue(0)
  const translateY2 = useSharedValue(0)
  const translateX3 = useSharedValue(0)
  const translateY3 = useSharedValue(0)

  useEffect(() => {
    // Only run this animation for native platforms
    if (Platform.OS !== 'web') {
      const baseConfig = { duration: 60000 }
      
      // Group 1: Moving right and down
      translateX1.value = withRepeat(withTiming(screenWidth / 2, baseConfig), -1, true)
      translateY1.value = withRepeat(withTiming(screenHeight / 2, baseConfig), -1, true)
      
      // Group 2: Moving left and up
      translateX2.value = withRepeat(withTiming(-screenWidth / 2, baseConfig), -1, true)
      translateY2.value = withRepeat(withTiming(-screenHeight / 2, baseConfig), -1, true)
      
      // Group 3: Moving diagonally
      translateX3.value = withRepeat(withTiming(screenWidth / 3, {...baseConfig, duration: 45000}), -1, true)
      translateY3.value = withRepeat(withTiming(-screenHeight / 3, {...baseConfig, duration: 75000}), -1, true)
      
      return () => {
        translateX1.value = 0
        translateY1.value = 0
        translateX2.value = 0
        translateY2.value = 0
        translateX3.value = 0
        translateY3.value = 0
      }
    }
  }, [screenWidth, screenHeight, translateX1, translateY1, translateX2, translateY2, translateX3, translateY3])

  const starsAnimatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX1.value }, { translateY: translateY1.value }],
  }))
  
  const starsAnimatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX2.value }, { translateY: translateY2.value }],
  }))
  
  const starsAnimatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX3.value }, { translateY: translateY3.value }],
  }))

  // Enhanced animated stars for web using CSS animations
  if (Platform.OS === 'web') {
    // Convert primaryColor to rgba with opacity
    const getColorWithOpacity = (opacity: number) => {
      const hex = primaryColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

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
          {/* Layer 1 - Slow moving stars in different directions */}
          <div
            style={{
              position: 'absolute',
              width: '200%',
              height: '200%',
              left: '-50%',
              top: '-50%'
            }}
          >
            {[...Array(40)].map((_, i) => {
              const direction = i % 4; // 0, 1, 2, 3 for different directions
              const animationName = `moveStars${direction}`;
              return (
                <div
                  key={`slow-${i}`}
                  style={{
                    position: 'absolute',
                    width: i % 5 === 0 ? '3px' : '2px',
                    height: i % 5 === 0 ? '3px' : '2px',
                    backgroundColor: getColorWithOpacity(0.5),
                    borderRadius: '50%',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `${animationName} ${100 + Math.random() * 40}s linear infinite`,
                    // Remove boxShadow to prevent shadow warnings
                    opacity: i % 5 === 0 ? 0.9 : 0.7
                  }}
                />
              );
            })}
          </div>
          
          {/* Layer 2 - Medium moving stars in different directions */}
          <div
            style={{
              position: 'absolute',
              width: '200%',
              height: '200%',
              left: '-50%',
              top: '-50%'
            }}
          >
            {[...Array(40)].map((_, i) => {
              const direction = (i % 4) + 4; // 4, 5, 6, 7 for different directions
              const animationName = `moveStars${direction}`;
              return (
                <div
                  key={`medium-${i}`}
                  style={{
                    position: 'absolute',
                    width: i % 7 === 0 ? '2px' : '1px',
                    height: i % 7 === 0 ? '2px' : '1px',
                    backgroundColor: getColorWithOpacity(0.6),
                    borderRadius: '50%',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `${animationName} ${70 + Math.random() * 30}s linear infinite`,
                    // Remove boxShadow to prevent shadow warnings
                    opacity: i % 10 === 0 ? 0.8 : 0.6
                  }}
                />
              );
            })}
          </div>
          
          {/* Layer 3 - Fast twinkling stars */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%'
            }}
          >
            {[...Array(25)].map((_, i) => (
              <div
                key={`twinkle-${i}`}
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  backgroundColor: getColorWithOpacity(0.8),
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
        
        {/* CSS Animations with multiple directions */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes moveStars0 {
            0% { transform: translate(0, 0); }
            100% { transform: translate(25%, 25%); }
          }
          
          @keyframes moveStars1 {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-25%, 25%); }
          }
          
          @keyframes moveStars2 {
            0% { transform: translate(0, 0); }
            100% { transform: translate(25%, -25%); }
          }
          
          @keyframes moveStars3 {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-25%, -25%); }
          }
          
          @keyframes moveStars4 {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50%, 10%); }
          }
          
          @keyframes moveStars5 {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-50%, 10%); }
          }
          
          @keyframes moveStars6 {
            0% { transform: translate(0, 0); }
            100% { transform: translate(10%, -50%); }
          }
          
          @keyframes moveStars7 {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-10%, -50%); }
          }
          
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }
        `}} />
      </>
    )
  }
  
  // For native platforms, use multiple animated views with different movement patterns
  return (
    <>
      {/* Group 1 */}
      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', width: screenWidth * 2, height: screenHeight * 2, zIndex: 1 },
          starsAnimatedStyle1,
        ]}
      >
        {[...Array(40)].map((_, i) => (
          <View
            key={`g1-${i}`}
            style={{
              position: 'absolute',
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              backgroundColor: `${primaryColor}10`, // Using hex opacity
              borderRadius: 1,
              left: Math.random() * screenWidth * 2,
              top: Math.random() * screenHeight * 2,
            }}
          />
        ))}
      </Animated.View>
      
      {/* Group 2 */}
      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', width: screenWidth * 2, height: screenHeight * 2, zIndex: 1 },
          starsAnimatedStyle2,
        ]}
      >
        {[...Array(40)].map((_, i) => (
          <View
            key={`g2-${i}`}
            style={{
              position: 'absolute',
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              backgroundColor: `${primaryColor}40`, // Using hex opacity
              borderRadius: 1,
              left: Math.random() * screenWidth * 2,
              top: Math.random() * screenHeight * 2,
            }}
          />
        ))}
      </Animated.View>
      
      {/* Group 3 */}
      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', width: screenWidth * 2, height: screenHeight * 2, zIndex: 1 },
          starsAnimatedStyle3,
        ]}
      >
        {[...Array(34)].map((_, i) => (
          <View
            key={`g3-${i}`}
            style={{
              position: 'absolute',
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              backgroundColor: `${primaryColor}`, // Using hex opacity
              borderRadius: 1,
              left: Math.random() * screenWidth * 2,
              top: Math.random() * screenHeight * 2,
            }}
          />
        ))}
      </Animated.View>
    </>
  )
}
