import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function DrawerLayout() {
  const colorScheme = useColorScheme();

  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        },
        headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        drawerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        },
        drawerActiveTintColor: '#2196F3',
        drawerInactiveTintColor: colorScheme === 'dark' ? '#fff' : '#000',
      }}>
      <Drawer.Screen
        name="index"
        options={{
          title: 'Drawer Home',
          drawerLabel: 'Home',
        }}
      />
    </Drawer>
  );
}
