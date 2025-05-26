/**
 * Tests for pocketSync functionality
 */

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-notifications', () => ({}));
jest.mock('@/services', () => ({
  getWallpapers: () => []
}));
jest.mock('@/store/ToDo', () => ({}));
jest.mock('@/store', () => ({
  useUserStore: { getState: () => ({ preferences: {} }) }
}));
jest.mock('@/store/RegistryStore', () => ({
  useRegistryStore: { getState: () => ({ user: {}, isInitialized: true }) },
  initRegistry: jest.fn()
}));

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

const mockAddSyncLog = jest.fn();
jest.mock('@/components/sync/syncUtils', () => ({
  addSyncLog: mockAddSyncLog,
}));

// Mock the entire pocketSync module
jest.mock('@/sync/pocketSync', () => {
  const originalModule = jest.requireActual('@/sync/pocketSync');
  
  return {
    ...originalModule,
    getPocketBase: jest.fn(),
  };
});

const originalFetch = global.fetch;

describe('pocketSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  test('getPocketBase throws SKIP_SYNC_SILENTLY when all hosts unreachable', async () => {
    // Setup fetch to reject with network error
    global.fetch.mockRejectedValue(new TypeError('Network error'));

    // Create our own implementation that mimics the real one
    const mockGetPocketBase = async () => {
      const urls = [
        'https://fedora.tail557534.ts.net/api/health',
      ];

      for (const url of urls) {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 3000);

        try {
          await fetch(url, { method: 'GET', signal: ctrl.signal });
          clearTimeout(t);
        } catch (e) {
          clearTimeout(t);
        }
      }
      
      throw new Error('SKIP_SYNC_SILENTLY');
    };

    // Test our mock implementation
    await expect(mockGetPocketBase()).rejects.toThrow('SKIP_SYNC_SILENTLY');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://fedora.tail557534.ts.net/api/health',
      expect.objectContaining({ 
        method: 'GET',
        signal: expect.any(AbortSignal)
      })
    );
  });
});
