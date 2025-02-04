import { useQuery } from '@tanstack/react-query';
import { VAULT_DATA } from '@/constants/vaultData';

export function useVault() {
  return useQuery({
    queryKey: ['vault-credentials'],
    queryFn: async () => {
      return VAULT_DATA;
    }
  });
}