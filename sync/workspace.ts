// File: sync/workspace.ts
import { getPocketBase } from "./pocketSync";
import * as FileSystem from "expo-file-system";
import { exportEncryptedState, generateSyncKey } from "@/sync/registrySyncManager";
import { generateRandomKey } from "@/sync/randomKey";
import { addSyncLog } from "@/components/sync/syncUtils";
import { useRegistryStore } from "@/store/RegistryStore";
import { pullLatestSnapshot, pushSnapshot } from "@/sync/snapshotPushPull";

import { storage } from "@/store/AsyncStorage";
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

    // add device + save file + push/pull
    await pb.collection('sync_workspaces')
            .update(workspaceId, { device_ids: [...ws.device_ids, deviceId] });
    await FileSystem.writeAsStringAsync(`${FileSystem.documentDirectory}workspace_id.txt`, workspaceId);

    await exportEncryptedState(useRegistryStore.getState().getAllStoreStates());
    await pushSnapshot();
    await pullLatestSnapshot();

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

  await exportEncryptedState(useRegistryStore.getState().getAllStoreStates());
  await pushSnapshot();

  return { id: newWorkspace.id, inviteCode: newInvite };
};



/**
 * Retrieve the workspace ID saved on-device (or `null` if not set).
 */
export const getCurrentWorkspaceId = async (): Promise<string | null> => {
  try {
    addSyncLog(
      "📖 Attempting to read workspace ID from file...",
      "verbose",
    );

    const workspaceId = await FileSystem.readAsStringAsync(
      `${FileSystem.documentDirectory}workspace_id.txt`,
    );

    addSyncLog(
      `📦 Found workspace ID: ${workspaceId}`,
      "info",
    );
    return workspaceId;
  } catch {
    addSyncLog(
      "❌ No workspace file found. Device not connected.",
      "warning",
    );
    return null;
  }
};

/**
 * Leave the current workspace by removing the local workspace ID file.
 * Optionally also remove this device from the workspace's device_ids list.
 */
export const leaveWorkspace = async (
  removeFromServer: boolean = true,
): Promise<boolean> => {
  const syncStatus = useRegistryStore.getState().syncStatus;
  if (syncStatus === 'syncing') {
    addSyncLog(
      "Cannot leave workspace while sync in progress",
      "warning",
    );
    return false;
  }

  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) {
      addSyncLog(
        "No workspace to leave - not connected",
        "warning",
      );
      return false;
    }

    addSyncLog(`🚪 Leaving workspace: ${workspaceId}`, "info");
    await FileSystem.deleteAsync(
      `${FileSystem.documentDirectory}workspace_id.txt`,
      { idempotent: true },
    );

    // clear it in memory, too
    useRegistryStore.getState().setWorkspaceId(null);

    if (removeFromServer) {
      try {
        const pb = await getPocketBase();
        const deviceId = await generateSyncKey();
        const workspace = await pb
          .collection("sync_workspaces")
          .getOne(workspaceId);
          const sharedKey = workspace.shared_key as string;          // << add
        await storage.set(`ws_key_${workspaceId}`, sharedKey); 
        const updated = (
          Array.isArray(workspace.device_ids)
            ? workspace.device_ids
            : []
        ).filter((id: string) => id !== deviceId);

        await pb.collection("sync_workspaces").update(workspaceId, {
          device_ids: updated,
        });
        addSyncLog(
          "✅ Removed device from workspace on server",
          "success",
        );
      } catch (serverErr) {
        addSyncLog(
          `⚠️ Server update failed (left locally): ${serverErr}`,
          "warning",
        );
      }
    }

    addSyncLog("✅ Successfully left workspace", "success");
    return true;
  } catch (err) {
    console.error("Error leaving workspace:", err);
    addSyncLog(
      `❌ Failed to leave workspace: ${err}`,
      "error",
    );
    throw err;
  }
};
