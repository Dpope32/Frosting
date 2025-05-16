import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVaultStore } from '@/store';

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
    // Ensure fresh data on each screen visit
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  // Mutation for adding a vault entry
  const addVaultEntry = useMutation({
    mutationFn: async (entry: { name: string; username: string; password: string }) => {
      return await vaultStore.addEntry(entry);
    },
    onSuccess: () => {
      // Force immediate refetch to update UI
      queryClient.invalidateQueries({ queryKey: ['vault-credentials'] });
      queryClient.refetchQueries({ queryKey: ['vault-credentials'] });
    },
  });
  
  // Mutation for deleting a vault entry
  const deleteVaultEntry = useMutation({
    mutationFn: async (id: string) => {
      await vaultStore.deleteEntry(id);
    },
    onSuccess: () => {
      // Force immediate refetch to update UI
      queryClient.invalidateQueries({ queryKey: ['vault-credentials'] });
      queryClient.refetchQueries({ queryKey: ['vault-credentials'] });
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
