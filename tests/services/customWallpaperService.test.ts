import { CustomWallpaperService } from '@/services/customWallpaperService';
import { useWallpaperStore } from '@/store/WallpaperStore';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('expo-file-system');
jest.mock('@/store/WallpaperStore', () => ({
  useWallpaperStore: jest.fn(() => ({
    getState: () => ({
      cacheWallpaper: jest.fn().mockResolvedValue(undefined),
      clearUnusedWallpapers: jest.fn().mockResolvedValue(undefined)
    })
  }))
}));
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(),
}));

describe('CustomWallpaperService', () => {
  const mockUri = 'file://mock/image.jpg';
  const mockStore = {
    getState: () => ({
      cacheWallpaper: jest.fn().mockResolvedValue(undefined),
      clearUnusedWallpapers: jest.fn().mockResolvedValue(undefined)
    })
  };
  (useWallpaperStore as unknown as jest.Mock).mockReturnValue(mockStore);
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset AsyncStorage mock
    (AsyncStorage as any).mockClear();
  });

  describe('uploadCustomWallpaper', () => {
    it('should process and save a custom wallpaper on mobile', async () => {
      // Arrange
      const service = new CustomWallpaperService();
      const expectedWallpaperKey = expect.stringMatching(/^wallpaper-custom-\d+$/);
      
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
      (FileSystem.copyAsync as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await service.uploadCustomWallpaper(mockUri);

      // Assert
      expect(result.wallpaperKey).toMatch(expectedWallpaperKey);
      expect(FileSystem.copyAsync).toHaveBeenCalledWith({
        from: mockUri,
        to: expect.stringContaining(result.wallpaperKey)
      });
      expect(mockStore.getState().cacheWallpaper).toHaveBeenCalledWith(
        result.wallpaperKey,
        expect.any(String)
      );
    });

    it('should handle web platform differently', async () => {
      // Arrange
      Platform.OS = 'web';
      const service = new CustomWallpaperService();

      // Act
      const result = await service.uploadCustomWallpaper(mockUri);

      // Assert
      expect(result.wallpaperKey).toMatch(/^wallpaper-custom-\d+$/);
      expect(mockStore.getState().cacheWallpaper).toHaveBeenCalledWith(
        result.wallpaperKey,
        mockUri
      );
    });

    it('should throw error if file operation fails', async () => {
      // Arrange
      const service = new CustomWallpaperService();
      (FileSystem.copyAsync as jest.Mock).mockRejectedValue(new Error('File operation failed'));

      // Act & Assert
      await expect(service.uploadCustomWallpaper(mockUri))
        .rejects
        .toThrow('Failed to process custom wallpaper');
    });
  });

  describe('removeCustomWallpaper', () => {
    it('should remove a custom wallpaper', async () => {
      // Arrange
      const service = new CustomWallpaperService();
      const wallpaperKey = 'wallpaper-custom-123456';
      
      // Act
      await service.removeCustomWallpaper(wallpaperKey);

      // Assert
      expect(mockStore.getState().clearUnusedWallpapers)
        .toHaveBeenCalledWith(expect.arrayContaining([wallpaperKey]));
    });
  });
}); 