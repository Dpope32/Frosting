// ===============================================
// File: sync/workspace.ts
// Purpose: create or join a PocketBase workspace and persist its ID locally.
// Notes:  
// • Dropped manual `created` field – PB sets this automatically.  
// • Minor refactor for readability while we're still in debug‑mode.  
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
      const workspace = await pb.collection("sync_workspaces").getOne(workspaceId);
      addSyncLog("Workspace found", "info");

      if (workspace.invite_code !== inviteCode) {
        addSyncLog("Invalid invite code", "error");
        throw new Error("Invalid invite code");
      }

      // push this device onto the array
      await pb.collection("sync_workspaces").update(workspaceId, {
        "device_ids+": deviceId,
      });

      await FileSystem.writeAsStringAsync(
        `${FileSystem.documentDirectory}workspace_id.txt`,
        workspaceId,
      );

      return { id: workspaceId, inviteCode: workspace.invite_code };
    }

    // ———————————————————————————— CREATE ——————————————————————————
    addSyncLog("📡 Creating new sync workspace...", "info");

    const newInviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const newWorkspace = await pb.collection("sync_workspaces").create({
      owner_device_id: deviceId,
      device_ids: [deviceId],
      invite_code: newInviteCode,
    });

    addSyncLog(`✅ Created sync workspace with ID: ${newWorkspace.id}`, "success");

    await FileSystem.writeAsStringAsync(
      `${FileSystem.documentDirectory}workspace_id.txt`,
      newWorkspace.id,
    );

    addSyncLog(`📁 Saved workspace ID to file: ${newWorkspace.id}`, "verbose");

    return { id: newWorkspace.id, inviteCode: newInviteCode };
  } catch (err) {
    console.error("Error creating/joining workspace:", err);
    throw err;
  }
};

/**
 * Retrieve the workspace ID saved on‑device (or `null` if not set).
 */
export const getCurrentWorkspaceId = async (): Promise<string | null> => {
  try {
    addSyncLog("📖 Attempting to read workspace ID from file...", "verbose");

    const workspaceId = await FileSystem.readAsStringAsync(
      `${FileSystem.documentDirectory}workspace_id.txt`,
    );

    addSyncLog(`📦 Found workspace ID: ${workspaceId}`, "info");
    return workspaceId;
  } catch {
    addSyncLog(
      "❌ No workspace file found. Device is not connected to a sync workspace.",
      "warning",
    );
    return null;
  }
};

/**
 * Leave the current workspace by removing the local workspace ID file.
 * Optionally also remove this device from the workspace's device_ids list.
 */
export const leaveWorkspace = async (removeFromServer: boolean = true): Promise<boolean> => {
  // Check if sync is in progress
  const syncStatus = useRegistryStore.getState().syncStatus;
  if (syncStatus === 'syncing') {
    addSyncLog("Cannot leave workspace while sync is in progress", "warning");
    return false;
  }
  
  try {
    // Get current workspace ID and device ID
    const workspaceId = await getCurrentWorkspaceId();
    
    if (!workspaceId) {
      addSyncLog("No workspace to leave - device is not connected to any workspace", "warning");
      return false;
    }
    
    addSyncLog(`🚪 Leaving workspace: ${workspaceId}`, "info");
    
    // Delete the workspace ID file locally
    await FileSystem.deleteAsync(
      `${FileSystem.documentDirectory}workspace_id.txt`,
      { idempotent: true }
    );
    
    // Optionally remove this device from the workspace record on server
    if (removeFromServer) {
      try {
        const pb = await getPocketBase();
        const deviceId = await generateSyncKey();
        
        // Get current workspace to modify its device_ids list
        const workspace = await pb.collection("sync_workspaces").getOne(workspaceId);
        
        if (workspace) {
          // Filter out this device ID
          const updatedDeviceIds = (workspace.device_ids || []).filter(
            (id: string) => id !== deviceId
          );
          
          // Update workspace with new device list
          await pb.collection("sync_workspaces").update(workspaceId, {
            device_ids: updatedDeviceIds,
          });
          
          addSyncLog(`✅ Removed device from workspace on server`, "success");
        }
      } catch (serverErr) {
        // Don't fail if server part fails - still considered successful if local file is deleted
        addSyncLog(`⚠️ Could not update server (but left workspace locally): ${serverErr}`, "warning");
      }
    }
    
    addSyncLog(`✅ Successfully left workspace`, "success");
    return true;
  } catch (err) {
    console.error("Error leaving workspace:", err);
    addSyncLog(`❌ Failed to leave workspace: ${err}`, "error");
    throw err;
  }
};