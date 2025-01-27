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
              <MaterialCommunityIcons name="sphere" size={24} color={color} style={{ marginRight: 20 }} />
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
          name="thunder"
          options={{
            title: 'Thunder',
            drawerLabel: 'Thunder',
            drawerIcon: ({ color }) => (
              <MaterialIcons name="flash-on" size={24} color={color} style={{ marginRight: 20 }} />
            ),
          }}
        />
        <Drawer.Screen
          name="ou"
          options={{
            title: 'OU',
            drawerLabel: 'OU',
            drawerIcon: ({ color }) => (
              <MaterialCommunityIcons name="football" size={24} color={color} style={{ marginRight: 20 }} />
            ),
          }}
        />
        <Drawer.Screen
          name="ai"
          options={{
            title: 'Chatbot',
            drawerLabel: 'Chatbot',
            drawerIcon: ({ color }) => (
              <MaterialIcons name="anchor" size={24} color={color} style={{ marginRight: 20 }} />
            ),
          }}
        />
         <Drawer.Screen
          name="cloud"
          options={{
            title: 'Cloud',
            drawerLabel: 'Cloud',
            drawerIcon: ({ color }) => (
              <MaterialIcons name="cloud" size={24} color={color} style={{ marginRight: 20 }} />
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
