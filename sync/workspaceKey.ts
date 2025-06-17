// sync/workspaceKey.ts
import { storage } from '@/store/AsyncStorage';
import { addSyncLog } from '@/components/sync/syncUtils';
import { getCurrentWorkspaceId, getPocketBase } from '@/sync';

export const getWorkspaceKey = async (): Promise<string> => {
  const wsId = await getCurrentWorkspaceId();
  if (!wsId) {
    addSyncLog('❌ No workspace ID found', 'error');
    throw new Error('No workspace ID found');
  }

  const pb = await getPocketBase();
  addSyncLog('🔍 GET request source: sync/workspaceKey.ts - getWorkspaceKey()', 'verbose');
  const { shared_key } = await pb.collection('sync_workspaces').getOne(wsId);
  if (!shared_key) {
    addSyncLog('❌ No shared key in workspace record', 'error');
    throw new Error('Workspace has no shared_key');
  }

  await storage.set(`ws_key_${wsId}`, shared_key);   
  return shared_key as string;
};

/**
 * Ensures the device has the correct workspace key by fetching it from PocketBase
 * and storing it locally. This should be called when joining a workspace.
 */
export const ensureWorkspaceKey = async (workspaceId: string): Promise<boolean> => {
  try {
    const pb = await getPocketBase();
    
    addSyncLog('🔍 GET request source: sync/workspaceKey.ts - ensureWorkspaceKey()', 'verbose');
    // Get the workspace record
    const workspace = await pb.collection('sync_workspaces').getOne(workspaceId);
    const remoteKey = workspace.shared_key;
    
    if (!remoteKey) {
      return false;
    }
    
    // Always update the key to ensure it's correct
    await storage.set(`ws_key_${workspaceId}`, remoteKey);
    
    return true;
  } catch (error) {
    return false;
  }
};
