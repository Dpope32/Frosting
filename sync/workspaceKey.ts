// sync/workspaceKey.ts
import { storage } from '@/store/AsyncStorage';
import { getPocketBase } from '@/sync/pocketSync';
import { generateRandomKey } from '@/sync/randomKey';
import { addSyncLog } from '@/components/sync/syncUtils';
export const getWorkspaceKey = async (wsId: string) => {
  const cacheKey = `ws_key_${wsId}`;
  let key = await storage.getString(cacheKey);

  const bad = !key || key.length !== 64;          // empty, wrong length
  addSyncLog(`Workspace key check: ${key}`, 'info');
  if (bad) {
    addSyncLog(`Workspace key is bad: ${key}`, 'info');
    const pb = await getPocketBase();
    addSyncLog(`Workspace key fetched from server: ${key}`, 'info');
    const ws = await pb.collection('sync_workspaces').getOne(wsId);
    key = ws.shared_key as string;
    addSyncLog(`Workspace key fetched from server: ${key}`, 'info');
    if (!key || key.length !== 64) {              // server blank too → mint
      key = generateRandomKey();
      await pb.collection('sync_workspaces').update(wsId, { shared_key: key });
      addSyncLog(`Workspace key generated and saved: ${key}`, 'info');
    }
    await storage.set(cacheKey, key);             // cache the good key
    addSyncLog(`Workspace key cached: ${key}`, 'info');
  }
  return key;
};
