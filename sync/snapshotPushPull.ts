// ===============================================
// File: sync/snapshotPushPull.ts
// Purpose: push / pull encrypted snapshots to PocketBase.
// Notes:  
// • Removed redundant `timestamp` property; rely on PB's `created` field.  
// • Added final `setSyncStatus('idle')` on success paths.  
// • Graceful decrypt failures while we're iterating.  
// ===============================================

import * as FileSystem from "expo-file-system";
import { decryptSnapshot } from "@/lib/encryption";
import { generateSyncKey, exportEncryptedState } from "@/sync/registrySyncManager";
import { useRegistryStore } from "@/store/RegistryStore";
import { useUserStore } from "@/store/UserStore";
import * as Sentry from "@sentry/react-native";
import { checkNetworkConnectivity, getPocketBase } from "./pocketSync";
import { getCurrentWorkspaceId } from "./getWorkspace";
import { addSyncLog } from "@/components/sync/syncUtils";
import { getWorkspaceKey } from "./workspaceKey";
let lastExport = 0; 
// ————————————————————— PUSH ——————————————————————
export const pushSnapshot = async (): Promise<void> => {
  if (!useUserStore.getState().preferences.premium) return;
  const runId = Date.now().toString(36)
  addSyncLog(`🛰️  ${runId} – push`, 'info');
  try {
    addSyncLog("Pushing snapshot to PocketBase", "info");

    // guards
    if (!useUserStore.getState().preferences.hasCompletedOnboarding) {
      Sentry.addBreadcrumb({ category:'sync', level:'warning',
         message:'Skipped push – onboarding not completed' });
      addSyncLog("Skipping push – onboarding not completed", "warning");
      return;
    }

    if (!(await checkNetworkConnectivity())) {
      Sentry.addBreadcrumb({ category:'sync', level:'warning',
         message:'Skipped push – no network' });
         addSyncLog('Skipping push – no network connection', 'warning');
         return;
      }
      

    const pb = await getPocketBase();
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) throw new Error("No workspace configured");

    const deviceId = await generateSyncKey();
    const now = Date.now();
    const state  = useRegistryStore.getState().getAllStoreStates();
    addSyncLog('🔐 stateSnapshot.enc exported (in sync/snapshotPushPull.ts) to File System ' + lastExport, 'success');
    // ✋ bail if we exported <=10 s ago
    if (now - lastExport < 10000) {
      addSyncLog('⏸️  export skipped – <10 s since last', 'verbose');
    } else {
      await exportEncryptedState(state);
      lastExport = now;
      addSyncLog(
        `💾 snapshot encrypted → stateSnapshot.enc NEW Last Export (${new Date(now).toISOString()})`,
        'info'
      );
    }
  
    const cipher = await FileSystem.readAsStringAsync(
      `${FileSystem.documentDirectory}stateSnapshot.enc`
    );

    await pb.collection("registry_snapshots").create({
      workspace_id: workspaceId,
      device_id: deviceId,
      snapshot_blob: cipher,
    });

    addSyncLog(` Successfully pushed data to PocketBase 🛰️  ${runId} – push done`, 'success');
  } catch (err) {
    Sentry.captureException(err);
    addSyncLog(
      "Error pushing to PocketBase",
      "error",
      err instanceof Error ? err.message : String(err),
    );
    useRegistryStore.getState().setSyncStatus("error");
    throw err;
  } finally {
    // ensure we get back to idle in debug builds
    useRegistryStore.getState().setSyncStatus("idle");
  }
};

// ————————————————————— PULL ——————————————————————
export const pullLatestSnapshot = async (): Promise<void> => {
  if (!useUserStore.getState().preferences.premium) return;
  const runId = Date.now().toString(36);
  addSyncLog(`🛰️  ${runId} – pull`, 'info');
  try {

    if (!useUserStore.getState().preferences.hasCompletedOnboarding) {
      addSyncLog("Skipping pull – onboarding not completed", "warning");
      return;
    }

    if (!useUserStore.getState().preferences.premium) {
      addSyncLog("Skipping pull – not premium", "warning");
      return;
    }

    if (!(await checkNetworkConnectivity())) {
      addSyncLog("Skipping pull – no network connection", "warning");
      return;
    }

    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) {
      addSyncLog("No workspace configured, aborting pull", "warning");
      return;
    }
    const pb = await getPocketBase();
    const { items } = await pb.collection("registry_snapshots").getList(1, 1, {
      filter: `workspace_id="${workspaceId}"`,
      sort: "-created",
    });

    if (items.length === 0) {
      addSyncLog("📭 No snapshots found on server yet", "info");
      return;
    }
    const cipher = items[0].snapshot_blob as string;
    const key = await getWorkspaceKey();
    //addSyncLog(`🔑 Using decryption key: ${key.slice(0,6)}...${key.slice(-6)}`, "info");

    let plain: Record<string, unknown>;
    try {
      plain = decryptSnapshot(cipher, key);
    } catch (err) {
      addSyncLog(`❌ Decrypt failed – key mismatch or old format`, "error");
      addSyncLog(`🔍 Encryption error details: ${err instanceof Error ? err.message : String(err)}`, "error");
      return;
    }

    // Keep a local copy so future pushes have a baseline
    await FileSystem.writeAsStringAsync(
      `${FileSystem.documentDirectory}stateSnapshot.enc`,
      cipher,
      { encoding: FileSystem.EncodingType.UTF8 },
    );

    useRegistryStore.getState().setSyncStatus("syncing");
    useRegistryStore.getState().hydrateAll(plain);
    addSyncLog(`✅ Snapshot pulled & stores hydrated  ${runId} – pull done`, 'success');
  } catch (err) {
    Sentry.captureException(err);
    addSyncLog(
      "Error pulling from PocketBase",
      "error",
      err instanceof Error ? err.message : String(err),
    );
    useRegistryStore.getState().setSyncStatus("error");
    throw err;
  } finally {
    useRegistryStore.getState().setSyncStatus("idle");
  }
};
