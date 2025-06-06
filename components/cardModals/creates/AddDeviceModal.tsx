import React, { useState, useEffect } from 'react';
import { Dimensions, useWindowDimensions } from 'react-native';
import { isWeb, YStack } from 'tamagui';
import { useColorScheme } from '@/hooks';
import { BaseCardAnimatedWS } from '@/components/baseModals/BaseCardAnimatedWS';
import { useUserStore, useToastStore, useRegistryStore } from '@/store';
import { getCurrentWorkspaceId, createOrJoinWorkspace } from '@/sync';
import { addSyncLog } from '@/components/sync/syncUtils';
import { baseSpacing, getColors } from '@/components/sync/sharedStyles';
import { ChooseAdd, Creating, ShowCode, Joining, Connected } from '@/components/sync/addDevice';
import { BaseCardAnimated } from '@/components/baseModals/BaseCardAnimated';

type AddDeviceModalProps = {
  onClose: () => void;
  currentWorkspaceId?: string | null;
  onWorkspaceCreated?: (id: string) => void;
  onWorkspaceJoined?: (id: string) => void;
  initialMode?: 'create' | 'join';
};

export default function AddDeviceModal({ 
  onClose, 
  currentWorkspaceId, 
  onWorkspaceCreated, 
  onWorkspaceJoined,
  initialMode 
}: AddDeviceModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const [isLoading, setIsLoading] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(currentWorkspaceId || null);
  const [inviteCode, setInviteCode] = useState<string>('');

  const actualWidth = isWeb ? Dimensions.get('window').width * 0.35 : 
    Dimensions.get('window').width * 0.8;
  const [inputInviteCode, setInputInviteCode] = useState<string>('');
  const [modalStep, setModalStep] = useState<'choose' | 'creating' | 'showCode' | 'joining' | 'connected'>(
    initialMode === 'create' ? 'creating' : 
    initialMode === 'join' ? 'joining' : 
    'choose'
  );
  const { width } = useWindowDimensions();
  const colors = getColors(isDark, primaryColor);
  const contentWidth = Math.min(width - baseSpacing * 2, 420);

  useEffect(() => {
    addSyncLog('🛠️  AddDeviceModal mounted', 'verbose');
    
    // Auto-trigger the appropriate action based on initialMode with a small delay
    if (initialMode === 'create' && modalStep === 'creating') {
      setTimeout(() => {
        handleCreateWorkspace();
      }, 100);
    }

    return () => addSyncLog('📤 AddDeviceModal un-mounted', 'verbose');
  }, []);

  useEffect(() => {
    addSyncLog(`🔀 Modal step ➜ ${modalStep}`, 'verbose');
  }, [modalStep]);

  useEffect(() => {
    const checkWorkspace = async () => {
      try {
        const id = await getCurrentWorkspaceId();
        if (id) {
          addSyncLog(`🔗 Existing workspace detected on device: ${id}`, 'info');
          setWorkspaceId(id);
          if (modalStep === 'choose') setModalStep('connected');
        } else {
          addSyncLog('🔍 No workspace file on device (first-time setup)', 'verbose');
        }
      } catch (error) {
        addSyncLog('Error checking workspace', 'error', error instanceof Error ? error.message : String(error));
      }
    };
    
    // Only check if we're not in an active flow
    if (modalStep === 'choose') {
      checkWorkspace();
    }
  }, [modalStep]);

  const handleCreateWorkspace = async () => {
    if (isLoading) return; // Prevent double execution
    
    addSyncLog('🪄 User chose "Create Workspace"', 'info');
    setModalStep('creating');
    
    try {
      setIsLoading(true);
      addSyncLog('Creating new sync workspace...', 'info');
      const result = await createOrJoinWorkspace();
      // Set local state
      setWorkspaceId(result.id);
      setInviteCode(result.inviteCode);
      
      // Update store immediately
      useRegistryStore.getState().setWorkspaceId(result.id);
      
      // Call parent callback
      if (onWorkspaceCreated) {
        onWorkspaceCreated(result.id);
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
    addSyncLog('🔑 User chose "Join Workspace"', 'info');
    setModalStep('joining');
  };

  const connectToWorkspace = async () => {
    
    if (isLoading) return; // Prevent double execution
    
    setIsLoading(true);
    const code = inputInviteCode.trim();
    addSyncLog(`🔌 Attempting to join via ${code.slice(0, 8)}…`, 'info');

    try {
      addSyncLog('Joining existing workspace...', 'info', inviteCode.trim());
      
      const result = await createOrJoinWorkspace(undefined, code);
        setInviteCode(result.inviteCode);
      
      // Set local state
      setWorkspaceId(result.id);
      
      // Update store immediately and ensure it persists
      useRegistryStore.getState().setWorkspaceId(result.id);
      
      // Call parent callback
      if (onWorkspaceJoined) {
        onWorkspaceJoined(result.id);
      }
      
      addSyncLog(`✅ Joined workspace ${result.id.slice(0, 8)} (invite OK)`, 'success');
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
    <BaseCardAnimatedWS
      title={
        modalStep === 'connected' ? 'Sync Workspace' : 
        modalStep === 'showCode' ? 'Share Workspace' :
        modalStep === 'joining' ? 'Join Workspace' :
        modalStep === 'creating' ? 'Creating Workspace' :
        'Sync Setup'
      }
      onClose={onClose}
    >
      <YStack 
        gap={baseSpacing} 
        paddingHorizontal={baseSpacing}
        width={actualWidth}
        alignSelf="center"
      >
        {modalStep === 'choose' && (
          <ChooseAdd
            colors={colors}
            handleCreateWorkspace={handleCreateWorkspace}
            handleJoinWorkspace={handleJoinWorkspace}
          />
        )}
        
        {modalStep === 'creating' && (
          <Creating colors={colors} />
        )}
        
        {modalStep === 'showCode' && workspaceId && inviteCode && (
          <ShowCode
            colors={colors}
            workspaceId={workspaceId}
            inviteCode={inviteCode}
            setModalStep={setModalStep}
          />
        )}
        
        {modalStep === 'joining' && (
          <Joining
            colors={colors}
            isDark={isDark}
            inputInviteCode={inputInviteCode}
            setInputInviteCode={setInputInviteCode}
            connectToWorkspace={connectToWorkspace}
            isLoading={isLoading}
          />

        )}
        
        {modalStep === 'connected' && (
          <Connected
            colors={colors}
            workspaceId={workspaceId}
            setModalStep={setModalStep}
            onClose={onClose}
            contentWidth={contentWidth}
          />
        )}
      </YStack>
    </BaseCardAnimatedWS>
  );
}

