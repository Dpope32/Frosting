// components/sync/SnapshotSize.tsx
import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, YStack, XStack, isWeb } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { useSnapshotSize } from '@/hooks/sync/useSnapshotSize';
import { baseSpacing, cardRadius, fontSizes, getColors } from '@/components/sync/sharedStyles';
import { isIpad } from '@/utils/deviceUtils';

interface SnapshotSizeProps {
  contentWidth: number;
  isDark: boolean;
  primaryColor: string;
  workspaceId?: string;
}

export const SnapshotSize: React.FC<SnapshotSizeProps> = ({
  contentWidth,
  isDark,
  primaryColor,
  workspaceId,
}) => {
  const colors = getColors(isDark, primaryColor);
  const { data, isLoading, error, refetch } = useSnapshotSize(workspaceId);

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return '#00C851'; // Green
    if (percentage < 80) return '#FF8800'; // Orange  
    return '#FF4444'; // Red
  };

  const getStorageMessage = (percentage: number) => {
    if (percentage < 20) return 'No where near full!';
    if (percentage < 50) return 'Slow down there tiger!';
    if (percentage < 80) return 'Consider cleaning up old data!';
    if (percentage < 95) return 'Storage almost full!';
    return 'Storage limit reached!';
  };

  if (error) {
    return (
      <View style={{
        width: contentWidth,
        backgroundColor: colors.card,
        borderRadius: cardRadius,
        borderWidth: 1,
        borderColor: colors.border,
        padding: baseSpacing * 2,
        alignSelf: 'center',
      }}>
        <XStack alignItems="center" justifyContent="space-between">
          <XStack alignItems="center" gap={baseSpacing}>
            <MaterialIcons name="error-outline" size={20} color={colors.error} />
            <Text fontSize={fontSizes.sm} color={colors.error} fontFamily="$body">
              {error}
            </Text>
          </XStack>
          <TouchableOpacity onPress={refetch}>
            <MaterialIcons name="refresh" size={20} color={colors.accent} />
          </TouchableOpacity>
        </XStack>
      </View>
    );
  }

  return (
    <View style={{
      width: contentWidth,
      backgroundColor: colors.card,
      borderRadius: cardRadius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: baseSpacing * 2,
      alignSelf: 'center',
    }}>
      <XStack alignItems="center" justifyContent="space-between" marginBottom={baseSpacing}>
        <XStack alignItems="center" gap={baseSpacing}>
          <MaterialIcons 
            name="storage" 
            size={isWeb ? 22 : isIpad() ? 20 : 18} 
            color={colors.accent} 
          />
          <Text
            fontSize={isWeb ? fontSizes.md : isIpad() ? fontSizes.md : fontSizes.sm}
            fontWeight="600"
            color={colors.text}
            fontFamily="$body"
          >
            Storage Usage
          </Text>
        </XStack>
        
        <XStack alignItems="center" gap={baseSpacing}>
          {isLoading && (
            <ActivityIndicator size="small" color={colors.accent} />
          )}
          <TouchableOpacity onPress={refetch} disabled={isLoading}>
            <MaterialIcons 
              name="refresh" 
              size={isWeb ? 20 : 18} 
              color={isLoading ? colors.subtext : colors.accent} 
            />
          </TouchableOpacity>
        </XStack>
      </XStack>

      {data ? (
        <YStack gap={baseSpacing}>
          <XStack alignItems="center" justifyContent="space-between">
            <Text
              fontFamily="$body"
              color={colors.text}
              fontSize={isWeb ? fontSizes.sm : isIpad() ? fontSizes.sm : fontSizes.xs}
            >
              {data.formatted.gb} of 10.00 GB used
            </Text>
            <Text
              fontFamily="$body"
              color={data.progressPercentage > 80 ? colors.error : colors.subtext}
              fontSize={isWeb ? fontSizes.sm : isIpad() ? fontSizes.sm : fontSizes.xs}
              fontWeight="600"
            >
              {data.progressPercentage.toFixed(1)}%
            </Text>
          </XStack>
          
          <YStack
            height={6}
            backgroundColor={isDark ? '#222' : '#e0e0e0'}
            borderRadius={3}
            overflow="hidden"
          >
            <YStack
              height="100%"
              width={`${Math.min(data.progressPercentage, 100)}%`}
              backgroundColor={getProgressColor(data.progressPercentage)}
              borderRadius={3}
            />
          </YStack>

          <XStack alignItems="center" justifyContent="space-between">
            <Text
              fontSize={isWeb ? fontSizes.xs : fontSizes.xs}
              color={data.progressPercentage > 80 ? colors.error : colors.subtext}
              fontFamily="$body"
              fontStyle="italic"
            >
              {getStorageMessage(data.progressPercentage)}
            </Text>
            
            {data.progressPercentage > 90 && (
              <XStack alignItems="center" gap={4}>
                <MaterialIcons name="warning" size={14} color={colors.error} />
                <Text
                  fontSize={fontSizes.xs}
                  color={colors.error}
                  fontFamily="$body"
                  fontWeight="600"
                >
                  Near Limit
                </Text>
              </XStack>
            )}
          </XStack>
        </YStack>
      ) : (
        <YStack alignItems="center" padding={baseSpacing * 2}>
          <MaterialIcons 
            name="cloud-off" 
            size={isWeb ? 48 : isIpad() ? 44 : 40} 
            color={colors.subtext} 
          />
          <Text
            fontSize={fontSizes.sm}
            color={colors.subtext}
            fontFamily="$body"
            textAlign="center"
            marginTop={baseSpacing}
          >
            {isLoading ? 'Loading snapshot size...' : 'No snapshot data available'}
          </Text>
        </YStack>
      )}
    </View>
  );
};
