import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { defaultPreferences } from '@/store';
import mockAsync from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsync);
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');


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