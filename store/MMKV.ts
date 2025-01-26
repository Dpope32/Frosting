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
    //console.log('[MMKV] Getting value for key:', key, { value, defaultValue });
    if (value === undefined) return defaultValue;
    const parsed = JSON.parse(value) as T;
   // console.log('[MMKV] Parsed value:', parsed);
    return parsed;
  },

  // Set a value in storage
  set: <T>(key: string, value: T): void => {
   // console.log('[MMKV] Setting value for key:', key, value);
    storage.set(key, JSON.stringify(value));
  },

  // Remove a value from storage
  delete: (key: string): void => {
  //  console.log('[MMKV] Deleting key:', key);
    storage.delete(key);
  },

  // Clear all values from storage
  clear: (): void => {
    storage.clearAll();
  },
};
