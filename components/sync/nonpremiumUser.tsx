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
              backgroundColor={isDark ? 'rgba(35, 38, 47, 0.95)' : 'rgba(247, 248, 250, 0.95)'} 
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
              backgroundColor: isDark ? 'rgba(35, 38, 47, 0.95)' : 'rgba(247, 248, 250, 0.95)', 
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
  const [flipped, setFlipped] = useState(false);

  // Use fake joining state in dev, real state in production
  const effectiveIsJoining = isDev ? devFakeJoining : isJoining;

  useEffect(() => {
    const interval = setInterval(() => {
      setFlipped(f => !f);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Better color scheme
  const cardBg = isWeb ? 'rgba(30, 35, 42, 0.95)' : colors.card;
  const tabBg = isWeb ? 'rgba(45, 52, 62, 0.8)' : colors.bg + '88';
  const featureBg = isWeb ? 'rgba(45, 52, 62, 0.6)' : colors.bg + '44';
  const infoBg = isWeb ? 'rgba(45, 52, 62, 0.6)' : colors.bg + '66';
  const inputBg = isWeb ? 'rgba(45, 52, 62, 0.8)' : colors.bg;

  return (
    <View style={[styles.container, { maxWidth: isWeb ? 600 : contentWidth }]}>
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: cardBg + '99',
            borderColor: colors.accent + '33',
            shadowColor: colors.accent + '44',
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

        {activeTab === 'premium' ? (
          <YStack alignItems="center" flex={1} justifyContent="center">
            <XStack alignItems="center" justifyContent="flex-start" gap={baseSpacing} >
            <View style={[styles.iconContainer, { backgroundColor: colors.accentBg }]}>
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

          </XStack>

            <YStack 
              style={[styles.featureList, { backgroundColor: featureBg }]}
              marginBottom={baseSpacing * 3}
            >
              <XStack alignItems="center" gap={baseSpacing}>
                <MaterialIcons name="sync" size={20} color={colors.accent} />
                <Text fontSize={14} color={colors.text} fontFamily="$body" fontWeight="600">
                  Unlimited devices
                </Text>
              </XStack>
              <XStack alignItems="center" gap={baseSpacing}>
                <MaterialIcons name="security" size={20} color={colors.accent} />
                <Text fontSize={14} color={colors.text} fontFamily="$body" fontWeight="600">
                  End-to-end encryption
                </Text>
              </XStack>
              <XStack alignItems="center" gap={baseSpacing}>
                <MaterialIcons name="backup" size={20} color={colors.accent} />
                <Text fontSize={14} color={colors.text} fontFamily="$body" fontWeight="600">
                  Automatic backups
                </Text>
              </XStack>
              <XStack alignItems="center" gap={baseSpacing}>
                <MaterialIcons name="attach-money" size={20} color={colors.accent} />
                <XStack alignItems="center" gap={4}>
                  <Text fontSize={14} color={colors.accent} fontFamily="$body" fontWeight="700">
                    ONLY $4/month
                  </Text>
                  <Text fontSize={12} color={colors.subtext} fontFamily="$body" fontWeight="600">
                    or $20/year (save 40%)
                  </Text>
                </XStack>
              </XStack>
              <XStack alignItems="center" gap={baseSpacing}>
                <MaterialIcons name="cancel" size={20} color={colors.accent} />
                <Text fontSize={14} color={colors.text} fontFamily="$body" fontWeight="600">
                  Cancel anytime
                </Text>
              </XStack>
            </YStack>
            <YStack 
              style={[styles.infoBox, { backgroundColor: infoBg }]}
              marginTop={baseSpacing }
            >
              <XStack alignItems="flex-start" gap={baseSpacing}>
                <MaterialIcons name="info" size={16} color={colors.accent} style={{ marginTop: 2 }} />
                <YStack flex={1} gap={6}>
                  <Text fontSize={12} color={colors.text} fontFamily="$body" fontWeight="600">
                    How it works:
                  </Text>
                  <YStack gap={4}>
                    <Text fontSize={11} color={colors.subtext} fontFamily="$body" lineHeight={16}>
                      • Add a Note on your iPhone? See the change when you open the app on your browser
                    </Text>
                    <Text fontSize={11} color={colors.subtext} fontFamily="$body" lineHeight={16}>
                      • Delete a Task on your Android? See the change when you open the app on your iPad
                    </Text>
                    <Text fontSize={11} color={colors.subtext} fontFamily="$body" lineHeight={16}>
                      • Perfect for spouses who want to sync their Bills
                    </Text>
                    <Text fontSize={11} color={colors.subtext} fontFamily="$body" lineHeight={16}>
                      • Don't want a specific feature to sync? Just disable it on the Sync screen!
                    </Text>
                  </YStack>
                </YStack>
              </XStack>
            </YStack>
            <Text 
              fontSize={isLarge ? 15 : 13} 
              color={colors.subtext} 
              fontFamily="$body"
              textAlign="center"
              marginVertical={baseSpacing * 2}
              lineHeight={isLarge ? 26 : 24}
            >
              Ready to sync your data across all your devices?
            </Text>
            <TouchableOpacity
              onPress={handlePremiumPress}
              style={styles.ctaButton}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={[colors.accent, colors.accent + 'DD', colors.accent + 'DD']}
                style={styles.buttonGradient}
              >
                <XStack alignItems="center" gap={baseSpacing}>
                  <Text 
                    color="#333" 
                    fontSize={isLarge ? 16 : 14} 
                    fontWeight="500" 
                    fontFamily="$body"
                  >
                    {isDev ? 'Activate Premium (Dev)' : 'Get Premium Access'}
                  </Text>
                  <MaterialIcons 
                    name={isDev ? "flash-on" : "arrow-forward"} 
                    size={isLarge ? 20 : 18} 
                    color="#333" 
                  />
                </XStack>
              </LinearGradient>
            </TouchableOpacity>

          </YStack>
        ) : (
          <YStack alignItems="center" flex={1} justifyContent="center" marginTop={baseSpacing * 2}>
            <MaterialIcons 
              name="group-add" 
              size={isLarge ? 80 : 64} 
              color={colors.accent} 
              style={{ marginBottom: baseSpacing * 2 }}
            />

            <Text 
              fontSize={isLarge ? 28 : 22} 
              fontWeight="800" 
              color={colors.text} 
              fontFamily="$body"
              textAlign="center"
              marginBottom={baseSpacing}
            >
              Join Workspace
            </Text>

            <Text 
              fontSize={isLarge ? 16 : 14} 
              color={colors.subtext} 
              fontFamily="$body"
              textAlign="center"
              marginBottom={baseSpacing * 3}
              maxWidth={isLarge ? 400 : 300}
            >
              Enter the workspace code shared by a premium user to join their workspace and sync your data.
            </Text>

            <YStack width="100%" maxWidth={isLarge ? 400 : 250} gap={baseSpacing * 2}>
              <YStack gap={baseSpacing}>

                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: inputBg,
                      borderColor: workspaceCode ? colors.accent : colors.border,
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
              </YStack>

              <TouchableOpacity
                onPress={handleJoinWorkspace}
                style={[
                  styles.ctaButton2,
                  { opacity: !workspaceCode.trim() || effectiveIsJoining ? 0.5 : 1, maxWidth: undefined }
                ]}
                activeOpacity={0.88}
                disabled={!workspaceCode.trim() || effectiveIsJoining}
              >
                <LinearGradient
                  colors={[colors.accent, colors.accent + 'DD']}
                  style={styles.buttonGradient}
                >
                  <XStack alignItems="center" gap={baseSpacing}>
                    {effectiveIsJoining ? (
                      <MaterialIcons name="hourglass-empty" size={18} color="white" />
                    ) : (
                      <MaterialIcons name="group-add" size={18} color="white" />
                    )}
                    <Text 
                      color={colors.gray} 
                      fontSize={isLarge ? 15 : 13} 
                      fontWeight="500" 
                      fontFamily="$body"
                    >
                      {effectiveIsJoining ? 'Joining...' : 'Join Workspace'}
                    </Text>
                  </XStack>
                </LinearGradient>
              </TouchableOpacity>
            </YStack>
          </YStack>
        )}

        <XStack 
          style={[styles.tabContainer, { backgroundColor: tabBg }]}
          marginTop={baseSpacing * 3}
          paddingBottom={8}
        >
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'premium' && { backgroundColor: tabBg, paddingBottom: 8 }
            ]}
            onPress={() => setActiveTab('premium')}
          >
            <MaterialIcons 
              name="star" 
              size={16} 
              color={activeTab === 'premium' ? colors.accent : colors.subtext} 
            />
            <Text 
              fontSize={14} 
              fontWeight={activeTab === 'premium' ? '700' : '500'}
              color={activeTab === 'premium' ? colors.accent : colors.subtext}
              fontFamily="$body"
            >
              Get Premium
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'join' && { backgroundColor: tabBg }
            ]}
            onPress={() => setActiveTab('join')}
          >
            <MaterialIcons 
              name="group-add" 
              size={16} 
              color={activeTab === 'join' ? colors.accent : colors.subtext} 
            />
            <Text 
              fontSize={14} 
              fontWeight={activeTab === 'join' ? '700' : '500'}
              color={activeTab === 'join' ? colors.accent : colors.subtext}
              fontFamily="$body"
            >
              Join Workspace
            </Text>
          </TouchableOpacity>
        </XStack>
      </View>
      
      {effectiveIsJoining && <JoiningOverlay colors={colors} isDark={!isWeb} onDevToggle={isDev ? () => setDevFakeJoining(false) : undefined} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: isWeb ? baseSpacing * 2 : isIpad() ? baseSpacing * 2.5 : baseSpacing,
    paddingHorizontal: isWeb ? baseSpacing : isIpad() ? baseSpacing * 1.5 : baseSpacing,
    width: '100%',
  },
  heroCard: {
    borderRadius: cardRadius,
    paddingBottom: 0,
    paddingHorizontal: isWeb ? baseSpacing * 2.5 : 0,
    borderWidth: 1,
    alignItems: 'stretch',
    width: '100%',
    minHeight: isWeb ? 500 : isIpad() ? 500 : 450,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: cardRadius,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: baseSpacing *2,
    paddingHorizontal: baseSpacing * 1.5,
    borderRadius: cardRadius,
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: isWeb ? 90 : isIpad() ? 90 : 80,
    height: isWeb ? 90 : isIpad() ? 90 : 80,
    borderRadius: isWeb ? 45 : isIpad() ? 45 : 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: baseSpacing * 2,
    shadowOffset: { width: 0, height: 2 },
    marginTop: baseSpacing * 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  featureList: {
    padding: baseSpacing * 1.5,
    borderRadius: cardRadius,
    gap: baseSpacing,
    width: '100%',
    maxWidth: isWeb ? 350 : 320,
  },
  ctaButton: {
    borderRadius: cardRadius,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    width: '100%',
    maxWidth: isWeb ? 350 : 250,
  },
  ctaButton2: {
    borderRadius: cardRadius,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    width: '100%',
    maxWidth: isWeb ? 400 : 320,
  },
  buttonGradient: {
    paddingHorizontal: baseSpacing * 2,
    paddingVertical: baseSpacing * 1.5,
    borderRadius: cardRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 2,
    borderRadius: cardRadius,

    paddingVertical: baseSpacing * 1.25,
    fontSize: isWeb ? 16 : 14,
    fontFamily: 'System',
    fontWeight: '500',
    textAlign: 'center',

  },
  infoBox: {
    padding: baseSpacing * 1.5,
    borderRadius: cardRadius,
    width: '100%',
    maxWidth: isWeb ? 350 : 320,
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