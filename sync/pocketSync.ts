// ===============================================
// File: sync/pocketSync.ts
// Purpose: PocketBase connectivity helpers + log exporter.
// Notes:
// • Normalises env URL – adds :8090 if missing.
// • Accepts 200, 401, or 404 from /api/health as "alive" (older PB builds).
// • Falls back to LAN IP if Tailscale URL fails.
// • All changes JS-only, no native rebuild required.
// ===============================================

import { generateSyncKey } from '@/sync/registrySyncManager'
import { useUserStore } from '@/store'
import * as Sentry from '@sentry/react-native'
import { addSyncLog, LogEntry } from '@/components/sync/syncUtils'
import { Platform } from 'react-native'

// ───────────────────────── CONSTANTS ─────────────────────────
const DEFAULT_PORT = 8090

/**
 * Ensures the provided base URL includes a port.
 * If none present append `:8090`. Trailing slashes removed.
 */
const withPort = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  const url = raw.replace(/\/$/, '');
  const hasPort = /:\d+$/.test(url);
  const isPlainHttp = url.startsWith('http://');
  return hasPort || !isPlainHttp ? url : `${url}:${DEFAULT_PORT}`;
};

const CANDIDATE_URLS = [
  withPort(process.env.EXPO_PUBLIC_POCKETBASE_URL), // https first
  withPort(process.env.EXPO_PUBLIC_PB_LAN),         // LAN fallback
].filter(Boolean) as string[];

const HEALTH_TIMEOUT = 8000  // Increased for international connections
const HEALTH_TIMEOUT_RETRY = 12000  // Even longer for retries
const HEALTH_PATH = '/api/health'
const MAX_RETRIES = 3
const RETRY_DELAY_BASE = 1000  // Base delay for exponential backoff
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type PocketBaseType = import('pocketbase', {
  with: { 'resolution-mode': 'import' }
}).default

// ───────────────────────── NETWORK UTILS ─────────────────────────
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  Sentry.addBreadcrumb({ category: 'pocketSync', message: 'checkNetworkConnectivity()', level: 'info' })
  
  // Add this debug log
  addSyncLog(`🔍 checkNetworkConnectivity called - Platform.OS: ${Platform.OS}`, 'verbose');
  
  try {
    // Skip network check on web - assume connection is available
    if (Platform.OS === 'web') {
      addSyncLog(`🌐 Web platform detected - skipping Google connectivity check`, 'info');
      return true;
    }
    
    addSyncLog(`📱 Non-web platform (${Platform.OS}) - checking Google connectivity`, 'verbose');
    
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3_000)
    await fetch('https://clients3.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
    })
    clearTimeout(timeout)
    return true
  } catch (err) {
    Sentry.captureException(err)
    // On web, if we can't check connectivity, assume we're connected
    if (Platform.OS === 'web') {
      addSyncLog(`🌐 Web platform error fallback - assuming connected`, 'info');
      return true;
    }
    return false
  }
}

// ───────────────────────── ROBUST CONNECTION HELPERS ─────────────────────────
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const testSingleUrl = async (url: string, retryCount: number = 0): Promise<boolean> => {
  const isRetry = retryCount > 0;
  const timeout = isRetry ? HEALTH_TIMEOUT_RETRY : HEALTH_TIMEOUT;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);

  try {
    addSyncLog(`🔍 Testing ${url} (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`, 'verbose');
    
    let res = await fetch(url, { 
      method: 'GET', 
      signal: ctrl.signal,
      // Platform-specific headers for better iOS compatibility
      headers: Platform.OS === 'ios' ? {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      } : {}
    });
    
    if (res.status === 405) {
      addSyncLog(`GET 405 — retrying HEAD for ${url}`, 'verbose');
      res = await fetch(url, { 
        method: 'HEAD', 
        signal: ctrl.signal,
        headers: Platform.OS === 'ios' ? {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        } : {}
      });
    }
    
    clearTimeout(timer);

    // Accept 200, 401, or 404 as "alive" (different PB versions)
    if (res.status === 200 || res.status === 401 || res.status === 404) {
      addSyncLog(`✅ ${url} -> ${res.status} (success)`, 'info');
      return true;
    }
    
    addSyncLog(`⚠️ ${url} -> ${res.status} (unexpected status)`, 'warning');
    return false;
    
  } catch (e: any) {
    clearTimeout(timer);
    const errorMsg = e.name === 'AbortError' ? 'timeout' : e.message || 'unknown error';
    addSyncLog(`❌ ${url} -> ${errorMsg} (attempt ${retryCount + 1})`, 'warning');
    return false;
  }
};

const testUrlWithRetries = async (baseUrl: string): Promise<boolean> => {
  const url = `${baseUrl}${HEALTH_PATH}`;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (await testSingleUrl(url, attempt)) {
      return true;
    }
    
    // Don't sleep after the last attempt
    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY_BASE * Math.pow(2, attempt); // Exponential backoff
      addSyncLog(`⏳ Waiting ${delay}ms before retry ${attempt + 2}`, 'verbose');
      await sleep(delay);
    }
  }
  
  addSyncLog(`❌ ${baseUrl} failed after ${MAX_RETRIES + 1} attempts`, 'error');
  return false;
};

// ───────────────────────── ROBUST PB FACTORY ─────────────────────────
export const getPocketBase = async (): Promise<PocketBaseType> => {
  addSyncLog(`🔄 Testing PocketBase connectivity (${CANDIDATE_URLS.length} URLs)`, 'info');
  
  let selected: string | undefined;

  // Test each URL with full retry logic
  for (const baseUrl of CANDIDATE_URLS) {
    addSyncLog(`🌐 Testing base URL: ${baseUrl}`, 'info');
    
    if (await testUrlWithRetries(baseUrl)) {
      selected = baseUrl;
      addSyncLog(`✅ Selected PocketBase URL: ${baseUrl}`, 'success');
      break;
    }
  }

  if (!selected) {
    const errorMsg = `All PocketBase URLs failed after ${MAX_RETRIES + 1} attempts each`;
    addSyncLog(`❌ ${errorMsg}`, 'error');
    
    // Add platform info for debugging
    addSyncLog(`📱 Platform: ${Platform.OS}, URLs tested: ${CANDIDATE_URLS.join(', ')}`, 'error');
    
    throw new Error('SKIP_SYNC_SILENTLY');
  }

  const { default: PocketBase } = await import('pocketbase');
  const pb = new PocketBase(selected);
  
  // Set longer default timeout for all PB operations
  pb.beforeSend = function (url, options) {
    // Increase timeout for all PocketBase requests
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    return {
      url,
      options: {
        ...options,
        signal: controller.signal,
      },
    };
  };
  
  return pb;
};

// ───────────────────────── LOG EXPORT ─────────────────────────
export const exportLogsToServer = async (logs: LogEntry[]): Promise<void> => {
  if (!useUserStore.getState().preferences.premium) return

  if (!(await checkNetworkConnectivity())) {
    addSyncLog('No network – abort log export', 'warning')
    return
  }

  const pb = await getPocketBase()
  const deviceId = await generateSyncKey()
  const username = useUserStore.getState().preferences.username ?? 'unknown'

  await pb.collection('debug_logs').create({
    device_id: deviceId,
    username,
    timestamp: new Date().toISOString(),
    logs: JSON.stringify(logs),
  })

  addSyncLog('Logs saved in PocketBase', 'info')
}