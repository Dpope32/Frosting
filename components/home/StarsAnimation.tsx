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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starPool = useRef<Star[]>([]);

    useMemo(() => {
      starPool.current = [...Array(95)].map((_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.8 + 0.2,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        layer: i < 30 ? 'slow' : i < 60 ? 'medium' : 'twinkle'
      }));
    }, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationFrameId: number;
      const resizeObserver = new ResizeObserver(() => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      });

      resizeObserver.observe(canvas);
      
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        starPool.current.forEach((star) => {
          star.x = (star.x + star.speed) % canvas.width;
          star.opacity += star.twinkleSpeed;
          if (star.opacity > 1 || star.opacity < 0.3) star.twinkleSpeed *= -1;
          
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
          ctx.fill();
        });

        animationFrameId = requestAnimationFrame(animate);
      };

      animate();
      return () => {
        cancelAnimationFrame(animationFrameId);
        resizeObserver.disconnect();
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />
    );
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