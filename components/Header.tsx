import React, { useState } from 'react';
import { Platform, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack, XStack, YStack } from 'tamagui';
import { Text } from 'tamagui';
import { DrawerActions, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { SettingsModal } from './cardModals/SettingsModal';
import { NBATeamModal } from './sports/NBATeamModal';
import { BillsListModal } from './cardModals/BillsListModal';
import { VaultListModal } from './cardModals/VaultListModal';
import { useCalendarViewStore } from '@/store/CalendarViewStore';

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
  const [showBillsListModal, setShowBillsListModal] = useState(false);
  const [showVaultListModal, setShowVaultListModal] = useState(false);
  const { webColumnCount, toggleWebColumnCount } = useCalendarViewStore(); // Get state and action from store

  // Check current screen
  const isSportsScreen = route.name === 'nba';
  const isBillsScreen = route.name === 'bills';
  const isVaultScreen = route.name === 'vault';
  const isCalendarScreen = route.name === 'calendar'; // Check for calendar screen
  const textColor = colorScheme === 'dark' ? '#FCF5E5' : '#00000';
  const isWeb = Platform.OS === 'web';

  // Calculate the spacer height based on platform
  const spacerHeight = isWeb ? 60 : Platform.OS === 'ios' ? 90 : 90;

  // Animation setup for the 3/2 toggle
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Determine which icon/element to show based on the current screen and platform
  const getRightHeaderElement = () => {
    if (isWeb && isCalendarScreen) {
      return (
        <Pressable
          onPress={() => {
            scale.value = withTiming(0.8, { duration: 100, easing: Easing.ease }, () => {
              toggleWebColumnCount();
              scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
            });
          }}
          style={{ padding: 8, marginRight: -8, marginTop: 5, marginLeft: -40 }}
        >
          <Animated.View style={animatedStyle}>
            <Text fontWeight="bold" fontSize={20} color={textColor}>
              {webColumnCount}
            </Text>
          </Animated.View>
        </Pressable>
      );
    }

    let iconName: keyof typeof Ionicons.glyphMap = "settings-outline";
    if (isSportsScreen) iconName = "basketball-outline";
    else if (isBillsScreen) iconName = "receipt-outline";
    else if (isVaultScreen) iconName = "key-outline";

    return (
      <Pressable
        onPress={handleIconPress}
        style={{
          padding: 8,
          marginRight: -8,
          ...(isWeb ? { mt: 5, marginLeft: -40 } as any : {})
        }}
      >
        <Ionicons name={iconName} size={isWeb ? 20 : 20} color={textColor} />
      </Pressable>
    );
  };

  // Handle the icon press based on the current screen
  const handleIconPress = () => {
    // Trigger haptic feedback on non-web platforms
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    if (isSportsScreen) setShowNBATeamModal(true);
    else if (isBillsScreen) setShowBillsListModal(true);
    else if (isVaultScreen) setShowVaultListModal(true);
    else setShowSettings(true);
  };

  return (
    <>
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
          style: {
            position: 'fixed', 
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
                ? 'rgba(0,0,0,0.6)' 
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
            px="$4" 
            height={isWeb ? 60 : Platform.OS === 'ios' ? 92 : 90}
            paddingTop={isWeb ? 15 : Platform.OS === 'ios' ? 40 : 40}
          >
            <XStack alignItems="center" gap="$3">
              {!isWeb && (
                <Pressable 
                  onPress={() => {
                    // Trigger haptic feedback on non-web platforms
                    if (Platform.OS !== 'web') {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                    navigation.dispatch(DrawerActions.toggleDrawer());
                  }}
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
                    size={isWeb ? 24 : 20} 
                    color={textColor} 
                  />
                </Pressable>
              )}
              <Text 
                fontSize={isWeb ? 18 : 20}
                color={textColor}
                numberOfLines={1}
                fontWeight= 'bold'
                fontFamily="$heading"
              >
                {title}
              </Text>
            </XStack>
            <Stack>
              {getRightHeaderElement()}
            </Stack>
          </XStack>
        </YStack>
      </YStack>
      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
      {isSportsScreen && <NBATeamModal open={showNBATeamModal} onOpenChange={setShowNBATeamModal} />}
      {isBillsScreen && <BillsListModal open={showBillsListModal} onOpenChange={setShowBillsListModal} />}
      {isVaultScreen && <VaultListModal open={showVaultListModal} onOpenChange={setShowVaultListModal} />}
    </>
  );
}
