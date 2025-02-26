import { View, Button } from 'react-native';
import { StorageUtils } from '@/store/AsyncStorage';
import { useUserStore } from '@/store/UserStore';
import { router } from 'expo-router';

export default function ResetScreen() {
  const clearPreferences = useUserStore(state => state.clearPreferences);
  
  const handleReset = async () => {
    // Need to await the async clear operation
    await StorageUtils.clear();
    clearPreferences();
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Reset App State" onPress={handleReset} />
    </View>
  );
}