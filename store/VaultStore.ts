import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';

interface VaultEntry {
  id: string;
  name: string;
  username: string;
  password: string;
  deletedAt?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface VaultData {
  items: VaultEntry[];
  totalItems: number;
}

export const VAULT_DATA = {
  page: 1,
  perPage: 10,
  totalItems: 0,
  items: []
};

interface VaultStore {
  vaultData: VaultData;
  isLoaded: boolean;
  isSyncEnabled: boolean;
  addEntry: (entry: Omit<VaultEntry, 'id'>) => Promise<VaultEntry>;
  deleteEntry: (id: string) => Promise<void>;
  getEntries: () => VaultEntry[];
  getActiveEntries: () => VaultEntry[];
  toggleVaultSync: () => void;
  hydrateFromSync?: (syncedData: { vaultData?: VaultData }) => void;
}

const getAddSyncLog = () => require('@/components/sync/syncUtils').addSyncLog;

export const useVaultStore = create<VaultStore>()(
  persist(
    (set, get) => ({
      vaultData: VAULT_DATA,
      isLoaded: false,
      isSyncEnabled: false,
      
      addEntry: async (entry) => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        const newId = `${timestamp}-${random}`;
        
        const newEntry: VaultEntry = {
          id: newId,
          ...entry,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set((state) => ({
          vaultData: {
            ...state.vaultData,
            items: [...state.vaultData.items, newEntry],
            totalItems: state.vaultData.totalItems + 1
          }
        }));
        
        try {
          getAddSyncLog()(`🔐 [VaultStore] New entry added: "${entry.name}"`, 'info');
        } catch (e) {}
        
        return newEntry;
      },
      
      deleteEntry: async (id) => {
        const deletionTimestamp = new Date().toISOString();
        
        set((state) => {
          const existingItem = state.vaultData.items.find(item => item.id === id);
          
          if (!existingItem) {
            try {
              getAddSyncLog()(`⚠️ [VaultStore] Attempted to delete non-existent entry: ${id}`, 'warning');
            } catch (e) {}
            return state;
          }
          
          const items = state.vaultData.items.map(item => 
            item.id === id 
              ? { ...item, deletedAt: deletionTimestamp, updatedAt: deletionTimestamp }
              : item
          );
          
          const activeItems = items.filter(item => !item.deletedAt);
          
          try {
            getAddSyncLog()(`🗑️ [VaultStore] Entry "${existingItem.name}" soft deleted locally`, 'info', `Deletion timestamp: ${deletionTimestamp}`);
          } catch (e) {}
          
          return {
            vaultData: {
              ...state.vaultData,
              items,
              totalItems: activeItems.length
            }
          };
        });
      },
      
      getEntries: () => {
        return get().vaultData.items.filter(item => !item.deletedAt);
      },

      getActiveEntries: () => {
        return get().vaultData.items.filter(item => !item.deletedAt);
      },

      toggleVaultSync: () => {
        set((state) => {
          const newSyncState = !state.isSyncEnabled;
          try {
            getAddSyncLog()(`🔐 [VaultStore] Vault sync ${newSyncState ? 'enabled' : 'disabled'}`, 'info');
          } catch (e) { /* ignore */ }
          return { isSyncEnabled: newSyncState };
        });
      },

      hydrateFromSync: (syncedData: { vaultData?: VaultData }) => {
        const addSyncLog = getAddSyncLog();
        const currentSyncEnabledState = get().isSyncEnabled;
        if (!currentSyncEnabledState) {
          addSyncLog('🔐 [VaultStore] Vault sync is disabled, skipping hydration', 'info');
          return;
        }

        const itemsToSync = syncedData.vaultData?.items;
        if (!itemsToSync || !Array.isArray(itemsToSync)) {
          addSyncLog('🔐 [VaultStore] No vault items data in snapshot, or items are not an array', 'info');
          return;
        }

        addSyncLog(`🔐 [VaultStore] Starting vault hydration with ${itemsToSync.length} incoming items`, 'info');

        let itemsMergedCount = 0;
        let itemsAddedCount = 0;
        let deletionsAppliedCount = 0;
        let deletionsPreservedCount = 0;

        set((state) => {
          const existingItemsMap = new Map(state.vaultData.items.map(item => [item.id, item]));
          const newItemsArray = [...state.vaultData.items];

          for (const incomingItem of itemsToSync) {
            if (existingItemsMap.has(incomingItem.id)) {
              const existingItemIndex = newItemsArray.findIndex(item => item.id === incomingItem.id);
              if (existingItemIndex !== -1) {
                const existingItem = newItemsArray[existingItemIndex];
                
                // CRITICAL FIX: Handle deletions with priority logic
                const incomingDeleted = !!incomingItem.deletedAt;
                const existingDeleted = !!existingItem.deletedAt;
                
                // Rule 1: Once deleted, always deleted (deletions have priority)
                if (existingDeleted && !incomingDeleted) {
                  addSyncLog(
                    `🛡️ [VaultStore] Preserving local deletion of "${existingItem.name}" over incoming non-deleted version`,
                    'warning',
                    `Local deletedAt: ${existingItem.deletedAt} | Incoming has no deletedAt`
                  );
                  deletionsPreservedCount++;
                  // Keep existing deleted version, don't overwrite
                  continue;
                }
                
                // Rule 2: Apply incoming deletions
                if (incomingDeleted && !existingDeleted) {
                  addSyncLog(
                    `🗑️ [VaultStore] Applying incoming deletion for "${incomingItem.name}"`,
                    'success',
                    `Incoming deletedAt: ${incomingItem.deletedAt}`
                  );
                  deletionsAppliedCount++;
                  newItemsArray[existingItemIndex] = incomingItem;
                  itemsMergedCount++;
                  continue;
                }
                
                // Rule 3: For non-deletion updates, use timestamp comparison
                const incomingTimestamp = new Date(incomingItem.updatedAt || incomingItem.createdAt || Date.now()).getTime();
                const existingTimestamp = new Date(existingItem.updatedAt || existingItem.createdAt || Date.now()).getTime();
                
                if (incomingTimestamp > existingTimestamp) {
                  addSyncLog(
                    `🔄 [VaultStore] Updating "${incomingItem.name}" with newer incoming version`,
                    'verbose',
                    `Incoming: ${incomingItem.updatedAt} > Existing: ${existingItem.updatedAt}`
                  );
                  newItemsArray[existingItemIndex] = incomingItem;
                  itemsMergedCount++;
                } else {
                  addSyncLog(
                    `⏭️ [VaultStore] Keeping existing version of "${existingItem.name}" (newer or equal)`,
                    'verbose',
                    `Existing: ${existingItem.updatedAt} >= Incoming: ${incomingItem.updatedAt}`
                  );
                }
              }
            } else {
              // New item from sync
              newItemsArray.push(incomingItem);
              itemsAddedCount++;
              
              if (incomingItem.deletedAt) {
                addSyncLog(`🗑️ [VaultStore] Adding already-deleted vault entry "${incomingItem.name}" from sync`, 'verbose');
              } else {
                addSyncLog(`➕ [VaultStore] Adding new vault entry "${incomingItem.name}" from sync`, 'info');
              }
            }
          }
          
          const activeItems = newItemsArray.filter(item => !item.deletedAt);
          const totalDeletedItems = newItemsArray.filter(item => !!item.deletedAt).length;
          
          addSyncLog(
            `✅ [VaultStore] Vault hydration complete`,
            'success',
            `Added: ${itemsAddedCount} | Merged: ${itemsMergedCount} | Deletions applied: ${deletionsAppliedCount} | Deletions preserved: ${deletionsPreservedCount} | Total: ${newItemsArray.length} (${activeItems.length} active, ${totalDeletedItems} deleted)`
          );
          
          return {
            vaultData: {
              ...state.vaultData,
              items: newItemsArray,
              totalItems: activeItems.length,
            },
          };
        });
      },
    }),
    {
      name: 'vault-storage',
      storage: createPersistStorage<VaultStore>(),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoaded = true;
          const addSyncLog = getAddSyncLog();
          const activeItems = state.vaultData.items.filter(item => !item.deletedAt);
          const deletedItems = state.vaultData.items.filter(item => !!item.deletedAt);
          addSyncLog(
            `🔐 [VaultStore] Rehydrated vault storage`,
            'info',
            `Total: ${state.vaultData.items.length} items (${activeItems.length} active, ${deletedItems.length} deleted)`
          );
        }
      },
    }
  )
);