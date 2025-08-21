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
const DEFAULT_PORT = 8090

const isSimulatorOrDev = (): boolean => {
  if (__DEV__) { return true}
  if (Platform.OS === 'ios' || Platform.OS === 'android') { return false}
  return false;
};

const withPort = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  const url = raw.replace(/\/$/, '');
  const hasPort = /:\d+$/.test(url);
  const isPlainHttp = url.startsWith('http://');
  return hasPort || !isPlainHttp ? url : `${url}:${DEFAULT_PORT}`;
};

const CANDIDATE_URLS = (Platform.OS === 'web' 
  ? [
      'https://kaiba.vercel.app/api/proxy/pb',
      withPort(process.env.EXPO_PUBLIC_POCKETBASE_URL),
      withPort(process.env.EXPO_PUBLIC_PB_LAN),
      withPort(process.env.EXPO_PUBLIC_PB_URL),
    ]
  : [
      withPort(process.env.EXPO_PUBLIC_POCKETBASE_URL), 
      withPort(process.env.EXPO_PUBLIC_PB_LAN),
      withPort(process.env.EXPO_PUBLIC_PB_URL),
    ]
).filter(Boolean).filter((url, index, array) => array.indexOf(url) === index) as string[];


const CANDIDATE_URLS_DEV = (Platform.OS === 'web' 
  ? [
      'https://kaiba.vercel.app/api/proxy/pb',
      withPort(process.env?.EXPO_PUBLIC_POCKETBASE_URL),
      withPort(process.env?.EXPO_PUBLIC_PB_LAN),
      withPort(process.env?.EXPO_PUBLIC_PB_URL),
    ]
  : [
      withPort(process.env?.EXPO_PUBLIC_POCKETBASE_URL), 
      withPort(process.env?.EXPO_PUBLIC_PB_LAN),
      withPort(process.env?.EXPO_PUBLIC_PB_URL),
    ]
).filter(Boolean).filter((url, index, array) => array.indexOf(url) === index) as string[];

const parseBooleanEnv = (val?: string): boolean => val === '1' || val === 'true' || val === 'TRUE';
let USE_DEV_PB_CANDIDATES = false;
try {
  const envVal = typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_PB_USE_DEV_URLS;
  if (typeof envVal === 'string') { USE_DEV_PB_CANDIDATES = parseBooleanEnv(envVal)}
} catch {}

export const setUseDevPocketSync = (enabled: boolean) => {USE_DEV_PB_CANDIDATES = enabled}

const ACTIVE_CANDIDATE_URLS = USE_DEV_PB_CANDIDATES ? CANDIDATE_URLS_DEV : CANDIDATE_URLS;

const HEALTH_TIMEOUT = Platform.OS === 'web' ? 3000 : 8000  
const HEALTH_TIMEOUT_RETRY = Platform.OS === 'web' ? 4000 : 12000  
const HEALTH_PATH = '/api/health'
const MAX_RETRIES = Platform.OS === 'web' ? 1 : 3
const RETRY_DELAY_BASE = 500  

export type PocketBaseType = import('pocketbase').default

export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {return true}
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
    if (Platform.OS === 'web') {return true}
    return false
  }
}


const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const testUrlWithRetries = async (baseUrl: string): Promise<boolean> => {
  const isProxyUrl = baseUrl.includes('/api/proxy/pb');
  const url = isProxyUrl ? `${baseUrl}/health` : `${baseUrl}${HEALTH_PATH}`;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (await testSingleUrl(url, attempt)) {
      return true;
    }
    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  
  getAddSyncLog()(`❌ ${baseUrl} failed after ${MAX_RETRIES + 1} attempts`, 'error');
  return false;
};


const testSingleUrl = async (url: string, retryCount: number = 0): Promise<boolean> => {
  const isRetry = retryCount > 0;
  const timeout = isRetry ? HEALTH_TIMEOUT_RETRY : HEALTH_TIMEOUT;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);

  try {
    
    let res = await fetch(url, { 
      method: 'GET', 
      signal: ctrl.signal,
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

    if (res.status === 200 || res.status === 401 || res.status === 404) {
      return true;
    }
    getAddSyncLog()(`....uhoh.....${url} -> ${res.status} (unexpected status)`, 'warning');
    return false;
    
  } catch (e: any) {
    clearTimeout(timer);
    const errorMsg = e.name === 'AbortError' ? 'timeout' : e.message || 'unknown error';
    
    if (Platform.OS === 'ios') { getAddSyncLog()(`📱 iOS error for ${url}: ${e.name} - ${errorMsg}`, 'warning')}
    if (e.stack) { getAddSyncLog()(`📱 iOS error stack: ${e.stack.split('\n')[0]}`, 'verbose')}
    if (Platform.OS !== 'ios') { getAddSyncLog()(`❌ Network error with ${url}`, 'error', errorMsg)}
    return false;
  }
};

export const getPocketBase = async (): Promise<PocketBaseType> => {
  if (isSimulatorOrDev()) {
    throw new Error('SKIP_SYNC_SILENTLY');
  }
  let selected: string | undefined;
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
  
  const isProxyUrl = selected.includes('/api/proxy/pb');
  
  pb.beforeSend = function (url, options) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 15000);
    
    let finalUrl = url;
    if (isProxyUrl) { finalUrl = url.replace('/api/proxy/pb/api/', '/api/proxy/pb/')}
    
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
}