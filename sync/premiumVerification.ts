import { getPocketBase, checkNetworkConnectivity, exportLogsToServer } from './pocketSync';
import { useUserStore } from '@/store';
import { addSyncLog, getLogQueue } from '@/components/sync/syncUtils';

interface PremiumUser {
  id: string;
  username: string;
  device_id: string;
  purchase_date: string;
  is_active: boolean;
  user_email: string;
  plan_id: string;
  ls_subscription_id: string;
  created: string;
  updated: string;
}

/**
 * Check if a user has premium access using existing PocketBase infrastructure
 */
export const checkPremiumStatus = async (username: string, deviceId?: string): Promise<{ isPremium: boolean; user?: PremiumUser }> => {
  try {
    addSyncLog(`🔍 Checking premium status for user: ${username}`, 'info');
    
    // Check network first (using existing helper)
    if (!(await checkNetworkConnectivity())) {
      addSyncLog(`🌐 No network connectivity for premium verification`, 'warning');
      await exportDebugLogs(`Premium verification failed - no network for ${username}`);
      return { isPremium: false };
    }
    
    // Use existing PocketBase helper (handles all the import complexity)
    const pb = await getPocketBase();
    
    // Build filter query
    let filter = `username = "${username}" && is_active = true`;
    if (deviceId) {
      filter += ` && device_id = "${deviceId}"`;
    }
    
    addSyncLog(`🔍 Querying premium_users with filter: ${filter} in sync/premiumVerification.ts`, 'verbose');
    const record = await pb.collection('premium_users').getFirstListItem(filter);
    
    if (record) {
      addSyncLog(`✅ Premium user found: ${username} (Plan: ${record.plan_id})`, 'success');
      await exportDebugLogs(`Premium verification SUCCESS for ${username}`);
      return { 
        isPremium: true, 
        user: record as unknown as PremiumUser 
      };
    }
    
    addSyncLog(`❌ No premium access found for user: ${username}`, 'warning');
    await exportDebugLogs(`Premium verification FAILED - user not found: ${username}`);
    return { isPremium: false };
    
  } catch (error) {
    // Handle specific errors
    if (error instanceof Error) {
      const message = error.message;
      
      // Silent skip for sync errors (already handled by getPocketBase)
      if (message === 'SKIP_SYNC_SILENTLY') {
        addSyncLog(`⚠️ PocketBase not available for premium verification`, 'warning');
        await exportDebugLogs(`Premium verification failed - PocketBase unavailable for ${username}`);
        return { isPremium: false };
      }
      
      // PocketBase 404 (user not found)
      if (message.includes('404') || message.includes('not found')) {
        addSyncLog(`❌ No premium access found for user: ${username}`, 'warning');
        await exportDebugLogs(`Premium verification 404 - user not found: ${username}`);
        return { isPremium: false };
      }
    }
    
    // Other errors - log but don't break the app
    addSyncLog(`🔥 Error checking premium status: ${error instanceof Error ? error.message : String(error)}`, 'error');
    await exportDebugLogs(`Premium verification ERROR for ${username}: ${error instanceof Error ? error.message : String(error)}`);
    return { isPremium: false }; // Fail safely
  }
};

/**
 * Verify and activate premium status for a user (used by deep links)
 */
export const verifyAndActivatePremium = async (username: string, deviceId?: string): Promise<boolean> => {
  try {
    addSyncLog(`🎯 Starting premium activation for ${username}`, 'info');
    const { isPremium, user } = await checkPremiumStatus(username, deviceId);
    
    if (isPremium && user) {
      // Update local user store
      const userStore = useUserStore.getState();
      userStore.setPreferences({ premium: true });
      
      addSyncLog(`🎉 Premium activated for ${username} (Plan: ${user.plan_id})`, 'success');
      await exportDebugLogs(`Premium activation SUCCESS for ${username} - Plan: ${user.plan_id}`);
      return true;
    }
    
    addSyncLog(`❌ Premium activation failed - no valid premium found for ${username}`, 'warning');
    await exportDebugLogs(`Premium activation FAILED - no valid premium found for ${username}`);
    return false;
  } catch (error) {
    addSyncLog(`🔥 Error verifying premium status: ${error instanceof Error ? error.message : String(error)}`, 'error');
    await exportDebugLogs(`Premium activation ERROR for ${username}: ${error instanceof Error ? error.message : String(error)}`);
    return false; // Fail safely
  }
};

/**
 * Get all premium users (for admin purposes)
 */
export const getAllPremiumUsers = async (): Promise<PremiumUser[]> => {
  try {
    if (!(await checkNetworkConnectivity())) {
      addSyncLog(`🌐 No network connectivity for fetching premium users`, 'warning');
      return [];
    }
    
    const pb = await getPocketBase();
    
    addSyncLog('🔍 GET request source: sync/premiumVerification.ts - getAllPremiumUsers()', 'verbose');
    const records = await pb.collection('premium_users').getFullList({
      sort: '-created',
      filter: 'is_active = true'
    });
    
    return records as unknown as PremiumUser[];
  } catch (error) {
    addSyncLog(`🔥 Error fetching premium users: ${error instanceof Error ? error.message : String(error)}`, 'error');
    return []; // Return empty array instead of throwing
  }
};

/**
 * Export debug logs for premium verification issues
 * This will help debug issues like Ksizzle13's case
 */
const exportDebugLogs = async (context: string): Promise<void> => {
  try {
    // Always try to export logs, even for non-premium users during verification
    const allLogs = getLogQueue();
    const recentLogs = allLogs.slice(-20); // Get last 20 log entries
    if (recentLogs.length > 0) {
      addSyncLog(`📤 Exporting debug logs: ${context}`, 'verbose');
      await exportLogsToServer(recentLogs);
    }
  } catch (error) {
    // Don't let log export errors break the main flow
    addSyncLog(`⚠️ Failed to export debug logs: ${error instanceof Error ? error.message : String(error)}`, 'verbose');
  }
}; 