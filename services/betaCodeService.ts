// services/betaCodeService.ts
import { useUserStore } from '@/store/UserStore';
import { useToastStore } from '@/store/ToastStore';
import { addSyncLog } from '@/components/sync/syncUtils';
import { getPocketBase } from '@/sync/pocketSync';
import { premiumService } from './premiumService';

// You can add these to your PocketBase as a new collection or hardcode them
const VALID_BETA_CODES = [
  'BETA2025',
  'EARLYBIRD',
  'KAIBATEST',
  'PREMIUM100',
  'SYNCBETA'
];

interface BetaCode {
  id: string;
  code: string;
  uses_remaining: number;
  max_uses: number;
  active: boolean;
  created: string;
  updated: string;
}

class BetaCodeService {
  
  /**
   * Validate and redeem a beta code
   */
  async redeemBetaCode(code: string): Promise<boolean> {
    try {
      const trimmedCode = code.trim().toUpperCase();
      addSyncLog(`🎟️ Attempting to redeem beta code: ${trimmedCode}`, 'info');
      
      const { username } = useUserStore.getState().preferences;
      if (!username) {
        addSyncLog('❌ No username found, cannot redeem beta code', 'error');
        useToastStore.getState().showToast('Username required to redeem beta code', 'error');
        return false;
      }

      // Option 1: Simple hardcoded validation (easiest for MVP)
      if (this.isValidHardcodedCode(trimmedCode)) {
        await this.activatePremiumViaCode(username, trimmedCode);
        return true;
      }

      // Option 2: PocketBase validation (if you want tracking)
      const isValid = await this.validateCodeWithPocketBase(trimmedCode, username);
      if (isValid) {
        await this.activatePremiumViaCode(username, trimmedCode);
        return true;
      }

      addSyncLog(`❌ Invalid beta code: ${trimmedCode}`, 'warning');
      useToastStore.getState().showToast('Invalid beta code', 'error');
      return false;

    } catch (error) {
      addSyncLog('🔥 Error redeeming beta code', 'error', error instanceof Error ? error.message : String(error));
      useToastStore.getState().showToast('Error redeeming beta code', 'error');
      return false;
    }
  }

  /**
   * Simple hardcoded validation (easiest for MVP)
   */
  private isValidHardcodedCode(code: string): boolean {
    return VALID_BETA_CODES.includes(code);
  }

  /**
   * Validate code with PocketBase (optional - for tracking usage)
   */
  private async validateCodeWithPocketBase(code: string, username: string): Promise<boolean> {
    try {
      const pb = await getPocketBase();
      
      // Get the beta code record
      const records = await pb.collection('beta_codes').getList(1, 1, {
        filter: `code="${code}" && active=true && uses_remaining>0`
      });

      if (records.items.length === 0) {
        addSyncLog(`❌ Beta code not found or inactive: ${code}`, 'warning');
        return false;
      }

      const betaCode = records.items[0] as unknown as BetaCode;
      
      // Check if user already used this code
      const existingUse = await pb.collection('beta_code_uses').getList(1, 1, {
        filter: `code_id="${betaCode.id}" && username="${username}"`
      });

      if (existingUse.items.length > 0) {
        addSyncLog(`❌ Beta code already used by user: ${username}`, 'warning');
        useToastStore.getState().showToast('You have already used this beta code', 'error');
        return false;
      }

      // Record the usage
      await pb.collection('beta_code_uses').create({
        code_id: betaCode.id,
        username: username,
        redeemed_at: new Date().toISOString()
      });

      // Decrement uses remaining
      await pb.collection('beta_codes').update(betaCode.id, {
        uses_remaining: betaCode.uses_remaining - 1
      });

      addSyncLog(`✅ Beta code validated and usage recorded`, 'success');
      return true;

    } catch (error) {
      addSyncLog('🔥 Error validating beta code with PocketBase', 'error', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Activate premium via beta code
   */
  private async activatePremiumViaCode(username: string, code: string): Promise<void> {
    try {
      addSyncLog(`🎉 Activating premium for ${username} via beta code: ${code}`, 'info');
      
      // Update user preferences
      const userStore = useUserStore.getState();
      userStore.setPreferences({ 
        premium: true
      });

      // Mark purchase as successful in premium service
      await premiumService.markPurchaseSuccessful(`beta_${code}_${username}`);

      addSyncLog(`✅ Premium activated successfully via beta code`, 'success');
      useToastStore.getState().showToast('🎉 Premium activated with beta code!', 'success');

      // Small delay then trigger first-time premium sync
      setTimeout(() => {
        premiumService.checkForSuccessfulPurchase();
      }, 500);

    } catch (error) {
      addSyncLog('🔥 Error activating premium via beta code', 'error', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Check if user has premium via any method
   */
  isPremiumActive(): boolean {
    return useUserStore.getState().preferences.premium === true;
  }

  /**
   * Get premium source (purchase, beta_code, etc.)
   */
  getPremiumSource(): string | undefined {
    // Since premiumSource doesn't exist in UserPreferences yet, just return undefined
    return undefined;
  }
}

// Export singleton
export const betaCodeService = new BetaCodeService();

// Helper functions
export const redeemBetaCode = (code: string) => betaCodeService.redeemBetaCode(code);
export const isPremiumActive = () => betaCodeService.isPremiumActive();
export const getPremiumSource = () => betaCodeService.getPremiumSource();