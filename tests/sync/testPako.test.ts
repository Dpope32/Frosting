
  import pako from 'pako';
  import CryptoJS from 'crypto-js';
  import { encryptSnapshot, decryptSnapshot } from '@/utils/encryption';
  import { exportEncryptedState } from '@/sync/registrySyncManager';
  import { useRegistryStore } from '@/store/RegistryStore';
  import { useCalendarStore } from '@/store/CalendarStore';
  import { useProjectStore as useTaskStore } from '@/store/ToDo';
  import { generateRandomKey } from '@/sync/randomKey';
  import * as FileSystem from 'expo-file-system';
  import { Platform } from 'react-native';
  
  // Mock dependencies
  jest.mock('@react-native-async-storage/async-storage', () => 
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
  );
  jest.mock('expo-notifications', () => ({}));
  jest.mock('@sentry/react-native', () => ({
    addBreadcrumb: jest.fn(),
    captureException: jest.fn(),
  }));
  jest.mock('@/components/sync/syncUtils', () => ({
    addSyncLog: jest.fn(),
  }));
  jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///test/',
  EncodingType: { UTF8: 'utf8' },
  writeAsStringAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, isDirectory: true })),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
}));
  jest.mock('@/sync/getWorkspace', () => ({
    getCurrentWorkspaceId: jest.fn(() => Promise.resolve('test-workspace-id')),
  }));
  jest.mock('@/sync/workspaceKey', () => ({
    getWorkspaceKey: jest.fn(() => Promise.resolve('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef')),
  }));
  jest.mock('@/store/UserStore', () => ({
    useUserStore: {
      getState: () => ({
        preferences: { premium: true, hasCompletedOnboarding: true }
      })
    }
  }));
  
  // Helper functions to safely convert between Uint8Array and base64 without stack overflow
const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
  // Process in chunks to avoid stack overflow with large arrays
  const chunkSize = 32768; // 32KB chunks
  let result = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    result += String.fromCharCode(...Array.from(chunk));
  }
  
  return btoa(result);
};

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes;
};

// Helper function to generate realistic test data
const generateTestData = (sizeInKB: number) => {  
    const tasks: Record<string, any> = {};
    const events: any[] = [];
    const habits: Record<string, any> = {};
    
    // Generate tasks with realistic structure
    const taskCount = Math.floor(sizeInKB / 2); // Approximately 2KB per task
    for (let i = 0; i < taskCount; i++) {
      const taskId = `task-${i}-${Date.now()}`;
      tasks[taskId] = {
        id: taskId,
        name: `Task ${i}: ${Math.random().toString(36).repeat(10)}`,
        description: `Description for task ${i}: ${Math.random().toString(36).repeat(20)}`,
        completed: Math.random() > 0.5,
        completionHistory: {
          '2024-01-01': true,
          '2024-01-02': false,
          '2024-01-03': true,
          '2024-01-04': Math.random() > 0.5,
          '2024-01-05': Math.random() > 0.5,
        },
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        category: ['personal', 'work', 'bills', 'health'][Math.floor(Math.random() * 4)],
        recurrencePattern: ['one-time', 'weekly', 'monthly', 'yearly'][Math.floor(Math.random() * 4)],
        schedule: ['monday', 'wednesday', 'friday'],
        createdAt: new Date(Date.now() - Math.random() * 10000000).toISOString(),
        updatedAt: new Date().toISOString(),
        time: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:00`,
        tags: [`tag-${i}`, `category-${i % 5}`],
        notes: `Additional notes for task ${i}: ${Math.random().toString(36).repeat(15)}`,
      };
    }
    
    // Generate calendar events
    const eventCount = Math.floor(sizeInKB / 4); // Approximately 4KB per event
    for (let i = 0; i < eventCount; i++) {
      events.push({
        id: `event-${i}-${Date.now()}`,
        title: `Event ${i}: ${Math.random().toString(36).repeat(8)}`,
        date: new Date(Date.now() + Math.random() * 10000000).toISOString(),
        time: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:00`,
        type: ['personal', 'work', 'birthday', 'appointment'][Math.floor(Math.random() * 4)],
        location: `Location ${i}: ${Math.random().toString(36).repeat(10)}`,
        description: `Event description ${i}: ${Math.random().toString(36).repeat(30)}`,
        reminders: [15, 30, 60],
        recurring: Math.random() > 0.7,
        createdAt: new Date(Date.now() - Math.random() * 10000000).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    
    // Generate habits
    const habitCount = Math.floor(sizeInKB / 3); // Approximately 3KB per habit
    for (let i = 0; i < habitCount; i++) {
      const habitId = `habit-${i}-${Date.now()}`;
      habits[habitId] = {
        id: habitId,
        name: `Habit ${i}: ${Math.random().toString(36).repeat(8)}`,
        frequency: ['daily', 'weekly', 'monthly'][Math.floor(Math.random() * 3)],
        streak: Math.floor(Math.random() * 100),
        bestStreak: Math.floor(Math.random() * 200),
        completionDates: Array.from({ length: 30 }, (_, j) => {
          const date = new Date();
          date.setDate(date.getDate() - j);
          return date.toISOString().split('T')[0];
        }),
        category: ['health', 'productivity', 'personal'][Math.floor(Math.random() * 3)],
        reminder: Math.random() > 0.5,
        reminderTime: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:00`,
        notes: `Habit notes ${i}: ${Math.random().toString(36).repeat(20)}`,
        createdAt: new Date(Date.now() - Math.random() * 10000000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    
    return {
      tasks: { tasks, hydrated: true, todaysTasks: [] },
      calendar: { events, lastUpdated: Date.now() },
      habits: { habits, lastUpdated: Date.now() },
      bills: { 
        bills: {}, 
        monthlyIncome: 5000, 
        isSyncEnabled: true, 
        lastUpdated: Date.now() 
      },
      vault: { 
        vaultData: { items: [] }, 
        isSyncEnabled: true, 
        lastUpdated: Date.now() 
      },
      customCategory: { categories: [], lastUpdated: Date.now() },
      tags: { tags: [], lastUpdated: Date.now() },
      people: { contacts: {}, isSyncEnabled: true, lastUpdated: Date.now() },
      projects: { projects: [], isSyncEnabled: true, lastUpdated: Date.now() },
    };
  };
  
  describe('Pako Compression Tests', () => {
    let originalPlatform: string;
    
    beforeEach(() => {
      originalPlatform = Platform.OS;
      jest.clearAllMocks();
    });
    
    afterEach(() => {
      Object.defineProperty(Platform, 'OS', {
        value: originalPlatform,
        writable: true,
      });
    });
  
    describe('1. Data Integrity Tests', () => {
      test('should maintain exact data integrity through compress→encrypt→decrypt→decompress cycle', async () => {
        const originalData = generateTestData(100); // 100KB test data
        const jsonString = JSON.stringify(originalData);
        const key = generateRandomKey();
        
        // Compress
        const compressed = pako.deflate(jsonString);
        const compressedString = uint8ArrayToBase64(compressed);
        
        // Encrypt
        const encrypted = encryptSnapshot(compressedString, key);
        
        // Decrypt
        const decrypted = decryptSnapshot(encrypted, key);
        
        // Decompress
        const decompressedArray = base64ToUint8Array(decrypted);
        const decompressed = pako.inflate(decompressedArray, { to: 'string' });
        const restoredData = JSON.parse(decompressed);
        
        // Verify exact match
        expect(restoredData).toEqual(originalData);
        expect(JSON.stringify(restoredData)).toBe(jsonString);
      });
  
      test('should handle Unicode and special characters correctly', async () => {
        const testData = {
          unicode: '🚀 Émoji tëst 中文 العربية हिन्दी',
          special: '!@#$%^&*()_+-=[]{}|;\\:\",.<>?/\\\\`~',
          mixed: '混合 tëxt 🎉 with $pecial ch@rs',
          escaped: '{\"nested\": \"json\", \"array\": [1, 2, 3]}',
        };
        
        const jsonString = JSON.stringify(testData);
        const key = generateRandomKey();
        
        // Full cycle
        const compressed = pako.deflate(jsonString);
        const compressedString = uint8ArrayToBase64(compressed);
        const encrypted = encryptSnapshot(compressedString, key);
        const decrypted = decryptSnapshot(encrypted, key);
        const decompressedArray = base64ToUint8Array(decrypted);
        const decompressed = pako.inflate(decompressedArray, { to: 'string' });
        const restored = JSON.parse(decompressed);
        
        expect(restored).toEqual(testData);
      });
  
      test('should preserve deeply nested object structures', async () => {
        const deepData = {
          level1: {
            level2: {
              level3: {
                level4: {
                  level5: {
                    array: [1, 2, { nested: true }],
                    value: 'deep value',
                    date: new Date().toISOString(),
                  }
                }
              }
            }
          }
        };
        
        const jsonString = JSON.stringify(deepData);
        const key = generateRandomKey();
        
        const compressed = pako.deflate(jsonString);
        const compressedString = uint8ArrayToBase64(compressed);
        const encrypted = encryptSnapshot(compressedString, key);
        const decrypted = decryptSnapshot(encrypted, key);
        const decompressedArray = base64ToUint8Array(decrypted);
        const decompressed = pako.inflate(decompressedArray, { to: 'string' });
        const restored = JSON.parse(decompressed);
        
        expect(restored).toEqual(deepData);
      });
    });
  
    describe('2. Compression Ratio Tests', () => {
      test('should achieve significant compression for typical app data', () => {
        const testSizes = [50, 100, 500, 1000, 2000]; // KB
        const results: any[] = [];
        
        testSizes.forEach(sizeKB => {
          const data = generateTestData(sizeKB);
          const jsonString = JSON.stringify(data);
          const originalSize = jsonString.length;
          
          const compressed = pako.deflate(jsonString);
          const compressedSize = compressed.length;
          const ratio = (compressedSize / originalSize) * 100;
          
          results.push({
            originalKB: (originalSize / 1024).toFixed(1),
            compressedKB: (compressedSize / 1024).toFixed(1),
            ratio: ratio.toFixed(1),
            saved: (100 - ratio).toFixed(1),
          });
          
          // Expect at least 50% compression for typical JSON data
          expect(ratio).toBeLessThan(50);
        });
        

      });
  
      test('should handle highly repetitive data efficiently', () => {
        const repetitiveData = {
          tasks: Array.from({ length: 1000 }, (_, i) => ({
            id: `task-${i}`,
            status: 'pending',
            type: 'daily',
            category: 'work',
            template: 'standard-task-template-with-long-name',
          }))
        };
        
        const jsonString = JSON.stringify(repetitiveData);
        const compressed = pako.deflate(jsonString);
        const ratio = (compressed.length / jsonString.length) * 100;
        
        // Highly repetitive data should compress very well
        expect(ratio).toBeLessThan(20);
      });
  
      test('should handle random data with reasonable compression', () => {
        const randomData = {
          random: Array.from({ length: 100 }, () => 
            Math.random().toString(36).substring(2)
          )
        };
        
        const jsonString = JSON.stringify(randomData);
        const compressed = pako.deflate(jsonString);
        const ratio = (compressed.length / jsonString.length) * 100;
        
        // Random data won't compress as well but should still show some improvement
        expect(ratio).toBeLessThan(90);
      });
    });
  
    describe('3. Backward Compatibility Tests', () => {
      test('should gracefully handle uncompressed legacy data', () => {
        const legacyData = { test: 'uncompressed data' };
        const jsonString = JSON.stringify(legacyData);
        const key = generateRandomKey();
        
        // Simulate old format (direct encryption without compression)
        const legacyEncrypted = encryptSnapshot(jsonString, key);
        
        // Try to decrypt and handle gracefully
        const decrypted = decryptSnapshot(legacyEncrypted, key);
        
        // Should detect it's not compressed (not base64 encoded compressed data)
        let restored;
        try {
          // Try new format first
          const decompressedArray = base64ToUint8Array(decrypted);
          const decompressed = pako.inflate(decompressedArray, { to: 'string' });
          restored = JSON.parse(decompressed);
        } catch (e) {
          // Fall back to legacy format
          restored = JSON.parse(decrypted);
        }
        
        expect(restored).toEqual(legacyData);
      });
  
      test('should detect and handle mixed format data', () => {
        const testCases = [
          { data: { type: 'compressed' }, compress: true },
          { data: { type: 'uncompressed' }, compress: false },
          { data: { type: 'compressed-large', content: 'x'.repeat(10000) }, compress: true },
        ];
        
        const key = generateRandomKey();
        
        testCases.forEach(testCase => {
          const jsonString = JSON.stringify(testCase.data);
          let encrypted;
          
          if (testCase.compress) {
            const compressed = pako.deflate(jsonString);
            const compressedString = uint8ArrayToBase64(compressed);
            encrypted = encryptSnapshot(compressedString, key);
          } else {
            encrypted = encryptSnapshot(jsonString, key);
          }
          
          const decrypted = decryptSnapshot(encrypted, key);
          let restored;
          
          try {
            // Try compressed format
            const decompressedArray = base64ToUint8Array(decrypted);
            const decompressed = pako.inflate(decompressedArray, { to: 'string' });
            restored = JSON.parse(decompressed);
          } catch (e) {
            // Fall back to uncompressed
            restored = JSON.parse(decrypted);
          }
          
          expect(restored).toEqual(testCase.data);
        });
      });
    });
  
    describe('4. Edge Cases and Error Handling', () => {
      test('should handle empty data', () => {
        const emptyData = {};
        const jsonString = JSON.stringify(emptyData);
        const key = generateRandomKey();
        
        const compressed = pako.deflate(jsonString);
        const compressedString = uint8ArrayToBase64(compressed);
        const encrypted = encryptSnapshot(compressedString, key);
        const decrypted = decryptSnapshot(encrypted, key);
        const decompressedArray = base64ToUint8Array(decrypted);
        const decompressed = pako.inflate(decompressedArray, { to: 'string' });
        const restored = JSON.parse(decompressed);
        
        expect(restored).toEqual(emptyData);
      });
  
      test('should handle very large data (5MB+)', () => {
        const largeData = generateTestData(5000); // 5MB
        const jsonString = JSON.stringify(largeData);
        const key = generateRandomKey();
        
        const compressed = pako.deflate(jsonString);
        const compressedString = uint8ArrayToBase64(compressed);
        const encrypted = encryptSnapshot(compressedString, key);
        const decrypted = decryptSnapshot(encrypted, key);
        const decompressedArray = base64ToUint8Array(decrypted);
        const decompressed = pako.inflate(decompressedArray, { to: 'string' });
        const restored = JSON.parse(decompressed);
        
        expect(restored).toEqual(largeData);
      });
  
      test('should throw meaningful error for corrupted compressed data', () => {
        const key = generateRandomKey();
        const corruptedBase64 = 'THIS_IS_NOT_VALID_COMPRESSED_DATA!!!';
        const encrypted = encryptSnapshot(corruptedBase64, key);
        const decrypted = decryptSnapshot(encrypted, key);
        
        expect(() => {
          const decompressedArray = base64ToUint8Array(decrypted);
          pako.inflate(decompressedArray, { to: 'string' });
        }).toThrow();
      });
  
      test('should handle malformed base64 gracefully', () => {
        expect(() => {
          const malformed = 'not-valid-base64-@#$%';
          base64ToUint8Array(malformed);
        }).toThrow();
      });
  
      test('should handle null and undefined values in data', () => {
        const dataWithNulls = {
          nullValue: null,
          undefinedValue: undefined,
          array: [1, null, 3, undefined, 5],
          nested: {
            nullField: null,
            validField: 'test',
          }
        };
        
        const jsonString = JSON.stringify(dataWithNulls);
        const key = generateRandomKey();
        
        const compressed = pako.deflate(jsonString);
        const compressedString = uint8ArrayToBase64(compressed);
        const encrypted = encryptSnapshot(compressedString, key);
        const decrypted = decryptSnapshot(encrypted, key);
        const decompressedArray = base64ToUint8Array(decrypted);
        const decompressed = pako.inflate(decompressedArray, { to: 'string' });
        const restored = JSON.parse(decompressed);
        
        // JSON.stringify converts undefined to null in arrays and omits it in objects
        expect(restored.nullValue).toBeNull();
        expect(restored.undefinedValue).toBeUndefined();
        expect(restored.array).toEqual([1, null, 3, null, 5]);
      });
    });
  
    describe('5. Performance Benchmarks', () => {
      test('should complete compression cycle within acceptable time limits', () => {
        const dataSizes = [100, 500, 1000, 2000]; // KB
        const results: any[] = [];
        
        dataSizes.forEach(sizeKB => {
          const data = generateTestData(sizeKB);
          const jsonString = JSON.stringify(data);
          const key = generateRandomKey();
          
          // Measure compression time
          const compressStart = Date.now();
          const compressed = pako.deflate(jsonString);
          const compressedString = uint8ArrayToBase64(compressed);
          const compressTime = Date.now() - compressStart;
          
          // Measure encryption time
          const encryptStart = Date.now();
          const encrypted = encryptSnapshot(compressedString, key);
          const encryptTime = Date.now() - encryptStart;
          
          // Measure decryption time
          const decryptStart = Date.now();
          const decrypted = decryptSnapshot(encrypted, key);
          const decryptTime = Date.now() - decryptStart;
          
          // Measure decompression time
          const decompressStart = Date.now();
          const decompressedArray = base64ToUint8Array(decrypted);
          const decompressed = pako.inflate(decompressedArray, { to: 'string' });
          const decompressTime = Date.now() - decompressStart;
          
          const totalTime = compressTime + encryptTime + decryptTime + decompressTime;
          
          results.push({
            sizeKB,
            compressTime,
            encryptTime,
            decryptTime,
            decompressTime,
            totalTime,
          });
          
          // Expect reasonable performance (adjust thresholds as needed)
          expect(totalTime).toBeLessThan(sizeKB * 10); // 10ms per KB max
        });
        

      });
  
      test('should compare compressed vs uncompressed processing times', () => {
        const data = generateTestData(1000); // 1MB
        const jsonString = JSON.stringify(data);
        const key = generateRandomKey();
        
        // Measure uncompressed cycle
        const uncompressedStart = Date.now();
        const uncompressedEncrypted = encryptSnapshot(jsonString, key);
        const uncompressedDecrypted = decryptSnapshot(uncompressedEncrypted, key);
        const uncompressedTime = Date.now() - uncompressedStart;
        
        // Measure compressed cycle
        const compressedStart = Date.now();
        const compressed = pako.deflate(jsonString);
        const compressedString = uint8ArrayToBase64(compressed);
        const compressedEncrypted = encryptSnapshot(compressedString, key);
        const compressedDecrypted = decryptSnapshot(compressedEncrypted, key);
        const decompressedArray = base64ToUint8Array(compressedDecrypted);
        const decompressed = pako.inflate(decompressedArray, { to: 'string' });
        const compressedTime = Date.now() - compressedStart;
        

        
        // Compressed cycle might be slightly slower due to compression overhead
        // but should be acceptable given the bandwidth savings
        expect(compressedTime).toBeLessThan(uncompressedTime * 2);
      });
    });
  
    describe('6. Integration Tests with exportEncryptedState', () => {
      test('should correctly integrate with exportEncryptedState function', async () => {
        // Mock registry store
        const mockGetAllStoreStates = jest.fn(() => generateTestData(500));
        useRegistryStore.getState = jest.fn(() => ({
          getAllStoreStates: mockGetAllStoreStates,
          setSyncStatus: jest.fn(),
          syncStatus: 'idle',
        })) as any;
        
        // Mock file system for mobile
        Object.defineProperty(Platform, 'OS', { value: 'ios', writable: true });
        (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);
        
        const uri = await exportEncryptedState(mockGetAllStoreStates());
        
        expect(uri).toBe('file:///test/stateSnapshot.enc');
        expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
        
        const writeCall = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0];
        const writtenData = writeCall[1];
        
        // Verify it's encrypted data (should be base64-like)
        expect(writtenData).toMatch(/^[A-Za-z0-9+/=]+$/);
      });
  
      test('should handle web platform localStorage', async () => {
        // Mock for web platform
        Object.defineProperty(Platform, 'OS', { value: 'web', writable: true });
        
        const mockLocalStorage = {
          setItem: jest.fn(),
          getItem: jest.fn(),
        };
        Object.defineProperty(window, 'localStorage', {
          value: mockLocalStorage,
          writable: true,
        });
        
        const mockGetAllStoreStates = jest.fn(() => generateTestData(100));
        useRegistryStore.getState = jest.fn(() => ({
          getAllStoreStates: mockGetAllStoreStates,
          setSyncStatus: jest.fn(),
          syncStatus: 'idle',
        })) as any;
        
        const uri = await exportEncryptedState(mockGetAllStoreStates());
        
        expect(uri).toBe('web://localStorage/encrypted_state_snapshot');
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'encrypted_state_snapshot',
          expect.any(String)
        );
      });
    });
  
    describe('7. Compression Level Optimization Tests', () => {
      test('should test different compression levels for optimal balance', () => {
        const data = generateTestData(1000); // 1MB
        const jsonString = JSON.stringify(data);
        const results: any[] = [];
        
        // Test different compression levels (1-9, where 9 is best compression)
        const levels = [1, 3, 5, 7, 9];
        
        levels.forEach(level => {
          const start = Date.now();
          const compressed = pako.deflate(jsonString, { level: level as any });
          const time = Date.now() - start;
          
          results.push({
            level,
            time: `${time}ms`,
            size: `${(compressed.length / 1024).toFixed(1)}KB`,
            ratio: `${((compressed.length / jsonString.length) * 100).toFixed(1)}%`,
          });
        });
        

        
        // Default level (6) should provide good balance
        const defaultCompressed = pako.deflate(jsonString);
        const level6Compressed = pako.deflate(jsonString, { level: 6 });
        expect(defaultCompressed.length).toBeCloseTo(level6Compressed.length, 100);
      });
    });
  
    describe('8. Real-World Scenario Tests', () => {
      test('should handle actual 2MB snapshot efficiently', () => {
        // Generate 2MB of realistic data
        const data = generateTestData(2048);
        const jsonString = JSON.stringify(data);
        const key = generateRandomKey();
        

        
        // Time the full cycle
        const startTime = Date.now();
        
        // Compress
        const compressStart = Date.now();
        const compressed = pako.deflate(jsonString);
        const compressedString = uint8ArrayToBase64(compressed);
        const compressTime = Date.now() - compressStart;
        

        
        // Encrypt
        const encryptStart = Date.now();
        const encrypted = encryptSnapshot(compressedString, key);
        const encryptTime = Date.now() - encryptStart;

        
        // Decrypt
        const decryptStart = Date.now();
        const decrypted = decryptSnapshot(encrypted, key);
        const decryptTime = Date.now() - decryptStart;

        
        // Decompress
        const decompressStart = Date.now();
        const decompressedArray = base64ToUint8Array(decrypted);
        const decompressed = pako.inflate(decompressedArray, { to: 'string' });
        const decompressTime = Date.now() - decompressStart;
        const totalTime = Date.now() - startTime;
        
        // Verify data integrity
        const restored = JSON.parse(decompressed);
        expect(restored).toEqual(data);
        // Compression should be faster than decompression
        expect(compressTime).toBeLessThan(decompressTime); 
        expect(compressTime).toBeLessThan(500); 
        expect(totalTime).toBeLessThan(2000); 
        expect(compressed.length).toBeLessThan(jsonString.length * 0.4); 
      });
  
      test('should handle incremental changes efficiently', () => {
        const baseData = generateTestData(1000);
        const key = generateRandomKey();
        
        // Make small changes (like toggling a few tasks)
        const modifiedData = { ...baseData };
        if (modifiedData.tasks && modifiedData.tasks.tasks) { 
          const taskIds = Object.keys(modifiedData.tasks.tasks).slice(0, 10);
          taskIds.forEach(id => {
            modifiedData.tasks.tasks[id].completed = !modifiedData.tasks.tasks[id].completed;
          });
        }
        
        // Test full compression cycle with modified data
        const modifiedJson = JSON.stringify(modifiedData);
        const compressed = pako.deflate(modifiedJson);
        const compressedString = uint8ArrayToBase64(compressed);
        const encrypted = encryptSnapshot(compressedString, key);
        const decrypted = decryptSnapshot(encrypted, key);
        const decompressedArray = base64ToUint8Array(decrypted);
        const decompressed = pako.inflate(decompressedArray, { to: 'string' });
        const restored = JSON.parse(decompressed);
        
        expect(restored).toEqual(modifiedData); 
      });
    });
  });