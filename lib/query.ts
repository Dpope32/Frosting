import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { StorageUtils } from '../store/MMKV';
import type { PersistedClient, Persister, PersistQueryClientOptions } from '@tanstack/react-query-persist-client';

type SetupPersistenceOptions = Omit<PersistQueryClientOptions, 'persister'>;

export function setupQueryPersistence(options: SetupPersistenceOptions) {
  const persister: Persister = {
    persistClient: async (client: PersistedClient) => {
      StorageUtils.set('REACT_QUERY_OFFLINE_CACHE', client);
    },
    restoreClient: async () => {
      return StorageUtils.get<PersistedClient>('REACT_QUERY_OFFLINE_CACHE');
    },
    removeClient: async () => {
      StorageUtils.delete('REACT_QUERY_OFFLINE_CACHE');
    },
  };

  persistQueryClient({
    ...options,
    persister,
  });
}
