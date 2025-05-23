import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values'; 
import { v4 as uuidv4 } from 'uuid';

const DEVICE_UNIQUE_ID_KEY = 'app_unique_device_id_v2_uuid';

export const getOrCreateUniqueDeviceId = async (): Promise<string> => {
  let deviceId = await AsyncStorage.getItem(DEVICE_UNIQUE_ID_KEY);
  if (!deviceId) {
    deviceId = uuidv4(); 
    await AsyncStorage.setItem(DEVICE_UNIQUE_ID_KEY, deviceId);
  } else {
  }
  return deviceId;
}; 