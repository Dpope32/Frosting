import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, YStack, XStack, isWeb } from 'tamagui';
import { useUserStore } from '@/store';
import { baseSpacing, cardRadius, getColors } from './sharedStyles';
import { isIpad } from '@/utils/deviceUtils';

interface NeedsWorkspaceProps {
  isDark: boolean;
  width?: number;
  onPressCreate?: () => void;
  onPressJoin?: () => void;
}

export default function NeedsWorkspace({ isDark, width, onPressCreate, onPressJoin }: NeedsWorkspaceProps) {
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const colors = getColors(isDark, primaryColor);
  return (
    <View style={{
      width: width,
      backgroundColor: colors.card,
      borderRadius: cardRadius, 
      borderWidth: 1,
      borderColor: colors.border,
      paddingTop: baseSpacing * 1.5,
      paddingBottom: baseSpacing,
      maxHeight: 450,
      alignSelf: 'center',
    }}>
    <YStack alignItems="center" justifyContent="space-between" marginTop={-baseSpacing} width={width || '100%'}>
      <View style={[styles.noWorkspaceContainer, width ? { width } : undefined]}>
        <Text 
            fontSize={isWeb ? 16 : 15} 
            fontWeight="500" 
            color={isDark ? "#fff" : "#000"}
            fontFamily="$body"
            textAlign="center"
        >
            You're not connected to a workspace!
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
                <Text color={isDark ? "#f9f9f9" : primaryColor} fontWeight="600" fontFamily="$body">Join</Text>
              </XStack>
          </TouchableOpacity>
        </XStack>
      </View>
    </YStack>
    </View>
  )
}

const styles = StyleSheet.create({
    noWorkspaceContainer: {
      width: '100%',
      padding: isIpad() ? 12 : 8,
      borderRadius: 12,
      alignItems: 'center',
    },
    workspaceButton1: {
      paddingHorizontal: isWeb ? 70 : isIpad() ? 50 : 40,
      paddingVertical: isWeb ? 12 : isIpad() ? 10 : 8,
      marginTop: isWeb ? 12 : isIpad() ? 10 : 2,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(150, 150, 150, 0.3)',
      backgroundColor: 'transparent',
      marginRight: isWeb ? 12 : isIpad() ? 10 : 6,
    },
    workspaceButton2: {
      paddingHorizontal: isWeb ? 70 : isIpad() ? 50 : 40,
      paddingVertical: isWeb ? 12 : isIpad() ? 10 : 8 ,
      marginTop: isWeb ? 12 : isIpad() ? 10 : 2,
      borderWidth: 1,
      borderColor: 'rgba(150, 150, 150, 0.3)',
      borderRadius: 8,
      marginLeft: isWeb ? 12 : isIpad() ? 10 : 6,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  });
  