import { getPocketBase, checkNetworkConnectivity } from './pocketSync';
import { useUserStore } from '@/store';
import { addSyncLog } from '@/components/sync/syncUtils';

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
      return { isPremium: false };
    }
    
    // Use existing PocketBase helper (handles all the import complexity)
    const pb = await getPocketBase();
    
    // Build filter query
    let filter = `username = "${username}" && is_active = true`;
    if (deviceId) {
      filter += ` && device_id = "${deviceId}"`;
    }
    
    const record = await pb.collection('premium_users').getFirstListItem(filter);
    
    if (record) {
      addSyncLog(`✅ Premium user found: ${username}`, 'success');
      return { 
        isPremium: true, 
        user: record as unknown as PremiumUser 
      };
    }
    
    addSyncLog(`❌ No premium access found for user: ${username}`, 'warning');
    return { isPremium: false };
    
  } catch (error) {
    // Handle specific errors
    if (error instanceof Error) {
      const message = error.message;
      
      // Silent skip for sync errors (already handled by getPocketBase)
      if (message === 'SKIP_SYNC_SILENTLY') {
        addSyncLog(`⚠️ PocketBase not available for premium verification`, 'warning');
        return { isPremium: false };
      }
      
      // PocketBase 404 (user not found)
      if (message.includes('404') || message.includes('not found')) {
        addSyncLog(`❌ No premium access found for user: ${username}`, 'warning');
        return { isPremium: false };
      }
    }
    
    // Other errors - log but don't break the app
    addSyncLog(`🔥 Error checking premium status: ${error instanceof Error ? error.message : String(error)}`, 'error');
    return { isPremium: false }; // Fail safely
  }
};

/**
 * Verify and activate premium status for a user (used by deep links)
 */
export const verifyAndActivatePremium = async (username: string, deviceId?: string): Promise<boolean> => {
  try {
    const { isPremium, user } = await checkPremiumStatus(username, deviceId);
    
    if (isPremium && user) {
      // Update local user store
      const userStore = useUserStore.getState();
      userStore.setPreferences({ premium: true });
      
      addSyncLog(`🎉 Premium activated for ${username} (Plan: ${user.plan_id})`, 'success');
      return true;
    }
    
    return false;
  } catch (error) {
    addSyncLog(`🔥 Error verifying premium status: ${error instanceof Error ? error.message : String(error)}`, 'error');
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