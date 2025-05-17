// hooks/sync/useDeviceId.ts
import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const DEVICE_ID_KEY = 'app_unique_device_id'

export const useDeviceId = (isPremium: boolean) => {
  const [deviceId, setDeviceId] = useState<string>('')
  
  useEffect(() => {
    const getOrCreateDeviceId = async () => {
      try {
        // Only proceed if premium is true
        if (!isPremium) {
          setDeviceId('')
          return
        }
        
        // Try to load existing device ID from storage
        let storedId = await AsyncStorage.getItem(DEVICE_ID_KEY)
        
        // If no stored ID exists, create a new one
        if (!storedId) {
          // Create truly unique device ID using platform info and timestamp
          const deviceInfo = Platform.OS + '-' + Platform.Version
          const timestamp = Date.now().toString(36)
          const randomPart = Math.random().toString(36).substring(2, 10)
          
          storedId = `${deviceInfo}-${timestamp}-${randomPart}`.replace(/\s+/g, '-')
          
          // Store the new ID for future use
          await AsyncStorage.setItem(DEVICE_ID_KEY, storedId)
          console.log('New device ID created:', storedId)
        }
        
        setDeviceId(storedId)
      } catch (error) {
        console.error('Error managing device ID:', error)
        // Fallback to a timestamp-based ID if storage fails
        const fallbackId = `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
        setDeviceId(fallbackId)
      }
    }
    
    getOrCreateDeviceId()
  }, [isPremium])
  
  // Return an object with deviceId property that's guaranteed to be a string
  return { deviceId }
}
