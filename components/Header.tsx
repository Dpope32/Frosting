import React, { useState } from 'react';
import { Platform, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack, XStack, YStack } from 'tamagui';
import { Text } from 'tamagui';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SettingsModal } from './SettingsModal';

interface HeaderProps {
  title: string;
  rightElement?: React.ReactNode;
}

export function Header({ title }: HeaderProps) {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <YStack 
        position="absolute" 
        top={0} 
        left={0} 
        right={0} 
        zIndex={50}
      >
        <YStack
          backgroundColor={colorScheme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.7)'}
        >
          <XStack 
            alignItems="center" 
            justifyContent="space-between" 
            paddingHorizontal="$4" 
            height={Platform.OS === 'ios' ? 90 : 90}
            paddingTop={Platform.OS === 'ios' ? 45 : 40}
          >
            <XStack alignItems="center" gap="$4">
              <Pressable 
                onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                style={{ padding: 8, marginLeft: -8 }}
              >
                <Ionicons name="menu" size={28} color="white" />
              </Pressable>
              <Text 
                fontSize={18}
                fontWeight="600"
                color="white"
                numberOfLines={1}
                fontFamily="$SpaceMono"
              >
                {title}
              </Text>
            </XStack>
            <Stack>
              <Pressable 
                onPress={() => setShowSettings(true)}
                style={{ padding: 8, marginRight: -8 }}
              >
                <Ionicons name="settings-outline" size={24} color="white" />
              </Pressable>
            </Stack>
          </XStack>
        </YStack>
      </YStack>
      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </>
  );
}
