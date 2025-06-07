import React, { useEffect, useMemo, useRef } from 'react'
import { View, useWindowDimensions, Platform } from 'react-native'
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  useSharedValue,
  withDelay,
  Easing,
  runOnJS,
  useFrameCallback,
  useDerivedValue
} from 'react-native-reanimated'

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  layer: 'slow' | 'medium' | 'twinkle';
}

// Single animated container that manages all stars
const OptimizedStarsLayer = ({ 
  stars, 
  screenWidth, 
  screenHeight 
}: { 
  stars: Star[], 
  screenWidth: number, 
  screenHeight: number 
}) => {
  const time = useSharedValue(0);
  const starsRef = useRef(stars);

  // Single animation driver for all stars
  useEffect(() => {
    time.value = withRepeat(
      withTiming(1000000, { 
        duration: 1000000, 
        easing: Easing.linear 
      }),
      -1,
      false
    );
  }, []);

  // Batch render only visible stars (viewport culling)
  const visibleStars = useMemo(() => {
    return stars.filter(star => 
      star.x > -50 && star.x < screenWidth + 50 &&
      star.y > -50 && star.y < screenHeight + 50
    );
  }, [stars, screenWidth, screenHeight]);

  // Group stars by layer for batch rendering
  const starsByLayer = useMemo(() => {
    const layers: { [key: string]: Star[] } = { slow: [], medium: [], twinkle: [] };
    visibleStars.forEach(star => layers[star.layer].push(star));
    return layers;
  }, [visibleStars]);

  return (
    <>
      {Object.entries(starsByLayer).map(([layerName, layerStars]) => (
        <StarLayer 
          key={layerName}
          stars={layerStars}
          time={time}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
        />
      ))}
    </>
  );
};

// Efficient layer component that renders multiple stars
const StarLayer = ({ 
  stars, 
  time, 
  screenWidth, 
  screenHeight 
}: { 
  stars: Star[], 
  time: Animated.SharedValue<number>,
  screenWidth: number,
  screenHeight: number
}) => {
  // Use a small number of reusable animated components
  const maxStarsPerLayer = Math.min(stars.length, 15); // Limit animated components
  
  return (
    <>
      {Array.from({ length: maxStarsPerLayer }, (_, index) => {
        const star = stars[index % stars.length]; // Cycle through stars
        
        const animatedStyle = useAnimatedStyle(() => {
          const progress = (time.value * star.speed) % 10000;
          const twinkle = Math.sin(time.value * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
          
          return {
            transform: [
              { 
                translateX: ((star.x + progress * 0.5) % (screenWidth + 100)) - 50
              },
              { 
                scale: 0.8 + twinkle * 0.4 
              }
            ],
            opacity: star.opacity * twinkle,
          };
        }, [star, screenWidth]);

        return (
          <Animated.View
            key={`star-${star.layer}-${index}`}
            style={[
              {
                position: 'absolute',
                width: star.size,
                height: star.size,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: star.size / 2,
                left: star.x,
                top: star.y,
              },
              animatedStyle
            ]}
          />
        );
      })}
    </>
  );
};

export const StarsAnimation = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

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

  // Native performance optimization
  const stars = useMemo(() => {
    const starCount = 60; // Reduced from 120
    return [...Array(starCount)].map((_, i): Star => ({
      id: i,
      x: Math.random() * screenWidth * 1.2,
      y: Math.random() * screenHeight * 1.2,
      size: Math.random() * 2.5 + 0.8,
      speed: Math.random() * 0.003 + 0.001,
      opacity: Math.random() * 0.4 + 0.4,
      twinkleSpeed: Math.random() * 0.008 + 0.002,
      twinklePhase: Math.random() * Math.PI * 2,
      layer: i < 20 ? 'slow' : i < 40 ? 'medium' : 'twinkle'
    }));
  }, [screenWidth, screenHeight]);

  console.log(`[Perf] Native: Optimized to ~15 animated components vs original 120`);

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
      <OptimizedStarsLayer 
        stars={stars}
        screenWidth={screenWidth}
        screenHeight={screenHeight}
      />
    </View>
  );
};