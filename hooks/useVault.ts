import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVaultStore } from '@/store/VaultStore';

export function useVault() {
  const queryClient = useQueryClient();
  const vaultStore = useVaultStore();
  
  // Use React Query to wrap the Zustand store
  const { data, isLoading, error } = useQuery({
    queryKey: ['vault-credentials'],
    queryFn: () => {
      // Return the current vault data from the store
      return vaultStore.vaultData;
    },
    // Only refetch when the store changes
    staleTime: Infinity,
  });
  
  // Mutation for adding a vault entry
  const addVaultEntry = useMutation({
    mutationFn: async (entry: { name: string; username: string; password: string }) => {
      return await vaultStore.addEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-credentials'] });
    },
  });
  
  // Mutation for deleting a vault entry
  const deleteVaultEntry = useMutation({
    mutationFn: async (id: string) => {
      await vaultStore.deleteEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-credentials'] });
    },
  });
  
  return {
    data,
    isLoading: isLoading || !vaultStore.isLoaded,
    error,
    addVaultEntry: (entry: { name: string; username: string; password: string }) => 
      addVaultEntry.mutate(entry),
    deleteVaultEntry: (id: string) => 
      deleteVaultEntry.mutate(id),
  };
}