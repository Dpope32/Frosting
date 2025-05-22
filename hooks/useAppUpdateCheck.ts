// File: hooks/useAppUpdateCheck.ts
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as Updates from 'expo-updates';

export function useAppUpdateCheck(enabled: boolean) {
  useEffect(() => {
    if (!enabled || __DEV__) return;

    const checkAndApply = async () => {
      try {
        if (Updates.isEmergencyLaunch) {
          if (Platform.OS !== 'web') {
            Alert.alert('Running in Emergency Mode', 'Some features may be limited.', [{ text: 'OK' }]);
          }
          return;
        }

        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          if (Platform.OS !== 'web') {
            Alert.alert('Update Available', 'Restart to apply?', [
              { text: 'Later', style: 'cancel' },
              { text: 'Restart', onPress: () => Updates.reloadAsync() }
            ]);
          } else if (window.confirm('Update available. Reload to apply?')) {
            Updates.reloadAsync();
          }
        }
      } catch (err) {
        console.error('Update check failed:', err);
      }
    };

    // initial + periodic
    setTimeout(checkAndApply, 2500);
    const iv = setInterval(checkAndApply, 30000);
    return () => clearInterval(iv);
  }, [enabled]);
}