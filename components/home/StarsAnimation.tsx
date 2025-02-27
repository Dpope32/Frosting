import React, { useEffect } from 'react'
import { View, useWindowDimensions, Platform } from 'react-native'
import Animated, { useAnimatedStyle, withRepeat, withTiming, useSharedValue } from 'react-native-reanimated'

export const StarsAnimation = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)

  useEffect(() => {
    // Only run this animation for native platforms
    if (Platform.OS !== 'web') {
      const animationConfig = { duration: 60000 }
      translateX.value = withRepeat(withTiming(-screenWidth, animationConfig), -1, false)
      translateY.value = withRepeat(withTiming(-screenHeight / 2, animationConfig), -1, false)
      return () => {
        translateX.value = 0
        translateY.value = 0
      }
    }
  }, [screenWidth, screenHeight, translateX, translateY])

  const starsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }))

  // Enhanced animated stars for web using CSS animations
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
          {/* Layer 1 - Slow moving stars */}
          <div
            style={{
              position: 'absolute',
              width: '200%',
              height: '200%',
              animation: 'moveStarsSlow 120s linear infinite',
              left: '-50%',
              top: '-50%'
            }}
          >
            {[...Array(30)].map((_, i) => (
              <div
                key={`slow-${i}`}
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
          
          {/* Layer 2 - Medium moving stars */}
          <div
            style={{
              position: 'absolute',
              width: '200%',
              height: '200%',
              animation: 'moveStarsMedium 80s linear infinite',
              left: '-50%',
              top: '-50%'
            }}
          >
            {[...Array(40)].map((_, i) => (
              <div
                key={`medium-${i}`}
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
        
        {/* CSS Animations */}
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
    )
  }
  
  // For native platforms, use the existing animation
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: screenWidth * 2, height: screenHeight * 2, zIndex: 1 },
        starsAnimatedStyle,
      ]}
    >
      {[...Array(100)].map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 1,
            left: Math.random() * screenWidth * 2,
            top: Math.random() * screenHeight * 2,
          }}
        />
      ))}
    </Animated.View>
  )
}
