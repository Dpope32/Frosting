import * as Device from 'expo-device';

export const useDeviceInfo = () => {
  const deviceName = Device.deviceName;
  const deviceType = Device.deviceType;
  const deviceYearClass = Device.deviceYearClass;
  const productName = Device.productName;
  const designName = Device.designName;
  const modelName = Device.modelName;
  const totalMemory = Device.totalMemory;
  const osName = Device.osName;
  const osVersion = Device.osVersion;
  return { deviceName, deviceType, deviceYearClass, productName, designName, modelName, totalMemory, osName, osVersion };
};

export const getDeviceInfo = async () => {
  const deviceInfo = await Device.getDeviceTypeAsync();
  const getUptimeAsync =  Device.getUptimeAsync;
  const getMaxMemoryAsync =  Device.getMaxMemoryAsync;
  const features =  Device.getPlatformFeaturesAsync;
  return { deviceInfo, getUptimeAsync, getMaxMemoryAsync, features };
};

