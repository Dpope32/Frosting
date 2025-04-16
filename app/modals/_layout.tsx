import React from 'react';
import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        gestureEnabled: true,
        headerShown: false,
        presentation: 'modal',
      }}
    />
  );
}
