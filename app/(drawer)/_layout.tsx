import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Header } from '@/components/Header';
import { View, Image, Text } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserStore } from '@/store/UserStore';
import { BlurView } from 'expo-blur';

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const { primaryColor, username, profilePicture } = useUserStore(s => s.preferences);

  return (
    <View style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props: DrawerContentComponentProps) => (
          <View style={{ flex: 1 }}>
            <View style={{ 
              paddingTop: 50,
              paddingBottom: 20,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255, 255, 255, 0.1)',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(30, 30, 30, 0.95)',
            }}>
              <Image 
                source={profilePicture ? { uri: profilePicture } : require('@/assets/images/adaptive-icon.png')}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  marginRight: 12,
                }}
              />
              <Text style={{ 
                color: '#fff',
                fontSize: 18,
                fontWeight: '600',
              }}>
                {username || 'User'}
              </Text>
            </View>
            <View style={{ 
              flex: 1,
              backgroundColor: 'rgba(30, 30, 30, 0.925)',
            }}>
              <DrawerContentScrollView 
                {...props}
                contentContainerStyle={{
                  paddingTop: 0
                }}
                style={{
                  marginTop: 10
                }}
              >
                <DrawerItemList {...props} />
              </DrawerContentScrollView>
            </View>
          </View>
        )}
        screenOptions={{
          header: ({ route, options }) => (
            <Header title={options.title || route.name} />
          ),
          headerTransparent: true,
          drawerStyle: {
            backgroundColor: 'transparent',
            width: '60%',
            overflow: 'hidden',
          },
          drawerActiveTintColor: '#fff',
          drawerInactiveTintColor:'rgba(255, 255, 255, 0.5)',
          drawerActiveBackgroundColor: `${primaryColor}20`,
          drawerItemStyle: {
            borderRadius: 12,
            padding: 4,
          },
          drawerLabelStyle: {
            fontSize: 16,
            fontWeight: '600',
            marginLeft: -20,
          },
          drawerContentStyle: {
            backgroundColor: 'rgba(30, 30, 30, 0.8)',
          },
          drawerType: 'slide',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
        }}
      >
        <Drawer.Screen
          name="(tabs)/index"
          options={{
            title: 'Home',
            drawerLabel: 'Home',
            drawerIcon: ({ color }) => (
              <MaterialCommunityIcons name="castle" size={24} color={color} style={{ marginRight: 20 }} />
            ),
          }}
        />
        <Drawer.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            drawerLabel: 'Calendar',
            drawerIcon: ({ color }) => (
              <MaterialIcons name="calendar-today" size={24} color={color} style={{ marginRight: 20 }} />
            ),
          }}
        />
        <Drawer.Screen
          name="sports"
          options={{
            title: 'Sports',
            drawerLabel: 'Sports',
            drawerIcon: ({ color }) => (
              <MaterialIcons name="sports-baseball" size={24} color={color} style={{ marginRight: 20 }} />
            ),
          }}
        />
        <Drawer.Screen
          name="chatbot"
          options={{
            title: ' ',
            drawerLabel: 'Chatbot',
            drawerIcon: ({ color }) => (
              <MaterialIcons name="code" size={24} color={color} style={{ marginRight: 20 }} />
            ),
          }}
        />
       <Drawer.Screen
          name="crm"
          options={{
            title: 'CRM',
            drawerLabel: 'CRM',
            drawerIcon: ({ color }) => (
              <MaterialIcons name="person" size={24} color={color} style={{ marginRight: 20 }} />
            ),
          }}
        />
       <Drawer.Screen
          name="storage"
          options={{
            title: 'Storage',
            drawerLabel: 'Storage',
            drawerIcon: ({ color }) => (
              <MaterialIcons name="person" size={24} color={color} style={{ marginRight: 20 }} />
            ),
          }}
        />
        <Drawer.Screen
          name="vault"
          options={{
            title: 'Vault',
            drawerLabel: 'Vault',
            drawerIcon: ({ color }) => (
              <MaterialIcons name="lock" size={24} color={color} style={{ marginRight: 20 }} />
            ),
          }}
        />
       <Drawer.Screen
          name="spotify"
          options={{
            title: 'Spotify',
            drawerLabel: 'Spotify',
            drawerIcon: ({ color }) => (
              <MaterialIcons name="person" size={24} color={color} style={{ marginRight: 20 }} />
            ),
          }}
        />        
      </Drawer>
      <BlurView 
        intensity={20}
        style={{
          position: 'absolute',
          width: '60%',
          height: '100%',
          zIndex: -1,
        }}
      />
    </View>
  );
}