import React  from "react";
import {  View,  Alert, Platform } from "react-native";
import { Button } from "tamagui";
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePeopleStore } from "@/store/People";
import { generateTestContacts } from "@/components/crm/testContacts";
import { handleDebugPress } from "@/services";

export const DevButtons = () => {
  return (
    <View style={{ position: 'absolute', bottom: 32, left: 24, zIndex: 1000, flexDirection: 'row', gap: 12 }}>
      <Button
        size="$4"
        circular
        backgroundColor="#666666"
        pressStyle={{ scale: 0.95 }}
        animation="quick"
        elevation={4}
        onPress={handleDebugPress}
        icon={<MaterialIcons name="bug-report" size={24} color="white" />}
        />
        <Button
        size="$4"
        circular
        backgroundColor="#ff6b6b"
        pressStyle={{ scale: 0.95 }}
        animation="quick"
        elevation={4}
        onPress={generateTestContacts}
        icon={<FontAwesome5 name="database" size={20} color="white" />}
        />
        <Button
        size="$4"
        circular
        backgroundColor="#e74c3c"
        pressStyle={{ scale: 0.95 }}
        animation="quick"
        elevation={4}
        onPress={() => {
            if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to clear all contacts? This cannot be undone.')) {
                usePeopleStore.getState().clearContacts();
            }
            } else {
            Alert.alert(
                'Clear All Contacts',
                'Are you sure you want to clear all contacts? This cannot be undone.',
                [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: () => {
                    usePeopleStore.getState().clearContacts();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                }
                ]
            );
            }
        }}
        icon={<MaterialIcons name="clear-all" size={24} color="white" />}
        />
    </View>
  );
};
