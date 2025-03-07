import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistStorage, StorageValue } from 'zustand/middleware/persist';

export const storage = {
  getString: async (key: string) => await AsyncStorage.getItem(key),
  set: async (key: string, value: string) => await AsyncStorage.setItem(key, value),
  delete: async (key: string) => await AsyncStorage.removeItem(key),
};

export const StorageUtils = {
  get: async <T>(key: string, defaultValue?: T): Promise<T | undefined> => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return defaultValue;
      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  },
  set: async <T>(key: string, value: T): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error storing data', error);
    }
  },
  delete: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data', error);
    }
  },
  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  },
  getAllKeys: async (): Promise<string[]> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys];
    } catch (error) {
      console.error('Error getting all keys', error);
      return [];
    }
  },
  multiGet: async <T>(keys: string[]): Promise<Map<string, T>> => {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result = new Map<string, T>();
      
      pairs.forEach(([key, value]) => {
        if (value) {
          try {
            result.set(key, JSON.parse(value) as T);
          } catch {
          }
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error in multiGet', error);
      return new Map();
    }
  }
};

export function createPersistStorage<T>(): PersistStorage<T> {
  return {
    getItem: async (name: string): Promise<StorageValue<T> | null> => {
      try {
        const value = await AsyncStorage.getItem(name);
        if (!value) return null;
        return JSON.parse(value) as StorageValue<T>;
      } catch {
        return null;
      }
    },
    setItem: async (name: string, value: StorageValue<T>): Promise<void> => {
      try {
        await AsyncStorage.setItem(name, JSON.stringify(value));
      } catch (error) {
        console.error(`Error storing ${name}`, error);
      }
    },
    removeItem: async (name: string): Promise<void> => {
      try {
        await AsyncStorage.removeItem(name);
      } catch (error) {
        console.error(`Error removing ${name}`, error);
      }
    },
  };
}