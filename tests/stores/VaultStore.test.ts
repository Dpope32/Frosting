import { useVaultStore } from '@/store/VaultStore';
import type { VaultEntry } from '@/types';

// Mock AsyncStorage BEFORE any imports
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock the sync utilities
jest.mock('@/components/sync/syncUtils', () => ({
  addSyncLog: jest.fn(),
}));

// Mock the AsyncStorage utilities
jest.mock('@/store/AsyncStorage', () => ({
  StorageUtils: {
    set: jest.fn(() => Promise.resolve()),
    get: jest.fn(() => Promise.resolve({})),
  },
  createPersistStorage: jest.fn(() => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  })),
}));

describe('VaultStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useVaultStore.setState({
      vaultData: {
        items: [],
        totalItems: 0,
      },
      isLoaded: false,
      isSyncEnabled: false,
    });
    jest.clearAllMocks();
  });

  const createTestEntry = (overrides: Partial<VaultEntry> = {}): Omit<VaultEntry, 'id'> => ({
    name: 'Test Service',
    username: 'testuser',
    password: 'testpass123',
    ...overrides,
  });

  test('addEntry adds a new vault entry', async () => {
    const entryData = createTestEntry();
    const result = await useVaultStore.getState().addEntry(entryData);
    
    expect(result.id).toBeDefined();
    expect(result.name).toBe(entryData.name);
    expect(result.username).toBe(entryData.username);
    expect(result.password).toBe(entryData.password);
    
    const state = useVaultStore.getState();
    expect(state.vaultData.items).toHaveLength(1);
    expect(state.vaultData.totalItems).toBe(1);
  });

  test('deleteEntry soft deletes the entry', async () => {
    // Add an entry first
    const entryData = createTestEntry();
    const addedEntry = await useVaultStore.getState().addEntry(entryData);
    
    // Verify entry exists and is not deleted
    expect(useVaultStore.getState().vaultData.items).toHaveLength(1);
    expect(useVaultStore.getState().vaultData.totalItems).toBe(1);
    expect(useVaultStore.getState().vaultData.items[0].deletedAt).toBeUndefined();
    
    // Delete the entry
    await useVaultStore.getState().deleteEntry(addedEntry.id);
    
    const state = useVaultStore.getState();
    
    // Entry should still exist in items array but be marked as deleted
    expect(state.vaultData.items).toHaveLength(1);
    expect(state.vaultData.items[0].deletedAt).toBeDefined();
    expect(state.vaultData.items[0].updatedAt).toBeDefined();
    
    // totalItems should reflect only active items
    expect(state.vaultData.totalItems).toBe(0);
  });

  test('getEntries filters out deleted entries', async () => {
    // Add multiple entries
    const activeEntry = await useVaultStore.getState().addEntry(createTestEntry({ name: 'Active Service' }));
    const toDeleteEntry = await useVaultStore.getState().addEntry(createTestEntry({ name: 'To Delete Service' }));
    
    // Delete one entry
    await useVaultStore.getState().deleteEntry(toDeleteEntry.id);
    
    const entries = useVaultStore.getState().getEntries();
    
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe(activeEntry.id);
    expect(entries[0].name).toBe('Active Service');
  });

  test('getActiveEntries filters out deleted entries', async () => {
    // Add multiple entries
    const activeEntry = await useVaultStore.getState().addEntry(createTestEntry({ name: 'Active Service' }));
    const toDeleteEntry = await useVaultStore.getState().addEntry(createTestEntry({ name: 'To Delete Service' }));
    
    // Delete one entry
    await useVaultStore.getState().deleteEntry(toDeleteEntry.id);
    
    const activeEntries = useVaultStore.getState().getActiveEntries();
    
    expect(activeEntries).toHaveLength(1);
    expect(activeEntries[0].id).toBe(activeEntry.id);
    expect(activeEntries[0].name).toBe('Active Service');
  });

  test('toggleVaultSync toggles sync state', () => {
    expect(useVaultStore.getState().isSyncEnabled).toBe(false);
    
    useVaultStore.getState().toggleVaultSync();
    expect(useVaultStore.getState().isSyncEnabled).toBe(true);
    
    useVaultStore.getState().toggleVaultSync();
    expect(useVaultStore.getState().isSyncEnabled).toBe(false);
  });

  test('hydrateFromSync skips when local sync is disabled', () => {
    useVaultStore.setState({ isSyncEnabled: false });
    
    const testEntry: VaultEntry = {
      id: 'test-1',
      name: 'Test Service',
      username: 'testuser',
      password: 'testpass',
    };
    
    useVaultStore.getState().hydrateFromSync?.({
      vaultData: {
        items: [testEntry],
        totalItems: 1,
      }
    });
    
    expect(useVaultStore.getState().vaultData.items).toHaveLength(0);
  });

  test('hydrateFromSync handles vault entry deletions', async () => {
    // Enable sync
    useVaultStore.setState({ isSyncEnabled: true });
    
    // Add a local entry
    const localEntry = await useVaultStore.getState().addEntry(createTestEntry({ name: 'Local Entry' }));
    
    // Simulate incoming deletion from sync with future timestamp
    const futureDate = new Date(Date.now() + 10000).toISOString();
    const deletedEntry = {
      ...localEntry,
      deletedAt: futureDate,
      updatedAt: futureDate
    };
    
    useVaultStore.getState().hydrateFromSync?.({
      vaultData: {
        items: [deletedEntry],
        totalItems: 0,
      }
    });
    
    // Entry should be marked as deleted
    const updatedEntry = useVaultStore.getState().vaultData.items[0];
    expect(updatedEntry.deletedAt).toBeDefined();
    
    // getEntries should not include deleted entry
    const activeEntries = useVaultStore.getState().getEntries();
    expect(activeEntries).toHaveLength(0);
  });

  test('hydrateFromSync merges newer data', async () => {
    useVaultStore.setState({ isSyncEnabled: true });
    
    const oldDate = new Date('2023-01-01').toISOString();
    const newDate = new Date('2023-01-02').toISOString();
    
    // Add local entry with old timestamp
    const localEntry: VaultEntry = {
      id: 'merge-test',
      name: 'Old Name',
      username: 'olduser',
      password: 'oldpass',
      createdAt: oldDate,
      updatedAt: oldDate
    };
    
    useVaultStore.setState({
      vaultData: {
        items: [localEntry],
        totalItems: 1,
      },
      isSyncEnabled: true
    });
    
    // Simulate incoming update with newer timestamp
    const updatedEntry: VaultEntry = {
      ...localEntry,
      name: 'New Name',
      username: 'newuser',
      updatedAt: newDate
    };
    
    useVaultStore.getState().hydrateFromSync?.({
      vaultData: {
        items: [updatedEntry],
        totalItems: 1,
      }
    });
    
    const mergedEntry = useVaultStore.getState().vaultData.items[0];
    expect(mergedEntry.name).toBe('New Name');
    expect(mergedEntry.username).toBe('newuser');
    expect(mergedEntry.updatedAt).toBe(newDate);
  });

  test('hydrateFromSync preserves newer local data', async () => {
    useVaultStore.setState({ isSyncEnabled: true });
    
    const oldDate = new Date('2023-01-01').toISOString();
    const newDate = new Date('2023-01-02').toISOString();
    
    // Add local entry with newer timestamp
    const localEntry: VaultEntry = {
      id: 'preserve-test',
      name: 'Newer Local Name',
      username: 'localuser',
      password: 'localpass',
      createdAt: oldDate,
      updatedAt: newDate
    };
    
    useVaultStore.setState({
      vaultData: {
        items: [localEntry],
        totalItems: 1,
      },
      isSyncEnabled: true
    });
    
    // Simulate incoming update with older timestamp
    const olderEntry: VaultEntry = {
      ...localEntry,
      name: 'Older Remote Name',
      username: 'remoteuser',
      updatedAt: oldDate
    };
    
    useVaultStore.getState().hydrateFromSync?.({
      vaultData: {
        items: [olderEntry],
        totalItems: 1,
      }
    });
    
    // Should keep the newer local data
    const resultEntry = useVaultStore.getState().vaultData.items[0];
    expect(resultEntry.name).toBe('Newer Local Name');
    expect(resultEntry.username).toBe('localuser');
  });

  test('hydrateFromSync adds new entries', () => {
    useVaultStore.setState({ isSyncEnabled: true });
    
    const newEntry: VaultEntry = {
      id: 'new-entry',
      name: 'New Service',
      username: 'newuser',
      password: 'newpass',
    };
    
    useVaultStore.getState().hydrateFromSync?.({
      vaultData: {
        items: [newEntry],
        totalItems: 1,
      }
    });
    
    expect(useVaultStore.getState().vaultData.items).toHaveLength(1);
    expect(useVaultStore.getState().vaultData.items[0]).toEqual(newEntry);
    expect(useVaultStore.getState().vaultData.totalItems).toBe(1);
  });

  test('hydrateFromSync handles mixed operations', async () => {
    useVaultStore.setState({ isSyncEnabled: true });
    
    // Set up local data
    const existingEntry: VaultEntry = {
      id: 'existing',
      name: 'Existing Entry',
      username: 'existing',
      password: 'existing',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };
    
    useVaultStore.setState({
      vaultData: {
        items: [existingEntry],
        totalItems: 1,
      }
    });
    
    // Simulate sync with: updated existing + new entry + deleted entry
    const futureDate = new Date(Date.now() + 10000).toISOString();
    
    const updatedExisting: VaultEntry = {
      ...existingEntry,
      name: 'Updated Existing',
      updatedAt: futureDate
    };
    
    const newEntry: VaultEntry = {
      id: 'new',
      name: 'New Entry',
      username: 'new',
      password: 'new',
    };
    
    const deletedEntry: VaultEntry = {
      id: 'deleted',
      name: 'Deleted Entry',
      username: 'deleted',
      password: 'deleted',
      deletedAt: futureDate,
      updatedAt: futureDate
    };
    
    useVaultStore.getState().hydrateFromSync?.({
      vaultData: {
        items: [updatedExisting, newEntry, deletedEntry],
        totalItems: 2, // Only active entries
      }
    });
    
    const state = useVaultStore.getState();
    
    // Should have all 3 items in storage
    expect(state.vaultData.items).toHaveLength(3);
    
    // But only 2 active entries
    const activeEntries = useVaultStore.getState().getActiveEntries();
    expect(activeEntries).toHaveLength(2);
    
    // Check specific updates
    const updated = state.vaultData.items.find(e => e.id === 'existing');
    expect(updated?.name).toBe('Updated Existing');
    
    const added = state.vaultData.items.find(e => e.id === 'new');
    expect(added).toBeDefined();
    
    const deleted = state.vaultData.items.find(e => e.id === 'deleted');
    expect(deleted?.deletedAt).toBeDefined();
  });
}); 
    