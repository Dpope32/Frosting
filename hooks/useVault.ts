import { useQuery, useQueryClient } from '@tanstack/react-query';
import { VAULT_DATA } from '@/constants/vaultData';

export function useVault() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['vault-credentials'],
    queryFn: async () => {
      return VAULT_DATA;
    }
  });

  const addVaultEntry = (entry: { name: string; username: string; password: string }) => {
    // Generate a unique ID using timestamp and random number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    let newId = `${timestamp}-${random}`;
    
    // Ensure ID is unique by checking existing items
    while (VAULT_DATA.items.some(item => item.id === newId)) {
      newId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
    
    const newEntry = {
      id: newId,
      ...entry
    };
    VAULT_DATA.items.push(newEntry);
    VAULT_DATA.totalItems += 1;
    queryClient.invalidateQueries({ queryKey: ['vault-credentials'] });
  };

  const deleteVaultEntry = async (id: string) => {
    console.log('(NOBRIDGE) LOG [useVault] Deleting entry with id:', id);
    const index = VAULT_DATA.items.findIndex(item => item.id === id);
    console.log('(NOBRIDGE) LOG [useVault] Found item at index:', index);
    
    if (index !== -1) {
      console.log('(NOBRIDGE) LOG [useVault] Current items:', VAULT_DATA.items);
      // Create new arrays instead of mutating
      VAULT_DATA.items = VAULT_DATA.items.filter(item => item.id !== id);
      VAULT_DATA.totalItems -= 1;
      console.log('(NOBRIDGE) LOG [useVault] Updated items:', VAULT_DATA.items);
      
      try {
        // Force a cache update
        console.log('(NOBRIDGE) LOG [useVault] Invalidating queries...');
        await queryClient.invalidateQueries({ queryKey: ['vault-credentials'] });
        
        // Update the cache directly to ensure immediate UI update
        console.log('(NOBRIDGE) LOG [useVault] Updating cache...');
        queryClient.setQueryData(['vault-credentials'], {
          items: [...VAULT_DATA.items],
          totalItems: VAULT_DATA.totalItems
        });
        console.log('(NOBRIDGE) LOG [useVault] Delete operation completed');
      } catch (error) {
        console.log('(NOBRIDGE) LOG [useVault] Error during cache update:', error);
        throw error;
      }
    } else {
      console.log('(NOBRIDGE) LOG [useVault] Item not found with id:', id);
    }
  };

  return {
    data,
    isLoading,
    error,
    addVaultEntry,
    deleteVaultEntry
  };
}
