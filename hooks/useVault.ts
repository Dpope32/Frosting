import { useQuery, useQueryClient } from '@tanstack/react-query';
import { VAULT_DATA } from '@/constants/vaultData';
import { vaultStorage } from '@/utils/Storage';

export function useVault() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['vault-credentials'],
    queryFn: async () => {
      const storedData = vaultStorage.getString('vault-data');
      if (storedData) {
        return JSON.parse(storedData);
      }
      // Initialize with empty vault data if nothing is stored
      vaultStorage.set('vault-data', JSON.stringify(VAULT_DATA));
      return VAULT_DATA;
    }
  });

  const addVaultEntry = (entry: { name: string; username: string; password: string }) => {
    const currentData = JSON.parse(vaultStorage.getString('vault-data') || JSON.stringify(VAULT_DATA));
    
    // Generate a unique ID using timestamp and random number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    let newId = `${timestamp}-${random}`;
    
    // Ensure ID is unique by checking existing items
    while (currentData.items.some((item: any) => item.id === newId)) {
      newId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
    
    const newEntry = {
      id: newId,
      ...entry
    };
    
    const updatedData = {
      ...currentData,
      items: [...currentData.items, newEntry],
      totalItems: currentData.totalItems + 1
    };
    
    vaultStorage.set('vault-data', JSON.stringify(updatedData));
    queryClient.invalidateQueries({ queryKey: ['vault-credentials'] });
  };

  const deleteVaultEntry = async (id: string) => {
    const currentData = JSON.parse(vaultStorage.getString('vault-data') || JSON.stringify(VAULT_DATA));
    const index = currentData.items.findIndex((item: any) => item.id === id);
    
    if (index !== -1) {
      const updatedData = {
        ...currentData,
        items: currentData.items.filter((item: any) => item.id !== id),
        totalItems: currentData.totalItems - 1
      };
      
      try {
        // Save to storage
        vaultStorage.set('vault-data', JSON.stringify(updatedData));
        
        // Force a cache update
        await queryClient.invalidateQueries({ queryKey: ['vault-credentials'] });
        
        // Update the cache directly to ensure immediate UI update
        queryClient.setQueryData(['vault-credentials'], updatedData);
      } catch (error) {
        console.error('Error during vault entry deletion:', error);
        throw error;
      }
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
