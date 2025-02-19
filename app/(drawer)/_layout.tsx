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

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const systemColorScheme = RNColorScheme();
  const { primaryColor, username, profilePicture } = useUserStore(s => s.preferences);

  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? '#1A1A1A' : '#F5F5F5';
  const textColor = isDark ? '#fff' : '#000';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const inactiveColor = isDark ? '#666' : '#999';

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

  const renderHomeIcon = useCallback(({ color }: { color: string }) => (
    <MaterialCommunityIcons name="castle" size={24} color={color} style={{ marginRight: 16 }} />
  ), []);

  const renderCalendarIcon = useCallback(({ color }: { color: string }) => (
    <MaterialIcons name="calendar-today" size={24} color={color} style={{ marginRight: 16 }} />
  ), []);

  const renderSportsIcon = useCallback(({ color }: { color: string }) => (
    <MaterialIcons name="sports-baseball" size={24} color={color} style={{ marginRight: 16 }} />
  ), []);

  const renderChatbotIcon = useCallback(({ color }: { color: string }) => (
    <MaterialIcons name="code" size={24} color={color} style={{ marginRight: 16 }} />
  ), []);

  const renderCRMIcon = useCallback(({ color }: { color: string }) => (
    <MaterialIcons name="person" size={24} color={color} style={{ marginRight: 16 }} />
  ), []);

  const renderStorageIcon = useCallback(({ color }: { color: string }) => (
    <MaterialIcons name="cloud-upload" size={24} color={color} style={{ marginRight: 16 }} />
  ), []);

  const renderVaultIcon = useCallback(({ color }: { color: string }) => (
    <MaterialIcons name="lock" size={24} color={color} style={{ marginRight: 16 }} />
  ), []);

  const renderBillsIcon = useCallback(({ color }: { color: string }) => (
    <MaterialIcons name="attach-money" size={24} color={color} style={{ marginRight: 16 }} />
  ), []);

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
            width: '65%',
            borderRightWidth: 1,
            borderColor
          },
          drawerActiveTintColor: '#fff', // Always use white text for active items since they have colored background
          drawerInactiveTintColor: inactiveColor,
          drawerActiveBackgroundColor: primaryColor,
          drawerItemStyle: {
            borderRadius: 12,
            padding: 4,
            marginHorizontal: 4
          },
          drawerLabelStyle: {
            fontSize: 16,
            fontWeight: '600',
            marginLeft: -16
          },
          drawerContentStyle: {
            backgroundColor
          },
          drawerType: 'front',  // Changed to front for better performance
          overlayColor: '#00000099',
          swipeEnabled: true,
          swipeEdgeWidth: 100,
          drawerStatusBarAnimation: 'slide',
          drawerHideStatusBarOnOpen: true,
          keyboardDismissMode: 'on-drag'
        }}
      >
        <Drawer.Screen
          name="(tabs)/index"
          options={{
            title: 'Home',
            drawerLabel: 'Home',
            drawerIcon: renderHomeIcon
          }}
        />
        <Drawer.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            drawerLabel: 'Calendar',
            drawerIcon: renderCalendarIcon
          }}
        />
        <Drawer.Screen
          name="sports"
          options={{
            title: 'Sports',
            drawerLabel: 'Sports',
            drawerIcon: renderSportsIcon
          }}
        />
        <Drawer.Screen
          name="chatbot"
          options={{
            title: 'Chatbot',
            drawerLabel: 'Chatbot',
            drawerIcon: renderChatbotIcon
          }}
        />
        <Drawer.Screen
          name="crm"
          options={{
            title: 'CRM',
            drawerLabel: 'CRM',
            drawerIcon: renderCRMIcon
          }}
        />
        <Drawer.Screen
          name="storage"
          options={{
            title: 'Storage',
            drawerLabel: 'Storage',
            drawerIcon: renderStorageIcon
          }}
        />
        <Drawer.Screen
          name="vault"
          options={{
            title: 'Password Vault',
            drawerLabel: 'Password Vault',
            drawerIcon: renderVaultIcon
          }}
        />
        <Drawer.Screen
          name="bills"
          options={{
            title: 'Bills',
            drawerLabel: 'Bills',
            drawerIcon: renderBillsIcon
          }}
        />
      </Drawer>
    </View>
  );
}
