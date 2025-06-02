import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Text, YStack, XStack, isWeb } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '@/store';
import { isIpad } from '@/utils/deviceUtils';
import { baseSpacing, cardRadius, Colors } from './sharedStyles';

interface NonPremiumUserProps {
  colors: Colors;
  contentWidth: number;
  onSignUp: () => void;
}

export function NonPremiumUser({ colors, contentWidth, onSignUp }: NonPremiumUserProps) {
  const isDev = __DEV__;
  const setPreferences = useUserStore(state => state.setPreferences);
  
  const handleButtonPress = () => {
    if (isDev) {
      // In dev mode, just activate premium
      setPreferences({ premium: true });
    } else {
      // In production, go to sign up
      onSignUp();
    }
  };

  const isLarge = isWeb || isIpad();
  const isDark = __DEV__;
  const IMAGE_SIZE = isLarge ? 88 : 72;
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlipped(f => !f);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, { width: contentWidth }]}>
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: isWeb ? 'rgba(255, 255, 255, 0.75)' : 'rgba(86, 50, 18, 0.13)',
            borderColor: colors.accent + '22',
            shadowColor: colors.accent + '33',
          },
        ]}
      >
        {isWeb && (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { zIndex: 0 },
            ]}
            pointerEvents="none"
          />
        )}
        <View style={[styles.iconContainer, { backgroundColor: colors.accentBg, overflow: 'hidden' }]}>
          <Image
            source={require('../../assets/images/pog2.png')}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'cover',
              transform: [{ scaleX: flipped ? -1 : 1 }],
              borderRadius: 9999,
              borderWidth: 2,
              borderColor: colors.accent,
            }}
            accessibilityLabel="Pot of Greed"
          />
        </View>
        <Text 
          fontSize={isLarge ? 28 : 24} 
          fontWeight="800" 
          color={colors.text} 
          fontFamily="$body"
          textAlign="center"
          marginBottom={baseSpacing}
          style={styles.heading}
        >
          Unlock Cloud Sync
        </Text>
        <Text 
          fontSize={isLarge ? 16 : 15} 
          color={colors.subtext} 
          fontFamily="$body"
          textAlign="center"
          marginBottom={baseSpacing / 2}
          lineHeight={isLarge ? 24 : 22}
        >
          Effortlessly sync your data across all your devices{'\n'}with secure, premium cloud access.
        </Text>
        <YStack alignItems="center" marginBottom={baseSpacing * 2}>
          <XStack alignItems="center" gap={baseSpacing / 2}>
            <Text 
              fontSize={isLarge ? 18 : 16} 
              fontWeight="700" 
              color={colors.accent} 
              fontFamily="$body"
            >
              $4/month
            </Text>
          </XStack>
          <XStack alignItems="center" gap={baseSpacing / 2} marginTop={4}>
            <Text 
              fontSize={isLarge ? 13 : 12} 
              color={colors.subtext} 
              fontFamily="$body"
              fontWeight="600"
            >
              or
            </Text>
            <Text 
              fontSize={isLarge ? 16 : 15} 
              color={colors.accent} 
              fontFamily="$body"
              fontWeight="700"
              marginLeft={4}
            >
              $25/year
            </Text>
            <Text 
              fontSize={isLarge ? 12 : 11} 
              color={colors.subtext} 
              fontFamily="$body"
              marginLeft={2}
            >
              (save 48%)
            </Text>
          </XStack>
        </YStack>
        <TouchableOpacity
          onPress={handleButtonPress}
          style={styles.ctaButton}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={[colors.accent, colors.accent + 'DD']}
            style={styles.buttonGradient}
          >
            <XStack alignItems="center" gap={baseSpacing}>
              <Text 
                color="#333" 
                fontSize={isLarge ? 18 : 16} 
                fontWeight="700" 
                fontFamily="$body"
              >
                {isDev ? '🚀 Activate Premium (Dev)' : 'Get Premium Access'}
              </Text>
              <MaterialIcons 
                name={isDev ? "flash-on" : "arrow-forward"} 
                size={isLarge ? 20 : 18} 
                color="white" 
              />
            </XStack>
          </LinearGradient>
        </TouchableOpacity>
        <XStack 
          alignItems="center" 
          justifyContent="center" 
          gap={baseSpacing * 2} 
          marginTop={baseSpacing * 2}
        >
          <XStack alignItems="center" gap={baseSpacing / 2}>
            <MaterialIcons name="security" size={16} color={colors.subtext} />
            <Text fontSize={12} color={colors.subtext} fontFamily="$body">
              Secure
            </Text>
          </XStack>
          <XStack alignItems="center" gap={baseSpacing / 2}>
            <MaterialIcons name="cancel" size={16} color={colors.subtext} />
            <Text fontSize={12} color={colors.subtext} fontFamily="$body">
              Cancel anytime
            </Text>
          </XStack>
        </XStack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: isWeb ? baseSpacing * 5 : isIpad() ? baseSpacing * 4.5 : baseSpacing * 4,
    paddingHorizontal: isWeb ? baseSpacing * 4 : isIpad() ? baseSpacing * 3.5 : baseSpacing * 3,
  },
  heroCard: {
    borderRadius: cardRadius + 8,
    paddingVertical: isWeb ? baseSpacing * 5 : isIpad() ? baseSpacing * 4.5 : baseSpacing * 4,
    paddingHorizontal: isWeb ? baseSpacing * 4 : isIpad() ? baseSpacing * 3.5 : baseSpacing * 3,
    borderWidth: 1.5,
    alignItems: 'center',
    width: '100%',
    minHeight: isWeb ? 700 : isIpad() ? 600 : 400,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  iconContainer: {
    width: isWeb ? 120 : isIpad() ? 110 : 100,
    height: isWeb ? 120 : isIpad() ? 110 : 100,
    borderRadius: isWeb ? 60 : isIpad() ? 55 : 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: baseSpacing * 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  heading: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  ctaButton: {
    borderRadius: isWeb ? 16 : isIpad() ? 14 : 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
    maxWidth: isWeb ? 320 : isIpad() ? 280 : 260,
  },
  buttonGradient: {
    paddingHorizontal: isWeb ? baseSpacing * 3 : isIpad() ? baseSpacing * 2.5 : baseSpacing * 2,
    paddingVertical: isWeb ? baseSpacing * 2 : isIpad() ? baseSpacing * 1.8 : baseSpacing * 1.5,
    borderRadius: isWeb ? 16 : isIpad() ? 14 : 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 