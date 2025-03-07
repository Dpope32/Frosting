import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Header } from '@/components/Header';
import { View, Image, Text, StyleSheet, useColorScheme as RNColorScheme, Platform, Dimensions } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserStore } from '@/store/UserStore';
import { memo, useCallback, useMemo } from 'react';
import { useDrawerStyles } from '../../components/shared/styles';

// Helper function to detect if device is iPad
const isIpad = () => {
  const { width, height } = Dimensions.get('window');
  return (
    Platform.OS === 'ios' &&
    Math.min(width, height) >= 768 &&
    Math.max(width, height) >= 1024
  );
};

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
  chatbot: { name: 'code' as MaterialIconName, type: 'material' },
  crm: { name: 'person' as MaterialIconName, type: 'material' },
  storage: { name: 'cloud-upload' as MaterialIconName, type: 'material' },
  vault: { name: 'lock' as MaterialIconName, type: 'material' },
  bills: { name: 'attach-money' as MaterialIconName, type: 'material' },
  'notifications-test': { name: 'notifications' as MaterialIconName, type: 'material' }
};

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const systemColorScheme = RNColorScheme();
  const { primaryColor, username, profilePicture } = useUserStore(s => s.preferences);
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? '#0e0e0e' : '#F5F5F5';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)';
  
  // Brighter inactive color for dark mode on mobile
  const inactiveColor = isDark 
    ? Platform.OS === 'web' ? '#444' : '#777' 
    : '#999';
  
  const isWeb = Platform.OS === 'web';
  const isIpadDevice = isIpad();
  const isPermanentDrawer = isWeb || isIpadDevice;
  
  const styles = useDrawerStyles();
  
  // Get device dimensions for responsive sizing
  const { width: deviceWidth } = Dimensions.get('window');
  
  // Drawer width calculation
  // Web: 25% of window width (min 280px, max window width)
  // iPad: Fixed 280px (increased from standard)
  // Mobile: Standard 250px
  const drawerWidth = isWeb 
    ? typeof window !== 'undefined' ? Math.min(280, window.innerWidth * 0.25) : 280
    : isIpadDevice
      ? 250 
      : 250;

  const renderDrawerContent = useCallback((props: DrawerContentComponentProps) => (
    <DrawerContent props={props} username={username} profilePicture={profilePicture} styles={styles} isWeb={isWeb} />
  ), [username, profilePicture, styles, isWeb]);

  const renderIcon = useCallback(({ color, route }: { color: string; route: string }) => {
    const icon = DRAWER_ICONS[route];
    if (icon.type === 'material') {
      return <MaterialIcons name={icon.name as MaterialIconName} size={24} color={color} style={{ marginRight: 4 }} />;
    }
    return <MaterialCommunityIcons name={icon.name as MaterialCommunityIconName} size={24} color={color} style={{ marginRight: 4 }} />;
  }, []);

  // Memoize drawer options for better performance
  const drawerScreenOptions = useMemo(() => {
    // Explicitly type the options to ensure compatibility
    const options: any = {
      header: ({ route, options }: { route: any; options: any }) => (
        <Header title={options.title || route.name} />
      ),
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
      // Adjust active background color for better contrast in light mode on mobile
      drawerActiveBackgroundColor: isDark 
        ? `${primaryColor}99` 
        : Platform.OS === 'web' ? primaryColor : `${primaryColor}ee`,
      drawerItemStyle: {
        // Add border radius to selected tab on mobile
        borderRadius: !isPermanentDrawer ? 8 : 0,
        paddingVertical: 0,
        paddingLeft: 0,
        marginBottom: 10,
        // Add horizontal margin on mobile for better appearance
        ...(!isPermanentDrawer ? { marginHorizontal: 4 } : {})
      },
      drawerLabelStyle: {
        fontSize: isIpadDevice ? 17 : 16, // Slightly larger font for iPad
        fontWeight: "600" as const,
        marginLeft: -8,
      },
      drawerContentStyle: {
        backgroundColor 
      },
      // Use explicit string literals for drawerType
      drawerType: isPermanentDrawer ? 'permanent' as const : 'front' as const,
      overlayColor: isPermanentDrawer ? 'transparent' : 'rgba(0,0,0,0.5)',
      swipeEnabled: !isPermanentDrawer,
      swipeEdgeWidth: 150,
      drawerStatusBarAnimation: 'fade',
      drawerHideStatusBarOnOpen: true,
      keyboardDismissMode: 'on-drag',
    };

    // Add gesture handler props for better performance
    if (!isPermanentDrawer) {
      options.gestureHandlerProps = {
        enabled: true,
        activeOffsetX: [-20, 20],
        failOffsetY: [-20, 20],
        velocityThreshold: 0.3,
      };
      
      // Add additional optimizations for mobile
      options.sceneContainerStyle = {
        transform: [{ translateX: 0 }],
      };
      
      options.minSwipeDistance = 5;
    }
    
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
      
      {/* Only show notifications test screen in development mode */}
      {__DEV__ && (
        <Drawer.Screen
          name="notifications-test"
          options={{
            title: 'Notification Tests',
            drawerLabel: 'Notification Tests',
            drawerIcon: (props) => renderIcon({ ...props, route: 'notifications-test' })
          }}
        />
      )}
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