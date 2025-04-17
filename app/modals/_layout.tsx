import React from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function ModalLayout() {
  const isIOS = Platform.OS === 'ios';
  
  return (
    <Stack
      screenOptions={{
        gestureEnabled: true,
        headerShown: false,
        presentation: 'modal',
        animation: isIOS ? 'ios_from_right' : 'fade',
        animationDuration: 300,
        gestureDirection: 'vertical',
        ...(isIOS ? {
          gestureResponseDistance: {
            bottom: 300 
          }
        } : {}),
        contentStyle: {
          backgroundColor: 'transparent',
          shadowOpacity: 0.15,
          shadowRadius: 15,
        },
      }}
    />
  );
}
