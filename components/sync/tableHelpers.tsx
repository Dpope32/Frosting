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

export const getConnectionStatus = (premium: boolean, syncStatus: string, currentSpaceId: string) => {
  return React.useMemo(() => {
    if (!premium) return 'Premium Required';
    if (syncStatus === 'error') return 'Error';
    if (syncStatus === 'syncing') return 'Syncing';
    if (currentSpaceId) return 'Connected';
    return 'Not Connected';
  }, [premium, syncStatus, currentSpaceId]);
};

export const getStatusColor = (syncStatus: string, currentSpaceId: string, colors: Colors) => {
  return React.useMemo(() => {
    if (syncStatus === 'error') return colors.error;
    if (syncStatus === 'syncing') return colors.accent;
    if (currentSpaceId) return colors.success;
    return colors.subtext;
  }, [syncStatus, currentSpaceId, colors]);
};

