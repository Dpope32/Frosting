import { router } from 'expo-router';
import { handleSharedContact } from '@/services';
import type { NotificationResponse } from 'expo-notifications';
import { verifyAndActivatePremium } from '@/sync/premiumVerification';
import { useUserStore, useToastStore } from '@/store';
import { addSyncLog } from '@/components/sync/syncUtils';
import { completePremiumPurchase } from '@/services/premiumService';

export function handleDeepLink(event: { url: string | NotificationResponse }) {  
  if (typeof event.url === 'object' && 'notification' in event.url) {
    const url = event.url.notification.request.content.data?.url;
    if (url) {
      router.push(url.replace('kaiba-nexus://', '/(drawer)/'));
      return;
    }
  }

  if (typeof event.url === 'string') {
    // Handle LemonSqueezy success return URLs
    if (event.url.includes('lemonsqueezy.com') || event.url.includes('success') || event.url.includes('checkout')) {
      handleLemonSqueezyReturn(event.url);
      return;
    }

    // Handle custom app scheme URLs
    if (event.url.startsWith('kaiba-nexus://')) {
      if (event.url.startsWith('kaiba-nexus://premium-success')) {
        handlePremiumSuccess(event.url);
        return;
      }
      
      if (event.url.startsWith('kaiba-nexus://share')) {
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
        router.push('/(drawer)/habits');
        return;
      }
    }
  }
}

/**
 * Handle LemonSqueezy return URLs (success, cancelled, etc.)
 */
async function handleLemonSqueezyReturn(url: string) {
  try {
    addSyncLog(`🍋 LemonSqueezy return URL detected: ${url}`, 'info');
    
    // Parse URL to check for success indicators
    const urlObj = new URL(url);
    const params = Object.fromEntries(urlObj.searchParams.entries());
    
    // Check for success indicators in URL
    const isSuccess = 
      url.includes('success') || 
      params.status === 'success' || 
      params.payment_status === 'paid' ||
      urlObj.pathname.includes('success');
    
    if (isSuccess) {
      addSyncLog(`✅ LemonSqueezy success detected, verifying premium status...`, 'info');
      await verifyPremiumStatus(params);
    } else {
      addSyncLog(`❌ LemonSqueezy return without success indicator`, 'warning');
      useToastStore.getState().showToast('Purchase may not have completed', 'warning');
    }
    
    // Navigate to sync page to show premium status
    router.push('/modals/sync');
    
  } catch (error) {
    addSyncLog(`🔥 Error handling LemonSqueezy return: ${error instanceof Error ? error.message : String(error)}`, 'error');
    useToastStore.getState().showToast('Error processing payment return', 'error');
  }
}

/**
 * Handle custom premium success deep link (kaiba-nexus://premium-success)
 */
async function handlePremiumSuccess(url: string) {
  try {
    addSyncLog(`🎉 Premium success deep link detected: ${url}`, 'info');
    
    const urlObj = new URL(url);
    const params = Object.fromEntries(urlObj.searchParams.entries());
    
    await verifyPremiumStatus(params);
    
    // Navigate to sync page
    router.push('/modals/sync');
    
  } catch (error) {
    addSyncLog(`🔥 Error handling premium success: ${error instanceof Error ? error.message : String(error)}`, 'error');
    useToastStore.getState().showToast('Error activating premium', 'error');
  }
}

/**
 * Verify premium status with PocketBase and activate if valid
 */
async function verifyPremiumStatus(params: Record<string, string>) {
  try {
    const { username } = useUserStore.getState().preferences;
    
    if (!username) {
      addSyncLog(`❌ No username found in user store, cannot verify premium`, 'error');
      useToastStore.getState().showToast('Username required for premium verification', 'error');
      return;
    }
    
    addSyncLog(`🔍 Verifying premium status for username: ${username}`, 'info');
    
    // First, mark purchase as successful in premium service
    const orderId = params.order_id || params.orderId || params.id;
    if (orderId) {
      await completePremiumPurchase(orderId);
    }
    
    // Verify with PocketBase using existing infrastructure - no import issues!
    const success = await Promise.race([
      verifyAndActivatePremium(username),
      new Promise<boolean>((resolve) => 
        setTimeout(() => {
          addSyncLog('⏰ Premium verification timed out, but purchase may still be valid', 'warning');
          resolve(false);
        }, 15000) // 15 second timeout for deep link verification
      )
    ]);
    
    if (success) {
      addSyncLog(`🎉 Premium successfully activated for ${username}!`, 'success');
      useToastStore.getState().showToast('Premium activated successfully! 🎉', 'success');
      
      // Navigate to sync page to show the new premium status
      setTimeout(() => {
        router.push('/modals/sync');
      }, 1000);
    } else {
      addSyncLog(`❌ Premium verification failed for ${username}`, 'error');
      useToastStore.getState().showToast('Premium verification failed. Please contact support if you completed purchase.', 'error');
    }
    
  } catch (error) {
    addSyncLog(`🔥 Error during premium verification: ${error instanceof Error ? error.message : String(error)}`, 'error');
    useToastStore.getState().showToast('Error verifying premium status - app continues normally', 'error');
  }
}