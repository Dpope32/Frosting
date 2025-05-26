import React, { useCallback, useMemo } from 'react';
import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { isWeb } from 'tamagui';
import { Header } from '@/components/Header';
import { View, Platform } from 'react-native'; 
// @ts-ignore
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserStore } from '@/store';
import { useDrawerStyles } from '../../components/shared/styles';
import { isIpad } from '@/utils';
import { DRAWER_ICONS } from '@/constants';
import { DrawerContent } from '@/components/drawer/DrawerContent';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;
type MaterialCommunityIconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const { primaryColor, username, profilePicture, premium = false } = useUserStore(s => s.preferences);
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? 'rgba(14, 14, 15, 1)' : 'rgb(225, 225, 225)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)';
  const inactiveColor = isDark  ? Platform.OS === 'web' ? '#444' : '#777' : '#999';
  const isIpadDevice = isIpad();
  const isPermanentDrawer = isWeb || isIpadDevice;
  const styles = useDrawerStyles();
  const drawerWidth = isWeb  ? typeof window !== 'undefined' ? Math.min(220, window.innerWidth * 0.25) : 250 : isIpadDevice ? 200  : 200;
console.log(drawerWidth)
  const renderDrawerContent = useCallback((props: DrawerContentComponentProps) => (
    <DrawerContent 
      props={props} 
      username={username || ''} 
      profilePicture={profilePicture} 
      styles={styles} 
      isWeb={isWeb} 
      isIpadDevice={isIpadDevice}
      premium={premium || false}
    />
  ), [username, profilePicture, styles, isWeb, isIpadDevice, premium]);

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
      defaultStatus: isPermanentDrawer ? 'open' : 'closed',
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
