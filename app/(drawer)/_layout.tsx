import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Header } from '@/components/Header';
import { View } from 'react-native';

export default function DrawerLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          header: ({ route, options }) => (
            <Header title={options.title || route.name} />
          ),
          headerTransparent: true,
          drawerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#1e1e1e',
            width: '70%',
          },
          drawerActiveTintColor: '#2196F3',
          drawerInactiveTintColor: colorScheme === 'dark' ? '#fff' : '#fff',
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: 'Home',
            drawerLabel: 'Home',
          }}
        />
        <Drawer.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            drawerLabel: 'Calendar',
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
    </View>
  );
}
