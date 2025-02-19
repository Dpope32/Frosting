import { MMKV } from 'react-native-mmkv';
import { PersistStorage, StorageValue } from 'zustand/middleware/persist';

const mmkv = new MMKV({
  id: 'frosting-app-storage',
});

// Raw MMKV instance for direct access
export const mmkvInstance = mmkv;

// Storage interface for zustand persist
export const storage = {
  getString: (key: string) => mmkv.getString(key),
  set: (key: string, value: string) => mmkv.set(key, value),
  delete: (key: string) => mmkv.delete(key),
};

// Utility functions for direct MMKV access with type safety
export const StorageUtils = {
  get: <T>(key: string, defaultValue?: T): T | undefined => {
    const value = mmkv.getString(key);
    if (value === undefined) return defaultValue;
    try {
      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    mmkv.set(key, JSON.stringify(value));
  },
  delete: (key: string): void => {
    mmkv.delete(key);
  },
  clear: (): void => {
    mmkv.clearAll();
  },
};

// Create persist storage for zustand stores
export function createPersistStorage<T>(): PersistStorage<T> {
  return {
    getItem: (name: string): StorageValue<T> | null => {
      const value = mmkv.getString(name);
      if (!value) return null;
      try {
        return JSON.parse(value) as StorageValue<T>;
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: StorageValue<T>): void => {
      mmkv.set(name, JSON.stringify(value));
    },
    removeItem: (name: string): void => {
      mmkv.delete(name);
    },
  };
}
