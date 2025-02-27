// useStorage.ts
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Alert, Platform } from 'react-native'
import { useToastStore } from '@/store/ToastStore'
import * as ImagePicker from 'expo-image-picker'
import { MediaTypeOptions, launchImageLibraryAsync } from 'expo-image-picker'
import { useUserStore } from '@/store/UserStore'

const UPLOAD_SERVER = __DEV__
  ? process.env.EXPO_PUBLIC_UPLOAD_SERVER_LOCAL
  : process.env.EXPO_PUBLIC_UPLOAD_SERVER_EXTERNAL

export interface FileStats {
  totalSize: number
  fileCount: number
}

export interface MediaItem {
  name: string
  size: number
  path: string
  timestamp: string
  type: string
}

const DEFAULT_STATS: FileStats = { totalSize: 0, fileCount: 0 }

export function useStorage() {
  const [progress, setProgress] = useState(0)
  const [activeServer, setActiveServer] = useState(UPLOAD_SERVER)
  const [isUploading, setIsUploading] = useState(false)
  const [stats, setStats] = useState<FileStats>(DEFAULT_STATS)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const username = useUserStore.getState().preferences.username

  useEffect(() => {
    if (username) {
      fetchStats()
      fetchMediaFiles()
    }
  }, [username, activeServer])

  useEffect(() => {
    const initServer = async () => {
      const server = await getUploadServer()
      setActiveServer(server)
    }
    initServer()
  }, [])

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

  const fetchStats = async () => {
    if (!username) return
    
    try {
      const response = await axios.get(`${activeServer}/stats/${username}`)
      setStats(response.data)
    } catch (error) {
      console.log('Failed to fetch stats:', error)
    }
  }

  const fetchMediaFiles = async () => {
    if (!username) return
    
    setIsLoading(true)
    try {
      const response = await axios.get(`${activeServer}/files/${username}`)
      if (response.data && response.data.files) {
        // Sort files by timestamp (newest first)
        const sortedFiles = response.data.files.sort((a: MediaItem, b: MediaItem) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        })
        setMediaItems(sortedFiles)
      }
    } catch (error) {
      console.error("Failed to fetch media files:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatSize = (bytes: number): string => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  // Helper function to show alerts that works on both web and native
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      // Use browser's alert on web
      window.alert(`${title}: ${message}`)
    } else {
      // Use React Native's Alert on native platforms
      Alert.alert(title, message)
    }
  }

  const pickAndUploadFiles = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        showAlert('Permission needed', 'Grant media library permissions to upload.')
        return
      }
      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.All,
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 1,
      })
      if (result.canceled || !result.assets?.length) return
      
      // Calculate total size of files to be uploaded
      const totalUploadSize = result.assets.reduce((total, asset) => {
        return total + (asset.fileSize || 0)
      }, 0)
      
      // Check if user will exceed 1GB limit (1GB = 1,073,741,824 bytes)
      const ONE_GB = 1073741824
      const privilegedUsers = ['Dedle', 'Bono', 'Kamarie', 'Kam']
      const isPrivilegedUser = privilegedUsers.includes(username)
      
      // Only check limit for non-privileged users
      if (!isPrivilegedUser && (stats.totalSize + totalUploadSize > ONE_GB)) {
        // Show toast notification for storage limit
        useToastStore.getState().showToast(
          'You have reached your 1GB storage limit. Please contact Admin for more storage.',
          'error'
        )
        return
      }
      
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

      showAlert('Success', 'Files uploaded successfully!')
      fetchStats()
      fetchMediaFiles()
    } catch (error) {
      showAlert('Upload Failed', error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsUploading(false)
      setProgress(0)
      setCurrentFileIndex(0)
    }
  }
  
  const getMediaUrl = (item: MediaItem, isFullVideo = false) => {
    if (isFullVideo) {
      return `${activeServer}/file/${username}/${item.name}`
    }
    return `${activeServer}/thumbnail/${username}/${item.name}`
  }
  
  const isImageFile = (filename: string): boolean => {
    return /\.(jpg|jpeg|png|gif|webp|bmp|tiff|svg)$/i.test(filename);
  }
  
  const isVideoFile = (filename: string): boolean => {
    return /\.(mp4|mov|avi|wmv|flv|webm|mkv|3gp)$/i.test(filename);
  }
  
  const refreshFiles = async () => {
    await fetchStats();
    await fetchMediaFiles();
  }

  return { 
    pickAndUploadFiles, 
    progress, 
    isUploading, 
    stats, 
    formatSize, 
    currentFileIndex, 
    totalFiles,
    mediaItems,
    isLoading,
    fetchMediaFiles,
    activeServer,
    getMediaUrl,
    isImageFile,
    isVideoFile,
    refreshFiles
  }
}
