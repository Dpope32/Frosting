import { addSyncLog } from "@/components/sync/syncUtils";
import { useRegistryStore } from "@/store";
import { storage } from "@/store/AsyncStorage";
import { getCurrentWorkspaceId, getPocketBase, ensureWorkspaceKey, generateSyncKey } from "@/sync";
import * as FileSystem from "expo-file-system";
const WS_KEY_PREFIX = 'ws_key_'; 
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
      await storage.delete(`${WS_KEY_PREFIX}${workspaceId}`);
      if (removeFromServer) {
        try {
          const pb = await getPocketBase();
          const deviceId = await generateSyncKey();
          const workspace = await pb
            .collection("sync_workspaces")
            .getOne(workspaceId);
          
          // Use the ensureWorkspaceKey function
          await ensureWorkspaceKey(workspaceId);
            
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
  