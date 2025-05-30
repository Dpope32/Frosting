// sync/getWorkspace.ts
// Purpose: get the current workspace ID from the device.

import { addSyncLog } from "@/components/sync/syncUtils";
import * as FileSystem from 'expo-file-system';

/** 
 * Retrieve the workspace ID saved on-device (or `null` if not set).
 */
export const getCurrentWorkspaceId = async (): Promise<string | null> => {
    try {
      const workspaceId = await FileSystem.readAsStringAsync(
        `${FileSystem.documentDirectory}workspace_id.txt`,
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
  