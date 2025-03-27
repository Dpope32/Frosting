import React from 'react'; 
import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Header } from '@/components/Header';
import { View, Image, Text, Platform, Dimensions } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserStore } from '@/store/UserStore';
import { memo, useCallback, useMemo } from 'react';
import { useDrawerStyles } from '../../components/shared/styles';
import { LegalButton } from '@/components/drawer/LegalButton';
import { isIpad } from '@/utils/deviceUtils';

const DrawerContent = memo(({ props, username, profilePicture, styles, isWeb }: { 
  props: DrawerContentComponentProps; 
  username: string | undefined;
  profilePicture: string | undefined | null;
  styles: any;
  isWeb: boolean;
}) => {
  
  // Determine the image source based on platform and availability
  const imageSource = (() => {
    if (!profilePicture) {
      return require('@/assets/images/adaptive-icon.png');
    }
    
    // For web, ensure the URI is properly formatted
    if (isWeb) {
      // If it's a data URL (starts with data:), use it directly
      if (profilePicture.startsWith('data:')) {
        return { uri: profilePicture };
      }
      
      // If it's a file URI that might not work on web, use the fallback
      if (profilePicture.startsWith('file:')) {
        return require('@/assets/images/adaptive-icon.png');
      }
      
      // Otherwise use the URI as is
      return { uri: profilePicture };
    }
    
    // For mobile, use the URI directly
    return { uri: profilePicture };
  })();
  
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image 
            source={imageSource}
            style={styles.profileImage}
          />
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

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;
type MaterialCommunityIconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface IconConfig {name: MaterialIconName | MaterialCommunityIconName; type: 'material' | 'community';}

const DRAWER_ICONS: Record<string, IconConfig> = {
  '(tabs)/index': { name: 'home' as MaterialIconName, type: 'material' },
  calendar: { name: 'calendar-today' as MaterialIconName, type: 'material' },
  nba: { name: 'sports-basketball' as MaterialIconName, type: 'material' },
  crm: { name: 'person' as MaterialIconName, type: 'material' },
  vault: { name: 'lock' as MaterialIconName, type: 'material' },
  bills: { name: 'attach-money' as MaterialIconName, type: 'material' },
};

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const { primaryColor, username, profilePicture } = useUserStore(s => s.preferences);
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? '#0e0e0e' : '#F5F5F5';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)';
  const inactiveColor = isDark  ? Platform.OS === 'web' ? '#444' : '#777' : '#999';
  const isWeb = Platform.OS === 'web';
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
  ), [username, profilePicture, styles, isWeb, drawerWidth]); // Added drawerWidth dependency

  const renderIcon = useCallback(({ color, route }: { color: string; route: string }) => {
    const icon = DRAWER_ICONS[route];
    if (icon.type === 'material') {
      return <MaterialIcons name={icon.name as MaterialIconName} size={24} color={color} style={{ marginRight: 4 }} />;
    }
    return <MaterialCommunityIcons name={icon.name as MaterialCommunityIconName} size={24} color={color} style={{ marginRight: 4 }} />;
  }, []);

  const drawerScreenOptions = useMemo(() => {
    const options: any = {
      header: ({ route, options }: { route: any; options: any }) => (
        <Header title={options.title || route.name} />
      ),
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
        borderRadius: !isPermanentDrawer ? 8 : 0,
        paddingVertical: 0,
        paddingLeft: 0,
        marginBottom: 10,
        ...(!isPermanentDrawer ? { marginHorizontal: 4 } : {})
      },
      drawerLabelStyle: {
        fontSize: isIpadDevice ? 17 : 16, 
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
        activeOffsetX: [-15, 15],  // More sensitive than current -10, 10
        failOffsetY: [-50, 50],  // Less restrictive than current -30, 30
        velocityThreshold: 0.3,  // Increased from 0.1 for smoother transitions
      };
      
      // Add additional optimizations for mobile
      options.sceneContainerStyle = {
        transform: [{ translateX: 0 }],
      };
      
      options.minSwipeDistance = 5;
    }
      options.drawerOpeningAnimation = {
        type: 'spring',
        stiffness: 1000,
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
      </Drawer>
    </View>
  );
}
