// @ts-nocheck
import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { isWeb } from 'tamagui';
import { Header } from '@/components/Header';
import { View, Image, Text, Platform, TouchableOpacity, Pressable } from 'react-native'; 

import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserStore } from '@/store/UserStore';
import { memo, useCallback, useMemo } from 'react';
import { useDrawerStyles } from '../../components/shared/styles';
import { LegalButton } from '@/components/drawer/LegalButton';
import  { ChangeLogButton } from '@/components/drawer/changeLogButton';
import { isIpad } from '@/utils/deviceUtils';
import { DRAWER_ICONS } from '@/constants/drawerIcons';
import { useRouter } from 'expo-router';
import { XStack } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;
type MaterialCommunityIconName = keyof typeof MaterialCommunityIcons.glyphMap;

const DrawerContent = memo(({ props, username, profilePicture, styles, isWeb }: { 
  props: DrawerContentComponentProps; 
  username: string | undefined;
  profilePicture: string | undefined | null;
  styles: any;
  isWeb: boolean;
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = colorScheme === 'dark' ? '#FCF5E5' : '#000000';
  const imageSource = (() => {
    if (!profilePicture) {
      return require('@/assets/images/adaptive-icon.png');
    }
    if (isWeb) {
      if (profilePicture.startsWith('data:')) {
        return { uri: profilePicture };
      }
      if (profilePicture.startsWith('file:')) {
        return require('@/assets/images/adaptive-icon.png');
      }
      return { uri: profilePicture };
    }
    return { uri: profilePicture };
  })();
  
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/modals/sync')}>
            <Image 
              source={imageSource}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <Text style={styles.username}>
            {username || 'User'}
          </Text>
          {!isWeb && !isIpad() && (
                <Pressable
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                    props.navigation.closeDrawer();
                  }}
                  style={{  
                    padding: isIpad() ? 8 : 8,
                    marginLeft: 16,
                    ...(isWeb ? {
                      cursor: 'pointer',
                      borderRadius: 8,
                      transition: 'all 0.2s ease',
                    } as any : {})
                  }}
                >
                  <Ionicons
                    name="caret-back"
                    size={isWeb ? 24 : 20}
                    color={isDark ? '#fff' : '#000'}
                  />
                </Pressable>
              )}
        </View>
        <View style={styles.content}>
          <DrawerContentScrollView 
            {...props}
            contentContainerStyle={styles.scrollViewContent}
            style={styles.scrollView}
          >
            <DrawerItemList {...props} />
          </DrawerContentScrollView>
        </View>
        <XStack alignItems="center" justifyContent="space-between" marginBottom={32} paddingHorizontal={isWeb ? 24 : isIpad() ? 20 : 16}>
          <ChangeLogButton />
          <LegalButton />
        </XStack>
    </View>
  );
});

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const { primaryColor, username, profilePicture } = useUserStore(s => s.preferences);
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? 'rgba(14, 14, 15, 1)' : 'rgb(225, 225, 225)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)';
  const inactiveColor = isDark  ? Platform.OS === 'web' ? '#444' : '#777' : '#999';
  const isIpadDevice = isIpad();
  const isPermanentDrawer = isWeb || isIpadDevice;
  const styles = useDrawerStyles();
  const drawerWidth = isWeb  ? typeof window !== 'undefined' ? Math.min(220, window.innerWidth * 0.20) : 220 : isIpadDevice ? 220  : 200;

  const renderDrawerContent = useCallback((props: DrawerContentComponentProps) => (
    <DrawerContent 
      props={props} 
      username={username} 
      profilePicture={profilePicture} 
      styles={styles} 
      isWeb={isWeb} 
    />
  ), [username, profilePicture, styles, isWeb, drawerWidth]);

  const renderIcon = useCallback(({ color, route }: { color: string; route: string }) => {
    const icon = DRAWER_ICONS[route];
    if (icon.type === 'material') {
      return <MaterialIcons name={icon.name as MaterialIconName} size={24} color={color} style={{ marginRight: 4 }} />;
    }
    return <MaterialCommunityIcons name={icon.name as MaterialCommunityIconName} size={24} color={color} style={{ marginRight: 4 }} />;
  }, []);

  const drawerScreenOptions = useMemo(() => {
    const options: any = {
      header: ({ route, options }: { route: any; options: any }) => {
        const isHome = route.name === '(tabs)/index';
        return (
          <Header 
            title={options.title || route.name} 
            isHome={isHome} 
            isPermanentDrawer={isPermanentDrawer} 
            drawerWidth={drawerWidth} 
          />
        );
      },
      headerTransparent: true,
      useNativeDriver: true,
      drawerStyle: {
        backgroundColor,
        width: drawerWidth,
        borderRightWidth: 1,
        borderColor,
        ...(isPermanentDrawer ? { zIndex: 20 } : {})
      },
      drawerActiveTintColor: '#fff',
      drawerInactiveTintColor: inactiveColor,
      drawerActiveBackgroundColor: isDark  ? `${primaryColor}99`  : Platform.OS === 'web' ? primaryColor : `${primaryColor}ee`,
      drawerItemStyle: {
        paddingVertical: 0,
        paddingLeft: 0,
        marginBottom: 10,
        borderRadius: 30,
      },
      drawerLabelStyle: {
        fontSize: isIpadDevice ? 18 : 16,
        fontWeight: "600" as const,
        marginLeft: -8,
      },
      drawerContentStyle: { backgroundColor },
      drawerType: isPermanentDrawer ? 'permanent' as const : 'back' as const,
      defaultStatus: 'open',
      overlayColor: isPermanentDrawer ? 'transparent' : isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)',
      swipeEnabled: !isPermanentDrawer,
      swipeEdgeWidth: 150,
      drawerStatusBarAnimation: 'fade',
      drawerHideStatusBarOnOpen: true,
      keyboardDismissMode: 'on-drag',
      freezeOnBlur: isWeb ? true : false,
    };
    if (!isPermanentDrawer) {
      options.gestureHandlerProps = {
        enabled: true,
        activeOffsetX: [-15, 15], 
        failOffsetY: [-50, 50],  
        velocityThreshold: 0.3,  
      };
      options.sceneContainerStyle = {
        transform: [{ translateX: 0 }],
      };
      
      options.minSwipeDistance = 5;
    }
      options.drawerOpeningAnimation = {
        type: '',
        stiffness: 750,
        damping: 70,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      };

    return options;
  }, [backgroundColor, drawerWidth, borderColor, isPermanentDrawer, inactiveColor, isDark, primaryColor, isIpadDevice]);

  return (
    <View style={styles.wrapper}>
      <Drawer drawerContent={renderDrawerContent} screenOptions={drawerScreenOptions} >
        <Drawer.Screen
          name="(tabs)/index"
          options={{
            title: 'Home',
            drawerLabel: 'Home',
            drawerIcon: (props: any) => renderIcon({ ...props, route: '(tabs)/index' })
          }}
        />
        <Drawer.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            drawerLabel: 'Calendar',
            drawerIcon: (props: any) => renderIcon({ ...props, route: 'calendar' })
          }}
        />
        <Drawer.Screen
          name="crm"
          options={{
            title: 'CRM',
            drawerLabel: 'CRM',
            drawerIcon: (props: any) => renderIcon({ ...props, route: 'crm' })
          }}
        />
        <Drawer.Screen
          name="vault"
          options={{
            title: 'Vault',
            drawerLabel: 'Vault',
            drawerIcon: (props: any) => renderIcon({ ...props, route: 'vault' })
          }}
        />
        <Drawer.Screen
          name="bills"
          options={{
            title: 'Bills',
            drawerLabel: 'Bills',
            drawerIcon: (props: any) => renderIcon({ ...props, route: 'bills' })
          }}
        />
        <Drawer.Screen
          name="notes"
          options={{
            title: 'Notes',
            drawerLabel: 'Notes',
            drawerIcon: (props: any) => renderIcon({ ...props, route: 'notes' })
          }}
        />
      <Drawer.Screen
        name="habits"
        options={{
          title: 'Habits',
          drawerLabel: 'Habits',
          drawerIcon: (props: any) => renderIcon({ ...props, route: 'habits' }),
        }}
      />
      <Drawer.Screen
        name="projects"
        options={{
          title: 'Projects',
          drawerLabel: 'Projects',
          drawerIcon: (props: any) => renderIcon({ ...props, route: 'projects' })
        }}
      />
      </Drawer>
    </View>
  );
}
