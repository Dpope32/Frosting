import React, { useState } from 'react';
import { Platform, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack, XStack, YStack } from 'tamagui';
import { Text } from 'tamagui';
import { DrawerActions, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SettingsModal } from './cardModals/SettingsModal';
import { NBATeamModal } from './sports/NBATeamModal';

interface HeaderProps {
  title: string;
  rightElement?: React.ReactNode;
}

export function Header({ title }: HeaderProps) {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const route = useRoute();
  const [showSettings, setShowSettings] = useState(false);
  const [showNBATeamModal, setShowNBATeamModal] = useState(false);
  
  // Check if we're on the sports screen
  const isSportsScreen = route.name === 'nba';

  const textColor = colorScheme === 'dark' ? '#FCF5E5' : '#bbb';
  const isWeb = Platform.OS === 'web';

  // Calculate the spacer height based on platform
  const spacerHeight = isWeb ? 60 : Platform.OS === 'ios' ? 90 : 90;

  return (
    <>
      {/* Spacer to prevent content from being hidden under the fixed header */}
      {isWeb && (
        <YStack height={spacerHeight} />
      )}
      <YStack 
        position="absolute" 
        top={0} 
        left={0} 
        right={0} 
        zIndex={isWeb ? 10 : 50}
        {...(isWeb ? {
          // Add web-specific styles for the header container
          style: {
            position: 'fixed', // Use fixed positioning on web for better scrolling behavior
          } as any
        } : {})}
      >
        <YStack
          backgroundColor={
            isWeb 
              ? colorScheme === 'dark' 
                ? 'rgba(0,0,0,0.0)' 
                : 'rgba(255,255,255,0.0)'
              : colorScheme === 'dark' 
                ? 'rgba(0,0,0,0.2)' 
                : 'rgba(255, 255, 255, 0.2)' 
          }
          style={{
            shadowColor: colorScheme === 'dark' ? undefined : '#000',
            shadowOffset: colorScheme === 'dark' ? undefined : { width: 0, height: 1 },
            shadowOpacity: colorScheme === 'dark' ? undefined : 0.1,
            shadowRadius: colorScheme === 'dark' ? undefined : 2,
            elevation: colorScheme === 'dark' ? undefined : 2,
          }}
        >
          <XStack 
            alignItems="center" 
            justifyContent="space-between" 
            paddingHorizontal="$4" 
            height={isWeb ? 60 : Platform.OS === 'ios' ? 90 : 90}
            paddingTop={isWeb ? 15 : Platform.OS === 'ios' ? 40 : 40}
          >
            <XStack alignItems="center" gap="$3">
              {/* Only show menu button on non-web platforms */}
              {!isWeb && (
                <Pressable 
                  onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                  style={{ 
                    padding: 8, 
                    marginLeft: -8,
                    ...(isWeb ? {
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
                    size={isWeb ? 24 : 28} 
                    color={textColor} 
                  />
                </Pressable>
              )}
              <Text 
                fontSize={isWeb ? 18 : 20}
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
                onPress={() => isSportsScreen ? setShowNBATeamModal(true) : setShowSettings(true)}
                style={{ 
                  padding: 8, 
                  marginRight: -8,
                  ...(isWeb ? {
                    marginTop: 5,
                    marginLeft: -40
                  } as any : {})
                }}
              >
                <Ionicons 
                  name={isSportsScreen ? "basketball-outline" : "settings-outline"}
                  size={isWeb ? 22 : 24} 
                  color={textColor} 
                />
              </Pressable>
            </Stack>
          </XStack>
        </YStack>
      </YStack>
      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
      {isSportsScreen && <NBATeamModal open={showNBATeamModal} onOpenChange={setShowNBATeamModal} />}
    </>
  );
}
