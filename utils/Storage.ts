import AsyncStorage from '@react-native-async-storage/async-storage';

class AsyncStorageWrapper {
  private id: string;
  
  constructor(id: string) {
    this.id = id;
  }
  
  async getString(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(`${this.id}-${key}`);
    } catch (error) {
      console.error(`Error getting ${key} from ${this.id}:`, error);
      return null;
    }
  }
  
  async set(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(`${this.id}-${key}`, value);
    } catch (error) {
      console.error(`Error setting ${key} in ${this.id}:`, error);
    }
  }
  
  async delete(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.id}-${key}`);
    } catch (error) {
      console.error(`Error deleting ${key} from ${this.id}:`, error);
    }
  }
  
  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const keysToRemove = keys.filter(k => k.startsWith(`${this.id}-`));
      await AsyncStorage.multiRemove(keysToRemove);
    } catch (error) {
      console.error(`Error clearing ${this.id}:`, error);
    }
  }
}

// Create and export the vaultStorage instance
export const vaultStorage = new AsyncStorageWrapper('vault');
