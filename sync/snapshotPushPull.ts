// ===============================================
// File: sync/snapshotPushPull.ts
// Purpose: push / pull encrypted snapshots to PocketBase.
// Notes:  
// • Removed redundant `timestamp` property; rely on PB’s `created` field.  
// • Added final `setSyncStatus('idle')` on success paths.  
// • Graceful decrypt failures while we’re iterating.  
// ===============================================

import * as FileSystem from "expo-file-system";
import { decryptSnapshot } from "@/lib/encryption";
import { generateSyncKey } from "@/sync/registrySyncManager";
import { useRegistryStore } from "@/store/RegistryStore";
import { useUserStore } from "@/store/UserStore";
import * as Sentry from "@sentry/react-native";
import { checkNetworkConnectivity, getPocketBase } from "./pocketSync";
import { getCurrentWorkspaceId } from "./workspace";
import { addSyncLog } from "@/components/sync/syncUtils";

// ————————————————————— PUSH ——————————————————————
export const pushSnapshot = async (): Promise<void> => {
  if (!useUserStore.getState().preferences.premium) return;

  try {
    addSyncLog("Pushing snapshot to PocketBase", "info");

    // guards
    if (!useUserStore.getState().preferences.hasCompletedOnboarding) {
      addSyncLog("Skipping push – onboarding not completed", "warning");
      return;
    }

    if (!(await checkNetworkConnectivity())) {
      addSyncLog("Skipping push – no network connection", "warning");
      return;
    }

    const pb = await getPocketBase();
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) throw new Error("No workspace configured");

    const deviceId = await generateSyncKey();
    const cipher = await FileSystem.readAsStringAsync(
      `${FileSystem.documentDirectory}stateSnapshot.enc`,
    );

    await pb.collection("registry_snapshots").create({
      workspace_id: workspaceId,
      device_id: deviceId,
      snapshot_blob: cipher,
    });

    addSyncLog("Successfully pushed data to PocketBase", "info");
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

  try {
    addSyncLog("Pulling latest snapshot from PocketBase", "info");

    if (!useUserStore.getState().preferences.hasCompletedOnboarding) {
      addSyncLog("Skipping pull – onboarding not completed", "warning");
      return;
    }

    if (!(await checkNetworkConnectivity())) {
      addSyncLog("Skipping pull – no network connection", "warning");
      return;
    }

    const pb = await getPocketBase();
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) throw new Error("No workspace configured");

    const list = await pb.collection("registry_snapshots").getList(1, 1, {
      filter: `workspace_id="${workspaceId}"`,
      sort: "-created",
    });

    if (list.items.length === 0) {
      addSyncLog("No snapshots found for this workspace", "info");
      return;
    }

    const blob = list.items[0].snapshot_blob;
    const key = await generateSyncKey();

    let data: Record<string, unknown>;
    try {
      data = decryptSnapshot(blob, key);
    } catch (e) {
      addSyncLog("Decrypt failed – probably an old format", "error");
      return; // bail gracefully during debug
    }

    useRegistryStore.getState().setSyncStatus("syncing");
    useRegistryStore.getState().hydrateAll(data);
    addSyncLog("Successfully pulled and hydrated data from PocketBase", "info");
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
