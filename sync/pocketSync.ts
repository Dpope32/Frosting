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

const HEALTH_TIMEOUT = 3000
const HEALTH_PATH = '/api/health'
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type PocketBaseType = import('pocketbase', {
  with: { 'resolution-mode': 'import' }
}).default

// ───────────────────────── NETWORK UTILS ─────────────────────────
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  Sentry.addBreadcrumb({ category: 'pocketSync', message: 'checkNetworkConnectivity()', level: 'info' })
  try {
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
    return false
  }
}

// ───────────────────────── PB FACTORY ─────────────────────────
export const getPocketBase = async (): Promise<PocketBaseType> => {
  let selected: string | undefined;

  for (const base of CANDIDATE_URLS) {
    const url = `${base}${HEALTH_PATH}`;
    addSyncLog(`Health-check ${url} (GET→HEAD fallback)`, 'verbose');

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), HEALTH_TIMEOUT);

    try {
      let res = await fetch(url, { method: 'GET', signal: ctrl.signal });
      if (res.status === 405) {
        addSyncLog(`GET 405 — retrying HEAD`, 'verbose');
        res = await fetch(url, { method: 'HEAD', signal: ctrl.signal });
      }
      clearTimeout(t);

      if (res.status === 200 || res.status === 401) {
        addSyncLog(`✅ ${url} -> ${res.status}`, 'success');
        selected = base;
        break;
      }
      addSyncLog(`⚠️ ${url} -> ${res.status}`, 'warning');
    } catch (e) {
      clearTimeout(t);
      addSyncLog(`❌ ${url} network error (${e})`, 'warning');
    }
  }
  if (!selected) {
    addSyncLog('Skipping sync – no PocketBase reachable', 'warning');
    throw new Error('SKIP_SYNC_SILENTLY');
  }
  const { default: PocketBase } = await import('pocketbase');
  return new PocketBase(selected);
};


// ───────────────────────── LOG EXPORT ─────────────────────────
export const exportLogsToServer = async (logs: LogEntry[]): Promise<void> => {
  if (!useUserStore.getState().preferences.premium) return

  addSyncLog('Exporting logs to PocketBase', 'info')

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
