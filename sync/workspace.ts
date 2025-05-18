// File: sync/workspace.ts
import { getPocketBase } from "./pocketSync";
import * as FileSystem from "expo-file-system";
import { generateSyncKey, generateRandomKey, ensureWorkspaceKey, exportEncryptedState, pushSnapshot, pullLatestSnapshot } from "@/sync";
import { useRegistryStore } from "@/store";
import { storage } from "@/store/AsyncStorage";
import { addSyncLog } from '@/components/sync/syncUtils';

export interface WorkspaceMeta {
  id: string;
  inviteCode: string;
}

/**
 * Create a new workspace or join an existing one.
 * – Always writes the workspace ID to disk
 * – Always exports + pushes a snapshot so other devices have data to pull
 */
export const createOrJoinWorkspace = async (
  workspaceId?: string,
  inviteCode?: string,
): Promise<WorkspaceMeta> => {
  const pb       = await getPocketBase();
  const deviceId = await generateSyncKey();

  // ------------------------------------------------ JOIN
  if (workspaceId && inviteCode) {
    const ws = await pb.collection('sync_workspaces').getOne(workspaceId);

    if (ws.invite_code !== inviteCode) throw new Error('Invalid invite code');

    // 🔑 ensure shared_key exists
    let sharedKey = ws.shared_key as string;
    if (!sharedKey) {
      sharedKey = generateRandomKey();
      await pb.collection('sync_workspaces')
              .update(workspaceId, { shared_key: sharedKey });
    }
    await storage.set(`ws_key_${workspaceId}`, sharedKey);
    
    // Ensure workspace key is properly synchronized
    await ensureWorkspaceKey(workspaceId);

    // add device + save file + push/pull
    if (!ws.device_ids || !ws.device_ids.includes(deviceId)) {
      await pb.collection('sync_workspaces')
              .update(workspaceId, { 'device_ids+': deviceId });
    }
    await FileSystem.writeAsStringAsync(`${FileSystem.documentDirectory}workspace_id.txt`, workspaceId);

    await exportEncryptedState(useRegistryStore.getState().getAllStoreStates());
    await Promise.all([pushSnapshot(), pullLatestSnapshot()]);

    return { id: workspaceId, inviteCode };
  }

  // ------------------------------------------------ CREATE
  const sharedKey    = generateRandomKey();                 // << generate once
  const newInvite    = Math.random().toString(36).slice(2,10).toUpperCase();
  const newWorkspace = await pb.collection('sync_workspaces').create({
    owner_device_id : deviceId,
    device_ids      : [deviceId],
    invite_code     : newInvite,
    shared_key      : sharedKey,
  });

  await storage.set(`ws_key_${newWorkspace.id}`, sharedKey);
  await FileSystem.writeAsStringAsync(
    `${FileSystem.documentDirectory}workspace_id.txt`,
    newWorkspace.id,
  );

  await ensureWorkspaceKey(newWorkspace.id);
  await exportEncryptedState(useRegistryStore.getState().getAllStoreStates());
  await pushSnapshot();
  return { id: newWorkspace.id, inviteCode: newInvite };
};

