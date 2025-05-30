import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';

interface VaultEntry {
  id: string;
  name: string;
  username: string;
  password: string;
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
          ...entry
        };
        
        set((state) => ({
          vaultData: {
            ...state.vaultData,
            items: [...state.vaultData.items, newEntry],
            totalItems: state.vaultData.totalItems + 1
          }
        }));
        
        return newEntry;
      },
      
      deleteEntry: async (id) => {
        set((state) => {
          const items = state.vaultData.items.filter(item => item.id !== id);
          return {
            vaultData: {
              ...state.vaultData,
              items,
              totalItems: items.length
            }
          };
        });
      },
      
      getEntries: () => {
        return get().vaultData.items;
      },

      toggleVaultSync: () => {
        set((state) => {
          const newSyncState = !state.isSyncEnabled;
          try {
            getAddSyncLog()(`Vault sync ${newSyncState ? 'enabled' : 'disabled'}`, 'info');
          } catch (e) { /* ignore */ }
          return { isSyncEnabled: newSyncState };
        });
      },

      hydrateFromSync: (syncedData: { vaultData?: VaultData }) => {
        const addSyncLog = getAddSyncLog();
        const currentSyncEnabledState = get().isSyncEnabled;
        if (!currentSyncEnabledState) {
          addSyncLog('Vault sync is disabled, skipping hydration for VaultStore.', 'info');
          return;
        }

        const itemsToSync = syncedData.vaultData?.items;
        if (!itemsToSync || !Array.isArray(itemsToSync)) {
          addSyncLog('No vault items data in snapshot for VaultStore, or items are not an array.', 'info');
          return;
        }

        let itemsMergedCount = 0;
        let itemsAddedCount = 0;

        set((state) => {
          const existingItemsMap = new Map(state.vaultData.items.map(item => [item.id, item]));
          const newItemsArray = [...state.vaultData.items];

          for (const incomingItem of itemsToSync) {
            if (existingItemsMap.has(incomingItem.id)) {
              const existingItemIndex = newItemsArray.findIndex(item => item.id === incomingItem.id);
              if (existingItemIndex !== -1) {
                newItemsArray[existingItemIndex] = incomingItem;
                itemsMergedCount++;
              }
            } else {
              newItemsArray.push(incomingItem);
              itemsAddedCount++;
            }
          }
          
          //addSyncLog(`Vault items hydrated: ${itemsAddedCount} added, ${itemsMergedCount} merged. Total items: ${newItemsArray.length}`, 'success');
          return {
            vaultData: {
              ...state.vaultData,
              items: newItemsArray,
              totalItems: newItemsArray.length,
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
        }
      },
    }
  )
);