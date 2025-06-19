import React, { useCallback, useState } from 'react'
import { Alert } from 'react-native' 
import { StorageUtils } from '@/store/AsyncStorage'
import { router } from 'expo-router';
import { Button, XStack, Text, isWeb } from 'tamagui';
import { useUserStore, useToastStore, useBillStore, usePeopleStore, useNoteStore } from '@/store'
import { useProjectStore } from '@/store/ToDo'
import type { Settings } from './utils'

export const SettingsModalFooter = ({
  onOpenChange,
  settings,
}: {
  onOpenChange: (open: boolean) => void;
  settings: Settings;
}) => {
    
    const setPreferences = useUserStore(state => state.setPreferences);
    const { showToast } = useToastStore();
    const [isSigningOut, setIsSigningOut] = useState(false);
    
    const handleSave = useCallback(() => {
        setPreferences({ ...settings });
        onOpenChange(false);
        showToast("Settings saved successfully", "success");
      }, [settings, setPreferences, onOpenChange, showToast])
  
  return (
    <XStack width="100%" px="$0" py="$2" justifyContent="space-between">
      <Button
        backgroundColor="transparent" borderColor={'$red10'} height={40} paddingHorizontal={20} pressStyle={{ opacity: 0.8 }}
        disabled={isSigningOut}
        onPress={async () => {
            const message = "Are you sure you want to reset all your data? This cannot be undone..."
            const shouldReset = isWeb
            ? window.confirm(message)
            : await new Promise(resolve => {
                Alert.alert(
                "Confirm Reset",
                message,
                [
                    { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                    { text: "Reset", style: "destructive", onPress: () => resolve(true) },
                ],
                { cancelable: false }
                )
            });
        
            if (shouldReset) {
            setIsSigningOut(true);
            try {
                useBillStore.getState().clearBills();
                useProjectStore.getState().clearTasks();
                usePeopleStore.getState().clearContacts();
                useUserStore.getState().clearPreferences();
                useNoteStore.getState().clearNotes();
                await StorageUtils.clear();
                setTimeout(() => {
                  if (isWeb) {
                    window.location.href = '/';
                  } else {
                    router.replace('/screens/onboarding');
                  }
                }, 300);
            } catch (error) {
                console.error("[SignOut] Error during sign out:", error);
                Alert.alert("Error", "Failed to sign out. Please try again.");
                setIsSigningOut(false);
            }
            }
        }}
        >
            <Text color="$red10" fontWeight="bold" fontFamily="$body" fontSize={14}>
            Sign Out
            </Text>
        </Button>
        <Button
            backgroundColor={settings.primaryColor}
            height={40}
            paddingHorizontal={20}
            pressStyle={{ opacity: 0.8 }}
            onPress={handleSave}
            disabled={isSigningOut}
        >
            <Text color="#fff" fontWeight="500" fontSize={14} fontFamily="$body">
            Save
            </Text>
        </Button>
    </XStack>
  );
};
