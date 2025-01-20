import { MMKV } from 'react-native-mmkv';

// Create a single MMKV instance to use throughout the app
export const storage = new MMKV({
  id: 'frosting-app-storage',
  // Optionally encrypt storage on iOS/Android
  // encryptionKey: 'encryption-key'
});

// Helper functions for common storage operations
export const StorageUtils = {
  // Get a value from storage
  get: <T>(key: string, defaultValue?: T): T | undefined => {
    const value = storage.getString(key);
    if (value === undefined) return defaultValue;
    return JSON.parse(value) as T;
  },

  // Set a value in storage
  set: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  // Remove a value from storage
  delete: (key: string): void => {
    storage.delete(key);
  },

  // Clear all values from storage
  clear: (): void => {
    storage.clearAll();
  },
};
