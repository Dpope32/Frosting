import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Header } from '@/components/Header';
import { View, Image, Text, useColorScheme as RNColorScheme, Platform, Dimensions, StyleSheet, TextStyle } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserStore } from '@/store/UserStore';
import { memo, useCallback, useMemo } from 'react';
import { LegalButton } from '@/components/drawer/LegalButton';
import { DrawerNavigationOptions } from '@react-navigation/drawer';

// Define strict types for icon names
type MaterialIconName = keyof typeof MaterialIcons.glyphMap;
type MaterialCommunityIconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface IconConfig {
  name: MaterialIconName | MaterialCommunityIconName;
  type: 'material' | 'community';
}

// Move DRAWER_ICONS outside component to prevent recreations
const DRAWER_ICONS: Record<string, IconConfig> = {
  '(tabs)/index': { name: 'home', type: 'material' },
  calendar: { name: 'calendar-today', type: 'material' },
  nba: { name: 'sports-basketball', type: 'material' },
  chatbot: { name: 'code', type: 'material' },
  crm: { name: 'person', type: 'material' },
  storage: { name: 'cloud-upload', type: 'material' },
  vault: { name: 'lock', type: 'material' },
  bills: { name: 'attach-money', type: 'material' },
  'notifications-test': { name: 'notifications', type: 'material' }
};

// Pre-define styles outside of component to prevent recalculation
const createDrawerStyles = (isDark: boolean, primaryColor: string) => StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0e0e0e' : '#F5F5F5',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#fff' : '#000',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 8,
  },
});

// Helper function for device detection
const isIpad = (): boolean => {
  const { width, height } = Dimensions.get('window');
  return (
    Platform.OS === 'ios' &&
    Math.min(width, height) >= 768 &&
    Math.max(width, height) >= 1024
  );
};

// Separate interface for DrawerContent props
interface DrawerContentProps {
  props: DrawerContentComponentProps;
  username: string | undefined;
  profilePicture: string | undefined | null;
  styles: ReturnType<typeof createDrawerStyles>;
  isWeb: boolean;
}

// Optimized DrawerContent component with memoization
const DrawerContent = memo(({ props, username, profilePicture, styles, isWeb }: DrawerContentProps) => {
  // Memoize image source calculation to prevent recalculation on every render
  const imageSource = useMemo(() => {
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
  }, [profilePicture, isWeb]);
  
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
}, (prevProps, nextProps) => {
  // Implement proper equality check for better memoization
  return (
    prevProps.username === nextProps.username &&
    prevProps.profilePicture === nextProps.profilePicture &&
    prevProps.isWeb === nextProps.isWeb
  );
});

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const { primaryColor, username, profilePicture } = useUserStore(s => s.preferences);
  const isDark = colorScheme === 'dark';
  
  // Cache static values
  const isWeb = Platform.OS === 'web';
  const isIpadDevice = isIpad();
  const isPermanentDrawer = isWeb || isIpadDevice;
  
  // Pre-calculate static colors
  const backgroundColor = isDark ? '#0e0e0e' : '#F5F5F5';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)';
  const inactiveColor = isDark 
    ? Platform.OS === 'web' ? '#444' : '#777' 
    : '#999';
  
  // Calculate drawer width only once
  const drawerWidth = useMemo(() => {
    if (isWeb) {
      return typeof window !== 'undefined' ? Math.min(280, window.innerWidth * 0.25) : 280;
    }
    return isIpadDevice ? 250 : 230;
  }, [isWeb, isIpadDevice]);
  
  // Create styles using the optimized function
  const styles = useMemo(() => createDrawerStyles(isDark, primaryColor), [isDark, primaryColor]);
  
  // Memoize icon renderer to prevent recreations
  const renderIcon = useCallback(({ color, route }: { color: string; route: string }) => {
    const icon = DRAWER_ICONS[route];
    if (!icon) return null;
    
    if (icon.type === 'material') {
      return <MaterialIcons name={icon.name as MaterialIconName} size={24} color={color} style={{ marginRight: 4 }} />;
    }
    return <MaterialCommunityIcons name={icon.name as MaterialCommunityIconName} size={24} color={color} style={{ marginRight: 4 }} />;
  }, []);
  
  // Memoize drawer content renderer with minimal dependencies
  const renderDrawerContent = useCallback((props: DrawerContentComponentProps) => (
    <DrawerContent 
      props={props} 
      username={username} 
      profilePicture={profilePicture} 
      styles={styles} 
      isWeb={isWeb} 
    />
  ), [username, profilePicture, styles, isWeb]);
  
  // Memoize drawer options with proper typing
  const drawerScreenOptions = useMemo((): DrawerNavigationOptions => {
    const options: DrawerNavigationOptions = {
      header: ({ route, options }) => (
        <Header title={options.title || route.name} />
      ),
      headerTransparent: true,
      
      drawerStyle: {
        backgroundColor,
        width: drawerWidth,
        borderRightWidth: 1,
        marginTop: 40,
        borderColor,
        ...(isPermanentDrawer ? { zIndex: 20 } : {})
      },
      drawerActiveTintColor: '#fff',
      drawerInactiveTintColor: inactiveColor,
      drawerActiveBackgroundColor: isDark 
        ? `${primaryColor}99` 
        : Platform.OS === 'web' ? primaryColor : `${primaryColor}ee`,
      drawerItemStyle: {
        borderRadius: !isPermanentDrawer ? 8 : 0,
        paddingVertical: 0,
        paddingLeft: 0,
        marginBottom: 10,
        ...(!isPermanentDrawer ? { marginHorizontal: 4 } : {})
      },
      drawerLabelStyle: {
        fontSize: isIpadDevice ? 17 : 16,
        fontWeight: "600" as TextStyle["fontWeight"],
        marginLeft: -8,
      },
      drawerContentStyle: {
        backgroundColor 
      },
      drawerType: isPermanentDrawer ? 'permanent' : 'front',
      overlayColor: isPermanentDrawer ? 'transparent' : 'rgba(0,0,0,0.5)',
      swipeEnabled: !isPermanentDrawer,
      swipeEdgeWidth: 150,
      drawerStatusBarAnimation: 'fade',
      drawerHideStatusBarOnOpen: true,
      keyboardDismissMode: 'on-drag',
    };

    // Add gesture handler props for better performance on non-permanent drawers
    if (!isPermanentDrawer) {
      // These are supported by the Drawer navigator
      options.swipeEnabled = true;
      options.swipeEdgeWidth = 150;
      options.swipeMinDistance = 5; // Corrected property name
    }
    
    return options;
  }, [backgroundColor, drawerWidth, borderColor, isPermanentDrawer, inactiveColor, isDark, primaryColor, isIpadDevice]);

  return (
    <View style={styles.wrapper}>
      <Drawer drawerContent={renderDrawerContent} screenOptions={drawerScreenOptions}>
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
        {__DEV__ && (
          <Drawer.Screen
            name="storage"
            options={{
              title: 'Storage',
              drawerLabel: 'Storage',
              drawerIcon: (props) => renderIcon({ ...props, route: 'storage' })
            }}
          />
        )}
      </Drawer>
    </View>
  );
}