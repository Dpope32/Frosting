import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ModalLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        },
        headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Modal',
        }}
      />
    </Stack>
  );
}
