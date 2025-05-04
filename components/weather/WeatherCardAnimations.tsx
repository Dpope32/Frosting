import React, { useEffect } from 'react';
import { Platform, View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { XStack } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';

interface WeatherCardAnimationsProps {
  shortForecast: string;
  precipitation: number;
  windValue: number;
  isDark: boolean;
}

const WeatherCardAnimations: React.FC<WeatherCardAnimationsProps> = ({
  shortForecast,
  precipitation,
  windValue,
  isDark,
}) => {
  const forecastLower = shortForecast.toLowerCase();
  const isRaining = precipitation > 30 || forecastLower.includes("rain") || forecastLower.includes("showers") || forecastLower.includes("thunderstorm");
  const isStorm = forecastLower.includes("thunderstorm");
  const isCloudy = forecastLower.includes("cloudy") || forecastLower.includes("partly cloudy") || forecastLower.includes("mostly cloudy");
  const isSunny = forecastLower.includes("sunny") || forecastLower.includes("clear") || forecastLower.includes("mostly sunny");
  const hasHighWind = windValue > 12;
  const hasVeryHighWind = windValue > 22;

  // Get screen width for percentage calculations
  const screenWidth = Dimensions.get('window').width;

  // =============================================================
  // Rain Animation (refined palette & thinner drops)
  // =============================================================
  const RainDrop = ({ index }: { index: number }) => {
    const initialY = useSharedValue(-18); // Slightly higher starting point for smoother entry
    const dropHeight = 8 + Math.random() * 8;
    const dropWidth = 0.8 + Math.random() * 0.8;
    
    // Instead of percentage string, use calculated numeric position
    const leftPosition = (Math.random() * screenWidth);
    
    // Calculate rain duration based on precipitation percentage
    // Lower precipitation = slower rain (longer duration)
    // Higher precipitation = faster rain (shorter duration)
    const baseDuration = 1800 - (precipitation * 10); // Range: 1800ms (0%) to 800ms (100%)
    const duration = baseDuration + Math.random() * 300;
    
    const delay = Math.random() * 1000 * (index % 5); // Stagger drops

    useEffect(() => {
      // Use setTimeout to introduce the delay
      const timer = setTimeout(() => {
        initialY.value = withRepeat(
          withTiming(120, { duration, easing: Easing.linear }),
          -1, // Repeat indefinitely
          false // Don't reverse
        );
      }, delay);
      
      return () => clearTimeout(timer);
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        position: 'absolute',
        top: initialY.value,
        left: leftPosition,
        height: dropHeight,
        width: dropWidth,
        backgroundColor: isDark ? 'rgba(147, 197, 253, 0.75)' : 'rgba(59, 130, 246, 0.7)', // Blue-500 / Blue-300
        borderRadius: dropWidth / 2,
        opacity: 0.6,
      };
    });

    return <Animated.View style={animatedStyle} />;
  };

  // =============================================================
  // Wind Animation (finer streaks, softened opacity)
  // =============================================================
  const WindStreak = ({ index }: { index: number }) => {
    const initialX = useSharedValue(-120); // Start further off-screen left
    const top = 5 + (index * 8) + (Math.random() * 15); // More vertical spread, less uniform spacing
    
    // Use numeric position instead of percentage string
    const leftPosition = (2 + Math.random() * 90) * screenWidth / 100;
    
    // Significantly longer width, much thinner height
    const width = (hasVeryHighWind ? 55 : 40) + (Math.random() * 45);
    const height = 0.6 + (Math.random() * 0.35); // Very thin
    const speedFactor = hasVeryHighWind ? 0.6 + (Math.random() * 0.4) : 0.8 + (Math.random() * 0.5);
    const duration = (1000 / speedFactor) + Math.random() * 300; // Adjust duration based on speed
    const delay = Math.random() * 500 * (index % (hasVeryHighWind ? 6 : 4));

    useEffect(() => {
      const timer = setTimeout(() => {
        initialX.value = withRepeat(
          withSequence(
            withTiming(-100, { duration: 0 }), // Start position
            // Travel much further across the screen
            withTiming(250 + Math.random() * 50, { duration, easing: Easing.linear })
          ),
          -1, false
        );
      }, delay);
      
      return () => clearTimeout(timer);
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        position: 'absolute',
        top: top,
        left: leftPosition,
        height: height,
        width: width,
        // Lighter opacity for streak effect
        backgroundColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.18)",
        opacity: 0.12 + (Math.random() * 0.18), // Slightly subtler opacity
        transform: [{ translateX: initialX.value }],
      };
    });

    const Element = Platform.OS === 'web' ? XStack : Animated.View;
    return <Element style={animatedStyle} />;
  };

  // --- Debris Animation (for very high wind) ---
  const WindDebris = ({ index }: { index: number }) => {
    const initialX = useSharedValue(-30); // Start off-screen left
    const initialRotate = useSharedValue(0);
    const top = 20 + Math.random() * 60; // Random vertical position
    
    // Use numeric position instead of percentage string
    const leftPosition = (20 + Math.random() * 60) * screenWidth / 100;
    
    const size = 2.5 + Math.random() * 2.5;
    const duration = 800 + Math.random() * 400;
    const rotationSpeed = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360); // Random rotation amount/direction
    const delay = Math.random() * 700 * (index % 3); // Stagger debris

    useEffect(() => {
      const timer = setTimeout(() => {
        initialX.value = withRepeat(
          withSequence(
            withTiming(-30, { duration: 0 }), // Reset position instantly
            withTiming(130, { duration, easing: Easing.linear }) // Animate across
          ),
          -1,
          false
        );
        initialRotate.value = withRepeat(
          withTiming(rotationSpeed, { duration, easing: Easing.linear }),
          -1,
          false
        );
      }, delay);
      
      return () => clearTimeout(timer);
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        position: 'absolute',
        top: top,
        left: leftPosition,
        height: size,
        width: size,
        borderRadius: size / 3, // Slightly less round
        backgroundColor: isDark ? "rgba(210,180,140,0.55)" : "rgba(139,69,19,0.5)", // Tan / Brown
        opacity: 0.55,
        transform: [
          { translateX: initialX.value },
          { rotate: `${initialRotate.value}deg` }
        ],
      };
    });

    // Use XStack for web compatibility if needed, otherwise View
    const Element = Platform.OS === 'web' ? XStack : Animated.View;
    return <Element style={animatedStyle} />;
  };

  // For web, we need to add a style element with updated CSS animations
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      // Calculate rain animation duration based on precipitation
      const rainDuration = (2.5 - (precipitation / 100) * 1.5).toFixed(1); // Range: 2.5s (0%) to 1.0s (100%)
      
      // Create or update the style element
      const styleId = 'dynamic-weather-animations';
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      // Update CSS with dynamic animation durations
      styleElement.textContent = `
        @keyframes rain {
          0% { transform: translateY(-10px) rotate(-30deg); }
          100% { transform: translateY(120px) rotate(-30deg); }
        }
        
        .rain-drop {
          animation: rain ${rainDuration}s linear infinite;
        }
      `;
    }
  }, [precipitation]);

  // Determine number of raindrops based on precipitation
  const numRaindrops = Math.min(28, Math.max(8, Math.floor(precipitation / 3.5)));


  // Render rain differently for web vs native
  const renderRain = () => {
    if (!isRaining) return null;
    
    if (Platform.OS === 'web') {
      return [...Array(numRaindrops)].map((_, i) => {
        const randomLeft = `${Math.random() * 100}%`;
        const randomDelay = `${Math.random() * 3}s`;
        return (
          <div 
            key={`rain-web-${i}`}
            style={{
              position: 'absolute',
              top: -10,
              left: randomLeft,
              height: 10 + Math.random() * 10,
              width: 1 + Math.random() * 1,
              backgroundColor: isDark ? 'rgba(173, 216, 230, 0.7)' : 'rgba(70, 130, 180, 0.7)',
              borderRadius: 1,
              opacity: 0.7,
              animation: `rain ${(2.5 - (precipitation / 100) * 1.5).toFixed(1)}s linear infinite`,
              animationDelay: randomDelay
            }}
            className="rain-drop"
          />
        );
      });
    } else {
      return [...Array(numRaindrops)].map((_, i) => (
        <RainDrop key={`rain-${i}`} index={i} />
      ));
    }
  };

  // -------------------------------------------------------------
  // Sun overlay (enhanced radial glow)
  // -------------------------------------------------------------
  const renderSunGlow = () => {
    if (!isSunny) return null;
    
    // Get temperature to determine sun brightness
    // Using raw props passed to the component to decide glow intensity
    const tempAbove50 = typeof shortForecast === 'string' && shortForecast.includes('50');
    
    // Enhanced size for better visibility
    const size = 320; // px
    const offset = -120; // shift up-left
    
    // Use temperature to determine glow intensity
    // More vibrant colors for temperatures above 50°F
    const primaryColor = tempAbove50 ? 
      (isDark ? 'rgba(253, 224, 71, 0.6)' : 'rgba(253, 230, 138, 0.7)') : 
      (isDark ? 'rgba(253, 224, 71, 0.35)' : 'rgba(253, 230, 138, 0.5)');
    
    return (
      <LinearGradient
        key="sun-glow"
        colors={[primaryColor, 'transparent']}
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          top: offset,
          left: offset, // Changed from right to left to position in top-left
          zIndex: 0,
        }}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
      />
    );
  };

  // -------------------------------------------------------------
  // Lightning flash effect using shared value (no entering prop)
  // -------------------------------------------------------------
  const flashOpacity = useSharedValue(0);

  useEffect(() => {
    if (isStorm) {
      flashOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 80 }),
          withTiming(0, { duration: 260 }),
          withTiming(0, { duration: 800 }) // pause between flashes
        ),
        -1,
        false
      );
    }
  }, [isStorm]);

  const lightningStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const renderLightning = () => {
    if (!isStorm) return null;
    return (
      <Animated.View
        key="flash"
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.35)',
          },
          lightningStyle,
        ]}
      />
    );
  };

  return (
    <>
      {renderSunGlow()}
      {renderRain()}
      {hasHighWind && [...Array(hasVeryHighWind ? 12 : 8)].map((_, i) => (
        <WindStreak key={`wind-${i}`} index={i} />
      ))}
      {hasVeryHighWind && [...Array(5)].map((_, i) => (
        <WindDebris key={`debris-${i}`} index={i} />
      ))}
      {renderLightning()}
    </>
  );
};

export default WeatherCardAnimations;
