import React from 'react';
import { Switch } from "react-native";
import { YStack, XStack, Text } from "tamagui";

interface Settings {
  username: string;
  primaryColor: string;
  profilePicture: string | undefined;
  zipCode: string;
  backgroundStyle: "gradient" | `wallpaper-${string}`;
  notificationsEnabled: boolean;
  quoteEnabled: boolean;
  portfolioEnabled: boolean;
  temperatureEnabled: boolean;
  wifiEnabled: boolean;
}

interface SwitchesProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  isDark?: boolean;
}


export const MobileSwitches = ({ settings, setSettings, isDark }: SwitchesProps) => {

return (
<XStack gap="$0.5" justifyContent="center">
<YStack alignItems="center" gap={4} flex={1}>
  <Text fontSize={13} color={isDark ? '#ccc' : '#000'} fontFamily="$body">Quote</Text>
  <Switch value={settings.quoteEnabled} onValueChange={(val) => setSettings((prev: Settings) => ({ ...prev, quoteEnabled: val }))} />
</YStack>
<YStack alignItems="center" gap={4} flex={1}>
  <Text fontSize={13} color={isDark ? '#ccc' : '#000'} fontFamily="$body">Stocks</Text>
  <Switch value={settings.portfolioEnabled} onValueChange={(val) => setSettings((prev: Settings) => ({ ...prev, portfolioEnabled: val }))} />
</YStack>
<YStack alignItems="center" gap={4} flex={1}>
  <Text fontSize={13} color={isDark ? '#ccc' : '#000'} fontFamily="$body">Weather</Text>
  <Switch value={settings.temperatureEnabled} onValueChange={(val) => setSettings((prev: Settings) => ({ ...prev, temperatureEnabled: val }))} />
</YStack>
<YStack alignItems="center" gap={4} flex={1}>
  <Text fontSize={13} color={isDark ? '#ccc' : '#000'} fontFamily="$body">WiFi</Text>
  <Switch value={settings.wifiEnabled} onValueChange={(val) => setSettings((prev: Settings) => ({ ...prev, wifiEnabled: val }))} />
</YStack>
<YStack alignItems="center" gap={4} flex={1}>
  <Text fontSize={13} color={isDark ? '#ccc' : '#000'} fontFamily="$body">Notifs</Text>
  <Switch value={settings.notificationsEnabled} onValueChange={(val) => setSettings((prev: Settings) => ({ ...prev, notificationsEnabled: val }))} />
</YStack>
</XStack>
)
}
