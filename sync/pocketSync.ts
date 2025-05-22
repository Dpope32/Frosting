import { generateSyncKey } from '@/sync/registrySyncManager'
import { useUserStore } from '@/store'
import * as Sentry from '@sentry/react-native'
import { addSyncLog, LogEntry } from '@/components/sync/syncUtils'

type PocketBaseType = import('pocketbase', { with: { 'resolution-mode': 'import' } }).default

// ---------------------------------------------------------------------------
// 1. Candidate PocketBase endpoints (ordered by preference)
// ---------------------------------------------------------------------------
const CANDIDATE_URLS: string[] = [
  process.env.EXPO_PUBLIC_POCKETBASE_URL, // Tailscale / public domain
  process.env.EXPO_PUBLIC_PB_URL,         // LAN or custom env override
  'https://fedora.tail557534.ts.net',     // fallback tailscale domain
  'http://192.168.1.32:8090',             // LAN IP (home)
].filter(Boolean) as string[]

const HEALTH_TIMEOUT = 3000 // ms

// ---------------------------------------------------------------------------
// 2. Quick connectivity probe (unchanged)
// ---------------------------------------------------------------------------
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  addSyncLog('Checking network connectivity in ps', 'info')
  Sentry.addBreadcrumb({ category: 'pocketSync', message: 'checkNetworkConnectivity', level: 'info' })
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3000)
  try {
    const r = await fetch('https://www.google.com', { method: 'HEAD', signal: controller.signal })
    clearTimeout(timer)
    Sentry.addBreadcrumb({ category: 'pocketSync', message: `network ok = ${r.ok}`, level: 'info' })
    addSyncLog(`network ok = ${r.ok}`, 'info')
    return r.ok
  } catch (err) {
    clearTimeout(timer)
    Sentry.captureException(err)
    addSyncLog(`Network check failed in ps: ${err}`, 'warning')
    return false
  }
}

// ---------------------------------------------------------------------------
// 3. PocketBase bootstrap with multi‑URL fallback + Sentry breadcrumbs
// ---------------------------------------------------------------------------
export const getPocketBase = async (): Promise<PocketBaseType> => {
  Sentry.addBreadcrumb({ category: 'pocketSync', message: 'getPocketBase()', level: 'info' })
   addSyncLog('getPocketBase()', 'info')
  let selectedUrl: string | undefined

  outer: for (const url of CANDIDATE_URLS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        Sentry.addBreadcrumb({
          category: 'pocketSync',
          message: `Health‑check ${url} (attempt ${attempt + 1})`,
          level: 'info',
        })
        addSyncLog(`Health‑check ${url} (attempt ${attempt + 1})`, 'info')
        const controller = new AbortController()
        const t = setTimeout(() => controller.abort(), HEALTH_TIMEOUT)
        const res = await fetch(`${url}/api/health`, { method: 'HEAD', signal: controller.signal })
        clearTimeout(t)
        if (!res.ok) throw new Error(`Status ${res.status}`)
        selectedUrl = url
        break outer // SUCCESS
      } catch (err) {
        Sentry.addBreadcrumb({
          category: 'pocketSync',
          message: `Health‑check failed for ${url} (attempt ${attempt + 1})`,
          data: { error: String(err) },
          level: 'warning',
        })
        addSyncLog(`Health‑check failed for ${url} (attempt ${attempt + 1})`, 'warning')
        await new Promise(r => setTimeout(r, 400))
      }
    }
  }

  if (!selectedUrl) {
      addSyncLog('Skipping sync silently – no PocketBase endpoint reachable. This implementation will be the death of me.', 'warning')
    Sentry.addBreadcrumb({ category: 'pocketSync', message: 'No endpoint reachable', level: 'error' })
    throw new Error('SKIP_SYNC_SILENTLY')
  }

  addSyncLog(`PocketBase selected lfg: ${selectedUrl}`, 'info')
  Sentry.addBreadcrumb({ category: 'pocketSync', message: `PocketBase selected: ${selectedUrl}`, level: 'info' })

  const { default: PocketBase } = await import('pocketbase')
  return new PocketBase(selectedUrl)
}



/**
 * Export sync logs to PocketBase for debugging purposes
 * This is a wrapper around the PocketBase collection 'debug_logs'
 * It also checks if the user is premium
 * If the user is not premium, it will not export the logs
 */
export const exportLogsToServer = async (logs: LogEntry[]): Promise<void> => {
  const isPremium = useUserStore.getState().preferences.premium === true;
  if (!isPremium) return;
  addSyncLog('Exporting logs to PocketBase', 'info');
  Sentry.addBreadcrumb({
    category: 'pocketSync',
    message: 'exportLogsToServer called',
    level: 'info',
  });
  
  try {
    // Check network connectivity
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      throw new Error('No network connection available');
    }
    
    // Get device identifier
    const deviceId = await generateSyncKey();
    const username = useUserStore.getState().preferences.username || 'unknown';
    // Get PocketBase instance
    const pb = await getPocketBase();
    addSyncLog('PocketBase instance created', 'info');
    // Format the logs for storage
    const formattedLogs = {
      device_id: deviceId,
      username: username,
      timestamp: new Date().toISOString(),
      logs: JSON.stringify(logs),
    };
    
    // Upload to a debug_logs collection
    await pb.collection('debug_logs').create(formattedLogs);
    addSyncLog('Logs created in PocketBase', 'info');
    Sentry.addBreadcrumb({
      category: 'pocketSync',
      message: 'Successfully exported logs to PocketBase',
      level: 'info',
    });
    console.log('✅ Successfully exported logs to PocketBase');
    
  } catch (error) {
    Sentry.captureException(error);
    Sentry.addBreadcrumb({
      category: 'pocketSync',
      message: 'Error exporting logs to PocketBase',
      data: { error },
      level: 'error',
    });
    console.error('❌ Error exporting logs to PocketBase:', error);
    throw error; // Rethrow to handle in the UI
  }
};
