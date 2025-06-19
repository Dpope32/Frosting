import { useEffect, useRef } from 'react';
import { useUserStore } from '@/store';
import { checkPremiumStatus } from '@/sync/premiumVerification';
import { addSyncLog, getLogQueue } from '@/components/sync/syncUtils';
import { exportLogsToServer } from '@/sync/pocketSync';

export const usePremiumVerification = () => {
  const username = useUserStore(state => state.preferences.username);
  const premium = useUserStore(state => state.preferences.premium);
  const setPreferences = useUserStore(state => state.setPreferences);
  const hasVerified = useRef(false);
  
  // Helper function to export debug logs
  const exportDebugLogs = async (context: string): Promise<void> => {
    try {
      const allLogs = getLogQueue();
      const recentLogs = allLogs.slice(-20); // Get last 20 log entries
      if (recentLogs.length > 0) {
        addSyncLog(`📤 [usePremiumVerification] Exporting debug logs: ${context}`, 'verbose');
        await exportLogsToServer(recentLogs);
      }
    } catch (error) {
      // Don't let log export errors break the main flow
      addSyncLog(`⚠️ Failed to export debug logs: ${error instanceof Error ? error.message : String(error)}`, 'verbose');
    }
  };
  
  useEffect(() => {
    const verifyPremiumStatus = async () => {
      const trimmedUsername = username?.trim();
      
      if (!trimmedUsername) {
        addSyncLog('⚠️ No username for premium verification', 'warning');
        await exportDebugLogs('Premium verification skipped - no username');
        return;
      }
      
      // If user is already premium locally, skip verification
      if (premium === true) {
        addSyncLog(`✅ User ${trimmedUsername} already has premium locally`, 'info');
        return;
      }
      
      // Prevent multiple verification attempts
      if (hasVerified.current) {
        addSyncLog(`🔒 Premium verification already attempted for ${trimmedUsername}`, 'verbose');
        return;
      }
      
      hasVerified.current = true;
      addSyncLog(`🎯 [usePremiumVerification] Starting automatic premium check for ${trimmedUsername}`, 'info');
      
      try {
        addSyncLog(`🔍 Verifying premium status for ${trimmedUsername}...`, 'info');
        
        // Uses existing PocketBase infrastructure - no import issues!
        const { isPremium, user } = await checkPremiumStatus(trimmedUsername);
        
        if (isPremium && user) {
          addSyncLog(`🎉 Premium verified for ${trimmedUsername} (Plan: ${user.plan_id})`, 'success');
          setPreferences({ premium: true });
          await exportDebugLogs(`Premium auto-verification SUCCESS for ${trimmedUsername}`);
        } else {
          addSyncLog(`ℹ️ No premium access found for ${trimmedUsername}`, 'info');
          await exportDebugLogs(`Premium auto-verification FAILED for ${trimmedUsername}`);
        }
      } catch (error) {
        // This should rarely happen since checkPremiumStatus handles errors internally
        addSyncLog(`🔥 Premium verification failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
        await exportDebugLogs(`Premium auto-verification ERROR for ${trimmedUsername}: ${error instanceof Error ? error.message : String(error)}`);
        hasVerified.current = false; // Allow retry on error
      }
    };
    
    // Only verify if we have a username and user is not already premium
    if (username?.trim() && premium !== true) {
      addSyncLog(`⏰ [usePremiumVerification] Scheduling premium check for ${username.trim()} in 2 seconds`, 'verbose');
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