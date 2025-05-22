/**
 * Tests for pocketSync functionality
 */

// jest.resetModules(); // This will be handled in beforeEach for better isolation per test

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

jest.mock('@/components/sync/syncUtils', () => ({
  addSyncLog: jest.fn(),
}));

// Set required environment variables
process.env.EXPO_PUBLIC_POCKETBASE_URL = 'https://fedora.tail557534.ts.net';
process.env.EXPO_PUBLIC_PB_LAN = 'http://192.168.1.32:8090';

// Define health check URLs based on env vars for consistency
const TAIL_HEALTH_URL = `${process.env.EXPO_PUBLIC_POCKETBASE_URL}/api/health`;
const LAN_HEALTH_URL = `${process.env.EXPO_PUBLIC_PB_LAN}/api/health`;

const originalFetch = global.fetch;
// global.fetch will be mocked in beforeEach

// Declare getPocketBase here, will be assigned in beforeEach
let getPocketBase;

describe('pocketSync', () => {
  beforeEach(() => {
    // Reset modules before each test to ensure a clean slate and that
    // the module under test picks up fresh mocks.
    jest.resetModules();

    // Mock global.fetch for each test.
    // This needs to be done *before* requiring the module that uses fetch.
    global.fetch = jest.fn();

    // Require the module under test *after* mocks (including global.fetch) are set up.
    // This ensures it uses the mocked version of fetch.
    // Re-mock dependencies that might have been cleared by resetModules if they are not top-level jest.mock
    // For instance, if @/components/sync/syncUtils was not mocked at the top level:
    // jest.mock('@/components/sync/syncUtils', () => ({ addSyncLog: jest.fn() }));
    // However, since it IS mocked at the top level, jest.resetModules() + require will pick it up.
    getPocketBase = require('@/sync/pocketSync').getPocketBase;
  });

  afterAll(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });

  test('getPocketBase throws SKIP_SYNC_SILENTLY when all hosts unreachable', async () => {
    // Setup fetch to reject with network error
    global.fetch.mockRejectedValue(new TypeError('Network error'));

    // Test that getPocketBase rejects with the expected error
    await expect(getPocketBase()).rejects.toThrow('SKIP_SYNC_SILENTLY');

    // Verify that both endpoints were tried
    expect(global.fetch).toHaveBeenCalledWith(
      TAIL_HEALTH_URL,
      expect.objectContaining({ method: 'HEAD' })
    );
    expect(global.fetch).toHaveBeenCalledWith(
      LAN_HEALTH_URL,
      expect.objectContaining({ method: 'GET' })
    );
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
