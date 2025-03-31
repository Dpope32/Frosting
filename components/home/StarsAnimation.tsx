import React, { useEffect, useMemo } from 'react'
import { View, useWindowDimensions, Platform } from 'react-native'
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  useSharedValue,
  withDelay,
  Easing
} from 'react-native-reanimated'

// Helper function to determine random direction
const getRandomDirection = (): number => Math.random() > 0.5 ? -1 : 1

// Create a star config with random properties
const createStarConfig = (
  screenWidth: number, 
  screenHeight: number, 
  index: number, 
  layer: 'slow' | 'medium' | 'twinkle'
): {
  size: number;
  left: number;
  top: number;
  duration: number;
  directionX: number;
  directionY: number;
  moveX: boolean;
  moveY: boolean;
  opacity: number;
  twinkle: boolean;
  delay: number;
} => {
  // Determine star size based on layer and random factor
  const baseSize = layer === 'slow' ? 2 : layer === 'medium' ? 1.5 : 1
  const size = index % (layer === 'slow' ? 5 : 7) === 0 ? baseSize * 1.5 : baseSize
  
  // Randomize position
  const left = Math.random() * screenWidth * 1.5
  const top = Math.random() * screenHeight * 1.5
  
  // Randomize animation durations
  const baseDuration = layer === 'slow' ? 60000 : layer === 'medium' ? 40000 : 20000
  const durationModifier = Math.random() * 30000
  
  // Randomize direction for each star
  const directionX = getRandomDirection()
  const directionY = getRandomDirection()
  
  // Some stars don't move or move only in one direction
  const moveX = Math.random() > 0.1
  const moveY = Math.random() > 0.1
  
  // Brightness varies by layer
  const opacity = layer === 'slow' ? 0.5 : layer === 'medium' ? 0.6 : 0.8
  
  // Some stars twinkle more dramatically
  const twinkle = Math.random() > 0.5
  
  return {
    size,
    left,
    top,
    duration: baseDuration + durationModifier,
    directionX,
    directionY,
    moveX,
    moveY,
    opacity,
    twinkle,
    delay: Math.random() * 5000 // Randomize start time
  }
}

export const StarsAnimation = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
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

  if (Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'windows' || Platform.OS === 'macos') {
    const slowStars = useMemo(() => 
      [...Array(40)].map((_, i) => createStarConfig(screenWidth, screenHeight, i, 'slow')),
    [screenWidth, screenHeight]);
    
    const mediumStars = useMemo(() => 
      [...Array(50)].map((_, i) => createStarConfig(screenWidth, screenHeight, i, 'medium')),
    [screenWidth, screenHeight]);
    
    const twinklingStars = useMemo(() => 
      [...Array(30)].map((_, i) => createStarConfig(screenWidth, screenHeight, i, 'twinkle')),
    [screenWidth, screenHeight]);
    
    return (
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
        {slowStars.map((star, i) => {
          const translateX = useSharedValue(0);
          const translateY = useSharedValue(0);
          const scale = useSharedValue(1);
          const opacityValue = useSharedValue(star.opacity);
          
          useEffect(() => {
            if (star.moveX) {
              translateX.value = withDelay(
                star.delay,
                withRepeat(
                  withTiming(
                    star.directionX * screenWidth * 0.5,
                    { 
                      duration: star.duration, 
                      easing: Easing.linear 
                    }
                  ),
                  -1,
                  true
                )
              );
            }
            
            if (star.moveY) {
              translateY.value = withDelay(
                star.delay,
                withRepeat(
                  withTiming(
                    star.directionY * screenHeight * 0.3,
                    {
                      duration: star.duration * 1.2,
                      easing: Easing.linear
                    }
                  ),
                  -1,
                  true
                )
              );
            }
            
            if (star.twinkle) {
              scale.value = withDelay(
                star.delay,
                withRepeat(
                  withTiming(
                    1 + Math.random() * 0.5,
                    { 
                      duration: 2000 + Math.random() * 3000,
                      easing: Easing.inOut(Easing.ease)
                    }
                  ),
                  -1,
                  true
                )
              );
              
              opacityValue.value = withDelay(
                star.delay,
                withRepeat(
                  withTiming(
                    0.3 + Math.random() * 0.7,
                    {
                      duration: 1500 + Math.random() * 2500,
                      easing: Easing.inOut(Easing.ease)
                    }
                  ),
                  -1,
                  true
                )
              );
            }
            
            return () => {
              translateX.value = 0;
              translateY.value = 0;
              scale.value = 1;
              opacityValue.value = star.opacity;
            };
          }, [screenWidth, screenHeight]);
          
          const starStyle = useAnimatedStyle(() => ({
            transform: [
              { translateX: translateX.value },
              { translateY: translateY.value },
              { scale: scale.value }
            ],
            opacity: opacityValue.value
          }));
          
          return (
            <Animated.View
              key={`slow-${i}`}
              style={[
                {
                  position: 'absolute',
                  width: star.size,
                  height: star.size,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: star.size / 2,
                  left: star.left,
                  top: star.top,
                  zIndex: 1
                },
                starStyle
              ]}
            />
          );
        })}
        
        {mediumStars.map((star, i) => {
          const translateX = useSharedValue(0);
          const translateY = useSharedValue(0);
          const scale = useSharedValue(1);
          const opacityValue = useSharedValue(star.opacity);
          
          useEffect(() => {
            if (star.moveX) {
              translateX.value = withDelay(
                star.delay,
                withRepeat(
                  withTiming(
                    star.directionX * screenWidth * 0.8,
                    { 
                      duration: star.duration,
                      easing: Easing.linear 
                    }
                  ),
                  -1,
                  true
                )
              );
            }
            
            if (star.moveY) {
              translateY.value = withDelay(
                star.delay,
                withRepeat(
                  withTiming(
                    star.directionY * screenHeight * 0.5,
                    {
                      duration: star.duration * 0.9,
                      easing: Easing.linear
                    }
                  ),
                  -1,
                  true
                )
              );
            }
            
            if (star.twinkle) {
              scale.value = withDelay(
                star.delay,
                withRepeat(
                  withTiming(
                    0.8 + Math.random() * 0.4,
                    { 
                      duration: 1500 + Math.random() * 2000,
                      easing: Easing.inOut(Easing.ease)
                    }
                  ),
                  -1,
                  true
                )
              );
              
              opacityValue.value = withDelay(
                star.delay,
                withRepeat(
                  withTiming(
                    0.4 + Math.random() * 0.6,
                    {
                      duration: 1000 + Math.random() * 2000,
                      easing: Easing.inOut(Easing.ease)
                    }
                  ),
                  -1,
                  true
                )
              );
            }
            
            return () => {
              translateX.value = 0;
              translateY.value = 0;
              scale.value = 1;
              opacityValue.value = star.opacity;
            };
          }, [screenWidth, screenHeight]);
          
          const starStyle = useAnimatedStyle(() => ({
            transform: [
              { translateX: translateX.value },
              { translateY: translateY.value },
              { scale: scale.value }
            ],
            opacity: opacityValue.value
          }));
          
          return (
            <Animated.View
              key={`medium-${i}`}
              style={[
                {
                  position: 'absolute',
                  width: star.size,
                  height: star.size,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: star.size / 2,
                  left: star.left,
                  top: star.top,
                  zIndex: 1
                },
                starStyle
              ]}
            />
          );
        })}
        
        {twinklingStars.map((star, i) => {
          const scale = useSharedValue(1);
          const opacityValue = useSharedValue(0.2);
          
          useEffect(() => {
            scale.value = withDelay(
              star.delay,
              withRepeat(
                withTiming(
                  1 + Math.random() * 0.7,
                  { 
                    duration: 1000 + Math.random() * 3000,
                    easing: Easing.inOut(Easing.ease)
                  }
                ),
                -1,
                true
              )
            );
            
            opacityValue.value = withDelay(
              star.delay,
              withRepeat(
                withTiming(
                  0.1 + Math.random() * 0.9,
                  {
                    duration: 800 + Math.random() * 2200,
                    easing: Easing.inOut(Easing.ease)
                  }
                ),
                -1,
                true
              )
            );
            
            return () => {
              scale.value = 1;
              opacityValue.value = 0.2;
            };
          }, []);
          
          const twinkleStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
            opacity: opacityValue.value
          }));
          
          return (
            <Animated.View
              key={`twinkle-${i}`}
              style={[
                {
                  position: 'absolute',
                  width: star.size,
                  height: star.size,
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  borderRadius: star.size / 2,
                  left: star.left,
                  top: star.top,
                  zIndex: 1
                },
                twinkleStyle
              ]}
            />
          );
        })}
      </View>
    );
  }
}
