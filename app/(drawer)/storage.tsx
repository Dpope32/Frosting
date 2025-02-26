import { useState, useEffect } from 'react'
import { YStack, Text, Button, Progress, XStack } from 'tamagui'
import * as ImagePicker from 'expo-image-picker'
import { MediaTypeOptions, launchImageLibraryAsync } from 'expo-image-picker'
import axios from 'axios'
import { Alert, Platform, View, useColorScheme, ScrollView } from 'react-native'
import { useUserStore } from '@/store/UserStore'
import * as Notifications from 'expo-notifications'
import { SchedulableTriggerInputTypes } from 'expo-notifications'
import { Plus, Bell } from '@tamagui/lucide-icons'

const UPLOAD_SERVER = __DEV__
  ? process.env.EXPO_PUBLIC_UPLOAD_SERVER_LOCAL
  : process.env.EXPO_PUBLIC_UPLOAD_SERVER_EXTERNAL

const getUploadServer = async () => {
  try {
    await axios.get(`${process.env.EXPO_PUBLIC_UPLOAD_SERVER_LOCAL}/health`, {
      timeout: 2000,
      validateStatus: (status) => status === 200,
    })
    return process.env.EXPO_PUBLIC_UPLOAD_SERVER_LOCAL
  } catch {
    try {
      await axios.get(`${process.env.EXPO_PUBLIC_UPLOAD_SERVER_EXTERNAL}/health`, {
        timeout: 5000,
        validateStatus: (status) => status === 200,
      })
      return process.env.EXPO_PUBLIC_UPLOAD_SERVER_EXTERNAL
    } catch {
      return process.env.EXPO_PUBLIC_UPLOAD_SERVER_EXTERNAL
    }
  }
}

interface FileStats {
  totalSize: number
  fileCount: number
}

const DEFAULT_STATS: FileStats = { totalSize: 0, fileCount: 0 }

const useFileUpload = () => {
  const [progress, setProgress] = useState(0)
  const [activeServer, setActiveServer] = useState(UPLOAD_SERVER)
  const [isUploading, setIsUploading] = useState(false)
  const [stats, setStats] = useState<FileStats>(DEFAULT_STATS)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const username = useUserStore.getState().preferences.username

  useEffect(() => {
    fetchStats()
  }, [username])

  useEffect(() => {
    const initServer = async () => setActiveServer(await getUploadServer())
    initServer()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${activeServer}/stats/${username}`)
      setStats(response.data)
    } catch {}
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
        formData.append('file', {
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.uri.split('/').pop() || 'image.jpg',
        } as any)
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
  const { pickAndUploadFiles, progress, isUploading, stats, formatSize, currentFileIndex, totalFiles } =
    useFileUpload()
  const primaryColor = useUserStore((state) => state.preferences.primaryColor)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  // Placeholder for fetched media
  const [mediaItems, setMediaItems] = useState<string[]>([]) // e.g. URLs or local paths

  // For testing notifications
  const testNotification = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync()
      const { status } = await Notifications.getPermissionsAsync()
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync()
        if (newStatus !== 'granted') {
          Alert.alert('Error', 'Failed to get notification permissions')
          return
        }
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Immediate Test',
          body: 'This should show right now!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
          autoDismiss: true,
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: new Date(Date.now() + 1000),
          channelId: 'test-channel',
        },
      })
      Alert.alert('Success', 'Immediate notification sent!')
    } catch (error) {
      Alert.alert('Error', String(error))
    }
  }

  // Responsive media grid columns
  const isWeb = Platform.OS === 'web'
  const getColumnCount = () => (isWeb ? 9 : 3)
  const columnCount = getColumnCount()

  return (
    <YStack flex={1} padding="$6" paddingTop={100} gap="$6" bg={isDark ? '#000' : '#fff'}>
      <XStack
        backgroundColor={isDark ? '#1a1a1a' : '#f5f5f5'}
        padding="$4"
        borderRadius="$4"
        borderWidth={1}
        borderColor={isDark ? '#333' : '#e0e0e0'}
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap="$4"
      >
        <YStack flex={1} minWidth={200} gap="$1">
          <Text fontFamily="$body" fontSize="$6" fontWeight="bold" color={isDark ? '#fff' : '#000'}>
            Cloud Storage
          </Text>
          <Text fontFamily="$body" fontSize="$3" color={isDark ? '#ccc' : '#666'}>
            Securely store and manage your files.
          </Text>
        </YStack>
        
        <XStack 
          gap="$5" 
          flexWrap="wrap" 
          justifyContent="flex-end" 
          alignItems="center"
          backgroundColor={isDark ? '#222' : '#e8e8e8'}
          borderRadius="$3"
          padding="$3"
          borderLeftWidth={4}
          borderLeftColor={primaryColor}
        >
          <YStack alignItems="center" gap="$1" minWidth={100}>
            <Text fontFamily="$body" fontSize="$3" color={isDark ? '#ccc' : '#666'}>
              Used Space
            </Text>
            <Text fontFamily="$body" fontSize="$5" fontWeight="bold" color={primaryColor}>
              {formatSize(stats.totalSize)}
            </Text>
          </YStack>
          
          <YStack alignItems="center" gap="$1" minWidth={100}>
            <Text fontFamily="$body" fontSize="$3" color={isDark ? '#ccc' : '#666'}>
              Total Files
            </Text>
            <Text fontFamily="$body" fontSize="$5" fontWeight="bold" color={primaryColor}>
              {stats.fileCount}
            </Text>
          </YStack>
        </XStack>
      </XStack>

      {isUploading && (
        <XStack
          backgroundColor={isDark ? '#1a1a1a' : '#f5f5f5'}
          padding="$4"
          borderRadius="$4"
          borderWidth={1}
          borderColor={isDark ? '#333' : '#e0e0e0'}
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap="$4"
        >
          <YStack flex={1} minWidth={200} gap="$2">
            <Text
              fontFamily="$body"
              fontSize="$5"
              fontWeight="bold"
              color={isDark ? '#fff' : '#000'}
            >
              Uploading Files
            </Text>
            <Text
              fontFamily="$body"
              fontSize="$3"
              color={isDark ? '#ccc' : '#666'}
            >
              File {currentFileIndex} of {totalFiles} • {progress}% Complete
            </Text>
            <Progress 
              value={progress} 
              backgroundColor={isDark ? '#333' : '#ddd'}
              width="100%"
            >
              <Progress.Indicator animation="bouncy" backgroundColor={primaryColor} />
            </Progress>
          </YStack>
          
          <XStack 
            backgroundColor={isDark ? '#222' : '#e8e8e8'} 
            borderRadius="$3"
            padding="$3"
            alignItems="center"
            justifyContent="center"
            minWidth={120}
            height={80}
            borderLeftWidth={4}
            borderLeftColor={primaryColor}
          >
            <Text
              fontFamily="$body"
              fontSize="$7"
              fontWeight="bold"
              color={primaryColor}
            >
              {progress}%
            </Text>
          </XStack>
        </XStack>
      )}

      {!mediaItems.length ? (
        <XStack
          backgroundColor={isDark ? '#1a1a1a' : '#f5f5f5'}
          padding="$4"
          borderRadius="$4"
          borderWidth={1}
          borderColor={isDark ? '#333' : '#e0e0e0'}
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap="$4"
        >
          <YStack flex={1} minWidth={200} gap="$2">
            <Text
              fontFamily="$body"
              fontSize="$5"
              fontWeight="bold"
              color={isDark ? '#fff' : '#000'}
            >
              No media backed up yet
            </Text>
            <Text
              fontFamily="$body"
              fontSize="$3"
              color={isDark ? '#ccc' : '#666'}
            >
              Your uploaded files and media will appear here. Tap the plus button in the bottom right to get started.
            </Text>
          </YStack>
          
          <XStack 
            backgroundColor={isDark ? '#222' : '#e8e8e8'} 
            borderRadius="$3"
            padding="$3"
            alignItems="center"
            justifyContent="center"
            minWidth={120}
            height={80}
            borderLeftWidth={4}
            borderLeftColor={primaryColor}
          >
            <Button
              size="$3"
              bg={primaryColor}
              color="white"
              pressStyle={{ scale: 0.95 }}
              animation="quick"
              onPress={pickAndUploadFiles}
              disabled={isUploading}
              borderRadius="$2"
              paddingHorizontal="$3"
            >
              <Plus color="white" size={16} />
              <Text color="white" fontWeight="bold" ml="$1">Upload</Text>
            </Button>
          </XStack>
        </XStack>
      ) : (
        <ScrollView
          contentContainerStyle={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            gap: 8,
          }}
        >
          {mediaItems.map((item, idx) => {
            const width = `${100 / columnCount - 1}%`
            return (
              <YStack
                key={idx}
                width={width}
                minWidth={60}
                aspectRatio={1}
                bg={isDark ? '#222' : '#eee'}
                borderRadius="$2"
                overflow="hidden"
              >
                {/* Replace this with an <Image> component when real media URLs are available */}
                <Text
                  fontFamily="$body"
                  fontSize="$2"
                  color={isDark ? '#ccc' : '#555'}
                  textAlign="center"
                  mt="$2"
                >
                  Placeholder
                </Text>
              </YStack>
            )
          })}
        </ScrollView>
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
