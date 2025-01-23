import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Header } from '@/components/Header';
import { View } from 'react-native';

export default function DrawerLayout() {
  console.log('[DrawerLayout] Rendering drawer layout');
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

        }}>
        <Drawer.Screen
          name="index"
          options={{
            title: ' ',
            drawerLabel: 'Home',
          }}
        />
      </Drawer>
    </View>
  );
}
