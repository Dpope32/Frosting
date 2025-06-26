import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { defaultPreferences } from '@/store';
import mockAsync from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsync);
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

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


// Mock timers to prevent async issues
jest.useFakeTimers();


// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  mockAsyncStorage.clear();
  mockAsyncStorage.setItem('@user-preferences', JSON.stringify(defaultPreferences));
  mockAsync.clear();
  mockAsync.setItem('@user-preferences', JSON.stringify(defaultPreferences));
}); 