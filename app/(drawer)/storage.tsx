import { useState, useEffect } from 'react'
import { YStack, Text, Button, Progress, XStack } from 'tamagui'
import * as ImagePicker from 'expo-image-picker'
import { MediaTypeOptions, launchImageLibraryAsync } from 'expo-image-picker'
import axios from 'axios'
import { Alert, Platform, View, useColorScheme } from 'react-native'
import { useUserStore } from '@/store/UserStore'
import * as Notifications from 'expo-notifications'
import { SchedulableTriggerInputTypes } from 'expo-notifications'
import { Plus, Bell } from '@tamagui/lucide-icons'

const UPLOAD_SERVER = __DEV__ 
  ? process.env.EXPO_PUBLIC_UPLOAD_SERVER_LOCAL 
  : process.env.EXPO_PUBLIC_UPLOAD_SERVER_EXTERNAL

// Add a fallback for the upload server
const getUploadServer = async () => {
  console.log('Attempting to connect to local server...')
  try {
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_UPLOAD_SERVER_LOCAL}/health`, 
      { 
        timeout: 2000,
        validateStatus: (status) => status === 200
      }
    )
    console.log('Local server response:', response.status)
    if (response.status === 200) {
      console.log('Using local server')
      return process.env.EXPO_PUBLIC_UPLOAD_SERVER_LOCAL
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log('Local server failed:', error.message)
    } else {
      console.log('Local server failed with unknown error')
    }
    
    console.log('Attempting to connect to external server...')
    try {
      const externalResponse = await axios.get(
        `${process.env.EXPO_PUBLIC_UPLOAD_SERVER_EXTERNAL}/health`,
        { 
          timeout: 5000,
          validateStatus: (status) => status === 200
        }
      )
      console.log('External server response:', externalResponse.status)
      if (externalResponse.status === 200) {
        console.log('Using external server')
        return process.env.EXPO_PUBLIC_UPLOAD_SERVER_EXTERNAL
      }
    } catch (externalError: unknown) {
      if (externalError instanceof Error) {
        console.log('External server failed:', externalError.message)
      } else {
        console.log('External server failed with unknown error')
      }
    }
  }
  console.log('Falling back to external server')
  return process.env.EXPO_PUBLIC_UPLOAD_SERVER_EXTERNAL
}

const DEFAULT_STATS = { totalSize: 0, fileCount: 0 }

interface FileStats {
  totalSize: number
  fileCount: number
}

const useFileUpload = () => {
  const [progress, setProgress] = useState(0)
  const [activeServer, setActiveServer] = useState(UPLOAD_SERVER)
  const [isUploading, setIsUploading] = useState(false)
  const [stats, setStats] = useState<FileStats>(DEFAULT_STATS)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const username = useUserStore.getState().preferences.username

  useEffect(() => { fetchStats() }, [username])

  useEffect(() => {
    const initServer = async () => {
      const server = await getUploadServer()
      setActiveServer(server)
    }
    initServer()
  }, [])

const fetchStats = async () => {
  try {
    const response = await axios.get(`${activeServer}/stats/${username}`)
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
        await axios.post(`${activeServer}/upload`, formData, {
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
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const testNotification = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      const { status } = await Notifications.getPermissionsAsync();
      
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
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
          date: new Date(Date.now() + 1000),
          channelId: 'test-channel'
        }
      });
      
      Alert.alert("Success", "Immediate notification sent!");
    } catch (error) {
      console.error('Notification error:', error);
      Alert.alert("Error", String(error));
    }
  }

  return (
    <YStack flex={1} padding="$6" paddingTop={100} gap="$6">
      <YStack 
        gap="$6" 
        backgroundColor={isDark ? "#1a1a1a" : "#f5f5f5"}
        padding="$4" 
        borderRadius="$4"
        borderWidth={1}
        borderColor={isDark ? "#333" : "#e0e0e0"}
      >
        <XStack justifyContent="space-around">
          <YStack alignItems="center" gap="$1">
            <Text fontSize="$4" color={isDark ? "#fff" : "#000"}>Used Space</Text>
            <Text fontSize="$5" fontWeight="bold" color={primaryColor}>
              {formatSize(stats.totalSize)}
            </Text>
          </YStack>
          <YStack alignItems="center" gap="$1">
            <Text fontSize="$4" color={isDark ? "#fff" : "#000"}>Total Files</Text>
            <Text fontSize="$5" fontWeight="bold" color={primaryColor}>
              {stats.fileCount}
            </Text>
          </YStack>
        </XStack>
      </YStack>

      {isUploading && (
        <YStack gap="$1">
          <Progress value={progress} backgroundColor={isDark ? "$gray4Dark" : "$gray4Light"}>
            <Progress.Indicator animation="bouncy" backgroundColor={primaryColor} />
          </Progress>
          <Text textAlign="center" color={isDark ? "#fff" : "#000"} fontSize="$3">
            Uploading file {currentFileIndex} of {totalFiles}
          </Text>
          <Text textAlign="center" color={isDark ? "#fff" : "#000"} fontSize="$3" fontWeight="bold">
            {progress}% Complete
          </Text>
        </YStack>
      )}

      <View style={{ position: 'absolute', bottom: 32, right: 24, zIndex: 1000 }}>
        <Button
          size="$4"
          circular
          bg={primaryColor}
          pressStyle={{ scale: 0.95 }}
          animation="quick"
          elevation={4}
          disabled={isUploading}
          onPress={pickAndUploadFiles}
        >
          <Plus color="white" size={24} />
        </Button>
      </View>

      {__DEV__ && (
        <View style={{ position: 'absolute', bottom: 32, left: 24, zIndex: 1000 }}>
          <Button
            size="$4"
            circular
            bg="$red9"
            pressStyle={{ scale: 0.95 }}
            animation="quick"
            elevation={4}
            onPress={testNotification}
          >
            <Bell color="white" size={24} />
          </Button>
        </View>
      )}
    </YStack>
  )
}
