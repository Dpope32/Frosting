// File: sync/workspace.ts
import { getPocketBase } from "./pocketSync";
import * as FileSystem from "expo-file-system";
import { generateSyncKey, generateRandomKey, ensureWorkspaceKey, exportEncryptedState, pushSnapshot, pullLatestSnapshot } from "@/sync";
import { useRegistryStore } from "@/store";
import { storage } from "@/store/AsyncStorage";
import { Platform } from "react-native";
import { addSyncLog } from "@/components/sync/syncUtils";
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
  if (!workspaceId && inviteCode) {
    const ws = await pb
      .collection('sync_workspaces')
      .getFirstListItem(`invite_code="${inviteCode}"`);   // ← indexed column
  
    workspaceId = ws.id;                                  // hydrate so old join-logic still works
  }
  addSyncLog(`🔌 Joining workspace ${workspaceId}...`, 'info', inviteCode);   
  // ------------------------------------------------ JOIN
  if (workspaceId && inviteCode) {
    const ws = await pb.collection('sync_workspaces').getOne(workspaceId);

    if (ws.invite_code !== inviteCode) throw new Error('Invalid invite code');
     addSyncLog('Invite code is valid', 'info', inviteCode);
     addSyncLog('Expected invite code: ' + ws.invite_code, 'info');
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
    
    // Web compatibility: use localStorage instead of FileSystem
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('workspace_id', workspaceId);
      }
    } else {
      await FileSystem.writeAsStringAsync(`${FileSystem.documentDirectory}workspace_id.txt`, workspaceId);
    }

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
  
  // Web compatibility: use localStorage instead of FileSystem
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('workspace_id', newWorkspace.id);
    }
  } else {
    await FileSystem.writeAsStringAsync(
      `${FileSystem.documentDirectory}workspace_id.txt`,
      newWorkspace.id,
    );
  }

  await ensureWorkspaceKey(newWorkspace.id);
  await exportEncryptedState(useRegistryStore.getState().getAllStoreStates());
  await pushSnapshot();
  return { id: newWorkspace.id, inviteCode: newInvite };
};

