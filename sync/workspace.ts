// ===============================================
// File: sync/workspace.ts
// Purpose: create or join a PocketBase workspace and persist its ID locally.
// Notes:
// • Dropped manual `created` field – PB sets this automatically.
// • Minimized array patch to ensure proper update of `device_ids`.
// ===============================================

import { getPocketBase } from "./pocketSync";
import * as FileSystem from "expo-file-system";
import { generateSyncKey } from "@/sync/registrySyncManager";
import { addSyncLog } from "@/components/sync/syncUtils";
import { useRegistryStore } from "@/store/RegistryStore";

export interface WorkspaceMeta {
  id: string;
  inviteCode: string;
}
/**
 * Create a new workspace or join an existing one if `workspaceId` & `inviteCode` are supplied.
 */
export const createOrJoinWorkspace = async (
  workspaceId?: string,
  inviteCode?: string,
): Promise<WorkspaceMeta> => {
  const pb = await getPocketBase();
  const deviceId = await generateSyncKey();

  try {
    addSyncLog("Creating or joining workspace", "info");

    // ———————————————————————————— JOIN ———————————————————————————
    if (workspaceId && inviteCode) {
      const workspace = await pb
        .collection("sync_workspaces")
        .getOne(workspaceId);
      addSyncLog("Workspace found", "info");

      if (workspace.invite_code !== inviteCode) {
        addSyncLog("Invalid invite code", "error");
        throw new Error("Invalid invite code");
      }

      // merge in the new deviceId, dedupe with a Set
      const updatedIds = Array.from(
        new Set([...(workspace.device_ids || []), deviceId])
      );

      await pb.collection("sync_workspaces").update(workspaceId, {
        device_ids: updatedIds,
      });

      await FileSystem.writeAsStringAsync(
        `${FileSystem.documentDirectory}workspace_id.txt`,
        workspaceId
      );

      return { id: workspaceId, inviteCode: workspace.invite_code };
    }

    // ———————————————————————————— CREATE ——————————————————————————
    addSyncLog("📡 Creating new sync workspace...", "info");

    const newInviteCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    const newWorkspace = await pb
      .collection("sync_workspaces")
      .create({
        owner_device_id: deviceId,
        device_ids: [deviceId],
        invite_code: newInviteCode,
      });

    addSyncLog(
      `✅ Created sync workspace with ID: ${newWorkspace.id}`,
      "success"
    );

    await FileSystem.writeAsStringAsync(
      `${FileSystem.documentDirectory}workspace_id.txt`,
      newWorkspace.id
    );

    addSyncLog(
      `📁 Saved workspace ID to file: ${newWorkspace.id}`,
      "verbose"
    );

    return { id: newWorkspace.id, inviteCode: newInviteCode };
  } catch (err) {
    console.error("Error creating/joining workspace:", err);
    throw err;
  }
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

    if (removeFromServer) {
      try {
        const pb = await getPocketBase();
        const deviceId = await generateSyncKey();
        const workspace = await pb
          .collection("sync_workspaces")
          .getOne(workspaceId);
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
