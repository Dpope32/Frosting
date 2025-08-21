// sync/workspaceKey.ts
import { storage } from '@/store/AsyncStorage';
import { addSyncLog } from '@/components/sync/syncUtils';
import { getCurrentWorkspaceId, getPocketBase } from '@/sync';

let _cachedKey: { wsId: string; key: string } | null = null;

export const getWorkspaceKey = async (): Promise<string> => {
  const wsId = await getCurrentWorkspaceId();
  if (!wsId) {
    addSyncLog('❌ No workspace ID found', 'error');
    throw new Error('No workspace ID found');
  }

  // 1) Fast in-memory cache
  if (_cachedKey && _cachedKey.wsId === wsId) {
    return _cachedKey.key;
  }

  // 2) Fast local storage cache (no network)
  try {
    const localKey = await storage.getString(`ws_key_${wsId}`);
    if (localKey) {
      _cachedKey = { wsId, key: localKey };
      return localKey;
    }
  } catch {
    // ignore and fall through to network
  }

  // 3) Fallback to network fetch once, then cache
  const pb = await getPocketBase();
  const { shared_key } = await pb.collection('sync_workspaces').getOne(wsId);
  if (!shared_key) {
    addSyncLog('❌ No shared key in workspace record', 'error');
    throw new Error('Workspace has no shared_key');
  }

  await storage.set(`ws_key_${wsId}`, shared_key as string);
  _cachedKey = { wsId, key: shared_key as string };
  return shared_key as string;
};

/**
 * Ensures the device has the correct workspace key by fetching it from PocketBase
 * and storing it locally. This should be called when joining a workspace.
 */
export const ensureWorkspaceKey = async (workspaceId: string): Promise<boolean> => {
  try {
    const pb = await getPocketBase();
    const workspace = await pb.collection('sync_workspaces').getOne(workspaceId);
    const remoteKey = workspace.shared_key;

    if (!remoteKey) {
      return false;
    }

    await storage.set(`ws_key_${workspaceId}`, remoteKey as string);
    if (_cachedKey && _cachedKey.wsId === workspaceId) {
      _cachedKey = { wsId: workspaceId, key: remoteKey as string };
    }

    return true;
  } catch {
    return false;
  }
};