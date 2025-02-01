// store/MMKV.ts
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'frosting-app-storage',
});

export const StorageUtils = {
  get: <T>(key: string, defaultValue?: T): T | undefined => {
    const value = storage.getString(key);
    if (value === undefined) return defaultValue;
    return JSON.parse(value) as T;
  },
  set: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },
  delete: (key: string): void => {
    storage.delete(key);
  },
  clear: (): void => {
    storage.clearAll();
  },
};
