import { useEffect, useRef } from 'react';
import { useUserStore } from '@/store';
import { checkPremiumStatus } from '@/sync/premiumVerification';
import { addSyncLog } from '@/components/sync/syncUtils';

export const usePremiumVerification = () => {
  const username = useUserStore(state => state.preferences.username);
  const premium = useUserStore(state => state.preferences.premium);
  const setPreferences = useUserStore(state => state.setPreferences);
  const hasVerified = useRef(false);
  
  useEffect(() => {
    const verifyPremiumStatus = async () => {
      const trimmedUsername = username?.trim();
      
      if (!trimmedUsername) {
        addSyncLog('⚠️ No username for premium verification', 'warning');
        return;
      }
      
      // If user is already premium locally, skip verification
      if (premium === true) {
        addSyncLog(`✅ User ${trimmedUsername} already has premium locally`, 'info');
        return;
      }
      
      // Prevent multiple verification attempts
      if (hasVerified.current) {
        return;
      }
      
      hasVerified.current = true;
      
      try {
        addSyncLog(`🔍 Verifying premium status for ${trimmedUsername}...`, 'info');
        
        // Uses existing PocketBase infrastructure - no import issues!
        const { isPremium, user } = await checkPremiumStatus(trimmedUsername);
        
        if (isPremium && user) {
          addSyncLog(`🎉 Premium verified for ${trimmedUsername} (Plan: ${user.plan_id})`, 'success');
          setPreferences({ premium: true });
        } else {
          addSyncLog(`ℹ️ No premium access found for ${trimmedUsername}`, 'info');
        }
      } catch (error) {
        // This should rarely happen since checkPremiumStatus handles errors internally
        addSyncLog(`🔥 Premium verification failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
        hasVerified.current = false; // Allow retry on error
      }
    };
    
    // Only verify if we have a username and user is not already premium
    if (username?.trim() && premium !== true) {
      // Delay to ensure stores are hydrated, but make it non-blocking
      const timer = setTimeout(() => {
        // Run verification in background - don't await it
        verifyPremiumStatus().catch(() => {
          // Silently handle any remaining errors
          addSyncLog('Premium verification completed with errors', 'verbose');
        });
      }, 2000); // Slightly longer delay for better stability
      
      return () => clearTimeout(timer);
    }
  }, [username, premium, setPreferences]);
}; 