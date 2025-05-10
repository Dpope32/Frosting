import { vaultStorage } from '../../utils/Storage';
import { act } from 'react-test-renderer';

// Mock AsyncStorage with in-memory store
jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};

  return {
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    getItem: jest.fn((key: string) => {
      return Promise.resolve(store[key] || null);
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => {
      return Promise.resolve(Object.keys(store));
    }),
    multiRemove: jest.fn((keys: string[]) => {
      keys.forEach(key => delete store[key]);
      return Promise.resolve();
    }),
  };
});

describe('vaultStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set and get string data', async () => {
    const testKey = 'test-key';
    const testValue = 'test-value';

    await act(async () => {
      await vaultStorage.set(testKey, testValue);
      const result = await vaultStorage.getString(testKey);
      expect(result).toBe(testValue);
    });
  });

  it('should delete data', async () => {
    const testKey = 'test-key';
    const testValue = 'test-value';

    await act(async () => {
      await vaultStorage.set(testKey, testValue);
      await vaultStorage.delete(testKey);
      const result = await vaultStorage.getString(testKey);
      expect(result).toBeNull();
    });
  });

  it('should clear all vault data', async () => {
    const testKey1 = 'test-key-1';
    const testKey2 = 'test-key-2';
    const testValue = 'test-value';

    await act(async () => {
      await vaultStorage.set(testKey1, testValue);
      await vaultStorage.set(testKey2, testValue);
      await vaultStorage.clearAll();
      
      // Verify both keys were cleared
      const result1 = await vaultStorage.getString(testKey1);
      const result2 = await vaultStorage.getString(testKey2);
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });
});
