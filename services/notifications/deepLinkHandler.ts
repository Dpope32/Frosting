import { router } from 'expo-router';
import { handleSharedContact } from '@/services';
import type { NotificationResponse } from 'expo-notifications';
import { verifyAndActivatePremium } from '@/sync/premiumVerification';
import { useUserStore, useToastStore } from '@/store';
import { addSyncLog, getLogQueue } from '@/components/sync/syncUtils';
import { completePremiumPurchase } from '@/services/premiumService';
import { exportLogsToServer } from '@/sync/pocketSync';

// Helper function to export debug logs for deep link issues
const exportDeepLinkDebugLogs = async (context: string): Promise<void> => {
  try {
    const allLogs = getLogQueue();
    const recentLogs = allLogs.slice(-30); // Get more logs for deep link debugging
    if (recentLogs.length > 0) {
      addSyncLog(`📤 [DeepLink] Exporting debug logs: ${context}`, 'verbose');
      await exportLogsToServer(recentLogs);
    }
  } catch (error) {
    // Don't let log export errors break the main flow
    addSyncLog(`⚠️ [DeepLink] Failed to export debug logs: ${error instanceof Error ? error.message : String(error)}`, 'verbose');
  }
};

export function handleDeepLink(event: { url: string | NotificationResponse }) {  
  addSyncLog(`🔗 [DeepLink] Received deep link event: ${JSON.stringify(event)}`, 'verbose');
  
  if (typeof event.url === 'object' && 'notification' in event.url) {
    const url = event.url.notification.request.content.data?.url;
    addSyncLog(`🔔 [DeepLink] Processing notification deep link: ${url}`, 'info');
    if (url) {
      router.push(url.replace('kaiba-nexus://', '/(drawer)/'));
      return;
    }
  }

  if (typeof event.url === 'string') {
    addSyncLog(`🔗 [DeepLink] Processing string URL: ${event.url}`, 'info');
    
    // Handle LemonSqueezy success return URLs
    if (event.url.includes('lemonsqueezy.com') || event.url.includes('success') || event.url.includes('checkout')) {
      addSyncLog(`🍋 [DeepLink] LemonSqueezy URL detected, processing...`, 'info');
      handleLemonSqueezyReturn(event.url);
      return;
    }

    // Handle custom app scheme URLs
    if (event.url.startsWith('kaiba-nexus://')) {
      if (event.url.startsWith('kaiba-nexus://premium-success')) {
        addSyncLog(`🎉 [DeepLink] Premium success URL detected`, 'info');
        handlePremiumSuccess(event.url);
        return;
      }
      
      if (event.url.startsWith('kaiba-nexus://share')) {
        addSyncLog(`📲 [DeepLink] Share URL detected`, 'info');
        const url = new URL(event.url);
        const params = Object.fromEntries(url.searchParams.entries());
        const contactData = {
          name: decodeURIComponent(params.name || ''),
          nickname: params.nickname ? decodeURIComponent(params.nickname) : undefined,
          phoneNumber: params.phone ? decodeURIComponent(params.phone) : undefined,
          email: params.email ? decodeURIComponent(params.email) : undefined,
          occupation: params.occupation ? decodeURIComponent(params.occupation) : undefined
        };
        handleSharedContact(contactData);
        return;
      }
      
      if (event.url.startsWith('kaiba-nexus://habits')) {
        addSyncLog(`🎯 [DeepLink] Habits URL detected`, 'info');
        router.push('/(drawer)/habits');
        return;
      }
    }
    
    addSyncLog(`⚠️ [DeepLink] Unhandled URL: ${event.url}`, 'warning');
  }
}

/**
 * Handle LemonSqueezy return URLs (success, cancelled, etc.)
 * This is crucial for webhook functionality!
 */
async function handleLemonSqueezyReturn(url: string) {
  try {
    addSyncLog(`🍋 [DeepLink] LemonSqueezy return URL detected: ${url}`, 'info');
    await exportDeepLinkDebugLogs(`LemonSqueezy return URL processing: ${url}`);
    
    // Parse URL to check for success indicators
    const urlObj = new URL(url);
    const params = Object.fromEntries(urlObj.searchParams.entries());
    
    addSyncLog(`🔍 [DeepLink] LemonSqueezy URL params: ${JSON.stringify(params)}`, 'verbose');
    
    // Check for success indicators in URL
    const isSuccess = 
      url.includes('success') || 
      params.status === 'success' || 
      params.payment_status === 'paid' ||
      urlObj.pathname.includes('success');
    
    addSyncLog(`🎯 [DeepLink] LemonSqueezy success check: ${isSuccess}`, 'info');
    
    if (isSuccess) {
      addSyncLog(`✅ [DeepLink] LemonSqueezy success detected, verifying premium status...`, 'info');
      await verifyPremiumStatus(params);
      await exportDeepLinkDebugLogs(`LemonSqueezy SUCCESS processing completed`);
    } else {
      addSyncLog(`❌ [DeepLink] LemonSqueezy return without success indicator`, 'warning');
      useToastStore.getState().showToast('Purchase may not have completed', 'warning');
      await exportDeepLinkDebugLogs(`LemonSqueezy FAILED - no success indicator`);
    }
    
    // Navigate to sync page to show premium status
    addSyncLog(`🧭 [DeepLink] Navigating to sync modal`, 'info');
    router.push('/modals/sync');
    
  } catch (error) {
    addSyncLog(`🔥 [DeepLink] Error handling LemonSqueezy return: ${error instanceof Error ? error.message : String(error)}`, 'error');
    await exportDeepLinkDebugLogs(`LemonSqueezy ERROR: ${error instanceof Error ? error.message : String(error)}`);
    useToastStore.getState().showToast('Error processing payment return', 'error');
  }
}

/**
 * Handle custom premium success deep link (kaiba-nexus://premium-success)
 */
async function handlePremiumSuccess(url: string) {
  try {
    addSyncLog(`🎉 [DeepLink] Premium success deep link detected: ${url}`, 'info');
    await exportDeepLinkDebugLogs(`Premium success deep link processing: ${url}`);
    
    const urlObj = new URL(url);
    const params = Object.fromEntries(urlObj.searchParams.entries());
    
    addSyncLog(`🔍 [DeepLink] Premium success params: ${JSON.stringify(params)}`, 'verbose');
    
    await verifyPremiumStatus(params);
    
    // Navigate to sync page
    addSyncLog(`🧭 [DeepLink] Navigating to sync modal after premium success`, 'info');
    router.push('/modals/sync');
    
  } catch (error) {
    addSyncLog(`🔥 [DeepLink] Error handling premium success: ${error instanceof Error ? error.message : String(error)}`, 'error');
    await exportDeepLinkDebugLogs(`Premium success ERROR: ${error instanceof Error ? error.message : String(error)}`);
    useToastStore.getState().showToast('Error activating premium', 'error');
  }
}

/**
 * Verify premium status with PocketBase and activate if valid
 * This function is KEY for webhook functionality!
 */
async function verifyPremiumStatus(params: Record<string, string>) {
  try {
    const { username } = useUserStore.getState().preferences;
    
    addSyncLog(`🎯 [DeepLink] Starting premium verification for user: ${username || 'UNKNOWN'}`, 'info');
    
    if (!username) {
      addSyncLog(`❌ [DeepLink] No username found in user store, cannot verify premium`, 'error');
      useToastStore.getState().showToast('Username required for premium verification', 'error');
      await exportDeepLinkDebugLogs(`Premium verification FAILED - no username`);
      return;
    }
    
    addSyncLog(`🔍 [DeepLink] Verifying premium status for username: ${username}`, 'info');
    
    // First, mark purchase as successful in premium service
    const orderId = params.order_id || params.orderId || params.id;
    if (orderId) {
      addSyncLog(`💳 [DeepLink] Processing order completion: ${orderId}`, 'info');
      await completePremiumPurchase(orderId);
    } else {
      addSyncLog(`⚠️ [DeepLink] No order ID found in params`, 'warning');
    }
    
    // Verify with PocketBase using existing infrastructure - no import issues!
    addSyncLog(`🔍 [DeepLink] Starting PocketBase premium verification...`, 'info');
    const success = await Promise.race([
      verifyAndActivatePremium(username),
      new Promise<boolean>((resolve) => 
        setTimeout(() => {
          addSyncLog('⏰ [DeepLink] Premium verification timed out, but purchase may still be valid', 'warning');
          resolve(false);
        }, 15000) // 15 second timeout for deep link verification
      )
    ]);
    
    if (success) {
      addSyncLog(`🎉 [DeepLink] Premium successfully activated for ${username}!`, 'success');
      useToastStore.getState().showToast('Premium activated successfully! 🎉', 'success');
      await exportDeepLinkDebugLogs(`Premium verification SUCCESS for ${username}`);
      
      // Navigate to sync page to show the new premium status
      setTimeout(() => {
        router.push('/modals/sync');
      }, 1000);
    } else {
      addSyncLog(`❌ [DeepLink] Premium verification failed for ${username}`, 'error');
      useToastStore.getState().showToast('Premium verification failed. Please contact support if you completed purchase.', 'error');
      await exportDeepLinkDebugLogs(`Premium verification FAILED for ${username}`);
    }
    
  } catch (error) {
    addSyncLog(`🔥 [DeepLink] Error during premium verification: ${error instanceof Error ? error.message : String(error)}`, 'error');
    await exportDeepLinkDebugLogs(`Premium verification ERROR: ${error instanceof Error ? error.message : String(error)}`);
    useToastStore.getState().showToast('Error verifying premium status - app continues normally', 'error');
  }
}