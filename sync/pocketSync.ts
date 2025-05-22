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
  addSyncLog('getPocketBase()', 'info')

  let selected: string | undefined

  outer: for (const base of CANDIDATE_URLS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const url = `${base}${HEALTH_PATH}`
        Sentry.addBreadcrumb({ category: 'pocketSync', message: `Health-check ${url} (try ${attempt})`, level: 'info' })
        addSyncLog(`Health-check ${url} (try ${attempt})`, 'info')

        const controller = new AbortController()
        const t = setTimeout(() => controller.abort(), HEALTH_TIMEOUT)
        const res = await fetch(url, { method: 'HEAD', signal: controller.signal })
        clearTimeout(t)

        if (!OK_STATUSES.has(res.status)) throw new Error(`status ${res.status}`)
        selected = base
        break outer
      } catch (err) {
        Sentry.addBreadcrumb({ category: 'pocketSync', message: `Health-check fail (${base})`, data: { err: String(err) }, level: 'warning' })
        await new Promise(r => setTimeout(r, 400))
      }
    }
  }

  if (!selected) {
    addSyncLog('Skipping sync – no PocketBase reachable', 'warning')
    Sentry.addBreadcrumb({ category: 'pocketSync', message: 'No PocketBase reachable', level: 'error' })
    throw new Error('SKIP_SYNC_SILENTLY')
  }

  Sentry.addBreadcrumb({ category: 'pocketSync', message: `PocketBase selected ${selected}`, level: 'info' })
  addSyncLog(`PocketBase selected: ${selected}`, 'info')

  // dynamic import at runtime – no resolution-mode needed here
  const { default: PocketBase } = await import('pocketbase')
  return new PocketBase(selected)
}

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