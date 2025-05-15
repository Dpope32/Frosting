import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, YStack, XStack, isWeb } from 'tamagui';

import { useUserStore } from '@/store/UserStore';
import { Ionicons } from '@expo/vector-icons';
import { baseSpacing } from './sharedStyles';

interface NeedsWorkspaceProps {
  isDark: boolean;
  width?: number;
  onPressCreate?: () => void;
  onPressJoin?: () => void;
}

export default function NeedsWorkspace({ isDark, width, onPressCreate, onPressJoin }: NeedsWorkspaceProps) {
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);

  return (
    <YStack alignItems="center" justifyContent="center" marginTop={-baseSpacing * 1.5} width={width || '100%'}>
      <View style={[styles.noWorkspaceContainer, width ? { width } : undefined]}>
        <Text 
            fontSize={isWeb ? 16 : 14} 
            fontWeight="500" 
            color={isDark ? "#fff" : "#000"}
            textAlign="center"
        >
            Your device is not connected to a workspace
        </Text>
        <XStack alignItems="center" justifyContent="center" gap={12} marginTop={8}>
          <TouchableOpacity 
              style={[styles.workspaceButton, { borderColor: primaryColor }]}
              onPress={onPressCreate}
          >
              <XStack alignItems="center" justifyContent="center" gap={4}>
                <Text color={primaryColor} fontWeight="600">Create Workspace</Text>
              </XStack>
          </TouchableOpacity>
          
          <TouchableOpacity 
              style={styles.workspaceButton}
              onPress={onPressJoin}
          >
              <XStack alignItems="center" justifyContent="center" gap={4}>
                <Text color={primaryColor} fontWeight="600">Join Workspace</Text>
              </XStack>
          </TouchableOpacity>
        </XStack>
      </View>
    </YStack>
  )
}

const styles = StyleSheet.create({
    noWorkspaceContainer: {
      width: '100%',
      padding: 10,
      borderRadius: 12,
      marginBottom: 0,
      alignItems: 'center',
    },
    workspaceButton: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(150, 150, 150, 0.3)',
      backgroundColor: 'transparent',
    },
  });
  