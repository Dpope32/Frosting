import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Header } from '@/components/Header';
import { View, Image, Text, StyleSheet, useColorScheme as RNColorScheme } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserStore } from '@/store/UserStore';
import { memo, useCallback } from 'react';

const DrawerContent = memo(({ props, username, profilePicture, styles }: { 
  props: DrawerContentComponentProps; 
  username: string | undefined;
  profilePicture: string | undefined | null;
  styles: any;
}) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Image 
        source={profilePicture ? { uri: profilePicture } : require('@/assets/images/adaptive-icon.png')}
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
));

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
  const backgroundColor = isDark ? '#121212' : '#F5F5F5';
  const textColor = isDark ? '#fff' : '#000';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)';
  const inactiveColor = isDark ? '#444' : '#999';

  const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor
    },
    container: {
      flex: 1
    },
    header: {
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor
    },
    profileImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
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
    <DrawerContent props={props} username={username} profilePicture={profilePicture} styles={styles} />
  ), [username, profilePicture, styles]);

  // Single unified icon renderer with proper typing
  const renderIcon = useCallback(({ color, route }: { color: string; route: string }) => {
    const icon = DRAWER_ICONS[route];
    if (icon.type === 'material') {
      return <MaterialIcons name={icon.name as MaterialIconName} size={24} color={color} style={{ marginRight: 4 }} />;
    }
    return <MaterialCommunityIcons name={icon.name as MaterialCommunityIconName} size={24} color={color} style={{ marginRight: 4 }} />;
  }, []);

  return (
    <View style={styles.wrapper}>
      <Drawer
        drawerContent={renderDrawerContent}
        screenOptions={{
          header: ({ route, options }) => (
            <Header title={options.title || route.name} />
          ),
          headerTransparent: true,
          drawerStyle: {
            backgroundColor,
            width: '60%', 
            borderRightWidth: 1,
            borderColor
          },
          drawerActiveTintColor: '#fff',
          drawerInactiveTintColor: inactiveColor,
          drawerActiveBackgroundColor: isDark ? `${primaryColor}99` : primaryColor,
          drawerItemStyle: {
            borderRadius: 2,
            paddingVertical: 6,
          },
          drawerLabelStyle: {
            fontSize: 16,
            fontWeight: '600',
            marginLeft: -10 
          },
          drawerContentStyle: {
            backgroundColor 
          },
          drawerType: 'front',  
          overlayColor: '#00000099',
          swipeEnabled: true,
          swipeEdgeWidth: 100,
          drawerStatusBarAnimation: 'none',
          drawerHideStatusBarOnOpen: true,
          keyboardDismissMode: 'on-drag'
        }}
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
          name="chatbot"
          options={{
            title: 'Chatbot',
            drawerLabel: 'Chatbot',
            drawerIcon: (props) => renderIcon({ ...props, route: 'chatbot' })
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
            title: 'Password Vault',
            drawerLabel: 'Password Vault',
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
