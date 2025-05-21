import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, YStack, XStack, isWeb } from 'tamagui';

import { useUserStore } from '@/store';
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
    <YStack alignItems="center" justifyContent="space-between" marginTop={-baseSpacing * 1.5} width={width || '100%'}>
      <View style={[styles.noWorkspaceContainer, width ? { width } : undefined]}>
        <Text 
            fontSize={isWeb ? 16 : 15} 
            fontWeight="500" 
            color={isDark ? "#fff" : "#000"}
            fontFamily="$body"
            textAlign="center"
        >
            Your device is not connected to a workspace!
        </Text>
        <XStack alignItems="center" justifyContent="center" gap={12} marginTop={8}>
          <TouchableOpacity 
              style={[styles.workspaceButton1, { borderColor: primaryColor }]}
              onPress={onPressCreate}
          >
              <XStack alignItems="center" justifyContent="center" gap={4}>
                <Text color={primaryColor} fontWeight="600" fontFamily="$body">Create</Text>
              </XStack>
          </TouchableOpacity>
          
          <TouchableOpacity 
              style={styles.workspaceButton2}
              onPress={onPressJoin}
          >
              <XStack alignItems="center" justifyContent="center" gap={4}>
                <Text color={"#fff"} fontWeight="600" fontFamily="$body">Join</Text>
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
      padding: 12,
      borderRadius: 12,
      marginBottom: 10,
      alignItems: 'center',
    },
    workspaceButton1: {
      paddingHorizontal: 60,
      paddingVertical: 12,
      marginTop: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(150, 150, 150, 0.3)',
      backgroundColor: 'transparent',
    },
    workspaceButton2: {
      paddingHorizontal: 50,
      paddingVertical: 12,
      marginTop: 10,
      borderRadius: 8,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  });
  