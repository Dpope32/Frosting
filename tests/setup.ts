import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { defaultPreferences } from '@/store';
import mockAsync from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsync);
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock expo-file-system to prevent FileSystem errors in tests
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/documents/',
  cacheDirectory: 'file:///mock/cache/',
  EncodingType: {
    UTF8: 'utf8',
  },
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve('')),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, isDirectory: false })),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  readDirectoryAsync: jest.fn(() => Promise.resolve([])),
  copyAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  downloadAsync: jest.fn((uri, localUri) => Promise.resolve({ uri: localUri })),
}));

// Mock react-native Platform to prevent import issues after test teardown
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default),
  },
  NativeModules: {},
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
}));

// Mock expo-notifications to prevent warnings in tests
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  setNotificationHandler: jest.fn(),
  AndroidNotificationPriority: {
    HIGH: 'high',
    DEFAULT: 'default',
  },
  SchedulableTriggerInputTypes: {
    DATE: 'date',
    TIME_INTERVAL: 'timeInterval',
  },
}));

// Mock notification services to prevent expo-notifications import warnings
jest.mock('@/services/notificationServices', () => ({
  scheduleHabitNotification: jest.fn(),
  cancelHabitNotification: jest.fn(),
  updateHabitNotification: jest.fn(),
  clearAllHabitNotifications: jest.fn(),
}));

// Mock components/sync/syncUtils to prevent logging issues
jest.mock('@/components/sync/syncUtils', () => ({
  addSyncLog: jest.fn(),
}));

// Mock constants/KEYS to prevent Platform access during teardown
jest.mock('@/constants/KEYS', () => ({
  WALLPAPER_DIR: 'file:///mock/documents/wallpapers/',
  AUTHORIZED_USERS: ["DeeDaw", "Bono", "Ksizzle13", "Father"],
  LAST_APP_VERSION_KEY: '@last_app_version',
  // Add other constants as needed
}));

// Note: WallpaperStore async operations are now properly disabled in test environment
// via IS_TEST checks in the store itself, so no mocking needed

// Mock timers to prevent async issues  
jest.useFakeTimers();

// Clear all mocks and timers after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.runOnlyPendingTimers(); // Run any pending timers
  jest.clearAllTimers(); // Clear all timers
  
  mockAsyncStorage.clear();
  mockAsyncStorage.setItem('@user-preferences', JSON.stringify(defaultPreferences));
  mockAsync.clear();
  mockAsync.setItem('@user-preferences', JSON.stringify(defaultPreferences));
});

// Restore real timers after all tests to prevent issues with test teardown
afterAll(() => {
  jest.runOnlyPendingTimers(); // Run any remaining timers
  jest.clearAllTimers(); // Clear all timers
  jest.useRealTimers(); // Restore real timers
});
