import { useState, useEffect } from 'react'
import { YStack, Text, Button, Spinner, Progress, XStack } from 'tamagui'
import * as ImagePicker from 'expo-image-picker'
import { MediaTypeOptions, launchImageLibraryAsync } from 'expo-image-picker'
import axios from 'axios'
import { Alert, Platform } from 'react-native'
import { useUserStore } from '@/store/UserStore'
import * as Notifications from 'expo-notifications'
import { useCalendarStore } from '@/store/CalendarStore'
import { SchedulableTriggerInputTypes } from 'expo-notifications'

const UPLOAD_SERVER = process.env.EXPO_PUBLIC_UPLOAD_SERVER
const DEFAULT_STATS = { totalSize: 0, fileCount: 0 }

interface FileStats {
  totalSize: number
  fileCount: number
}

const useFileUpload = () => {
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [stats, setStats] = useState<FileStats>(DEFAULT_STATS)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const username = useUserStore.getState().preferences.username

  useEffect(() => { fetchStats() }, [username])

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${UPLOAD_SERVER}/stats/${username}`)
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const formatSize = (bytes: number): string => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const pickAndUploadFiles = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Grant media library permissions to upload.')
        return
      }
      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.All,
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 1,
      })
      if (result.canceled || !result.assets?.length) return
      setIsUploading(true)
      setProgress(0)
      setTotalFiles(result.assets.length)
      for (let i = 0; i < result.assets.length; i++) {
        setCurrentFileIndex(i + 1)
        const asset = result.assets[i]
        const formData = new FormData()
        formData.append(
          'file',
          {
            uri: asset.uri,
            type: asset.mimeType || 'image/jpeg',
            name: asset.uri.split('/').pop() || 'image.jpg',
          } as any
        )
        formData.append('username', username)
        await axios.post(`${UPLOAD_SERVER}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (evt) => {
            const chunk = evt.loaded / (evt.total || 1)
            const percent = Math.round(((i + chunk) * 100) / result.assets.length)
            setProgress(percent)
          },
        })
      }
      Alert.alert('Success', 'Files uploaded successfully!')
      fetchStats()
    } catch (error) {
      console.error('Upload error:', error)
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsUploading(false)
      setProgress(0)
      setCurrentFileIndex(0)
    }
  }

  return { pickAndUploadFiles, progress, isUploading, stats, formatSize, currentFileIndex, totalFiles }
}

export default function StorageScreen() {
  const { pickAndUploadFiles, progress, isUploading, stats, formatSize, currentFileIndex, totalFiles } = useFileUpload()
  const primaryColor = useUserStore((state) => state.preferences.primaryColor)
  const testNotification = async () => {
    try {
      // Log existing notifications before cancelling
      const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('Currently scheduled notifications:', existingNotifications);
  
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
      console.log('Testing immediate notification...');
      
      const { status } = await Notifications.getPermissionsAsync();
      console.log('Current permission status:', status);
      
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        console.log('New permission status:', newStatus);
        if (newStatus !== 'granted') {
          Alert.alert('Error', 'Failed to get notification permissions');
          return;
        }
      }
  
      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "🔔 Immediate Test",
          body: "This should show right now!",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
          autoDismiss: true
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: new Date(Date.now() + 1000), // 1 second from now
          channelId: 'test-channel'
        }
      });
      
      console.log('Immediate notification scheduled:', notifId);
      
      // Log all scheduled notifications after scheduling new one
      const updatedNotifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('Updated scheduled notifications:', updatedNotifications);
      
      Alert.alert("Success", "Immediate notification sent!");
    } catch (error) {
      console.error('Notification error:', error);
      Alert.alert("Error", String(error));
    }
  }

  return (
    <YStack flex={1} padding="$6" paddingTop={100} gap="$6">
      {__DEV__ && (
        <Button
          size="$4"
          backgroundColor="$red9"
          borderRadius="$3"
          pressStyle={{ scale: 0.98, opacity: 0.9 }}
          onPress={testNotification}
          marginBottom="$3"
        >
          <Text fontSize="$4" fontWeight="bold" color="white">
            Test Notification
          </Text>
        </Button>
      )}
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
        backgroundColor={isUploading ? "$gray3Dark" : primaryColor}
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
            <Progress.Indicator animation="bouncy" backgroundColor={primaryColor} />
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
  )
}
