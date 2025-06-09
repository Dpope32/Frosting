import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, TextInput, ActivityIndicator } from 'react-native';
import { Text, YStack, XStack, isWeb } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore, useToastStore, useRegistryStore } from '@/store';
import { isIpad } from '@/utils/deviceUtils';
import { baseSpacing, cardRadius, Colors } from './sharedStyles';
import { startPremiumPurchase } from '@/services/premiumService';
import { addSyncLog } from './syncUtils';
import { createOrJoinWorkspace } from '@/sync';

interface NonPremiumUserProps {
  colors: Colors;
  contentWidth: number;
  onSignUp: () => void;
  onJoinWorkspace?: (code: string) => void;
}

export function NonPremiumUser({ colors, contentWidth, onSignUp, onJoinWorkspace }: NonPremiumUserProps) {
  const isDev = __DEV__;
  const setPreferences = useUserStore(state => state.setPreferences);
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [showInviteInput, setShowInviteInput] = useState(false);
  
  const handleJoinWorkspace = async () => {
    if (!inviteCode.trim()) {
      useToastStore.getState().showToast('Please enter an invite code', 'error');
      return;
    }

    setIsJoining(true);
    const code = inviteCode.trim();
    addSyncLog(`🔌 Non-premium user attempting to join via ${code.slice(0, 8)}…`, 'info');

    try {
      const result = await createOrJoinWorkspace(undefined, code);
      
      // Set premium and workspace
      setPreferences({ premium: true });
      useRegistryStore.getState().setWorkspaceId(result.id);
      
      addSyncLog(`✅ Joined workspace ${result.id.slice(0, 8)} - premium activated`, 'success');
      useToastStore.getState().showToast('Successfully joined workspace!', 'success');
      
    } catch (error) {
      console.error('Failed to join workspace:', error);
      addSyncLog('Failed to join workspace', 'error',
        error instanceof Error ? error.message : String(error));
      useToastStore.getState().showToast('Invalid invite code', 'error');
    } finally {
      setIsJoining(false);
    }
  };
  
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
    <View style={[styles.container, { width: contentWidth }]}>
      {isJoining && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text 
            fontSize={16} 
            color={colors.text} 
            fontFamily="$body"
            marginTop={baseSpacing}
          >
            Joining workspace...
          </Text>
        </View>
      )}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: isWeb ? 'rgba(255, 255, 255, 0.75)' : 'rgba(58, 86, 18, 0.13)',
            borderColor: colors.accent + '22',
            shadowColor: colors.accent + '33',
            opacity: isJoining ? 0.3 : 1,
          },
        ]}
      >
        <XStack 
          style={[styles.tabContainer, { backgroundColor: tabBg }]}
          marginBottom={baseSpacing * 2}
        >
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'premium' && { backgroundColor: colors.accent + '22' }
            ]}
            onPress={() => setActiveTab('premium')}
          >
            <MaterialIcons 
              name="star" 
              size={16} 
              color={activeTab === 'premium' ? '#000' : colors.subtext} 
            />
            <Text 
              fontSize={14} 
              fontWeight={activeTab === 'premium' ? '700' : '500'}
              color={activeTab === 'premium' ? '#000' : colors.subtext}
              fontFamily="$body"
            >
              Get Premium
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
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
          Premium
        </Text>
        <Text 
          fontSize={isLarge ? 14 : 13} 
          color={colors.subtext} 
          fontFamily="$body"
          textAlign="center"
          marginBottom={baseSpacing / 2}
          lineHeight={isLarge ? 24 : 22}
        >
          Ready to sync your data across all your devices?
        </Text>
        <XStack>
          <Text fontSize={12} color={colors.subtext2} fontFamily="$body">
            All data is encrypted and decrypted on your device! When syncing, multiple devices share the same key.
          </Text>
          </XStack>
        <YStack alignItems="flex-start" marginVertical={baseSpacing * 2}>
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
        <XStack alignItems="center" marginTop={baseSpacing * 2} >
          </XStack>
          <XStack paddingHorizontal={baseSpacing} alignItems="center" gap={baseSpacing / 2} marginTop={2}>
          <Text 
              fontSize={isLarge ? 12 : 11} 
              fontWeight="700" 
              color={colors.accent} 
              fontFamily="$body"
            >
              ONLY $4/month
            </Text>
            <Text 
              fontSize={isLarge ? 11 : 10} 
              color={colors.subtext} 
              fontFamily="$body"
              fontWeight="600"
            >
              or
            </Text>
            <Text  
              fontSize={isLarge ? 11 : 10} 
              color={colors.accent} 
              fontFamily="$body"
              fontWeight="700"
              marginLeft={4}
            >
              $25/year
            </Text>
          </XStack>
        </YStack>
        
        {/* Subtle invite code section */}
        <TouchableOpacity 
          onPress={() => setShowInviteInput(!showInviteInput)}
          style={styles.inviteToggle}
          activeOpacity={0.7}
        >
          <XStack alignItems="center" gap={baseSpacing / 2}>
            <MaterialIcons 
              name="group-add" 
              size={14} 
              color={colors.subtext} 
            />
            <Text 
              fontSize={11} 
              color={colors.subtext} 
              fontFamily="$body"
              fontWeight="600"
            >
              Have an invite code?
            </Text>
            <MaterialIcons 
              name={showInviteInput ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={16} 
              color={colors.subtext} 
            />
          </XStack>
        </TouchableOpacity>

        {showInviteInput && (
          <YStack gap={baseSpacing} marginTop={baseSpacing} alignItems="center">
            <TextInput
              style={[
                styles.inviteInput,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                }
              ]}
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="Enter invite code"
              placeholderTextColor={colors.subtext}
              autoCapitalize="none"
              editable={!isJoining}
            />
            <TouchableOpacity
              onPress={handleJoinWorkspace}
              style={[
                styles.joinButton,
                { 
                  backgroundColor: colors.accentBg,
                  borderColor: colors.accent,
                  opacity: !inviteCode.trim() || isJoining ? 0.5 : 1,
                }
              ]}
              disabled={!inviteCode.trim() || isJoining}
              activeOpacity={0.8}
            >
              <Text 
                fontSize={12} 
                color={colors.text} 
                fontFamily="$body"
                fontWeight="600"
              >
                Join Workspace
              </Text>
            </TouchableOpacity>
          </YStack>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: isWeb ? baseSpacing * 2 : isIpad() ? baseSpacing * 2.5 : baseSpacing * 2,
    paddingHorizontal: isWeb ? baseSpacing : isIpad() ? baseSpacing * 1.5 : baseSpacing,
    width: '100%',
  },
  heroCard: {
    borderRadius: cardRadius + 4,
    paddingVertical: isWeb ? baseSpacing * 3 : isIpad() ? baseSpacing * 3.5 : baseSpacing * 3,
    paddingHorizontal: isWeb ? baseSpacing * 2.5 : isIpad() ? baseSpacing * 2.5 : baseSpacing * 2,
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
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: baseSpacing,
    paddingHorizontal: baseSpacing * 1.5,
    borderRadius: cardRadius - 4,
  },
  iconContainer: {
    width: isWeb ? 90 : isIpad() ? 90 : 80,
    height: isWeb ? 90 : isIpad() ? 90 : 80,
    borderRadius: isWeb ? 45 : isIpad() ? 45 : 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: baseSpacing * 2,
    shadowOffset: { width: 0, height: 2 },
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
    maxWidth: isWeb ? 350 : 320,
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  inviteToggle: {
    alignSelf: 'center',
    paddingVertical: baseSpacing,
    paddingHorizontal: baseSpacing * 1.5,
    borderRadius: 8,
  },
  inviteInput: {
    width: '100%',
    maxWidth: isWeb ? 280 : isIpad() ? 240 : 220,
    paddingVertical: baseSpacing,
    paddingHorizontal: baseSpacing * 1.5,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
  },
  joinButton: {
    paddingVertical: baseSpacing,
    paddingHorizontal: baseSpacing * 2,
    borderRadius: 8,
    borderWidth: 1,
  },
}); 