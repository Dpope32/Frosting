import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { defaultPreferences } from '@/store/UserStore';
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);


// Mock timers to prevent async issues
jest.useFakeTimers();


// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  mockAsyncStorage.clear();
  mockAsyncStorage.setItem('@user-preferences', JSON.stringify(defaultPreferences));
}); 