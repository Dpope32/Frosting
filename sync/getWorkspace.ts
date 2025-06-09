// sync/getWorkspace.ts
// Purpose: get the current workspace ID from the device.

import { addSyncLog } from "@/components/sync/syncUtils";
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/** 
 * Retrieve the workspace ID saved on-device (or `null` if not set).
 */
export const getCurrentWorkspaceId = async (): Promise<string | null> => {
    try {
      // Web compatibility: use localStorage instead of FileSystem
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          const workspaceId = window.localStorage.getItem('workspace_id');
          return workspaceId;
        } else {
          addSyncLog(
            "❌ localStorage not available on web",
            "warning",
          );
          return null;
        }
      } else {
        // Native platforms: use FileSystem
        const workspaceId = await FileSystem.readAsStringAsync(
          `${FileSystem.documentDirectory}workspace_id.txt`,
        );
        return workspaceId;
      }
    } catch {
      addSyncLog(
        "❌ No workspace file found. Device not connected.",
        "warning",
      );
      return null;
    }
  };