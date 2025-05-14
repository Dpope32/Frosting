import { getPocketBase } from "./pocketSync";
import * as FileSystem from 'expo-file-system';
import { generateSyncKey } from '@/sync/registrySyncManager';
import { addSyncLog } from '@/components/sync/syncUtils';

// New function to create or join a workspace
export const createOrJoinWorkspace = async (workspaceId?: string, inviteCode?: string): Promise<{id: string, inviteCode: string}> => {
    try {
      addSyncLog('Creating or joining workspace', 'info');
      const pb = await getPocketBase();
      const deviceId = await generateSyncKey();
      
      // If workspaceId is provided, attempt to join existing workspace
      if (workspaceId && inviteCode) {
        // Verify invite code is valid for this workspace
        const workspace = await pb.collection('sync_workspaces').getOne(workspaceId);
        addSyncLog('Workspace found', 'info');
        if (workspace.invite_code === inviteCode) {
          // Add this device to the workspace's authorized devices
          await pb.collection('sync_workspaces').update(workspaceId, {
            "device_ids+": deviceId
          });
          
          // Store the workspace ID locally
          await FileSystem.writeAsStringAsync(
            `${FileSystem.documentDirectory}workspace_id.txt`,
            workspaceId
          );
          
          return { id: workspaceId, inviteCode: workspace.invite_code };
        } else {
          addSyncLog('Invalid invite code', 'error');
          throw new Error("Invalid invite code");
        }
      } else {
        // Create new workspace
        addSyncLog("📡 Creating new sync workspace...", "info");

        const newInviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        const newWorkspace = await pb.collection('sync_workspaces').create({
          owner_device_id: deviceId,
          device_ids: [deviceId],
          invite_code: newInviteCode,
        });

        addSyncLog(
          `✅ Created sync workspace with ID: ${newWorkspace.id}`,
          "success"
        );

        // Store the workspace ID locally
        await FileSystem.writeAsStringAsync(
          `${FileSystem.documentDirectory}workspace_id.txt`,
          newWorkspace.id
        );

        addSyncLog(
          `📁 Saved workspace ID to file: ${newWorkspace.id}`,
          "verbose"
        );

        return { id: newWorkspace.id, inviteCode: newInviteCode };
      }
    } catch (error) {
      console.error("Error creating/joining workspace:", error);
      throw error;
    }
  };
  
  // Function to get current workspace ID
  export const getCurrentWorkspaceId = async (): Promise<string | null> => {
    try {
      addSyncLog("📖 Attempting to read workspace ID from file...", "verbose");

      const workspaceId = await FileSystem.readAsStringAsync(
        `${FileSystem.documentDirectory}workspace_id.txt`
      );

      addSyncLog(`📦 Found workspace ID: ${workspaceId}`, "info");
      return workspaceId;
    } catch (error) {
      addSyncLog(
        "❌ No workspace file found. Device is not connected to a sync workspace.",
        "warning"
      );

      return null; // No workspace set yet
    }
  };
  