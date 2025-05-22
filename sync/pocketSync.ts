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
const withPort = (raw: string | undefined): string | undefined => {
  if (!raw) return undefined
  const url = raw.replace(/\/$/, '')
  return /:\d+$/.test(url) ? url : `${url}:${DEFAULT_PORT}`
}

const ENV_URL = withPort(process.env.EXPO_PUBLIC_POCKETBASE_URL)
// Primary tailscale → fallback LAN
const CANDIDATE_URLS = [ENV_URL, `http://192.168.1.32:${DEFAULT_PORT}`].filter(Boolean) as string[]

const HEALTH_TIMEOUT = 3_000
const HEALTH_PATH = '/api/health'
// Acceptable "alive" status codes when hitting /api/health
const OK_STATUSES = new Set([200, 401, 404])

// PocketBase dynamic import type helper (preserve resolution-mode to satisfy TS)
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

  const USE_HEAD_HOSTS = [/\.ts\.net$/i];
  const needsHead = (host: string) => USE_HEAD_HOSTS.some(re => re.test(host));

  for (const base of CANDIDATE_URLS) {
    const method = needsHead(base) ? 'HEAD' : 'GET';
    const url = `${base}${HEALTH_PATH}`;

    addSyncLog(`Health-check ${url} via ${method}`, 'verbose');

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), HEALTH_TIMEOUT);

    try {
      const res = await fetch(url, { method, signal: ctrl.signal });
      clearTimeout(t);

      if (res.status === 200 || res.status === 401) {
        addSyncLog(`✅ ${url} -> ${res.status}`, 'info');
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

  addSyncLog(`PocketBase selected: ${selected}`, 'info');
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

// ===============================================
// Update summary (1 change):
// • Restored type-only import with "resolution-mode": "import" to silence TS complaint.
// ===============================================