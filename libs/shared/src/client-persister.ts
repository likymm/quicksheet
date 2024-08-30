import { get, set, del } from 'idb-keyval';
import {
  PersistedClient,
  Persister,
  persistQueryClient,
} from '@tanstack/query-persist-client-core';
import { QueryClient } from '@tanstack/query-core';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export function queryClientPersister(): QueryClient {
  persistQueryClient({
    queryClient: queryClient,
    persister: createIDBPersister('GRANT_MGT'),
    maxAge: 1000 * 60 * 5, // 5 minutes
  } as never);
  return queryClient;
}

export function createIDBPersister(idbValidKey: IDBValidKey = 'reactQuery') {
  return {
    persistClient: async (client: PersistedClient) => {
      await set(idbValidKey, client);
    },
    restoreClient: async () => {
      return await get<PersistedClient>(idbValidKey);
    },
    removeClient: async () => {
      await del(idbValidKey);
    },
  } as Persister;
}
