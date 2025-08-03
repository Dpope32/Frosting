// Bun test setup - using Bun's built-in mocking
import { mock } from "bun:test";

// Create AsyncStorage mock
const createAsyncStorageMock = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: mock((key: string) => Promise.resolve(store[key] || null)),
    setItem: mock((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    removeItem: mock((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    multiGet: mock((keys: string[]) => {
      return Promise.resolve(keys.map(key => [key, store[key] || null]));
    }),
    getAllKeys: mock(() => Promise.resolve(Object.keys(store))),
    clear: mock(() => {
      Object.keys(store).forEach(key => delete store[key]);
      return Promise.resolve();
    }),
    multiRemove: mock((keys: string[]) => {
      keys.forEach(key => delete store[key]);
      return Promise.resolve();
    })
  };
};

// Create expo-notifications mock
const createNotificationsMock = () => ({
  getPermissionsAsync: mock(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: mock(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: mock(() => Promise.resolve('notification-id')),
  cancelScheduledNotificationAsync: mock(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: mock(() => Promise.resolve([])),
  cancelAllScheduledNotificationsAsync: mock(() => Promise.resolve()),
  setNotificationHandler: mock(() => {}),
  AndroidNotificationPriority: {
    HIGH: 'high',
    DEFAULT: 'default',
  },
  SchedulableTriggerInputTypes: {
    DATE: 'date',
    TIME_INTERVAL: 'timeInterval',
  },
});

// Create notification services mock
const createNotificationServicesMock = () => ({
  scheduleHabitNotification: mock(() => {}),
  cancelHabitNotification: mock(() => {}),
  updateHabitNotification: mock(() => {}),
  clearAllHabitNotifications: mock(() => {}),
});

// Export mocks for use in tests
export const asyncStorageMock = createAsyncStorageMock();
export const notificationsMock = createNotificationsMock();
export const notificationServicesMock = createNotificationServicesMock();

// Set up module mocks
mock.module("@react-native-async-storage/async-storage", () => asyncStorageMock);
mock.module("expo-notifications", () => notificationsMock);
mock.module("@/services/notificationServices", () => notificationServicesMock);

// Mock react-native modules that cause issues
mock.module("react-native", () => ({
  NativeModules: {},
  Platform: { OS: "ios" },
  Dimensions: {
    get: () => ({ width: 375, height: 812 }),
    addEventListener: () => {},
    removeEventListener: () => {},
  },
  StyleSheet: {
    create: (styles: any) => styles,
  },
}));

// Mock other problematic modules
mock.module("@/components/sync/syncUtils", () => ({
  addSyncLog: mock(() => {}),
}));

mock.module("@/store/AsyncStorage", () => ({
  StorageUtils: {
    set: mock(() => Promise.resolve()),
    get: mock(() => Promise.resolve({})),
  },
  createPersistStorage: mock(() => ({
    getItem: mock(() => Promise.resolve(null)),
    setItem: mock(() => Promise.resolve()),
    removeItem: mock(() => Promise.resolve()),
  })),
}));

mock.module("@/store", () => ({
  useCalendarStore: {
    getState: mock(() => ({
      addEvent: mock(() => {}),
    })),
  },
}));

// Helper to reset all mocks
export const resetMocks = () => {
  // Clear AsyncStorage
  const store = asyncStorageMock as any;
  Object.keys(store).forEach(key => {
    if (typeof store[key] === 'function' && store[key].mock) {
      store[key].mockClear();
    }
  });
  
  // Clear the internal store
  asyncStorageMock.clear();
};
