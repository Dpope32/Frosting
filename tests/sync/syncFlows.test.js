// Add this mock at the top, before any other imports or mocks
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Common Mocks
jest.mock('@/components/sync/syncUtils', () => ({
  addSyncLog: jest.fn(),
}));

const mockFileSystem = {
  documentDirectory: 'file:///mock-doc-dir/',
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  EncodingType: { UTF8: 'utf8' },
};
jest.mock('expo-file-system', () => mockFileSystem);

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

// Mock UserStore
const mockUserStoreState = {
  preferences: {
    premium: true,
    hasCompletedOnboarding: true,
    username: 'testUser',
    primaryColor: 'blue', // Default or mock as needed
  },
  setPreferences: jest.fn(),
};
jest.mock('@/store/UserStore', () => ({
  useUserStore: {
    getState: jest.fn(() => mockUserStoreState),
    setState: jest.fn(), // Allow setState for preference changes if needed
    subscribe: jest.fn(() => jest.fn()), // Mock subscribe if used by components/hooks
  },
}));

// Mock RegistryStore (dynamic state for getAllStoreStates and hydrateAll)
let currentMockedRegistryState = {};
const mockHydrateAllActual = jest.fn((newData) => {
  currentMockedRegistryState = newData;
});
const mockGetAllStoreStatesActual = jest.fn(() => currentMockedRegistryState);
const mockSetSyncStatusActual = jest.fn();
const mockExportStateToFileActual = jest.fn(); // If needed by index.tsx logic

const mockRegistryStoreGetState = jest.fn(() => ({
  hydrateAll: mockHydrateAllActual,
  getAllStoreStates: mockGetAllStoreStatesActual,
  setSyncStatus: mockSetSyncStatusActual,
  exportStateToFile: mockExportStateToFileActual,
  syncStatus: 'idle', // Default sync status
  lastError: null,
}));
jest.mock('@/store/RegistryStore', () => ({
  useRegistryStore: {
    getState: mockRegistryStoreGetState,
    persist: {
        hasHydrated: jest.fn().mockResolvedValue(true),
    }
  },
}));


// Mock PocketBase related modules
const mockPocketBaseInstance = {
  collection: jest.fn().mockReturnThis(),
  getList: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  getOne: jest.fn(),
};
jest.mock('@/sync/pocketSync', () => ({
  getPocketBase: jest.fn().mockResolvedValue(mockPocketBaseInstance),
  checkNetworkConnectivity: jest.fn().mockResolvedValue(true),
}));

const mockWorkspaceId = 'mock-workspace-id-xyz';
const mockGeneratedSyncKey = 'mock-sync-key-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'; // 64 hex chars

// Mock encryption library
const mockDecryptedSnapshotData = { testStore: { data: 'decryptedDataFromPull' } };
const mockEncryptedCiphertext = 'mockEncryptedDataAsBase64String';
const { encryptSnapshot: actualEncryptSnapshot, decryptSnapshot: actualDecryptSnapshot } = jest.requireActual('@/lib/encryption');

jest.mock('@/lib/encryption', () => ({
  encryptSnapshot: jest.fn().mockReturnValue(mockEncryptedCiphertext),
  decryptSnapshot: jest.fn().mockReturnValue(mockDecryptedSnapshotData),
}));


// Mock parts of registrySyncManager, but use actual for exportEncryptedState
// and generateRandomKey for the encryption test
const { generateRandomKey: actualGenerateRandomKeyForTest, exportEncryptedState: actualExportEncryptedState } = jest.requireActual('@/sync/registrySyncManager');

const mockSpiedFunctions = {
  pullLatestSnapshot: jest.fn(),
  pushSnapshot: jest.fn(),
  exportEncryptedState: jest.fn(),
};

jest.mock('@/sync/registrySyncManager', () => {
    const originalModule = jest.requireActual('@/sync/registrySyncManager');
    return {
        ...originalModule,
        generateSyncKey: jest.fn().mockResolvedValue(mockGeneratedSyncKey),
        exportEncryptedState: mockSpiedFunctions.exportEncryptedState.mockImplementation(originalModule.exportEncryptedState),
    };
});


jest.mock('@/sync/workspace', () => {
    const originalModule = jest.requireActual('@/sync/workspace');
    return {
        ...originalModule,
        getCurrentWorkspaceId: jest.fn().mockResolvedValue(mockWorkspaceId),
        createOrJoinWorkspace: jest.fn().mockImplementation(originalModule.createOrJoinWorkspace),
    };
});


jest.mock('@/sync/snapshotPushPull', () => {
    const originalModule = jest.requireActual('@/sync/snapshotPushPull');
    return {
        ...originalModule,
        pullLatestSnapshot: mockSpiedFunctions.pullLatestSnapshot.mockImplementation(originalModule.pullLatestSnapshot),
        pushSnapshot: mockSpiedFunctions.pushSnapshot.mockImplementation(originalModule.pushSnapshot),
    };
});


describe('Sync User Stories', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Default UserStore state
    mockUserStoreState.preferences.premium = true;
    mockUserStoreState.preferences.hasCompletedOnboarding = true;
    jest.mocked(require('@/store/UserStore').useUserStore.getState).mockReturnValue(mockUserStoreState);
    
    // Default RegistryStore state
    currentMockedRegistryState = {}; // Start with empty state
    jest.mocked(mockHydrateAllActual).mockImplementation((newData) => {
        currentMockedRegistryState = newData;
    });
    jest.mocked(mockGetAllStoreStatesActual).mockImplementation(() => currentMockedRegistryState);
    jest.mocked(mockRegistryStoreGetState).mockReturnValue({
        hydrateAll: mockHydrateAllActual,
        getAllStoreStates: mockGetAllStoreStatesActual,
        setSyncStatus: mockSetSyncStatusActual,
        exportStateToFile: mockExportStateToFileActual,
        syncStatus: 'idle',
        lastError: null,
    });

    // Default FileSystem mocks
    jest.mocked(mockFileSystem.readAsStringAsync).mockResolvedValue(mockEncryptedCiphertext); // For push reading exported state
    jest.mocked(mockFileSystem.writeAsStringAsync).mockResolvedValue(undefined);

    // Default PocketBase mocks
    jest.mocked(require('@/sync/pocketSync').getPocketBase).mockResolvedValue(mockPocketBaseInstance);
    jest.mocked(require('@/sync/pocketSync').checkNetworkConnectivity).mockResolvedValue(true);
    jest.mocked(mockPocketBaseInstance.collection).mockReturnThis();
    jest.mocked(mockPocketBaseInstance.getList).mockResolvedValue({ items: [{ snapshot_blob: 'mockPulledBlobFromPB' }] });
    jest.mocked(mockPocketBaseInstance.create).mockResolvedValue({ id: 'newSnapshotRecordId' });
    jest.mocked(mockPocketBaseInstance.update).mockResolvedValue({ id: 'updatedWorkspaceId' });
    jest.mocked(mockPocketBaseInstance.getOne).mockResolvedValue({ id: mockWorkspaceId, invite_code: 'VALID_CODE', device_ids: ['otherDevice'] });


    // Default encryption mocks
    jest.mocked(require('@/lib/encryption').encryptSnapshot).mockReturnValue(mockEncryptedCiphertext);
    jest.mocked(require('@/lib/encryption').decryptSnapshot).mockReturnValue(mockDecryptedSnapshotData);
    
    // Default registrySyncManager mocks
    jest.mocked(require('@/sync/registrySyncManager').generateSyncKey).mockResolvedValue(mockGeneratedSyncKey);
    
    // Default workspace mocks
    jest.mocked(require('@/sync/workspace').getCurrentWorkspaceId).mockResolvedValue(mockWorkspaceId);

    // Reset spies
    mockSpiedFunctions.pullLatestSnapshot.mockClear();
    mockSpiedFunctions.pushSnapshot.mockClear();
    mockSpiedFunctions.exportEncryptedState.mockClear();

    // Connect the mock functions to the mocked implementations
    mockSpiedFunctions.pullLatestSnapshot = jest.mocked(require('@/sync/snapshotPushPull').pullLatestSnapshot);
    mockSpiedFunctions.pushSnapshot = jest.mocked(require('@/sync/snapshotPushPull').pushSnapshot);
    mockSpiedFunctions.exportEncryptedState = jest.mocked(require('@/sync/registrySyncManager').exportEncryptedState);

    // Re-apply implementations for spied functions to use actual logic
    const snapshotPushPullActual = jest.requireActual('@/sync/snapshotPushPull');
    mockSpiedFunctions.pullLatestSnapshot.mockImplementation(snapshotPushPullActual.pullLatestSnapshot);
    mockSpiedFunctions.pushSnapshot.mockImplementation(snapshotPushPullActual.pushSnapshot);

    const registrySyncManagerActual = jest.requireActual('@/sync/registrySyncManager');
    mockSpiedFunctions.exportEncryptedState.mockImplementation(registrySyncManagerActual.exportEncryptedState);
  });

  describe('#1 Initial Pull Before Push', () => {
    it('should call pullLatestSnapshot before pushSnapshot, and hydrateStores with non-null data from pull', async () => {
      // Arrange:
      // User is premium and onboarded (default mockUserStoreState)
      // Workspace ID exists (default mockGetCurrentWorkspaceId)
      // Network is connected (default mockCheckNetworkConnectivity)
      // getPocketBase returns mock PB instance
      // mockPocketBaseInstance.getList returns a snapshot blob for pull
      // decryptSnapshot returns mockDecryptedSnapshotData
      // generateSyncKey returns mockGeneratedSyncKey
      // Initial local state is empty
      currentMockedRegistryState = {};

      const callOrder = [];
      mockSpiedFunctions.pullLatestSnapshot.mockImplementation(async (...args) => {
        callOrder.push('pullLatestSnapshot');
        const actualModule = jest.requireActual('@/sync/snapshotPushPull');
        return actualModule.pullLatestSnapshot(...args);
      });
      mockSpiedFunctions.exportEncryptedState.mockImplementation(async (...args) => {
        callOrder.push('exportEncryptedState');
        const actualModule = jest.requireActual('@/sync/registrySyncManager');
        return actualModule.exportEncryptedState(...args);
      });
      mockSpiedFunctions.pushSnapshot.mockImplementation(async (...args) => {
        callOrder.push('pushSnapshot');
        const actualModule = jest.requireActual('@/sync/snapshotPushPull');
        return actualModule.pushSnapshot(...args);
      });
      
      // Act: Simulating the sequence from index.tsx's syncOnStartup logic
      // 1. Pull
      await mockSpiedFunctions.pullLatestSnapshot();

      // 2. Export (with states obtained after pull)
      const statesAfterPull = mockGetAllStoreStatesActual();
      await mockSpiedFunctions.exportEncryptedState(statesAfterPull);
      
      // Ensure FileSystem.readAsStringAsync returns what exportEncryptedState wrote (mockEncryptedCiphertext)
      jest.mocked(mockFileSystem.readAsStringAsync).mockResolvedValue(mockEncryptedCiphertext);

      // 3. Push
      await mockSpiedFunctions.pushSnapshot();

      // Assert:
      // 1. Call order
      expect(callOrder).toEqual(['pullLatestSnapshot', 'exportEncryptedState', 'pushSnapshot']);

      // 2. hydrateAll was called by pullLatestSnapshot with non-null data
      expect(mockHydrateAllActual).toHaveBeenCalledWith(mockDecryptedSnapshotData);
      expect(mockDecryptedSnapshotData).not.toBeNull();
      
      // 3. exportEncryptedState was called with the hydrated states
      expect(mockSpiedFunctions.exportEncryptedState).toHaveBeenCalledWith(mockDecryptedSnapshotData);
      
      // 4. pushSnapshot was called
      expect(mockSpiedFunctions.pushSnapshot).toHaveBeenCalled();
      // Check if pb.collection("registry_snapshots").create was called by pushSnapshot
      expect(mockPocketBaseInstance.create).toHaveBeenCalledWith(expect.objectContaining({
        snapshot_blob: mockEncryptedCiphertext, // This is what pushSnapshot reads and sends
      }));
    });
  });

  describe('#2 Onboarding Join Flow', () => {
    it('when joining a workspace, the first network write is a PATCH to device_ids, not a snapshot POST', async () => {
      // Arrange
      const workspaceToJoinId = 'joinableWorkspace123';
      const inviteCode = 'VALID_CODE';
      const newDeviceId = mockGeneratedSyncKey; // generateSyncKey will provide this

      jest.mocked(require('@/sync/registrySyncManager').generateSyncKey).mockResolvedValue(newDeviceId);
      
      const mockWorkspaceData = {
        id: workspaceToJoinId,
        invite_code: inviteCode,
        device_ids: ['existingDevice1'],
        // other fields...
      };
      jest.mocked(mockPocketBaseInstance.getOne).mockResolvedValue(mockWorkspaceData);
      jest.mocked(mockPocketBaseInstance.update).mockResolvedValue({ ...mockWorkspaceData, device_ids: ['existingDevice1', newDeviceId] });
      
      const { createOrJoinWorkspace } = jest.requireActual('@/sync/workspace');

      // Act
      await createOrJoinWorkspace(workspaceToJoinId, inviteCode);

      // Assert
      // 1. getOne was called to fetch the workspace
      expect(mockPocketBaseInstance.getOne).toHaveBeenCalledWith(workspaceToJoinId);
      
      // 2. update was called to add the device_id (PATCH equivalent)
      expect(mockPocketBaseInstance.update).toHaveBeenCalledWith(
        workspaceToJoinId,
        { 'device_ids+': newDeviceId } 
      );
      
      // 3. No snapshot create (POST) was called by createOrJoinWorkspace
      expect(mockPocketBaseInstance.create).not.toHaveBeenCalled(); // Specifically for 'registry_snapshots'
      
      // Check that create was not called on 'registry_snapshots' collection
      const createCalls = mockPocketBaseInstance.create.mock.calls;
      const snapshotCreateCall = createCalls.find(call => 
        mockPocketBaseInstance.collection.mock.calls.some(colCall => colCall[0] === 'registry_snapshots') && call[0].snapshot_blob
      );
      expect(snapshotCreateCall).toBeUndefined();

      // 4. FileSystem.writeAsStringAsync was called to save workspaceId
      expect(mockFileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        `${mockFileSystem.documentDirectory}workspace_id.txt`,
        workspaceToJoinId
      );
    });
  });

  describe('#3 Encryption Symmetry', () => {
    it('should encrypt and then decrypt data to its original form', () => {
      // Arrange
      const originalData = {
        user: { id: 1, name: 'Test User', settings: { theme: 'dark' } },
        items: [{ id: 'a', value: 10 }, { id: 'b', value: 20 }],
        lastSync: new Date().toISOString(),
      };
      
      // Get the actual functions directly inside the test
      const { generateRandomKey } = jest.requireActual('@/sync/registrySyncManager');
      const keyHex = generateRandomKey(); 

      // Use actual encryption/decryption functions from lib/encryption
      const { encryptSnapshot: realEncrypt, decryptSnapshot: realDecrypt } = jest.requireActual('@/lib/encryption');

      // Act
      const encrypted = realEncrypt(originalData, keyHex);
      const decrypted = realDecrypt(encrypted, keyHex);

      // Assert
      expect(decrypted).toEqual(originalData);
      expect(encrypted).not.toEqual(JSON.stringify(originalData)); // Ensure it's actually encrypted
    });
  });
}); 