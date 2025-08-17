// ===============================================
// File: sync/pocketSync.ts
// Purpose: PocketBase connectivity helpers + log exporter.
// Notes:
// • Normalises env URL – adds :8090 if missing.
// • Accepts 200, 401, or 404 from /api/health as "alive" (older PB builds).
// • Falls back to LAN IP if Tailscale URL fails.
// • All changes JS-only, no native rebuild required.
// • Gracefully handles simulator/dev mode PocketBase import failures
// ===============================================

import { generateSyncKey } from '@/sync/registrySyncManager'
import { useUserStore } from '@/store'
import * as Sentry from '@sentry/react-native'
import { LogEntry } from '@/components/sync/syncUtils'
import { Platform } from 'react-native'

let debug = true;
const getAddSyncLog = () => {
  if (debug) {
    return require('@/components/sync/syncUtils').addSyncLog;
  }
  return () => {};
}
// ───────────────────────── CONSTANTS ─────────────────────────
const DEFAULT_PORT = 8090

/**
 * Detects if we're running on a simulator/emulator where PocketBase might not work
 */
const isSimulatorOrDev = (): boolean => {
  // Always skip PocketBase in development mode
  if (__DEV__) {
    return true;
  }
  
  // Check for simulator/emulator on iOS/Android
  // This is a basic check - more sophisticated detection could be added
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    // In production builds on real devices, we assume PocketBase should work
    // The import error will be caught and handled gracefully anyway
    return false;
  }
  
  // On web, PocketBase should work fine
  return false;
};

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

const CANDIDATE_URLS = (Platform.OS === 'web' 
  ? [
      // Prioritize proxy for web (VPNs commonly block Tailscale)
      'https://kaiba.vercel.app/api/proxy/pb',
      withPort(process.env.EXPO_PUBLIC_POCKETBASE_URL),
      withPort(process.env.EXPO_PUBLIC_PB_LAN),
      withPort(process.env.EXPO_PUBLIC_PB_URL),
    ]
  : [
      // Direct connections first for mobile
      withPort(process.env.EXPO_PUBLIC_POCKETBASE_URL), 
      withPort(process.env.EXPO_PUBLIC_PB_LAN),
      withPort(process.env.EXPO_PUBLIC_PB_URL),
    ]
).filter(Boolean).filter((url, index, array) => array.indexOf(url) === index) as string[]; // Remove duplicates


const CANDIDATE_URLS_DEV = (Platform.OS === 'web' 
  ? [
      // Prioritize proxy for web (VPNs commonly block Tailscale)
      'https://kaiba.vercel.app/api/proxy/pb',
      withPort(process.env?.EXPO_PUBLIC_POCKETBASE_URL),
      withPort(process.env?.EXPO_PUBLIC_PB_LAN),
      withPort(process.env?.EXPO_PUBLIC_PB_URL),
    ]
  : [
      // Direct connections first for mobile
      withPort(process.env?.EXPO_PUBLIC_POCKETBASE_URL), 
      withPort(process.env?.EXPO_PUBLIC_PB_LAN),
      withPort(process.env?.EXPO_PUBLIC_PB_URL),
    ]
).filter(Boolean).filter((url, index, array) => array.indexOf(url) === index) as string[]; // Remove duplicates

// ───────────────────────── DEV SWITCH ─────────────────────────
// Default to using normal URLs. Can be flipped at runtime or via env var.
const parseBooleanEnv = (val?: string): boolean => val === '1' || val === 'true' || val === 'TRUE';
let USE_DEV_PB_CANDIDATES = false;
try {
  // Guarded for web environments without Node's process
  // Prefer EXPO_PUBLIC_ so Expo inlines it for web builds
  // Example flip: set EXPO_PUBLIC_PB_USE_DEV_URLS=1 before starting web
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const envVal = typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_PB_USE_DEV_URLS;
  if (typeof envVal === 'string') {
    USE_DEV_PB_CANDIDATES = parseBooleanEnv(envVal);
  }
} catch {}

export const setUseDevPocketSync = (enabled: boolean) => {
  USE_DEV_PB_CANDIDATES = enabled;
};

const ACTIVE_CANDIDATE_URLS = USE_DEV_PB_CANDIDATES ? CANDIDATE_URLS_DEV : CANDIDATE_URLS;

const HEALTH_TIMEOUT = Platform.OS === 'web' ? 3000 : 8000  // Shorter timeout on web for VPN detection
const HEALTH_TIMEOUT_RETRY = Platform.OS === 'web' ? 4000 : 12000  // Shorter retry timeout on web
const HEALTH_PATH = '/api/health'
const MAX_RETRIES = Platform.OS === 'web' ? 1 : 3  // Reduce retries on web (VPN context)
const RETRY_DELAY_BASE = 500  // Faster retry for web
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type PocketBaseType = import('pocketbase').default

// ───────────────────────── NETWORK UTILS ─────────────────────────
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  Sentry.addBreadcrumb({ category: 'pocketSync', message: 'checkNetworkConnectivity()', level: 'info' })
  
  
  try {
    // Skip network check on web - assume connection is available
    if (Platform.OS === 'web') {
      getAddSyncLog()(`🌐 Web platform detected - skipping Google connectivity check`, 'info');
      return true;
    }
    
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
      getAddSyncLog()(`🌐 Web platform error fallback - assuming connected`, 'info');
      return true;
    }
    return false
  }
}

// ───────────────────────── ROBUST CONNECTION HELPERS ─────────────────────────
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


const testUrlWithRetries = async (baseUrl: string): Promise<boolean> => {
  // Handle proxy URLs differently
  const isProxyUrl = baseUrl.includes('/api/proxy/pb');
  const url = isProxyUrl ? `${baseUrl}/health` : `${baseUrl}${HEALTH_PATH}`;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (await testSingleUrl(url, attempt)) {
      return true;
    }
    
    // Don't sleep after the last attempt
    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY_BASE * Math.pow(2, attempt); // Exponential backoff
      await sleep(delay);
    }
  }
  
  getAddSyncLog()(`❌ ${baseUrl} failed after ${MAX_RETRIES + 1} attempts`, 'error');
  return false;
};

// ───────────────────────── ROBUST PB FACTORY ─────────────────────────

const testSingleUrl = async (url: string, retryCount: number = 0): Promise<boolean> => {
  const isRetry = retryCount > 0;
  const timeout = isRetry ? HEALTH_TIMEOUT_RETRY : HEALTH_TIMEOUT;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);

  try {
    
    let res = await fetch(url, { 
      method: 'GET', 
      signal: ctrl.signal,
      // Platform-specific headers for better iOS compatibility
      headers: Platform.OS === 'ios' ? {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'User-Agent': 'KaibaApp/1.0 iOS'
      } : {}
    });
    
    if (res.status === 405) {
      res = await fetch(url, { 
        method: 'HEAD', 
        signal: ctrl.signal,
        headers: Platform.OS === 'ios' ? {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'User-Agent': 'KaibaApp/1.0 iOS'
        } : {}
      });
    }
    
    clearTimeout(timer);

    // Accept 200, 401, or 404 as "alive" (different PB versions)
    if (res.status === 200 || res.status === 401 || res.status === 404) {
      return true;
    }
    getAddSyncLog()(`....uhoh.....${url} -> ${res.status} (unexpected status)`, 'warning');
    return false;
    
  } catch (e: any) {
    clearTimeout(timer);
    const errorMsg = e.name === 'AbortError' ? 'timeout' : e.message || 'unknown error';
    
    // Enhanced error debugging
    if (Platform.OS === 'ios') {
      getAddSyncLog()(`📱 iOS error for ${url}: ${e.name} - ${errorMsg}`, 'warning');
      if (e.stack) {
        getAddSyncLog()(`📱 iOS error stack: ${e.stack.split('\n')[0]}`, 'verbose');
      }
    } else {
      getAddSyncLog()(`❌ Network error with ${url}`, 'error', errorMsg);
    }
    return false;
  }
};

export const getPocketBase = async (): Promise<PocketBaseType> => {
  if (isSimulatorOrDev()) {
    throw new Error('SKIP_SYNC_SILENTLY');
  }
  let selected: string | undefined;
  // Test each URL with full retry logic
  for (const baseUrl of ACTIVE_CANDIDATE_URLS) {
    if (await testUrlWithRetries(baseUrl)) {
      selected = baseUrl;
      break;
    }
  }
  if (!selected) {
    const errorMsg = `All PocketBase URLs failed after ${MAX_RETRIES + 1} attempts each`;
      getAddSyncLog()(`❌ ${errorMsg}`, 'error');
    throw new Error('SKIP_SYNC_SILENTLY');
  }

  let pb;
  try {
    const { default: PocketBase } = await import('pocketbase');
    pb = new PocketBase(selected);
  } catch (importError) {
    const errorMessage = importError instanceof Error ? importError.message : String(importError);
    
    if (errorMessage.includes('Requiring unknown module') || 
        errorMessage.includes('importedAll') ||
        errorMessage.includes('Cannot set property')) {
      getAddSyncLog()(`🧪 [SIM] PocketBase import failed (likely simulator) - skipping sync silently`, 'warning');
    } else {
      getAddSyncLog()(`❌ Failed to import PocketBase: ${errorMessage}`, 'error');
    }
    
    throw new Error('SKIP_SYNC_SILENTLY');
  }
  
  // Check if we're using the proxy
  const isProxyUrl = selected.includes('/api/proxy/pb');
  
  // Set longer default timeout for all PB operations
  pb.beforeSend = function (url, options) {
    // Increase timeout for all PocketBase requests
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    // Handle proxy URL rewriting
    let finalUrl = url;
    if (isProxyUrl) {
      // Remove the extra /api that PocketBase adds when using proxy
      // PocketBase creates: https://kaiba.vercel.app/api/proxy/pb/api/collections/...
      // We want: https://kaiba.vercel.app/api/proxy/pb/collections/...
      finalUrl = url.replace('/api/proxy/pb/api/', '/api/proxy/pb/');
    //  getAddSyncLog()(`🔄 Proxy URL rewrite: ${url} -> ${finalUrl}`, 'verbose');
    }
    
    return {
      url: finalUrl,
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
    getAddSyncLog()('No network – abort log export', 'warning')
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

  getAddSyncLog()('Logs saved in PocketBase', 'info')
}