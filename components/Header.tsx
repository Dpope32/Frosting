import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Platform, Pressable, Dimensions, useColorScheme } from 'react-native';
import { Stack, XStack, YStack, isWeb } from 'tamagui';
import { Text } from 'tamagui';
// @ts-ignore - Suppressing ESM import error
import { DrawerActions, useNavigation, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { CardSection } from '@/components/home/CardSection';
import { SettingsModal } from '@/components/cardModals/SettingsModal/SettingsModal';
import { QuoteModal } from '@/components/home/QuoteModal';
import { WifiModal } from '@/components/home/WifiModal';
import { ArchivedProjectsModal } from '@/components/listModals/ArchivedProjectsModal';
import { NBATeamModal } from '@/components/sports/NBATeamModal';
import { BillsListModal } from './listModals/BillsListModal';
import { VaultListModal } from './listModals/VaultListModal';
import { PeopleListModal } from './listModals/PeopleListModal';
import { EditBillModal } from './cardModals/edits/EditBillModal';
import { EditVaultModal } from './cardModals/edits/EditVaultModal';
import { useCalendarViewStore, useCalendarStore } from '@/store';
import { useUserStore } from '@/store';
import { isIpad } from '@/utils';
import { Bill, VaultEntry } from '@/types';
import { Legend } from '@/components/calendar/Legend';
import { getUSHolidays } from '@/services';
import { debouncedNavigate } from '@/utils/navigationUtils';
import { useBills } from '@/hooks';

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
  const [showSettings, setShowSettings] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [wifiModalOpen, setWifiModalOpen] = useState(false);
  const [showNBATeamModal, setShowNBATeamModal] = useState(false);
  const [showBillsListModal, setShowBillsListModal] = useState(false);
  const [showVaultListModal, setShowVaultListModal] = useState(false);
  const [showPeopleListModal, setShowPeopleListModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [editBillModalOpen, setEditBillModalOpen] = useState(false);
  const [selectedVaultEntry, setSelectedVaultEntry] = useState<any>(null);
  const [editVaultModalOpen, setEditVaultModalOpen] = useState(false);
  const [showArchivedProjectsModal, setShowArchivedProjectsModal] = useState(false);
  const { webColumnCount, toggleWebColumnCount } = useCalendarViewStore();
  const username = useUserStore(s => s.preferences.username);
  const { events } = useCalendarStore();
  const { updateBill } = useBills();

  const isSportsScreen = route.name === 'nba';
  const isBillsScreen = route.name === 'bills';
  const isVaultScreen = route.name === 'vault';
  const isNotesScreen = route.name === 'notes';
  const isNBAScreen = route.name === 'nba';
  const isCrmScreen = route.name === 'crm';
  const isCalendarScreen = route.name === 'calendar';
  const isHabitsScreen = route.name === 'habits';
  const isProjectsScreen = route.name === 'projects';

  // Calculate active event types for the Legend
  const [activeEventTypes, setActiveEventTypes] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (isCalendarScreen && isWeb) {
      const currentYear = new Date().getFullYear();
      const holidays = [
        ...getUSHolidays(currentYear),
        ...getUSHolidays(currentYear + 1)
      ];

      const allEvents = [...events, ...holidays];

      // Extract unique event types from combined events
      const types: string[] = [];
      allEvents.forEach(event => {
        if (event.type && !types.includes(event.type)) {
          types.push(event.type);
        }
      });
      setActiveEventTypes(types);
    }
  }, [events, isCalendarScreen]);

  const textColor = isHome ? colorScheme === 'dark' ? '#FCF5E5' : '#fcf5e5' : colorScheme === 'dark' ? '#FCF5E5' : '#000000';
  const spacerHeight = isWeb ? 60 : Platform.OS === 'ios' ? 90 : 90;
  const scale = useSharedValue(1);
  const isDark = colorScheme === 'dark';

  const handleTemperaturePress = () => {
    debouncedNavigate('/modals/temperature');
    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) }
  }
  const handlePortfolioPress = () => {
    debouncedNavigate('/modals/portfolio');
    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) }
  }
  const handleQuotePress = () => {
    setQuoteModalOpen(true)
    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) }
  }
  const handleWifiPress = () => {
    setWifiModalOpen(true)
    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) }
  }
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const getRightHeaderElement = () => {
    if (isWeb && isCalendarScreen) {
      // Get appropriate layout icon based on column count
      const layoutIcon =
        webColumnCount === 1 ? "apps-outline" :
        webColumnCount === 2 ? "grid-outline" : "grid";

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
            <Ionicons name={layoutIcon} size={24} color={textColor} />
          </Animated.View>
        </Pressable>
      );
    } else if (isIpad() && isCalendarScreen) {
      // Get layout icon for iPad (3-state toggle: 1-column, 2-column, and Week view)
      const { viewMode } = useCalendarViewStore();

      let layoutIcon: keyof typeof Ionicons.glyphMap;
      if (viewMode === 'week') {
        layoutIcon = "reorder-three";
      } else {
        layoutIcon = webColumnCount === 1 ? "apps-outline" : "grid-outline";
      }

      return (
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();

            // 3-state toggle: 1-column → 2-column → Week view → (back to 1-column)
            if (viewMode === 'month') {
              if (webColumnCount === 1) {
                // Change to 2-column Month view
                useCalendarViewStore.setState({ webColumnCount: 2 });
              } else {
                // Change to Week view
                useCalendarViewStore.setState({ viewMode: 'week' });
              }
            } else {
              // Change back to 1-column Month view
              useCalendarViewStore.setState({ viewMode: 'month', webColumnCount: 1 });
            }
          }}
          style={{ padding: 6, marginRight: -8, marginTop: 0, marginLeft: -40 }}
        >
          <Ionicons name={layoutIcon} size={24} color={textColor} />
        </Pressable>
      );
    } else if (!isWeb && !isIpad() && isCalendarScreen) {
      // Mobile calendar toggle between month and week views
      const { viewMode, toggleViewMode } = useCalendarViewStore();
      const viewIcon = viewMode === 'month' ? "calendar" : "reorder-three";

      return (
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.selectionAsync();
            }
            toggleViewMode();
          }}
          style={{ padding: 8, marginRight: -8 }}
        >
          <Ionicons name={viewIcon} size={22} color={textColor} />
        </Pressable>
      );
    }

    let iconName: keyof typeof Ionicons.glyphMap = "settings-outline";
    if (isSportsScreen) iconName = "basketball-outline";
    else if (isBillsScreen) iconName = "receipt-outline";
    else if (isVaultScreen) iconName = "key-outline";
    else if (isCrmScreen) iconName = "people-outline";
    else if (isProjectsScreen) iconName = "archive-outline";

    // Don't show settings icon on iPad or Web
    if ((isIpad() || isWeb) && !isSportsScreen && !isBillsScreen && !isVaultScreen && !isCrmScreen && !isProjectsScreen) {
      return null;
    }

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
    if (Platform.OS !== 'web') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) }
    if (isSportsScreen) setShowNBATeamModal(true);
    else if (isBillsScreen) {
      setShowBillsListModal(true);
    }
    else if (isVaultScreen) {
      setShowVaultListModal(true);
    }
    else if (isCrmScreen) setShowPeopleListModal(true);
    else if (isProjectsScreen) setShowArchivedProjectsModal(true);
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
        zIndex={isWeb ? 10 : 10}
        {...(isIpad() ? {
          style: {
            position: 'fixed',
            marginLeft: isPermanentDrawer ? -(drawerWidth ?? 0) : 0,
          } as any
        } : {})}
        {...(isWeb ? {
          style: {
            position: 'fixed',
          } as any
        } : {})}
      >
        <YStack
          marginLeft={isPermanentDrawer ? drawerWidth : 0}
          backgroundColor={
            isWeb
              ? colorScheme === 'dark'
                ? 'rgba(14, 14, 15, 0.9)'
                : 'rgba(255,255,255,0.0)'
              : isHome
                ? colorScheme === 'dark'
                  ? isIpad() ? 'rgba(14, 14, 15, 0.0)' : "rgba(14, 14, 15, 0.94)"
                  : 'rgba(255,255,255,0.0)'
                : colorScheme === 'dark'
                  ? 'rgba(14, 14, 15, 0.9)'
                  : 'rgba(255, 255, 255, 0.1)'
          }>
          <XStack
            alignItems="center"
            justifyContent="space-between"
            px="$4"
            height={isWeb ? 80 : isIpad() ? 80 : 90}
            paddingTop={isWeb ? 0 : isIpad() ? 30 : 40}
          >
            <XStack alignItems="center" gap="$1" style={{ marginLeft: isPermanentDrawer ? 10 : 0 }}>
              {!isWeb && !isIpad() && (
                <Pressable
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                    navigation.dispatch(DrawerActions.toggleDrawer());
                  }}
                  style={{
                    padding: isIpad() ? 8 : 8,
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
                fontSize={isWeb ? 18 : isIpad() ? 20 : 18}
                color={textColor}
                style={{ marginLeft: isIpad() ? 24 : 0 }}
                numberOfLines={1}
                fontWeight='bold'
                fontFamily="$heading"
                paddingBottom={isIpad() ? 12 : 0}
              >
                {!isHome ? title : isWeb ? '' : isIpad() ? '' : title}
              </Text>
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

            {/* Web Calendar Legend */}
            {isWeb && isCalendarScreen && activeEventTypes.length > 0 && (
              <XStack
                flex={1}
                justifyContent="center"
                alignItems="center"
                style={{ marginLeft: 20, marginRight: 20 }}
              >
                <Legend isDark={isDark} eventTypes={activeEventTypes} />
              </XStack>
            )}

            <Stack>
              {getRightHeaderElement()}
            </Stack>
          </XStack>
        </YStack>
      </YStack>
      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
      {isSportsScreen && <NBATeamModal open={showNBATeamModal} onOpenChange={setShowNBATeamModal} />}
      {isBillsScreen && (
        <>
          <BillsListModal
            open={showBillsListModal}
            onOpenChange={setShowBillsListModal}
            onEditBill={(bill: Bill) => {
              setSelectedBill(bill as any);
              setEditBillModalOpen(true);
            }}
          />
          <EditBillModal
            isVisible={editBillModalOpen}
            onClose={() => {
              setEditBillModalOpen(false);
              setSelectedBill(null);
            }}
            bill={selectedBill}
            onSubmit={async (updatedBillData) => {
              try {
                await updateBill(updatedBillData, {
                  onSuccess: () => {
                    setEditBillModalOpen(false);
                    setSelectedBill(null);
                  },
                  onError: () => {
                    setEditBillModalOpen(false);
                    setSelectedBill(null);
                  }
                });
              } catch (error) {
                console.error('Error updating bill:', error);
                setEditBillModalOpen(false);
                setSelectedBill(null);
              }
            }}
          />
        </>
      )}
      {isVaultScreen && (
        <>
          <VaultListModal
            open={showVaultListModal}
            onOpenChange={setShowVaultListModal}
            onEditVault={(entry: VaultEntry) => {
              setSelectedVaultEntry(entry as any);
              setEditVaultModalOpen(true);
            }}
          />
          <EditVaultModal
            isVisible={editVaultModalOpen}
            onClose={() => {
              setEditVaultModalOpen(false);
              setSelectedVaultEntry(null);
            }}
            vaultEntry={selectedVaultEntry}
            onSubmit={() => {
              setEditVaultModalOpen(false);
              setSelectedVaultEntry(null);
            }}
          />
        </>
      )}
      {isCrmScreen && <PeopleListModal open={showPeopleListModal} onOpenChange={setShowPeopleListModal} />}
      <QuoteModal open={quoteModalOpen} onOpenChange={setQuoteModalOpen} />
      <WifiModal open={wifiModalOpen} onOpenChange={setWifiModalOpen} />
      <ArchivedProjectsModal open={showArchivedProjectsModal} onOpenChange={setShowArchivedProjectsModal} />
    </>
  );
}
