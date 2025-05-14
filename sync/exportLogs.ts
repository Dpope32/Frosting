import { addSyncLog } from "@/components/sync/syncUtils";
import { useToastStore } from "@/store/ToastStore";
import { exportLogsToServer } from "./pocketSync";
import { useUserStore } from "@/store/UserStore";
    
  export const exportLogs = async (syncLogs: Array<{id: string; message: string; timestamp: Date; status: 'info' | 'success' | 'error' | 'verbose' |'warning'; details?: string}>) => {
    const premium = useUserStore.getState().preferences.premium === true;
    if (!premium) { 
      useToastStore.getState().showToast('Premium required for log export', 'error');
      return;
    }
    
    try {
      addSyncLog('Exporting logs to server...', 'info');
      await exportLogsToServer(syncLogs);
      addSyncLog('Logs exported successfully', 'success');
      useToastStore.getState().showToast('Logs exported successfully', 'success');
    } catch (error) {
      addSyncLog('Failed to export logs', 'error', 
        error instanceof Error ? error.message : String(error));
      useToastStore.getState().showToast('Failed to export logs', 'error');
    }
  };