import { useState, useEffect } from 'react';
import { YStack, Text, Button, Spinner, Progress, XStack } from 'tamagui';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Alert } from 'react-native';
import { useUserStore } from '@/store/UserStore';

const UPLOAD_SERVER = process.env.EXPO_PUBLIC_UPLOAD_SERVER;
const DEFAULT_STATS: FileStats = { totalSize: 0, fileCount: 0 };

interface FileStats {
  totalSize: number;
  fileCount: number;
}

const useFileUpload = () => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState<FileStats>(DEFAULT_STATS);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const username = useUserStore.getState().preferences.username;

  useEffect(() => {
    fetchStats();
  }, [username]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${UPLOAD_SERVER}/stats/${username}`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const pickAndUploadFiles = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant media library permissions to upload files.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 1,
        selectionLimit: 10,
      });

      if (result.canceled || result.assets.length === 0) return;

      setIsUploading(true);
      setProgress(0);
      setTotalFiles(result.assets.length);
      
      for (let i = 0; i < result.assets.length; i++) {
        const asset = result.assets[i];
        setCurrentFileIndex(i + 1);
        const formData = new FormData();
        formData.append('file', {
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.uri.split('/').pop() || 'image.jpg',
        } as any);
        formData.append('username', username);

        await axios.post(`${UPLOAD_SERVER}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              ((i + (progressEvent.loaded / (progressEvent.total ?? 100))) * 100) / result.assets.length
            );
            setProgress(percentCompleted);
          },
        });
      }

      Alert.alert('Success', 'Files uploaded successfully!');
      fetchStats();
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'An error occurred during upload');
    } finally {
      setIsUploading(false);
      setProgress(0);
      setCurrentFileIndex(0);
    }
  };

  return { pickAndUploadFiles, progress, isUploading, stats, formatSize, currentFileIndex, totalFiles };
};

export default function StorageScreen() {
  const { pickAndUploadFiles, progress, isUploading, stats, formatSize, currentFileIndex, totalFiles } = useFileUpload();

  return (
    <YStack flex={1} padding="$6" paddingTop={100} gap="$6">
      <YStack gap="$6" backgroundColor="$gray2Dark" padding="$3" borderRadius="$3">
        <XStack justifyContent="space-around">
          <YStack alignItems="center" gap="$1">
            <Text fontSize="$4" color="$gray11Dark">Used Space</Text>
            <Text fontSize="$5" fontWeight="bold" color="$blue10">
              {formatSize(stats.totalSize)}
            </Text>
          </YStack>
          <YStack alignItems="center" gap="$1">
            <Text fontSize="$4" color="$gray11Dark">Total Files</Text>
            <Text fontSize="$5" fontWeight="bold" color="$blue10">
              {stats.fileCount}
            </Text>
          </YStack>
        </XStack>
      </YStack>
      <Button
        size="$4"
        backgroundColor={isUploading ? "$gray3Dark" : "$blue9"}
        borderRadius="$3"
        pressStyle={{ scale: 0.98, opacity: 0.9 }}
        disabled={isUploading}
        onPress={pickAndUploadFiles}
        marginVertical="$3"
      >
        <XStack gap="$1" alignItems="center">
          {isUploading && <Spinner size="small" color="$gray12Dark" />}
          <Text fontSize="$4" fontWeight="bold" color="white">
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </Text>
        </XStack>
      </Button>
      {isUploading && (
        <YStack gap="$1">
          <Progress value={progress} backgroundColor="$gray4Dark">
            <Progress.Indicator animation="bouncy" backgroundColor="$blue10" />
          </Progress>
          <Text textAlign="center" color="$gray11Dark" fontSize="$3">
            Uploading file {currentFileIndex} of {totalFiles}
          </Text>
          <Text textAlign="center" color="$gray11Dark" fontSize="$3" fontWeight="bold">
            {progress}% Complete
          </Text>
        </YStack>
      )}
    </YStack>
  );
}
