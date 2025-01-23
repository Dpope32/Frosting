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
              paddingTop: 60,
              paddingBottom: 20,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255, 255, 255, 0.1)',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(30, 30, 30, 0.8)',
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
              backgroundColor: 'rgba(30, 30, 30, 0.8)',
              paddingTop: 20,
            }}>
              <DrawerContentScrollView {...props}>
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
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
            overflow: 'hidden',
          },
          drawerActiveTintColor: primaryColor,
          drawerInactiveTintColor: '#fff',
          drawerActiveBackgroundColor: `${primaryColor}20`,
          drawerItemStyle: {
            borderRadius: 12,
            marginHorizontal: 2,
            marginVertical: 4,
            padding: 4,
          },
          drawerLabelStyle: {
            fontSize: 16,
            fontWeight: '600',
            marginLeft: -16,
          },
          drawerContentStyle: {
            paddingTop: 0,
            backgroundColor: 'rgba(30, 30, 30, 0.8)',
          },
          drawerType: 'slide',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: 'Home',
            drawerLabel: 'Home',
            drawerIcon: ({ color }) => (
              <MaterialIcons name="home" size={24} color={color} style={{ marginRight: 20 }} />
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
          name="(tabs)"
          options={{
            title: 'Home',
            drawerLabel: 'Home',
            drawerItemStyle: { display: 'none' }
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
