import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
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
      console.log('🎉 Dev mode: Premium activated!');
    } else {
      // In production, go to sign up
      onSignUp();
    }
  };

  const isLarge = isWeb || isIpad();

  return (
    <View style={[styles.container, { width: contentWidth }]}>
      <LinearGradient
        colors={[colors.accent + '15', colors.accent + '05']}
        style={[styles.gradientCard, { borderColor: colors.accent + '30' }]}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
          <MaterialIcons 
            name="cloud-sync" 
            size={isLarge ? 64 : 56} 
            color={colors.accent} 
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
          Sync your data across all devices{'\n'}with premium access
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
            <Text 
              fontSize={isLarge ? 14 : 13} 
              color={colors.subtext} 
              fontFamily="$body"
            >
              • Unlimited devices
            </Text>
          </XStack>
        </YStack>
        <YStack gap={baseSpacing} marginBottom={baseSpacing * 3} alignItems="center">
          {[
            '🔄 Real-time sync across devices',
            '🔐 End-to-end encryption',
            '☁️ Secure cloud backup',
            '📱 Works on phone, tablet, web',
            '🔑 Only you can access your data',
            '🔍 You control which data syncs',
          ].map((feature, index) => (
            <XStack key={index} alignItems="center" gap={baseSpacing}>
              <Text 
                fontSize={isLarge ? 15 : 14} 
                color={colors.text} 
                fontFamily="$body"
                textAlign="center"
              >
                {feature}
              </Text>
            </XStack>
          ))}
        </YStack>
        <TouchableOpacity
          onPress={handleButtonPress}
          style={[
            styles.ctaButton, 
            { 
              backgroundColor: colors.accent,
              shadowColor: colors.accent,
            }
          ]}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.accent, colors.accent + 'DD']}
            style={styles.buttonGradient}
          >
            <XStack alignItems="center" gap={baseSpacing}>
              <Text 
                color="white" 
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
        {isDev && (
          <Text 
            fontSize={12} 
            color={colors.subtext} 
            fontFamily="$body"
            textAlign="center"
            marginTop={baseSpacing}
            fontStyle="italic"
          >
            Dev Mode: Button activates premium instantly
          </Text>
        )}
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
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
  },
  gradientCard: {
    borderRadius: cardRadius + 4,
    padding: isWeb ? baseSpacing * 4 : isIpad() ? baseSpacing * 3.5 : baseSpacing * 3,
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
    minHeight: isWeb ? 500 : isIpad() ? 450 : 400,
    justifyContent: 'center',
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