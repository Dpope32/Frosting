import React, { useState, useEffect } from 'react';
import { TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, YStack, XStack } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BaseCardAnimated } from '@/components/baseModals/BaseCardAnimated';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/UserStore';
import { useToastStore } from '@/store/ToastStore';
import { TextInput } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { generateSyncKey } from '@/sync/registrySyncManager';
import { createOrJoinWorkspace, getCurrentWorkspaceId } from '@/sync/pocketSync';
import { addSyncLog } from '@/components/sync/syncUtils';
import { baseSpacing, fontSizes, cardRadius, buttonRadius, getColors } from '@/components/sync/sharedStyles';

type AddDeviceModalProps = {
  onClose: () => void;
  currentWorkspaceId?: string | null;
  onWorkspaceCreated?: (id: string, inviteCode: string) => void;
  onWorkspaceJoined?: (id: string) => void;
};

export default function AddDeviceModal({ 
  onClose, 
  currentWorkspaceId, 
  onWorkspaceCreated, 
  onWorkspaceJoined 
}: AddDeviceModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const [isLoading, setIsLoading] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(currentWorkspaceId || null);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [inputInviteCode, setInputInviteCode] = useState<string>('');
  const [inputWorkspaceId, setInputWorkspaceId] = useState<string>('');
  const [modalStep, setModalStep] = useState<'choose' | 'creating' | 'showCode' | 'joining' | 'connected'>('choose');
  const { width } = useWindowDimensions();
  const colors = getColors(isDark, primaryColor);
  const contentWidth = Math.min(width - baseSpacing * 2, 420);

  // Check if already in a workspace on mount
  useEffect(() => {
    const checkWorkspace = async () => {
      const id = await getCurrentWorkspaceId();
      if (id) {
        setWorkspaceId(id);
        if (modalStep === 'choose') {
          setModalStep('connected');
        }
      }
    };
    
    checkWorkspace();
  }, []);

  const handleCreateWorkspace = async () => {
    setModalStep('creating');
    try {
      setIsLoading(true);
      addSyncLog('Creating new sync workspace...', 'info');
      
      // Create a new workspace
      const result = await createOrJoinWorkspace();
      
      setWorkspaceId(result.id);
      setInviteCode(result.inviteCode);
      
      if (onWorkspaceCreated) {
        onWorkspaceCreated(result.id, result.inviteCode);
      }
      
      addSyncLog(`Workspace created with ID: ${result.id.substring(0, 8)}`, 'success');
      useToastStore.getState().showToast('Your workspace is ready!', 'success');
      setModalStep('showCode');
    } catch (error) {
      console.error('Error creating workspace:', error);
      addSyncLog('Failed to create workspace', 'error', 
        error instanceof Error ? error.message : String(error));
      useToastStore.getState().showToast('Failed to create workspace', 'error');
      setModalStep('choose');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinWorkspace = () => {
    setModalStep('joining');
  };

  const connectToWorkspace = async () => {
    if (!inputWorkspaceId.trim() || !inputInviteCode.trim()) {
      useToastStore.getState().showToast('Please enter both workspace ID and invite code', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      addSyncLog('Joining existing workspace...', 'info');
      
      // Join an existing workspace
      const result = await createOrJoinWorkspace(
        inputWorkspaceId.trim(), 
        inputInviteCode.trim()
      );
      
      setWorkspaceId(result.id);
      
      if (onWorkspaceJoined) {
        onWorkspaceJoined(result.id);
      }
      
      addSyncLog(`Joined workspace: ${result.id.substring(0, 8)}`, 'success');
      useToastStore.getState().showToast('Successfully joined workspace', 'success');
      setModalStep('connected');
    } catch (error) {
      console.error('Failed to join workspace:', error);
      addSyncLog('Failed to join workspace', 'error',
        error instanceof Error ? error.message : String(error));
      useToastStore.getState().showToast('Failed to join workspace', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseCardAnimated
      title={
        modalStep === 'connected' ? 'Sync Workspace' : 
        modalStep === 'showCode' ? 'Share Workspace' :
        modalStep === 'joining' ? 'Join Workspace' :
        'Sync Setup'
      }
      onClose={onClose}
    >
      <YStack gap={baseSpacing * 2} padding={baseSpacing}>
        {modalStep === 'choose' && (
          <>
            <Text color={colors.subtext} fontSize={fontSizes.md}>
              How would you like to sync your data?
            </Text>
            <Button
              onPress={handleCreateWorkspace}
              backgroundColor={colors.accentBg}
              borderColor={colors.accent}
              borderWidth={2}
              size="$3"
              height={44}
              pressStyle={{ scale: 0.97 }}
              animation="quick"
              style={{ borderRadius: buttonRadius }}
            >
              <Text color={colors.accent} fontSize={fontSizes.md} fontWeight="600">
                Create New Workspace
              </Text>
            </Button>
            <Button
              onPress={handleJoinWorkspace}
              backgroundColor={colors.card}
              borderColor={colors.border}
              borderWidth={2}
              size="$3"
              height={44}
              pressStyle={{ scale: 0.97 }}
              animation="quick"
              style={{ borderRadius: buttonRadius }}
            >
              <Text color={colors.text} fontSize={fontSizes.md} fontWeight="600">
                Join Existing Workspace
              </Text>
            </Button>
          </>
        )}
        
        {modalStep === 'creating' && (
          <YStack alignItems="center" justifyContent="center" padding={baseSpacing * 2}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text marginTop={baseSpacing} color={colors.subtext}>
              Creating your sync workspace...
            </Text>
          </YStack>
        )}
        
        {modalStep === 'showCode' && workspaceId && inviteCode && (
          <YStack backgroundColor={colors.card} padding={baseSpacing * 3} borderRadius={cardRadius} marginBottom={baseSpacing * 2}>
            <Text fontSize={fontSizes.sm} color={colors.subtext}>
              Workspace ID:
            </Text>
            <XStack justifyContent="space-between" alignItems="center" marginTop={baseSpacing}>
              <Text fontSize={fontSizes.lg} fontWeight="600" color={colors.text}>
                {workspaceId}
              </Text>
              <Button 
                size="$2" 
                onPress={async () => {
                  await Clipboard.setStringAsync(workspaceId);
                  useToastStore.getState().showToast('Workspace ID copied', 'success');
                }}
                style={{ borderRadius: buttonRadius }}
              >
                Copy
              </Button>
            </XStack>
            
            <Text fontSize={fontSizes.sm} color={colors.subtext} marginTop={baseSpacing * 2}>
              Invite Code:
            </Text>
            <XStack justifyContent="space-between" alignItems="center" marginTop={baseSpacing}>
              <Text fontSize={fontSizes.lg} fontWeight="600" color={colors.text}>
                {inviteCode}
              </Text>
              <Button 
                size="$2" 
                onPress={async () => {
                  await Clipboard.setStringAsync(inviteCode);
                  useToastStore.getState().showToast('Invite code copied', 'success');
                }}
                style={{ borderRadius: buttonRadius }}
              >
                Copy
              </Button>
            </XStack>
            
            <Text fontSize={fontSizes.xs} color={colors.subtext} marginTop={baseSpacing}>
              Share both the Workspace ID and Invite Code with your other devices to connect them.
            </Text>
            
            <Button
              onPress={() => setModalStep('connected')}
              backgroundColor={colors.accentBg}
              borderColor={colors.accent}
              borderWidth={2}
              size="$3"
              height={44}
              pressStyle={{ scale: 0.97 }}
              animation="quick"
              marginTop={baseSpacing * 2}
              style={{ borderRadius: buttonRadius }}
            >
              <Text color={colors.accent} fontSize={fontSizes.md} fontWeight="600">
                Done
              </Text>
            </Button>
          </YStack>
        )}
        
        {modalStep === 'joining' && (
          <YStack gap={baseSpacing * 2} padding={baseSpacing}>
            <Text color={colors.subtext} fontSize={fontSizes.md}>
              Enter the Workspace ID and Invite Code:
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.card,
                padding: baseSpacing * 1.5,
                borderRadius: cardRadius,
                color: colors.text,
                fontSize: fontSizes.md,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              value={inputWorkspaceId}
              onChangeText={setInputWorkspaceId}
              placeholder="Workspace ID"
              placeholderTextColor={colors.subtext}
            />
            <TextInput
              style={{
                backgroundColor: colors.card,
                padding: baseSpacing * 1.5,
                borderRadius: cardRadius,
                color: colors.text,
                fontSize: fontSizes.md,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              value={inputInviteCode}
              onChangeText={setInputInviteCode}
              placeholder="Invite Code"
              placeholderTextColor={colors.subtext}
            />
            <Button
              onPress={connectToWorkspace}
              backgroundColor={colors.accent}
              height={44}
              pressStyle={{ scale: 0.97 }}
              animation="quick"
              style={{ borderRadius: buttonRadius }}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text color="#fff" fontSize={fontSizes.md} fontWeight="600">
                  Join Workspace
                </Text>
              )}
            </Button>
          </YStack>
        )}
        
        {modalStep === 'connected' && (
          <YStack gap={baseSpacing}>
            {workspaceId ? (
              <YStack>
                <XStack 
                  padding={baseSpacing * 2}
                  backgroundColor={colors.accentBg}
                  borderRadius={cardRadius}
                  borderWidth={1}
                  borderColor={colors.accent}
                  justifyContent="space-between"
                  alignItems="center"
                  width={contentWidth}
                  alignSelf="center"
                >
                  <YStack>
                    <Text fontSize={fontSizes.lg} fontWeight="600" color={colors.accent}>
                      Connected to Workspace
                    </Text>
                    <Text fontSize={fontSizes.sm} color={colors.subtext} marginTop={4}>
                      ID: {workspaceId}
                    </Text>
                  </YStack>
                  <MaterialIcons 
                    name="check-circle" 
                    size={24} 
                    color={colors.accent} 
                  />
                </XStack>
                
                <Text fontSize={fontSizes.sm} color={colors.subtext} marginTop={baseSpacing * 2} textAlign="center">
                  Your data will automatically sync between all devices connected to this workspace.
                </Text>
              </YStack>
            ) : (
              <XStack
                padding={baseSpacing * 2}
                backgroundColor={colors.accentBg}
                borderRadius={cardRadius}
                borderWidth={1}
                borderColor={colors.error}
                justifyContent="center"
                alignItems="center"
                width={contentWidth}
                alignSelf="center"
              >
                <Text fontSize={fontSizes.md} color={colors.error} textAlign="center">
                  No workspace connected. Create or join a workspace to enable sync.
                </Text>
              </XStack>
            )}
            
            <Button
              onPress={() => setModalStep('choose')}
              backgroundColor={workspaceId ? colors.card : colors.accentBg}
              borderColor={workspaceId ? colors.border : colors.accent}
              borderWidth={2}
              size="$3"
              height={44}
              pressStyle={{ scale: 0.97 }}
              animation="quick"
              marginTop={baseSpacing * 2}
              style={{ borderRadius: buttonRadius }}
            >
              <Text 
                color={workspaceId ? colors.text : colors.accent} 
                fontSize={fontSizes.md} 
                fontWeight="600"
              >
                {workspaceId ? 'Change Workspace' : 'Setup Workspace'}
              </Text>
            </Button>
            
            <Button
              onPress={onClose}
              backgroundColor={colors.card}
              borderColor={colors.border}
              borderWidth={2}
              size="$3"
              height={44}
              pressStyle={{ scale: 0.97 }}
              animation="quick"
              marginTop={baseSpacing}
              style={{ borderRadius: buttonRadius }}
            >
              <Text color={colors.text} fontSize={fontSizes.md} fontWeight="600">
                Close
              </Text>
            </Button>
          </YStack>
        )}
      </YStack>
    </BaseCardAnimated>
  );
}

