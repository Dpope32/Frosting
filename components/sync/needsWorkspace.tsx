import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, YStack, XStack, isWeb } from 'tamagui';

import { useUserStore } from '@/store/UserStore';
import { Ionicons } from '@expo/vector-icons';

interface NeedsWorkspaceProps {
  isDark: boolean;
  width?: number;
  onPressCreate?: () => void;
}

export default function NeedsWorkspace({ isDark, width, onPressCreate }: NeedsWorkspaceProps) {
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);

  return (
    <YStack alignItems="center" justifyContent="center" width={width || '100%'}>
      <View style={[styles.noWorkspaceContainer, width ? { width } : undefined]}>
        <Text 
            fontSize={isWeb ? 16 : 14} 
            fontWeight="500" 
            color={isDark ? "#fff" : "#000"}
            textAlign="center"
 >
            Your device is not connected to a workspace
        </Text>
        <TouchableOpacity 
            style={[styles.addWorkspaceButton, { backgroundColor: 'transparent' }]}
            onPress={onPressCreate}
        >
            <XStack alignItems="center" justifyContent="center" gap={8}>
            <Ionicons name="add-circle-outline" size={20} color={primaryColor} />
            <Text color={primaryColor} fontWeight="600">Create or Join Workspace</Text>
            </XStack>
        </TouchableOpacity>
        </View>
    </YStack>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginBottom: 100,
    },
    noWorkspaceContainer: {
      width: '100%',
      padding: 10,
      borderRadius: 12,
      marginBottom: 0,
      alignItems: 'center',
    },
    addWorkspaceButton: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
  