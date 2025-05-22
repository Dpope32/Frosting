import React, { useState, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { YStack } from 'tamagui';
import { useColorScheme } from '@/hooks';
import { BaseCardAnimatedWS } from '@/components/baseModals/BaseCardAnimatedWS';
import { useUserStore, useToastStore, useRegistryStore } from '@/store';
import { getCurrentWorkspaceId, createOrJoinWorkspace } from '@/sync';
import { addSyncLog } from '@/components/sync/syncUtils';
import { baseSpacing, getColors } from '@/components/sync/sharedStyles';
import { ChooseAdd, Creating, ShowCode, Joining, Connected } from '@/components/sync/addDevice';

type AddDeviceModalProps = {
  onClose: () => void;
  currentWorkspaceId?: string | null;
  onWorkspaceCreated?: (id: string, inviteCode: string) => void;
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
  const [inputInviteCode, setInputInviteCode] = useState<string>('');
  const [inputWorkspaceId, setInputWorkspaceId] = useState<string>('');
  const [modalStep, setModalStep] = useState<'choose' | 'creating' | 'showCode' | 'joining' | 'connected'>(initialMode === 'create' ? 'creating' : initialMode === 'join' ? 'joining' :  'choose');
  const { width } = useWindowDimensions();
  const colors = getColors(isDark, primaryColor);
  const contentWidth = Math.min(width - baseSpacing * 2, 420);

  useEffect(() => {
    addSyncLog('🛠️  AddDeviceModal mounted', 'verbose');
    
    // Auto-trigger the appropriate action based on initialMode
    if (initialMode === 'create' && modalStep === 'creating') {
      handleCreateWorkspace();
    }

    return () => addSyncLog('📤 AddDeviceModal un-mounted', 'verbose');
  }, []);

  useEffect(() => {
    addSyncLog(`🔀 Modal step ➜ ${modalStep}`, 'verbose');
  }, [modalStep]);

  useEffect(() => {
    const checkWorkspace = async () => {
      const id = await getCurrentWorkspaceId();
      if (id) {
        addSyncLog(`🔗 Existing workspace detected on device: ${id}`, 'info');
        setWorkspaceId(id);
        if (modalStep === 'choose') setModalStep('connected');
      } else {
        addSyncLog('🔍 No workspace file on device (first-time setup)', 'verbose');
      }
    };
    checkWorkspace();
  }, []);


  const handleCreateWorkspace = async () => {
    addSyncLog('🪄 User chose "Create Workspace"', 'info');
    setModalStep('creating');
    try {
      setIsLoading(true);
      addSyncLog('Creating new sync workspace...', 'info');
      const result = await createOrJoinWorkspace();
      setWorkspaceId(result.id);
      setInviteCode(result.inviteCode);
      useRegistryStore.getState().setWorkspaceId(result.id);
      if (onWorkspaceCreated) { onWorkspaceCreated(result.id, result.inviteCode)}
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
    if (!inputWorkspaceId.trim() || !inputInviteCode.trim()) {
      addSyncLog('⚠️  Join aborted – empty Workspace ID / Invite Code', 'warning');
      useToastStore.getState().showToast(
        'Please enter both workspace ID and invite code',
        'error'
      );
      return;
    }
    
    setIsLoading(true);
    addSyncLog(
      `🔌 Attempting to join workspace ${inputWorkspaceId.trim().slice(0, 8)}…`,
      'info'
    );

    try {
      addSyncLog('Joining existing workspace...', 'info');
      const result = await createOrJoinWorkspace(
        inputWorkspaceId.trim(), 
        inputInviteCode.trim()
      );
      setWorkspaceId(result.id);
      useRegistryStore.getState().setWorkspaceId(result.id);
      if (onWorkspaceJoined) { onWorkspaceJoined(result.id)}
      addSyncLog(  `✅ Joined workspace ${result.id.slice(0, 8)} (invite OK)`, 'success' );
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
      <YStack gap={baseSpacing} paddingHorizontal={baseSpacing} marginTop={-baseSpacing}>
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
            inputWorkspaceId={inputWorkspaceId}
            setInputWorkspaceId={setInputWorkspaceId}
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

