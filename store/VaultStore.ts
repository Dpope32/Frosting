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
  addEntry: (entry: Omit<VaultEntry, 'id'>) => Promise<VaultEntry>;
  deleteEntry: (id: string) => Promise<void>;
  getEntries: () => VaultEntry[];
}

export const useVaultStore = create<VaultStore>()(
  persist(
    (set, get) => ({
      vaultData: VAULT_DATA,
      isLoaded: false,
      
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
      }
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