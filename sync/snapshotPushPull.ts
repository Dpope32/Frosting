// ===============================================
// File: sync/snapshotPushPull.ts
// Purpose: push / pull encrypted snapshots to PocketBase.
// Notes:
// • Re-queues a push if another push is in flight
// • Emits addSyncLog("🔁 Running queued push …") when that happens
// • Still JS-only – no Expo rebuild required
// ===============================================

import * as FileSystem from "expo-file-system";
import { decryptSnapshot } from "@/utils/encryption";
import { generateSyncKey, exportEncryptedState } from "@/sync/registrySyncManager";
import { useRegistryStore } from "@/store/RegistryStore";
import { useUserStore } from "@/store/UserStore";
import * as Sentry from "@sentry/react-native";
import { checkNetworkConnectivity, getPocketBase } from "./pocketSync";
import { getCurrentWorkspaceId } from "./getWorkspace";
import { addSyncLog } from "@/components/sync/syncUtils";
import { getWorkspaceKey } from "./workspaceKey";
import { Platform } from 'react-native';
import pako from 'pako';

let debug = false;
let lastExport = 0;
let dirtyAfterPush = false;           // <— new flag

const WEB_SNAPSHOT_KEY = 'encrypted_state_snapshot';

// ————————————————————— PUSH ——————————————————————
export const pushSnapshot = async (): Promise<void> => {
  // premium-only feature
  if (!useUserStore.getState().preferences.premium) return;

  // if a push is already running, mark dirty and bail
  if (useRegistryStore.getState().syncStatus === 'syncing') {
    dirtyAfterPush = true;
    if (debug) {
      addSyncLog('🔄 Push queued while another push in progress', 'verbose');
    }
    return;
  }

  // we're the primary push now
  useRegistryStore.getState().setSyncStatus('syncing');
  const runId = Date.now().toString(36);
  if (debug) {
    addSyncLog(`🛰️  ${runId} – push`, 'info');
  }

  try {
    if (debug) {
      addSyncLog('Pushing snapshot to PocketBase', 'info');
    }

    // guards
    if (!useUserStore.getState().preferences.hasCompletedOnboarding) {
      if (debug) {
        addSyncLog('Skipping push – onboarding not completed', 'warning');
      }
      return;
    }

    if (!(await checkNetworkConnectivity())) {
      addSyncLog('Skipping push – no network connection', 'warning');
      return;
    }
    if (debug) {
      addSyncLog(`🔍 checkNetworkConnectivity called from snapshotPushPull.ts pushSnapshot() - Platform.OS: ${Platform.OS}`, 'verbose');
    }
    
    const pb = await getPocketBase();
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) {
      if (debug) {
        addSyncLog('No workspace configured, aborting push', 'warning');
      }
      return;
    }

    const deviceId = await generateSyncKey();
    const now = Date.now();
    const state = useRegistryStore.getState().getAllStoreStates();

    // export only once per 10 s
    if (now - lastExport >= 10_000) {
      await exportEncryptedState(state);
      lastExport = now;
      if (debug) {
        addSyncLog(
          `💾 snapshot encrypted → stateSnapshot.enc from snapshotPushPull.ts  (${new Date(now).toISOString()})`,
          'info'
        );
      }
    } else {
      addSyncLog('⏸️  export skipped – <10 s since last', 'verbose');
    }

    // Web compatibility: read from localStorage instead of FileSystem
    let cipher: string;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        cipher = window.localStorage.getItem(WEB_SNAPSHOT_KEY) || '';
        if (!cipher) {
          if (debug) {
            addSyncLog('No snapshot found in localStorage', 'warning');
          }
          return;
        }
      } else {
        if (debug) {
          addSyncLog('localStorage not available on web', 'error');
        }
        return;
      }
    } else {
      cipher = await FileSystem.readAsStringAsync(
        `${FileSystem.documentDirectory}stateSnapshot.enc`
      );
    }

    // Update existing record or create if none exists
    try {
      const { items } = await pb.collection('registry_snapshots')
        .getList(1, 1, { filter: `workspace_id="${workspaceId}"` });
      
      if (items.length > 0) {
        // Update existing record
        await pb.collection('registry_snapshots').update(items[0].id, {
          device_id: deviceId,
          snapshot_blob: cipher,
          timestamp: new Date().toISOString(),
        });
        if (debug) {
          addSyncLog(`📝 Updated existing snapshot (record: ${items[0].id})`, 'verbose');
        }
      } else {
        // Create first record for this workspace
        await pb.collection('registry_snapshots').create({
          workspace_id: workspaceId,
          device_id: deviceId,
          snapshot_blob: cipher,
        });
        if (debug) {
          addSyncLog('✨ Created first snapshot for workspace', 'verbose');
        }
      }
    } catch (createErr) {
      // Handle unique constraint errors gracefully
      if (createErr instanceof Error && createErr.message.includes('unique')) {
        const { items } = await pb.collection('registry_snapshots')
          .getList(1, 1, { filter: `workspace_id="${workspaceId}"` });
        
        if (items.length > 0) {
          await pb.collection('registry_snapshots').update(items[0].id, {
            device_id: deviceId,
            snapshot_blob: cipher,
            timestamp: new Date().toISOString(),
          });
          if (debug) {
            addSyncLog('📝 Updated after unique constraint error', 'verbose');
          }
        } else {
          throw createErr;
        }
      } else {
        throw createErr;
      }
    }

    if (debug) {
      addSyncLog(`Successfully pushed data to PocketBase 🛰️  ${runId} – push done`, 'success');
    }
  } catch (err) {
    Sentry.captureException(err);
    if (debug) {
      addSyncLog(
        'Error pushing to PocketBase',
        'error',
        err instanceof Error ? err.message : String(err)
      );
    }
    useRegistryStore.getState().setSyncStatus('error');
    throw err;
  } finally {
    useRegistryStore.getState().setSyncStatus('idle');

    // if something changed while we were busy, run again
    if (dirtyAfterPush) {
      dirtyAfterPush = false;
      if (debug) {
        addSyncLog('🔁 Running queued push after previous push finished', 'info');
      }
      await pushSnapshot();
    }
  }
};

// ————————————————————— PULL ——————————————————————
export const pullLatestSnapshot = async (): Promise<void> => {
  if (!useUserStore.getState().preferences.premium) return;
  const pullStartTime = Date.now();

  if (debug) {
    addSyncLog('📥 pullLatestSnapshot() called - will make GET request to registry_snapshots', 'verbose');
    const runId = Date.now().toString(36);
    addSyncLog(`🛰️  ${runId} – pull`, 'info');
  }
  useRegistryStore.getState().setSyncStatus('syncing');

  try {
    if (!useUserStore.getState().preferences.hasCompletedOnboarding) {
      if (debug) {
        addSyncLog('Skipping pull – onboarding not completed', 'warning');
      }
      return;
    }
    if (!(await checkNetworkConnectivity())) {
      if (debug) {
        addSyncLog('Skipping pull – no network connection', 'warning');
      }
      return;
    }
    if (debug) {
      addSyncLog(`🔍 checkNetworkConnectivity called from snapshotPushPull.ts pullLatestSnapshot() - Platform.OS: ${Platform.OS}`, 'verbose');
    }
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) {
      if (debug) {
        addSyncLog('No workspace configured, aborting pull', 'warning');
      }
      return;
    }

    const pb = await getPocketBase();
    const { items } = await pb.collection('registry_snapshots').getList(1, 1, {
      filter: `workspace_id="${workspaceId}"`,
      sort: '-created',
    });

    if (items.length === 0) {
      if (debug) {
        addSyncLog('📭 No snapshots found on server yet', 'info');
      }
      return;
    }

    const cipher = items[0].snapshot_blob as string;
    const key = await getWorkspaceKey();

    let plain: Record<string, unknown>;
    try {
      const compressedString = decryptSnapshot(cipher, key); 
      const binaryString = atob(compressedString);
      const compressed = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        compressed[i] = binaryString.charCodeAt(i);
      }
      
      const decompressed = pako.inflate(compressed, { to: 'string' });
      plain = JSON.parse(decompressed);
      
    } catch (err) {
      if (debug) {
        addSyncLog('❌ Decrypt failed – key mismatch or old format', 'error');
      }
      return;
    }

    // keep local copy so future pushes have baseline
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(WEB_SNAPSHOT_KEY, cipher);
      }
    } else {
      await FileSystem.writeAsStringAsync(
        `${FileSystem.documentDirectory}stateSnapshot.enc`,
        cipher,
        { encoding: FileSystem.EncodingType.UTF8 }
      );
    }
    const pullEndTime = Date.now();
    addSyncLog(`📥 Pull phase took: ${pullEndTime - pullStartTime}ms`, 'info');
    useRegistryStore.getState().hydrateAll(plain);
    if (debug) {
      const runId = Date.now().toString(36);
      addSyncLog(`✅ Snapshot pulled & stores hydrated  ${runId} – pull done`, 'success');
    }
  } catch (err) {
    Sentry.captureException(err);
    if (debug) {
      addSyncLog(
        'Error pulling from PocketBase',
        'error',
        err instanceof Error ? err.message : String(err)
      );
    }
    useRegistryStore.getState().setSyncStatus('error');
    throw err;
  } finally {
    useRegistryStore.getState().setSyncStatus('idle');
  }
};
