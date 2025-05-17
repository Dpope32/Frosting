import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values'; // Required by uuid for React Native
import { v4 as uuidv4 } from 'uuid';

// Using a new key to ensure fresh UUIDs are generated if any old format existed.
const DEVICE_UNIQUE_ID_KEY = 'app_unique_device_id_v2_uuid';

export const getOrCreateUniqueDeviceId = async (): Promise<string> => {
  let deviceId = await AsyncStorage.getItem(DEVICE_UNIQUE_ID_KEY);
  if (!deviceId) {
    deviceId = uuidv4(); // Generate a version 4 UUID
    await AsyncStorage.setItem(DEVICE_UNIQUE_ID_KEY, deviceId);
    console.log('🔑 Generated new unique device ID (UUID):', deviceId);
  } else {
    console.log('🔑 Found existing unique device ID (UUID):', deviceId);
  }
  return deviceId;
}; 