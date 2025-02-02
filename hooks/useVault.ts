import { useQuery } from '@tanstack/react-query';

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

// Hardcoded values
const BASE_URL = 'http://192.168.1.32:8090';
const PIN = '2022';

export function useVault() {
  return useQuery({
    queryKey: ['vault-credentials'],
    queryFn: async (): Promise<PocketBaseResponse> => {
      console.log('Fetching from:', `${BASE_URL}/api/collections/credz/records`);
      console.log('Using PIN:', PIN);

      const response = await fetch(`${BASE_URL}/api/collections/credz/records`, {
        headers: {
          'Content-Type': 'application/json',
          'pin': PIN
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch credentials, status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched Vault Data:', data);
      return data;
    }
  });
}
