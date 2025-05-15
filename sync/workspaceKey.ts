// sync/workspaceKey.ts
import { storage } from '@/store/AsyncStorage';
import { getPocketBase } from '@/sync/pocketSync';

export const getWorkspaceKey = async (workspaceId: string) => {
  const cacheKey = `ws_key_${workspaceId}`;
  let k = await storage.getString(cacheKey);
  if (k) return k;

  const pb = await getPocketBase();
  const ws = await pb.collection('sync_workspaces').getOne(workspaceId);
  k = ws.shared_key as string;
  await storage.set(cacheKey, k);
  return k;
};
