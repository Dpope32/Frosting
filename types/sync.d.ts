/**
 * Type declarations for sync modules
 */

declare module '@/sync/snapshotPushPull' {
  /**
   * Push the encrypted state snapshot to PocketBase server
   */
  export function pushSnapshot(): Promise<void>;
  
  /**
   * Pull the latest snapshot from PocketBase server and apply it
   */
  export function pullLatestSnapshot(): Promise<void>;
}

declare module '@/sync/registrySyncManager' {
  /**
   * Generate or retrieve the device's unique sync key
   */
  export function generateSyncKey(): Promise<string>;
  
  /**
   * Export and encrypt the app state for syncing
   * @param allStates The states from all stores to encrypt and export
   * @returns URI of the encrypted file
   */
  export function exportEncryptedState(allStates: Record<string, any>): Promise<string>;
} 

