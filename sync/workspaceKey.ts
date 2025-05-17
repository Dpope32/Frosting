// sync/workspaceKey.ts
import { storage } from '@/store/AsyncStorage';
import { addSyncLog } from '@/components/sync/syncUtils';
import { getCurrentWorkspaceId, getPocketBase } from '@/sync';

export const getWorkspaceKey = async (): Promise<string> => {
  const wsId = await getCurrentWorkspaceId();
  addSyncLog(`🔍 Retrieving workspace key for: ${wsId}`, 'info');
  if (!wsId) {
    addSyncLog('❌ No workspace ID found', 'error');
    throw new Error('No workspace ID found');
  }

  const pb = await getPocketBase();
  addSyncLog(`🔍 Retrieving workspace key from PocketBase`, 'info');
  const { shared_key } = await pb.collection('sync_workspaces').getOne(wsId);
  if (!shared_key) {
    addSyncLog('❌ No shared key in workspace record', 'error');
    throw new Error('Workspace has no shared_key');
  }

  await storage.set(`ws_key_${wsId}`, shared_key);   // cache
  addSyncLog(`🔑 Retrieved workspace key: ${shared_key.slice(0,6)}...${shared_key.slice(-6)}`, 'info');
  return shared_key as string;
};

/**
 * Ensures the device has the correct workspace key by fetching it from PocketBase
 * and storing it locally. This should be called when joining a workspace.
 */
export const ensureWorkspaceKey = async (workspaceId: string): Promise<boolean> => {
  try {
    const pb = await getPocketBase();
    
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
