import React, { useState } from 'react';
import { Platform, Pressable } from 'react-native';
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

  const textColor = colorScheme === 'dark' ? '#FCF5E5' : '#001';

  // Calculate the spacer height based on platform
  const spacerHeight = Platform.OS === 'web' ? 60 : Platform.OS === 'ios' ? 90 : 90;

  return (
    <>
      {/* Spacer to prevent content from being hidden under the fixed header */}
      {Platform.OS === 'web' && (
        <YStack height={spacerHeight} />
      )}
      <YStack 
        position="absolute" 
        top={Platform.OS === 'web' ? 0 : 0} 
        left={0} 
        right={0} 
        zIndex={50}
        {...(Platform.OS === 'web' ? {
          // Add web-specific styles for the header container
          style: {
            position: 'fixed', // Use fixed positioning on web for better scrolling behavior
            backdropFilter: 'blur(10px)', // Add a blur effect for a modern look
          } as any
        } : {})}
      >
        <YStack
          backgroundColor={
            Platform.OS === 'web' 
              ? colorScheme === 'dark' 
                ? 'rgba(0,0,0,0.7)' 
                : 'rgba(255,255,255,0.9)'
              : colorScheme === 'dark' 
                ? 'rgba(0,0,0,0.8)' 
                : 'rgba(255,255,255,1)'
          }
          {...(Platform.OS === 'web' ? {
            style: {
              borderBottom: colorScheme === 'dark' 
                ? '1px solid rgba(255,255,255,0.1)' 
                : '1px solid rgba(0,0,0,0.1)',
              boxShadow: colorScheme === 'dark'
                ? '0 2px 8px rgba(0,0,0,0.2)'
                : '0 2px 8px rgba(0,0,0,0.05)'
            } as any
          } : {})}
        >
          <XStack 
            alignItems="center" 
            justifyContent="space-between" 
            paddingHorizontal="$4" 
            height={Platform.OS === 'web' ? 60 : Platform.OS === 'ios' ? 90 : 90}
            paddingTop={Platform.OS === 'web' ? 15 : Platform.OS === 'ios' ? 45 : 40}
          >
            <XStack alignItems="center" gap="$4">
              <Pressable 
                onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                style={{ 
                  padding: 8, 
                  marginLeft: -8,
                  ...(Platform.OS === 'web' ? {
                    cursor: 'pointer',
                    borderRadius: 8,
                    transition: 'all 0.2s ease',
                    ':hover': {
                      backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                    }
                  } as any : {})
                }}
              >
                <Ionicons 
                  name="menu" 
                  size={Platform.OS === 'web' ? 24 : 28} 
                  color={textColor} 
                />
              </Pressable>
              <Text 
                fontSize={Platform.OS === 'web' ? 18 : 20}
                fontWeight="600"
                color={textColor}
                numberOfLines={1}
                fontFamily="$body"
              >
                {title}
              </Text>
            </XStack>
            <Stack>
              <Pressable 
                onPress={() => setShowSettings(true)}
                style={{ 
                  padding: 8, 
                  marginRight: -8,
                  ...(Platform.OS === 'web' ? {
                    cursor: 'pointer',
                    borderRadius: 8,
                    transition: 'all 0.2s ease',
                    ':hover': {
                      backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                    }
                  } as any : {})
                }}
              >
                <Ionicons 
                  name="settings-outline" 
                  size={Platform.OS === 'web' ? 22 : 24} 
                  color={textColor} 
                />
              </Pressable>
            </Stack>
          </XStack>
        </YStack>
      </YStack>
      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </>
  );
}
