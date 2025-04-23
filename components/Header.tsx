import React, { useState } from 'react';
import { Platform, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack, XStack, YStack, isWeb } from 'tamagui'; 
import { Text } from 'tamagui';
import { DrawerActions, useNavigation, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { GreetingSection } from '@/components/home/GreetingSection';
import { CardSection } from '@/components/home/CardSection'; 
import { SettingsModal } from './cardModals/SettingsModal';
import { PortfolioModal } from './cardModals/PortfolioModal'; 
import { QuoteModal } from './cardModals/QuoteModal'; 
import { WifiModal } from './cardModals/WifiModal';
import { NBATeamModal } from './sports/NBATeamModal';
import { BillsListModal } from './listModals/BillsListModal';
import { VaultListModal } from './listModals/VaultListModal';
import { PeopleListModal } from './listModals/PeopleListModal';
import { useCalendarViewStore } from '@/store/CalendarViewStore';
import { useUserStore } from '@/store/UserStore';

interface HeaderProps {
  title: string;
  rightElement?: React.ReactNode;
  isHome?: boolean;
  isPermanentDrawer?: boolean;
  drawerWidth?: number;
}

export function Header({ title, isHome, isPermanentDrawer, drawerWidth }: HeaderProps) {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const route = useRoute();
  const router = useRouter(); 
  const isDark = colorScheme === 'dark';
  const [showSettings, setShowSettings] = useState(false);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false); 
  const [quoteModalOpen, setQuoteModalOpen] = useState(false); 
  const [wifiModalOpen, setWifiModalOpen] = useState(false); 
  const [showNBATeamModal, setShowNBATeamModal] = useState(false);
  const [showBillsListModal, setShowBillsListModal] = useState(false);
  const [showVaultListModal, setShowVaultListModal] = useState(false);
  const [showPeopleListModal, setShowPeopleListModal] = useState(false);
  const { webColumnCount, toggleWebColumnCount } = useCalendarViewStore();
  const username = useUserStore(s => s.preferences.username);

  const isSportsScreen = route.name === 'nba';
  const isBillsScreen = route.name === 'bills';
  const isVaultScreen = route.name === 'vault';
  const isNotesScreen = route.name === 'notes';
  const isNBAScreen = route.name === 'nba';
  const isCrmScreen = route.name === 'crm';
  const isCalendarScreen = route.name === 'calendar';
  const textColor = colorScheme === 'dark' ? '#FCF5E5' : '#fcf5e5';
  const spacerHeight = isWeb ? 60 : Platform.OS === 'ios' ? 90 : 90;
  const scale = useSharedValue(1);

  const handleTemperaturePress = () => {
    router.push('/modals/temperature');
    if (Platform.OS !== 'web') {Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
  }
  const handlePortfolioPress = () => {
     setPortfolioModalOpen(true)
     if (Platform.OS !== 'web') {Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
    }
  const handleQuotePress = () => {
    setQuoteModalOpen(true)
    if (Platform.OS !== 'web') {Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
  }
  const handleWifiPress = () => {
    setWifiModalOpen(true)
    if (Platform.OS !== 'web') {Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
  }
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

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
          style={{ padding: 6, marginRight: -8, marginTop: 0, marginLeft: -40 }}
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
    else if (isCrmScreen) iconName = "people-outline";

    return (
      <Pressable
        onPress={handleIconPress}
        style={{ padding: 8, marginRight: -8, ...(isWeb ? { mt: -5, marginLeft: -40 } as any : {}) }}
      >
        <Ionicons name={iconName} size={isWeb ? 20 : 20} color={textColor} />
      </Pressable>
    );
  };

  const handleIconPress = () => {
    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
    if (isSportsScreen) setShowNBATeamModal(true);
    else if (isBillsScreen) setShowBillsListModal(true);
    else if (isVaultScreen) setShowVaultListModal(true);
    else if (isCrmScreen) setShowPeopleListModal(true);
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
        left={isPermanentDrawer ? drawerWidth : 0}
        right={0}
        zIndex={isWeb ? 10 : 50}
        {...(isWeb ? { style: { position: 'fixed'} as any } : {})}
      >
        <YStack
        backgroundColor={
          isWeb 
            ? colorScheme === 'dark' 
              ? 'rgba(14, 14, 15, 0.9)'  
              : 'rgba(255,255,255,0.0)'
            : colorScheme === 'dark' 
              ? 'rgba(0,0,0,0.4)' 
              : 'rgba(255, 255, 255, 0.1)' 
        }
        style={{
          shadowColor: colorScheme === 'dark' ? undefined : '#000',
          shadowOffset: colorScheme === 'dark' ? undefined : { width: 0, height: 1 },
          shadowOpacity: colorScheme === 'dark' ? undefined : 0.1,
          shadowRadius: colorScheme === 'dark' ? undefined : 2,
          elevation: colorScheme === 'dark' ? undefined : 2,
        }}>
          <XStack
            alignItems="center"
            justifyContent="space-between"
            px="$4"
            height={isWeb ? 80 : Platform.OS === 'ios' ? 88 : 90}
            paddingTop={isWeb ? 0 : Platform.OS === 'ios' ? 40 : 40}
          >
            <XStack alignItems="center" gap="$0" style={{ marginLeft: isPermanentDrawer ? 10 : 0 }}>
              {!isWeb && (
                <Pressable
                  onPress={() => {
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
              {isHome ? (
                <GreetingSection username={username} />
              ) : (
                <Text
                  fontSize={isWeb ? 18 : 18}
                  color={textColor}
                  numberOfLines={1}
                  fontWeight= 'bold'
                  fontFamily="$heading"
                >
                  {title}
                </Text>
              )}
              {isWeb && isHome && (
                <CardSection
                  isHome={isHome}
                  onPortfolioPress={handlePortfolioPress}
                  onTemperaturePress={handleTemperaturePress}
                  onQuotePress={handleQuotePress}
                  onWifiPress={handleWifiPress}
                />
              )}
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
      {isCrmScreen && <PeopleListModal open={showPeopleListModal} onOpenChange={setShowPeopleListModal} />}
      <PortfolioModal open={portfolioModalOpen} onOpenChange={setPortfolioModalOpen} />
      <QuoteModal open={quoteModalOpen} onOpenChange={setQuoteModalOpen} />
      <WifiModal open={wifiModalOpen} onOpenChange={setWifiModalOpen}/>
    </>
  );
}
