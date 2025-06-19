import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, TextInput, Platform, Animated, Modal } from 'react-native';
import { Text, YStack, XStack, isWeb, Stack, Spinner } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '@/store';
import { isIpad } from '@/utils/deviceUtils';
import { baseSpacing, cardRadius, Colors } from './sharedStyles';
import { startPremiumPurchase } from '@/services/premiumService';
import { addSyncLog } from './syncUtils';

// Conditional BlurView import to prevent crashes
let BlurView: any = null;
try {
  if (Platform.OS !== 'web') {
    BlurView = require('expo-blur').BlurView;
  }
} catch (error) {
  console.warn('BlurView not available:', error);
}

interface NonPremiumUserProps {
  colors: Colors;
  contentWidth: number;
  onSignUp: () => void;
  onJoinWorkspace?: (code: string) => void;
}

const JoiningOverlay = ({ colors, isDark, onDevToggle }: { colors: Colors; isDark: boolean; onDevToggle?: () => void }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [dots, setDots] = useState('');
  const isComponentMounted = useRef(true);

  const isIpadDevice = !!isIpad(); 
  const safeWidth = isIpadDevice ? 400 : 350;
  const safeMaxWidth = isIpadDevice ? 400 : 350;

  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  // Fade in animation
  useEffect(() => {
    const animation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    });
    animation.start();
    return () => {
      animation.stop();
    };
  }, [fadeAnim]);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isComponentMounted.current) return;
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const animatedViewStyle = useMemo(() => ({
    opacity: fadeAnim,
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center' as 'center',
    alignItems: 'center' as 'center',
    zIndex: 99999,
  }), [fadeAnim]);

  const backgroundColor = isDark ? "rgba(14, 14, 15, 0.75)" : "rgba(0, 0, 0, 0.35)";

  const ContentComponent = () => {
    return (
      <XStack alignItems="center" justifyContent="center" gap="$3" paddingVertical="$2">
        <Spinner 
          size="large" 
          color={colors.accent}
          opacity={0.9}
        />
        
        <YStack alignItems="center" gap="$1">
          <Text 
            fontFamily="$body"
            fontSize={isWeb ? 16 : 14}
            fontWeight="600"
            color="$color"
            opacity={0.9}
          >
            Joining workspace{dots}
          </Text>
          <Text
            fontFamily="$body"
            fontSize={isWeb ? 13 : 11}
            color="$color"
            opacity={0.7}
          >
            This may take up to 2 minutes to sync all your data
          </Text>
        </YStack>
      </XStack>
    );
  };

  return (
    <Modal visible={true} transparent animationType="none" statusBarTranslucent supportedOrientations={['portrait', 'landscape']}>
      <Animated.View style={animatedViewStyle}>
        {onDevToggle && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: baseSpacing * 19.5,
              right: baseSpacing * 4.5,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#ff6b6b',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#ff6b6b',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
              zIndex: 1000,
            }}
            onPress={onDevToggle}
            activeOpacity={0.8}
          >
            <MaterialIcons 
              name="pause" 
              size={16} 
              color="white" 
            />
          </TouchableOpacity>
        )}
        
        {Platform.OS === 'web' || !BlurView ? (
          <Stack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            justifyContent="center"
            alignItems="center"
            style={{ 
              backdropFilter: 'blur(20px)', 
              backgroundColor: backgroundColor,
            }}
          >
            <Stack    
              backgroundColor={backgroundColor} 
              borderRadius={16} 
              padding="$3" 
              borderColor={isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.1)"} 
              borderWidth={1}
              style={{ 
                boxShadow: isDark 
                  ? '0px 4px 24px rgba(0, 0, 0, 0.45), inset 0px 0px 1px rgba(255, 255, 255, 0.12)' 
                  : '0px 4px 24px rgba(0, 0, 0, 0.15), inset 0px 0px 1px rgba(255, 255, 255, 0.2)',
                width: safeWidth,
                maxWidth: safeMaxWidth,
              }}
            >
              <ContentComponent />
            </Stack>
          </Stack>
        ) : (
          <BlurView 
            intensity={Platform.OS === 'ios' ? 80 : 120} 
            tint={isDark ? 'dark' : 'light'} 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View style={{
                backgroundColor: backgroundColor,
                padding: 12, 
              borderRadius: 16,
              borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.1)",
              borderWidth: 1,
              shadowColor: isDark ? "#000" : "rgba(0, 0, 0, 0.15)", 
              shadowOffset: { width: 0, height: 4 }, 
              shadowOpacity: 0.35,  
              shadowRadius: 12,
              elevation: 5, 
              width: safeWidth, 
              maxWidth: safeMaxWidth, 
            }}>
              <ContentComponent />
            </View>
          </BlurView>
        )}
      </Animated.View>
    </Modal>
  );
};

export function NonPremiumUser({ colors, contentWidth, onSignUp, onJoinWorkspace }: NonPremiumUserProps) {
  const isDev = __DEV__;
  const setPreferences = useUserStore(state => state.setPreferences);
  const [activeTab, setActiveTab] = useState<'premium' | 'join'>('premium');
  const [workspaceCode, setWorkspaceCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [devFakeJoining, setDevFakeJoining] = useState(false);

  const handlePremiumPress = async () => {
    if (isDev) {
      setPreferences({ premium: true });
    } else {
      try {
        addSyncLog('🛒 Starting premium purchase flow', 'info');
        await startPremiumPurchase();
        addSyncLog('✅ Purchase tracking started, redirecting to LemonSqueezy', 'info');
        onSignUp();
      } catch (error) {
        addSyncLog(`❌ Error starting purchase tracking: ${error instanceof Error ? error.message : String(error)}`, 'error');
        // Still proceed to sign up even if tracking fails
        onSignUp();
      }
    }
  };

  const handleJoinWorkspace = async () => {
    if (!workspaceCode.trim()) return;

    setIsJoining(true);
    try {
      addSyncLog(`🔗 Attempting to join workspace with code: ${workspaceCode}`, 'info');
      if (onJoinWorkspace) {
        await onJoinWorkspace(workspaceCode.trim());
      }
    } catch (error) {
      addSyncLog(`❌ Error joining workspace: ${error instanceof Error ? error.message : String(error)}`, 'error');
    } finally {
      setIsJoining(false);
    }
  };

  const isLarge = isWeb || isIpad();
  const isDark = colors.bg === '#000000' || colors.bg === '#1a1a1a' || colors.bg.includes('rgba(0, 0, 0');

  // Use fake joining state in dev, real state in production
  const effectiveIsJoining = isDev ? devFakeJoining : isJoining;

  // Modern color scheme that works well on all platforms
  const modernColors = {
    cardBg: colors.card,
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    tabBg: colors.bg,
    tabActiveBg: colors.card,
    featureBg: colors.bg,
    inputBg: colors.bg,
    shadow: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.08)',
  };

  return (
    <View style={[styles.container, { maxWidth: isWeb ? 520 : contentWidth }]}>
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: modernColors.cardBg,
            borderColor: modernColors.cardBorder,
            shadowColor: modernColors.shadow,
          },
        ]}
      >
        {/* Dev-only joining toggle button */}
        {isDev && (
          <TouchableOpacity
            style={[
              styles.devToggle,
              {
                backgroundColor: devFakeJoining ? '#ff6b6b' : '#51cf66',
                shadowColor: devFakeJoining ? '#ff6b6b' : '#51cf66',
              }
            ]}
            onPress={() => setDevFakeJoining(!devFakeJoining)}
            activeOpacity={0.8}
          >
            <MaterialIcons 
              name={devFakeJoining ? 'pause' : 'play-arrow'} 
              size={16} 
              color="white" 
            />
          </TouchableOpacity>
        )}

        {/* Tab Navigation */}
        <XStack 
          style={[styles.tabContainer, { backgroundColor: modernColors.tabBg }]}
          marginBottom={baseSpacing * 2}
        >
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'premium' && { backgroundColor: modernColors.tabActiveBg }
            ]}
            onPress={() => setActiveTab('premium')}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name="star" 
              size={18} 
              color={activeTab === 'premium' ? colors.accent : colors.subtext} 
            />
            <Text 
              fontSize={isLarge ? 15 : 14} 
              fontWeight={activeTab === 'premium' ? '600' : '500'}
              color={activeTab === 'premium' ? colors.accent : colors.subtext}
              fontFamily="$body"
            >
              Get Premium
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'join' && { backgroundColor: modernColors.tabActiveBg }
            ]}
            onPress={() => setActiveTab('join')}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name="group-add" 
              size={18} 
              color={activeTab === 'join' ? colors.accent : colors.subtext} 
            />
            <Text 
              fontSize={isLarge ? 15 : 14} 
              fontWeight={activeTab === 'join' ? '600' : '500'}
              color={activeTab === 'join' ? colors.accent : colors.subtext}
              fontFamily="$body"
            >
              Join Workspace
            </Text>
          </TouchableOpacity>
        </XStack>

        {activeTab === 'premium' ? (
          <YStack flex={1} paddingHorizontal={baseSpacing * 1.5}>
            {/* Hero Section */}
            <YStack alignItems="center" marginBottom={baseSpacing * 3}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                <MaterialIcons name="sync" size={isLarge ? 42 : 36} color={colors.accent} />
              </View>
              
              <Text 
                fontSize={isLarge ? 28 : 24} 
                fontWeight="700" 
                color={colors.text} 
                fontFamily="$body"
                textAlign="center"
                marginBottom={baseSpacing}
              >
                Sync Everywhere
              </Text>
              
              <Text 
                fontSize={isLarge ? 16 : 15} 
                color={colors.subtext} 
                fontFamily="$body"
                textAlign="center"
                lineHeight={isLarge ? 24 : 22}
                maxWidth={isLarge ? 380 : 300}
              >
                Keep your notes, tasks, and data perfectly synchronized across all your devices
              </Text>
            </YStack>

            {/* Features Grid */}
            <YStack 
              style={[styles.featuresContainer, { backgroundColor: modernColors.featureBg }]}
              marginBottom={baseSpacing * 3}
            >
              <XStack style={styles.featureRow}>
                <YStack style={styles.feature}>
                  <MaterialIcons name="devices" size={24} color={colors.accent} />
                  <Text fontSize={13} color={colors.text} fontFamily="$body" fontWeight="600" textAlign="center">
                    Unlimited Devices
                  </Text>
                </YStack>
                <YStack style={styles.feature}>
                  <MaterialIcons name="security" size={24} color={colors.accent} />
                  <Text fontSize={13} color={colors.text} fontFamily="$body" fontWeight="600" textAlign="center">
                    E2E Encryption
                  </Text>
                </YStack>
              </XStack>
              
              <XStack style={styles.featureRow}>
                <YStack style={styles.feature}>
                  <MaterialIcons name="backup" size={24} color={colors.accent} />
                  <Text fontSize={13} color={colors.text} fontFamily="$body" fontWeight="600" textAlign="center">
                    Auto Backup
                  </Text>
                </YStack>
                <YStack style={styles.feature}>
                  <MaterialIcons name="cancel" size={24} color={colors.accent} />
                  <Text fontSize={13} color={colors.text} fontFamily="$body" fontWeight="600" textAlign="center">
                    Cancel Anytime
                  </Text>
                </YStack>
              </XStack>
            </YStack>

            {/* Pricing */}
            <YStack alignItems="center" marginBottom={baseSpacing * 3}>
              <XStack alignItems="baseline" gap={8} marginBottom={baseSpacing}>
                <Text 
                  fontSize={isLarge ? 32 : 28} 
                  fontWeight="800" 
                  color={colors.accent} 
                  fontFamily="$body"
                >
                  $4
                </Text>
                <Text 
                  fontSize={isLarge ? 18 : 16} 
                  color={colors.subtext} 
                  fontFamily="$body"
                  fontWeight="500"
                >
                  /month
                </Text>
              </XStack>
              
              <Text 
                fontSize={isLarge ? 15 : 14} 
                color={colors.accent} 
                fontFamily="$body"
                fontWeight="600"
                textAlign="center"
              >
                or $20/year (save 40%)
              </Text>
            </YStack>

            {/* CTA Button */}
            <TouchableOpacity
              onPress={handlePremiumPress}
              style={[styles.ctaButton, { shadowColor: colors.accent + '40' }]}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.accent, colors.accent + 'E6']}
                style={styles.buttonGradient}
              >
                <XStack alignItems="center" gap={baseSpacing}>
                  <Text 
                    color="white" 
                    fontSize={isLarge ? 17 : 16} 
                    fontWeight="600" 
                    fontFamily="$body"
                  >
                    {isDev ? 'Activate Premium (Dev)' : 'Start Free Trial'}
                  </Text>
                  <MaterialIcons 
                    name={isDev ? "flash-on" : "arrow-forward"} 
                    size={isLarge ? 20 : 18} 
                    color="white" 
                  />
                </XStack>
              </LinearGradient>
            </TouchableOpacity>
          </YStack>
        ) : (
          <YStack flex={1} paddingHorizontal={baseSpacing * 2}>
            {/* Join Workspace Content */}
            <YStack alignItems="center" marginBottom={baseSpacing * 3}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                <MaterialIcons name="group-add" size={isLarge ? 42 : 36} color={colors.accent} />
              </View>
              
              <Text 
                fontSize={isLarge ? 26 : 22} 
                fontWeight="700" 
                color={colors.text} 
                fontFamily="$body"
                textAlign="center"
                marginBottom={baseSpacing}
              >
                Join Workspace
              </Text>
              
              <Text 
                fontSize={isLarge ? 16 : 15} 
                color={colors.subtext} 
                fontFamily="$body"
                textAlign="center"
                lineHeight={isLarge ? 24 : 22}
                maxWidth={isLarge ? 360 : 280}
              >
                Enter a workspace code from a premium user to sync your data together
              </Text>
            </YStack>

            {/* Input Section */}
            <YStack gap={baseSpacing * 2} marginBottom={baseSpacing * 3}>
              <TextInput
                style={[
                  styles.workspaceInput,
                  {
                    backgroundColor: modernColors.inputBg,
                    borderColor: workspaceCode ? colors.accent : modernColors.cardBorder,
                    color: colors.text,
                  }
                ]}
                value={workspaceCode}
                onChangeText={setWorkspaceCode}
                placeholder="Enter workspace code..."
                placeholderTextColor={colors.subtext}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={20}
              />

              <TouchableOpacity
                onPress={handleJoinWorkspace}
                style={[
                  styles.joinButton,
                  { 
                    backgroundColor: workspaceCode.trim() && !effectiveIsJoining ? colors.accent : modernColors.inputBg,
                    opacity: !workspaceCode.trim() || effectiveIsJoining ? 0.6 : 1,
                    shadowColor: colors.accent + '40',
                  }
                ]}
                activeOpacity={0.85}
                disabled={!workspaceCode.trim() || effectiveIsJoining}
              >
                <XStack alignItems="center" gap={baseSpacing}>
                  {effectiveIsJoining ? (
                    <MaterialIcons name="hourglass-empty" size={20} color="white" />
                  ) : (
                    <MaterialIcons name="group-add" size={20} color={workspaceCode.trim() ? "white" : colors.subtext} />
                  )}
                  <Text 
                    color={workspaceCode.trim() && !effectiveIsJoining ? "white" : colors.subtext} 
                    fontSize={isLarge ? 17 : 16} 
                    fontWeight="600" 
                    fontFamily="$body"
                  >
                    {effectiveIsJoining ? 'Joining...' : 'Join Workspace'}
                  </Text>
                </XStack>
              </TouchableOpacity>
            </YStack>
          </YStack>
        )}
      </View>
      
      {effectiveIsJoining && <JoiningOverlay colors={colors} isDark={isDark} onDevToggle={isDev ? () => setDevFakeJoining(false) : undefined} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: isWeb ? baseSpacing * 1.5 : baseSpacing,
    paddingHorizontal: isWeb ? baseSpacing : baseSpacing,
    width: '100%',
  },
  heroCard: {
    borderRadius: isWeb ? 20 : 16,
    padding: baseSpacing * 2,
    borderWidth: 1,
    alignItems: 'stretch',
    width: '100%',
    minHeight: isWeb ? 480 : isIpad() ? 460 : 420,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: baseSpacing * 1.2,
    paddingHorizontal: baseSpacing,
    borderRadius: 8,
  },
  iconContainer: {
    width: isWeb ? 80 : 72,
    height: isWeb ? 80 : 72,
    borderRadius: isWeb ? 40 : 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: baseSpacing * 1.5,
  },
  featuresContainer: {
    padding: baseSpacing * 2,
    borderRadius: 16,
    gap: baseSpacing * 1.5,
  },
  featureRow: {
    justifyContent: 'space-around',
    gap: baseSpacing * 2,
  },
  feature: {
    alignItems: 'center',
    gap: baseSpacing * 0.8,
    flex: 1,
  },
  ctaButton: {
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    paddingHorizontal: baseSpacing * 2,
    paddingVertical: baseSpacing * 1.8,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceInput: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: baseSpacing * 1.5,
    paddingHorizontal: baseSpacing * 1.5,
    fontSize: isWeb ? 16 : 15,
    fontFamily: 'System',
    fontWeight: '500',
    textAlign: 'center',
  },
  joinButton: {
    paddingVertical: baseSpacing * 1.8,
    paddingHorizontal: baseSpacing * 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  devToggle: {
    position: 'absolute',
    top: baseSpacing,
    right: baseSpacing,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
});