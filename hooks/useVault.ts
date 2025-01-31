import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';

interface Credential {
  id: string;
  name: string;
  username: string;
  password: string;
}

interface PocketBaseResponse {
  page: number;
  perPage: number;
  totalItems: number;
  items: Credential[];
}

const BASE_URL = Constants.expoConfig?.extra?.POCKETBASE_URL || 'http://localhost:8090';
const PIN = Constants.expoConfig?.extra?.POCKETBASE_PIN || '0000';

export function useVault() {
  return useQuery({
    queryKey: ['vault-credentials'],
    queryFn: async (): Promise<PocketBaseResponse> => {
      const response = await fetch(`${BASE_URL}/api/collections/credz/records`, {
        headers: {
          'Content-Type': 'application/json',
          'pin': PIN
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch credentials');
      }
      
      return response.json();
    }
  });
}