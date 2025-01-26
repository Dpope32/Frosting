import { View, Button } from 'react-native';
import { StorageUtils } from '@/store/MMKV';
import { useUserStore } from '@/store/UserStore';
import { router } from 'expo-router';

export default function ResetScreen() {
  const clearPreferences = useUserStore(state => state.clearPreferences);
  
  const handleReset = () => {
   // console.log('[Reset] Clearing all storage and preferences');
    StorageUtils.clear();
    clearPreferences();
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Reset App State" onPress={handleReset} />
    </View>
  );
}
