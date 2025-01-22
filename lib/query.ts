import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { storage } from '../store/MMKV';

import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

// Create a custom persister using MMKV
const createMMKVPersister = (): Persister => ({
  persistClient: async (client: PersistedClient) => {
    storage.set('REACT_QUERY_OFFLINE_CACHE', JSON.stringify(client));
  },
  restoreClient: async () => {
    const client = storage.getString('REACT_QUERY_OFFLINE_CACHE');
    if (!client) return undefined;
    return JSON.parse(client) as PersistedClient;
  },
  removeClient: async () => {
    storage.delete('REACT_QUERY_OFFLINE_CACHE');
  },
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global query configuration
      staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
      gcTime: 1000 * 60 * 30, // Keep unused data in cache for 30 minutes
      retry: 2, // Retry failed requests 2 times
      refetchOnWindowFocus: false, // Don't refetch on window focus (mobile apps)
      refetchOnReconnect: true, // Refetch when reconnecting
    },
    mutations: {
      // Global mutation configuration
      retry: 1,
    },
  },
});

// Create a persister using MMKV
const mmkvPersister = createMMKVPersister();

// Enable persistence
persistQueryClient({
  queryClient,
  persister: mmkvPersister,
  // Maximum age of cache in milliseconds
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  // Dehydrate queries that:
  dehydrateOptions: {
    shouldDehydrateQuery: ({ queryKey }) => {
      // Customize which queries to persist
      return true; // Persist all queries by default
    },
  },
});

export { queryClient };
