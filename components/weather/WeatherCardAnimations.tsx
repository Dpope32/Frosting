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
import RainDrop from '@/components/shared/RainDrop';

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
  
  // Weather condition detection - more granular
  const isRaining = precipitation > 30 || forecastLower.includes("rain") || forecastLower.includes("showers");
  const isStorm = forecastLower.includes("thunderstorm") && precipitation >= 40; // Only show storm effects for 40%+ chance
  
  // Cloud conditions - differentiate levels
  const isMostlyCloudy = forecastLower.includes("mostly cloudy");
  const isPartlyCloudy = forecastLower.includes("partly cloudy");
  const isCloudy = isMostlyCloudy || isPartlyCloudy || forecastLower.includes("cloudy");
  
  // Sun conditions - differentiate levels
  const isFullSunny = forecastLower.includes("sunny") && !forecastLower.includes("partly") && !forecastLower.includes("mostly");
  const isMostlySunny = forecastLower.includes("mostly sunny");
  const isPartlySunny = forecastLower.includes("partly sunny");
  const isClear = forecastLower.includes("clear");
  const isSunny = isFullSunny || isMostlySunny || isPartlySunny || isClear;
  
  // Wind conditions
  const hasHighWind = windValue > 12;
  const hasVeryHighWind = windValue > 22;
  
  // Fog conditions
  const isFoggy = forecastLower.includes("fog");

  // Get screen width for percentage calculations
  const screenWidth = Dimensions.get('window').width;

  // =============================================================
  // Rain Animation Configuration
  // =============================================================
  const createRainDrop = (index: number) => {
    const dropHeight = 6 + Math.random() * 6; // Smaller drops
    const dropWidth = 1 + Math.random() * 1.5; // Thinner drops
    const leftPosition = Math.random() * screenWidth;
    const baseDuration = 1200 - (precipitation * 8); // Faster base speed
    const duration = baseDuration + Math.random() * 400;
    const delay = Math.random() * 2000; // Stagger over 2 seconds
    
    return {
      delay,
      duration,
      initialX: leftPosition,
      startY: -20,
      endY: 140,
      width: dropWidth,
      height: dropHeight,
      color: rainColor,
      opacity: rainOpacity * (0.6 + Math.random() * 0.4), // Vary opacity
      rotation: -10 - Math.random() * 10, // Slight angle variation
    };
  };

  // =============================================================
  // Wind Animation (more subtle and refined)
  // =============================================================
  const WindStreak = ({ index }: { index: number }) => {
    const initialX = useSharedValue(-80);
    const top = 10 + (index * 12) + (Math.random() * 20);
    
    const leftPosition = (5 + Math.random() * 80) * screenWidth / 100;
    
    // More reasonable sizes
    const width = (hasVeryHighWind ? 35 : 25) + (Math.random() * 25);
    const height = 0.4 + (Math.random() * 0.3); // Even thinner
    const speedFactor = hasVeryHighWind ? 0.7 + (Math.random() * 0.3) : 0.9 + (Math.random() * 0.4);
    const duration = (1200 / speedFactor) + Math.random() * 400;
    const delay = Math.random() * 800 * (index % 4);

    useEffect(() => {
      const timer = setTimeout(() => {
        initialX.value = withRepeat(
          withTiming(180, { duration, easing: Easing.linear }),
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
        height: height,
        width: width,
        backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
        opacity: 0.08 + (Math.random() * 0.12), // Much more subtle
        transform: [{ translateX: initialX.value }],
      };
    });

    return <Animated.View style={animatedStyle} />;
  };

  // --- Debris Animation (for very high wind) - more subtle ---
  const WindDebris = ({ index }: { index: number }) => {
    const initialX = useSharedValue(-25);
    const initialRotate = useSharedValue(0);
    const top = 25 + Math.random() * 50;
    
    const leftPosition = (30 + Math.random() * 40) * screenWidth / 100;
    
    const size = 1.5 + Math.random() * 2; // Smaller debris
    const duration = 1000 + Math.random() * 600; // Slower movement
    const rotationSpeed = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 180); // Less rotation
    const delay = Math.random() * 1000 * (index + 1); // Better staggering

    useEffect(() => {
      const timer = setTimeout(() => {
        initialX.value = withRepeat(
          withTiming(120, { duration, easing: Easing.linear }),
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
        borderRadius: size / 2,
        backgroundColor: isDark ? "rgba(210,180,140,0.4)" : "rgba(139,69,19,0.35)",
        opacity: 0.4,
        transform: [
          { translateX: initialX.value },
          { rotate: `${initialRotate.value}deg` }
        ],
      };
    });

    return <Animated.View style={animatedStyle} />;
  };

  // For web, we need to add a style element with updated CSS animations
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      // Calculate rain animation duration based on precipitation
      const rainDuration = (2.0 - (precipitation / 100) * 1.2).toFixed(1); // Faster, more realistic
      
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
          0% { transform: translateY(-20px) rotate(-15deg); opacity: 0.8; }
          100% { transform: translateY(140px) rotate(-15deg); opacity: 0.3; }
        }
        
        .rain-drop {
          animation: rain ${rainDuration}s linear infinite;
        }
      `;
    }
  }, [precipitation]);

  // Determine number of raindrops and opacity based on precipitation
  const numRaindrops = Math.min(20, Math.max(3, Math.floor(precipitation / 4))); // Reduced count for performance
  const rainOpacity = 0.3 + Math.min(0.6, precipitation / 120); // More subtle opacity
  const rainColor = isDark
    ? `rgba(147, 197, 253, ${0.4 + precipitation / 250})`
    : `rgba(59, 130, 246, ${0.3 + precipitation / 200})`;

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
              height: 8 + Math.random() * 6,
              width: 1 + Math.random() * 1,
              backgroundColor: rainColor,
              borderRadius: 1,
              opacity: rainOpacity,
              animation: `rain ${(2.0 - (precipitation / 100) * 1.2).toFixed(1)}s linear infinite`,
              animationDelay: randomDelay
            }}
            className="rain-drop"
          />
        );
      });
    } else {
      return [...Array(numRaindrops)].map((_, i) => {
        const dropProps = createRainDrop(i);
        return (
          <RainDrop 
            key={`rain-${i}`} 
            {...dropProps}
          />
        );
      });
    }
  };

  // -------------------------------------------------------------
  // Sun overlay (enhanced radial glow)
  // -------------------------------------------------------------
  const renderSunGlow = () => {
    if (!isSunny && !isPartlyCloudy) return null;
    
    // Base size that can be adjusted based on weather type
    let size = 320; // px
    let offset = -120; // shift up-left
    let intensity = 0.6; // Base intensity
    
    // Adjust intensity based on weather type - full sunny should be brightest
    if (isFullSunny) {
      intensity = 0.95; // Full sun is brightest
    } else if (isClear) {
      intensity = 0.9; // Clear is very bright
    } else if (isMostlySunny) {
      intensity = 0.8; // Mostly sunny is still bright
      size = 300; // Slightly smaller
    } else if (isPartlySunny) {
      intensity = 0.65; // Partly sunny is dimmer
      size = 280; // Smaller
    } else if (isPartlyCloudy) {
      intensity = 0.3; // Even dimmer for partly cloudy
      size = 260; // Even smaller
    }
    
    // Adjust for temperature
    const tempFactor = typeof shortForecast === 'string' && shortForecast.match(/\b(\d+)\b/);
    const temp = tempFactor ? parseInt(tempFactor[1], 10) : 50;
    
    // Increase intensity for high temperatures
    if (temp > 90) intensity *= 1.15;
    else if (temp > 80) intensity *= 1.1;
    else if (temp > 70) intensity *= 1.05;
    else if (temp < 40) intensity *= 0.9;
    
    // Yellow is more intense for warmer temps, white-yellow for cooler
    const yellowFactor = temp > 80 ? 0.9 : (temp > 70 ? 0.8 : 0.7);
    
    // Adjusting colors based on time of day and temperature
    let primaryColor, secondaryColor;
    if (isDark) {
      // Dark mode has more vibrant sun colors
      primaryColor = `rgba(253, ${224 + Math.min(31, Math.max(0, temp - 70))}, ${71 + Math.min(30, Math.max(0, temp - 80))}, ${intensity})`;
      secondaryColor = 'transparent';
    } else {
      // Light mode has softer colors
      primaryColor = `rgba(253, ${230 + Math.min(25, Math.max(0, temp - 70))}, ${138 + Math.min(30, Math.max(0, temp - 80))}, ${intensity})`;
      secondaryColor = 'transparent';
    }
    
    return (
      <LinearGradient
        key="sun-glow"
        colors={[primaryColor, secondaryColor]}
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
  // Lightning flash effect - much more subtle and realistic
  // -------------------------------------------------------------
  const flashOpacity = useSharedValue(0);

  useEffect(() => {
    if (isStorm) {
      // More realistic lightning timing - longer pauses, quicker flashes
      const pauseDuration = precipitation < 30 ? 12000 : precipitation < 50 ? 8000 : precipitation < 70 ? 5000 : 3000;

      flashOpacity.value = withRepeat(
        withSequence(
          // Quick double flash (common in real lightning)
          withTiming(0.15, { duration: 50 }), // First flash - much dimmer
          withTiming(0, { duration: 100 }),
          withTiming(0.25, { duration: 30 }), // Second flash - slightly brighter
          withTiming(0, { duration: 200 }),
          withTiming(0, { duration: pauseDuration }) // Long pause between strikes
        ),
        -1,
        false
      );
    } else {
      flashOpacity.value = withTiming(0, { duration: 100 });
    }
  }, [isStorm, precipitation, flashOpacity]);

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
            // Much more subtle lightning effect
            backgroundColor: isDark ? 'rgba(200,220,255,0.4)' : 'rgba(255,255,255,0.6)',
            pointerEvents: 'none',
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
      {hasHighWind && [...Array(hasVeryHighWind ? 6 : 4)].map((_, i) => (
        <WindStreak key={`wind-${i}`} index={i} />
      ))}
      {hasVeryHighWind && [...Array(3)].map((_, i) => (
        <WindDebris key={`debris-${i}`} index={i} />
      ))}
      {renderLightning()}
    </>
  );
};

export default WeatherCardAnimations;
