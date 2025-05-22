import React from 'react';
import { View } from 'react-native';
import { Device } from './syncTable';
import { Colors } from './sharedStyles';

export const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'ios': return 'phone-iphone';
      case 'android': return 'phone-android';
      case 'web': return 'language';
      case 'desktop': return 'computer';
      default: return 'devices';
    }
  };

export const getDeviceStatusColor = (device: Device, colors: Colors) => {
    if (device.isCurrentDevice) return colors.success;
    if (device.status === 'online') return colors.success;
    if (device.status === 'syncing') return colors.accent;
    if (device.status === 'error') return colors.error;
    return colors.subtext;
  };



