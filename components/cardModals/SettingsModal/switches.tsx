import React from 'react';
import { Switch, Platform } from 'react-native';
import { YStack, XStack, Text, Circle } from 'tamagui';
import type { Settings } from './utils';

interface SwitchesProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  isDark: boolean;
  setColorPickerOpen: (open: boolean) => void;
}

export function Switches({ settings, setSettings, isDark, setColorPickerOpen }: SwitchesProps) {
  return (
    <YStack mt="$2" py="$1">
      <XStack gap="$4" justifyContent="center">
        <YStack alignItems="center" gap={4} flex={1}>
          <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">Quote</Text>
          <Switch value={settings.quoteEnabled} onValueChange={(val) => setSettings((prev: Settings) => ({ ...prev, quoteEnabled: val }))} />
        </YStack>
        <YStack alignItems="center" gap={4} flex={1}>
          <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">Stocks</Text>
          <Switch value={settings.portfolioEnabled} onValueChange={(val) => setSettings((prev: Settings) => ({ ...prev, portfolioEnabled: val }))} />
        </YStack>
        <YStack alignItems="center" gap={4} flex={1}>
          <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">Weather</Text>
          <Switch value={settings.temperatureEnabled} onValueChange={(val) => setSettings((prev: Settings) => ({ ...prev, temperatureEnabled: val }))} />
        </YStack>
        <YStack alignItems="center" gap={4} flex={1}>
          <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">Network</Text>
          <Switch value={settings.wifiEnabled} onValueChange={(val) => setSettings((prev: Settings) => ({ ...prev, wifiEnabled: val }))} />
        </YStack>
        <YStack alignItems="center" gap={4} flex={1}>
          <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">Notifications</Text>
          <Switch value={settings.notificationsEnabled} onValueChange={(val) => setSettings((prev: Settings) => ({ ...prev, notificationsEnabled: val }))} />
        </YStack>
        <YStack alignItems="center" gap={4} flex={1}>
          <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">Primary Color</Text>
          <Circle size={36} backgroundColor={settings.primaryColor} pressStyle={{ scale: 0.97 }} onPress={() => setColorPickerOpen(true)} />
        </YStack>
      </XStack>
    </YStack>
  );
}
