import { addSyncLog } from "@/components/sync/syncUtils";
import * as FileSystem from 'expo-file-system';

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
  