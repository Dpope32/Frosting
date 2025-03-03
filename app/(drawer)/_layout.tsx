import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Header } from '@/components/Header';
import { View, Image, Text, StyleSheet, useColorScheme as RNColorScheme, Platform, Dimensions } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserStore } from '@/store/UserStore';
import { memo, useCallback, useMemo } from 'react';
import Animated from 'react-native-reanimated';

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
        console.log('Detected file URI on web, using fallback');
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

interface IconConfig {
  name: MaterialIconName | MaterialCommunityIconName;
  type: 'material' | 'community';
}

const DRAWER_ICONS: Record<string, IconConfig> = {
  '(tabs)/index': { name: 'castle' as MaterialCommunityIconName, type: 'community' },
  calendar: { name: 'calendar-today' as MaterialIconName, type: 'material' },
  sports: { name: 'sports-baseball' as MaterialIconName, type: 'material' },
  chatbot: { name: 'code' as MaterialIconName, type: 'material' },
  crm: { name: 'person' as MaterialIconName, type: 'material' },
  storage: { name: 'cloud-upload' as MaterialIconName, type: 'material' },
  vault: { name: 'lock' as MaterialIconName, type: 'material' },
  bills: { name: 'attach-money' as MaterialIconName, type: 'material' }
};

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const systemColorScheme = RNColorScheme();
  const { primaryColor, username, profilePicture } = useUserStore(s => s.preferences);

  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? '#1e1e1e' : '#F5F5F5';
  const textColor = isDark ? '#fff' : '#000';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)';
  const inactiveColor = isDark ? '#444' : '#999';
  const isWeb = Platform.OS === 'web';
  // Use fixed width for better performance on mobile
  const { width: screenWidth } = Dimensions.get('window');
  const drawerWidth = isWeb 
    ? typeof window !== 'undefined' ? Math.min(280, window.innerWidth * 0.25) : 280 
    : 250

  const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor
    },
    container: {
      flex: 1
    },
    header: {
      paddingTop: isWeb ? 20: 50,
      paddingBottom: isWeb ? 10: 20,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor
    },
    profileImage: {
      width: isWeb ? 40 : 50,
      height: isWeb ? 40 : 50,
      borderRadius: isWeb ?  20 : 25,
      marginRight: 12
    },
    username: {
      color: textColor,
      fontSize: 18,
      fontWeight: '600'
    },
    content: {
      flex: 1,
      backgroundColor
    },
    scrollView: {
      marginTop: 10
    },
    scrollViewContent: {
      paddingTop: 0
    }
  });

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
        ...(isWeb ? { zIndex: 20 } : {})
      },
      drawerActiveTintColor: '#fff',
      drawerInactiveTintColor: inactiveColor,
      drawerActiveBackgroundColor: isDark ? `${primaryColor}99` : primaryColor,
      drawerItemStyle: {
        borderRadius: 0,
        paddingVertical: 0,
        paddingLeft: 0,
        marginBottom: 10
      },
      drawerLabelStyle: {
        fontSize: 16,
        fontWeight: "600" as const, // Type assertion to match expected fontWeight values
        marginLeft: -8,
      },
      drawerContentStyle: {
        backgroundColor 
      },
      // Use explicit string literals for drawerType
      drawerType: isWeb ? 'permanent' as const : 'front' as const, // 'front' performs better than 'slide'
      overlayColor: isWeb ? 'transparent' : 'rgba(0,0,0,0.5)',
      swipeEnabled: !isWeb,
      swipeEdgeWidth: 50, // Smaller edge width for more precise detection
      drawerStatusBarAnimation: 'fade',
      drawerHideStatusBarOnOpen: true,
      keyboardDismissMode: 'on-drag',
    };

    // Add gesture handler props for better performance
    if (!isWeb) {
      options.gestureHandlerProps = {
        enabled: true,
        activeOffsetX: [-20, 20],
        failOffsetY: [-20, 20],
        velocityThreshold: 0.3,
      };
      
      // Add additional optimizations for mobile
      options.sceneContainerStyle = {
        transform: [{ translateX: 0 }], // Force hardware acceleration
      };
      
      options.minSwipeDistance = 5;
    }
    
    return options;
  }, [backgroundColor, drawerWidth, borderColor, isWeb, inactiveColor, isDark, primaryColor]);

  return (
    <View style={styles.wrapper}>
      <Drawer
        drawerContent={renderDrawerContent}
        screenOptions={drawerScreenOptions}
      >
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
          name="sports"
          options={{
            title: 'Sports',
            drawerLabel: 'Sports',
            drawerIcon: (props) => renderIcon({ ...props, route: 'sports' })
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
          name="storage"
          options={{
            title: 'Storage',
            drawerLabel: 'Storage',
            drawerIcon: (props) => renderIcon({ ...props, route: 'storage' })
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
