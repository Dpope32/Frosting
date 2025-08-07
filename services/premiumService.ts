import { AppState, AppStateStatus } from 'react-native';
import { useUserStore } from '@/store/UserStore';
import { useRegistryStore } from '@/store/RegistryStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addSyncLog } from '@/components/sync/syncUtils';
import { pullLatestSnapshot, pushSnapshot } from '@/sync/snapshotPushPull';

const PENDING_PURCHASE_KEY = 'pending_premium_purchase';
const LEMON_SQUEEZY_SUCCESS_KEY = 'lemon_squeezy_success';

interface PendingPurchase {
  timestamp: number;
  orderId?: string;
  variantId?: string;
}

class PremiumService {
  private appStateSubscription: any = null;
  private isListening = false;
  private previousPremiumStatus = false;

  /**
   * Start listening for app state changes to detect return from Lemon Squeezy
   */
  startListening() {
    if (this.isListening) return;
    
    this.isListening = true;
    this.previousPremiumStatus = useUserStore.getState().preferences.premium === true;
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  /**
   * Stop listening for app state changes
   */
  stopListening() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    this.isListening = false;
  }

  /**
   * Handle app state changes - check for successful purchase when app becomes active
   */
  private handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      await this.checkForSuccessfulPurchase();
      this.checkPremiumStatusChange();
    }
  };

  /**
   * Mark that a purchase flow is starting
   */
  async markPurchaseStarted(orderId?: string, variantId?: string) {
    const pendingPurchase: PendingPurchase = {
      timestamp: Date.now(),
      orderId,
      variantId
    };
    
    await AsyncStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify(pendingPurchase));
  }

  /**
   * Check if there's a pending purchase that might have completed
   */
  async checkForSuccessfulPurchase() {
    try {
      const pendingPurchaseData = await AsyncStorage.getItem(PENDING_PURCHASE_KEY);
      
      if (!pendingPurchaseData) return;

      const pendingPurchase: PendingPurchase = JSON.parse(pendingPurchaseData);
      
      // Check if purchase was started recently (within last 30 minutes)
      const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
      if (pendingPurchase.timestamp < thirtyMinutesAgo) {
        // Purchase is too old, clean it up
        await AsyncStorage.removeItem(PENDING_PURCHASE_KEY);
        return;
      }

      // Check for success indicators
      const hasSuccessFlag = await AsyncStorage.getItem(LEMON_SQUEEZY_SUCCESS_KEY);
      
      if (hasSuccessFlag) {
        await this.processPurchaseSuccess(pendingPurchase);
      } else {
        // Could implement additional checks here like:
        // - API call to verify purchase status
        // - Deep link parameter checking
      }
    } catch (error) {
      console.error('Error checking for successful purchase:', error);
    }
  }

  /**
   * Process a successful purchase
   */
  private async processPurchaseSuccess(purchase: PendingPurchase) {
    try {
      addSyncLog('🎉 Processing premium purchase success', 'success');
      
      // Update registry sync status to indicate premium activation
      useRegistryStore.getState().setSyncStatus('syncing');
      
      // Update user premium status
      const userStore = useUserStore.getState();
      const wasPremium = userStore.preferences.premium === true;
      userStore.setPreferences({ premium: true });

      // Clean up pending purchase data
      await AsyncStorage.multiRemove([PENDING_PURCHASE_KEY, LEMON_SQUEEZY_SUCCESS_KEY]);

      // If user wasn't premium before, trigger initial sync operations
      if (!wasPremium) {
        addSyncLog('🔄 First-time premium activation - initializing sync', 'info');
        await this.handleFirstTimePremiumActivation();
      }

      addSyncLog('✅ Premium activation complete', 'success');
      
    } catch (error) {
      addSyncLog('❌ Error processing premium purchase', 'error', error instanceof Error ? error.message : String(error));
      useRegistryStore.getState().setSyncStatus('error');
    } finally {
      useRegistryStore.getState().setSyncStatus('idle');
    }
  }

  /**
   * Handle first-time premium activation
   */
  private async handleFirstTimePremiumActivation() {
    try {
      await pullLatestSnapshot();
      
      // Small delay to ensure pull is complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Then push current local data to ensure it's backed up
      addSyncLog('📤 Pushing local data to workspace', 'info');
      await pushSnapshot();
      
    } catch (error) {
      addSyncLog('⚠️ Error during first-time premium sync', 'warning', error instanceof Error ? error.message : String(error));
      // Don't throw - we don't want to fail the premium activation
    }
  }

  /**
   * Check for premium status changes
   */
  private checkPremiumStatusChange() {
    const currentPremiumStatus = useUserStore.getState().preferences.premium === true;
    
    if (!this.previousPremiumStatus && currentPremiumStatus) {
      // User just became premium
      addSyncLog('🎉 Premium status activated', 'success');
      this.handleFirstTimePremiumActivation();
    }
    
    this.previousPremiumStatus = currentPremiumStatus;
  }

  /**
   * Manually mark purchase as successful (can be called from deep links or webhooks)
   */
  async markPurchaseSuccessful(orderId?: string) {
    await AsyncStorage.setItem(LEMON_SQUEEZY_SUCCESS_KEY, JSON.stringify({
      timestamp: Date.now(),
      orderId
    }));
    
    // Immediately check for purchase completion
    await this.checkForSuccessfulPurchase();
  }

  /**
   * Cancel pending purchase (user cancelled or failed)
   */
  async cancelPendingPurchase() {
    await AsyncStorage.multiRemove([PENDING_PURCHASE_KEY, LEMON_SQUEEZY_SUCCESS_KEY]);
  }

  /**
   * Get pending purchase info
   */
  async getPendingPurchase(): Promise<PendingPurchase | null> {
    try {
      const data = await AsyncStorage.getItem(PENDING_PURCHASE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting pending purchase:', error);
      return null;
    }
  }

  /**
   * Initialize the service
   */
  async initialize() {
    // Check for any pending purchases on app start
    await this.checkForSuccessfulPurchase();
    
    // Start listening for app state changes
    this.startListening();
  }

  /**
   * Cleanup service
   */
  cleanup() {
    this.stopListening();
  }
}

// Export singleton instance
export const premiumService = new PremiumService();

// Export helper functions for easier usage
export const startPremiumPurchase = (orderId?: string, variantId?: string) => 
  premiumService.markPurchaseStarted(orderId, variantId);

export const completePremiumPurchase = (orderId?: string) => 
  premiumService.markPurchaseSuccessful(orderId);

export const cancelPremiumPurchase = () => 
  premiumService.cancelPendingPurchase();

export const initializePremiumService = () => 
  premiumService.initialize(); 