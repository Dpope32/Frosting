import React from 'react';
import  { Suspense, lazy } from 'react';
import { ActivityIndicator } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { isWeb } from 'tamagui';
import { Header } from '@/components/Header';
import { View, Image, Text, Platform, TouchableOpacity } from 'react-native'; 
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserStore } from '@/store/UserStore';
import { memo, useCallback, useMemo } from 'react';
import { useDrawerStyles } from '../../components/shared/styles';
import { LegalButton } from '@/components/drawer/LegalButton';
import { isIpad } from '@/utils/deviceUtils';
import { DRAWER_ICONS } from '@/constants/drawerIcons';

import { useRouter } from 'expo-router';

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
        <LegalButton />
    </View>
  );
});

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const { primaryColor, username, profilePicture } = useUserStore(s => s.preferences);
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? 'rgba(14, 14, 15, 0.9)' : '#f7f4ea';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)';
  const inactiveColor = isDark  ? Platform.OS === 'web' ? '#444' : '#777' : '#999';
  const isIpadDevice = isIpad();
  const isPermanentDrawer = isWeb || isIpadDevice;
  const styles = useDrawerStyles();
  const drawerWidth = isWeb  ? typeof window !== 'undefined' ? Math.min(280, window.innerWidth * 0.25) : 280 : isIpadDevice ? 250  : 230;

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
        borderRadius: 8, 
        paddingVertical: 0,
        paddingLeft: 0,
        marginBottom: 10,
        ...(!isPermanentDrawer ? { marginHorizontal: 4 } : {})
      },
      drawerLabelStyle: {
        fontSize: isIpadDevice ? 18 : 16,
        fontWeight: "600" as const,
        marginLeft: -8,
      },
      drawerContentStyle: { backgroundColor },
      drawerType: isPermanentDrawer ? 'permanent' as const : 'front' as const,
      overlayColor: isPermanentDrawer ? 'transparent' : 'rgba(0,0,0,0.5)',
      swipeEnabled: !isPermanentDrawer,
      swipeEdgeWidth: 150,
      drawerStatusBarAnimation: 'fade',
      drawerHideStatusBarOnOpen: true,
      keyboardDismissMode: 'on-drag',
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
        type: 'spring',
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
            drawerIcon: (props) => renderIcon({ ...props, route: '(tabs)/index' })
          }}
        />
        <Drawer.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            drawerLabel: 'Calendar',
            drawerIcon: (props) => renderIcon({ ...props, route: 'calendar' })
          }}
        />
         <Drawer.Screen
          name="nba"
          options={{
            title: 'NBA',
            drawerLabel: 'NBA',
            drawerIcon: (props) => renderIcon({ ...props, route: 'nba' })
          }}
        /> 
        <Drawer.Screen
          name="crm"
          options={{
            title: 'CRM',
            drawerLabel: 'CRM',
            drawerIcon: (props) => renderIcon({ ...props, route: 'crm' })
          }}
        />
        <Drawer.Screen
          name="vault"
          options={{
            title: 'Vault',
            drawerLabel: 'Vault',
            drawerIcon: (props) => renderIcon({ ...props, route: 'vault' })
          }}
        />
        <Drawer.Screen
          name="bills"
          options={{
            title: 'Bills',
            drawerLabel: 'Bills',
          drawerIcon: (props) => renderIcon({ ...props, route: 'bills' })
        }}
      />
        <Drawer.Screen
          name="notes"
          options={{
            title: 'Notes',
            drawerLabel: 'Notes',
          drawerIcon: (props) => renderIcon({ ...props, route: 'notes' })
        }}
      />
      <Drawer.Screen
        name="habits"
        options={{
          title: 'Habits',
          drawerLabel: 'Habits',
          drawerIcon: props => renderIcon({ ...props, route: 'habits' }),
        }}
      />
      </Drawer>
    </View>
  );
}
