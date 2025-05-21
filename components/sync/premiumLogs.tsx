import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated, ScrollView, ActivityIndicator } from 'react-native';
import { Text, YStack, XStack } from 'tamagui';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserStore } from '@/store';
import { baseSpacing, fontSizes, cardRadius, getColors } from '@/components/sync/sharedStyles';
import { clearLogQueue, setLogUpdateCallback } from '@/components/sync/syncUtils';

interface PremiumLogsProps {
  isLoading: boolean;
  syncStatus: string;
  syncLogs: Array<{
    id: string;
    message: string;
    timestamp: Date;
    status: 'info' | 'success' | 'error' | 'warning' | 'verbose';
    details?: string;
  }>;
  showDetails: {[key: string]: boolean};
  toggleDetails: (logId: string) => void;
  clearLogs: () => void;
  exportLogs: () => void;
  premium: boolean;
  devices: any[];
  contentWidth: number;
  maxHeight?: number;
}

export const PremiumLogs = ({
  isLoading,
  syncStatus,
  syncLogs,
  showDetails,
  toggleDetails,
  clearLogs,
  exportLogs,
  premium,
  devices,
  contentWidth,
  maxHeight
}: PremiumLogsProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const colors = getColors(isDark, primaryColor);
  const fadeAnims = useRef<{[key: string]: Animated.Value}>({});

  // Clean up logs when component unmounts
  useEffect(() => {
    return () => {
      clearLogQueue();
      // Also unsubscribe from log updates to prevent listener leaks
      setLogUpdateCallback(null);
    };
  }, []);

  return (
    <YStack alignItems="center" justifyContent="center" padding={0} >
      <XStack alignItems="center"  marginBottom={-20}>
        {isLoading && <ActivityIndicator size="small" color={colors.accent} />}
        {isLoading && (
          <Text fontSize={fontSizes.xs} fontFamily="$body" color={colors.subtext}>
            {syncStatus === 'syncing' ? 'Sync in progress...' : 'Preparing sync...'}
          </Text>
        )}
      </XStack>

      <View style={{
        width: contentWidth,
        marginTop: 0,
        backgroundColor: colors.card,
        borderRadius: cardRadius,
        borderWidth: 1,
        borderColor: colors.border,
        padding: baseSpacing * 2,
        maxHeight: maxHeight || 'auto',
      }}>
        <XStack alignItems="center" justifyContent="space-between" marginBottom={baseSpacing}>
          <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.text} fontWeight="600">
            Sync Progress Log
          </Text>
          <XStack gap={10}>
            <TouchableOpacity onPress={exportLogs}>
              <Text color={colors.accent} fontFamily="$body" fontWeight="500" fontSize={14}>Export</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearLogs}>
              <Text color={colors.accent} fontFamily="$body" fontWeight="500" fontSize={14}>Clear</Text>
            </TouchableOpacity>
          </XStack>
        </XStack>
        <View style={{height: 1, backgroundColor: colors.border, marginBottom: baseSpacing * 2}} />
        <ScrollView 
          style={{ 
            maxHeight: 400,
            height: syncLogs.length > 0 ? 350 : 100,
          }}
          contentContainerStyle={{ paddingBottom: baseSpacing * 3 }}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        > 
          <YStack gap={baseSpacing} alignItems="flex-start">
            {syncLogs.map((log) => {
              if (!fadeAnims.current[log.id]) {
                fadeAnims.current[log.id] = new Animated.Value(0);
                Animated.timing(fadeAnims.current[log.id], {
                  toValue: 1,
                  duration: 500,
                  useNativeDriver: true,
                }).start();
              }
              
              let icon = '🔄';
              let textColor = colors.text;
              
              switch(log.status) {
                case 'verbose':
                  icon = '🔍';
                  textColor = isDark ? '#9CA3AF' : '#6B7280';
                  break;
                case 'success':
                  icon = '✅';
                  textColor = colors.success;
                  break;
                case 'error':
                  icon = '❌';
                  textColor = colors.error;
                  break;
                case 'warning':
                  icon = '⚠️';
                  textColor = isDark ? '#F39C12' : '#D35400';
                  break;
                default:
                  icon = '🔄';
                  break;
              }
              
              return (
                <Animated.View 
                  key={log.id} 
                  style={{
                    opacity: fadeAnims.current[log.id],
                    width: '100%',
                  }}
                >
                  <TouchableOpacity 
                    onPress={() => log.details && toggleDetails(log.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Text fontSize={fontSizes.md} marginRight={baseSpacing / 2}>
                      {icon}
                    </Text>
                    <YStack flex={1}>
                      <Text fontSize={fontSizes.sm} fontFamily="$body" color={textColor} fontWeight="500">
                        {log.message}
                      </Text>
                      <Text fontSize={fontSizes.xs} fontFamily="$body" color={colors.subtext}>
                        {log.timestamp.toLocaleTimeString()} · {Math.floor((Date.now() - log.timestamp.getTime()) / 1000)}s ago
                        {log.details && ' · Tap for details'}
                      </Text>
                      
                      {log.details && showDetails[log.id] && (
                        <View style={{
                          backgroundColor: isDark ? '#1E1E1E' : '#F0F0F0',
                          padding: baseSpacing,
                          borderRadius: 6,
                          marginTop: baseSpacing / 2,
                          marginBottom: baseSpacing / 2,
                          maxHeight: 300, 
                        }}>
                          <ScrollView>
                            <Text fontSize={fontSizes.xs} color={colors.subtext} fontFamily="$body">
                              {log.details}
                            </Text>
                          </ScrollView>
                        </View>
                      )}
                    </YStack>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </YStack>
        </ScrollView>
      </View>


      <YStack 
        alignItems="center"
        marginTop={baseSpacing * 2}
        marginBottom={baseSpacing * 2}
        gap={baseSpacing}
        width={contentWidth}
      >
        <XStack 
          padding={baseSpacing * 2}
          backgroundColor={isDark ? "rgba(16, 185, 129, 0.10)" : "rgba(6, 95, 70, 0.2)"}
          borderColor={"rgba(16, 185, 129, 0.5)"}
          borderWidth={1}
          borderRadius={8}
          width="100%"
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons name="download-outline" size={16} color="#4ade80" style={{ marginHorizontal: 8 }} />
          <Text color={isDark ? "#4ade80" : "#047857"} fontSize={13} fontWeight="500" fontFamily="$body" textAlign="center">
            {!premium 
              ? 'Premium required for automatic sync across devices'
              : isLoading 
                ? 'Sync in progress...'
                : 'Local data pulls automatically on app start'}
          </Text>
        </XStack>
          <XStack 
          padding={baseSpacing * 2}
          backgroundColor={isDark ? "rgba(140, 16, 185, 0.1)" : "rgba(62, 6, 95, 0.2)"}
          borderColor={"rgba(154, 16, 185, 0.5)"}
          borderWidth={1}
          borderRadius={8}
          width="100%"
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons name="push-outline" size={16} color="#8c10b9" style={{ marginHorizontal: 8 }} />
          <Text color={isDark ? "#8c10b9" : "#8c10b9"} fontSize={13} fontWeight="500" fontFamily="$body" textAlign="center">
            {!premium 
              ? 'Sign up today!'
              : isLoading 
                ? 'Please wait'
                : 'Pushes changes when app goes to background'}
          </Text>
        </XStack>
      </YStack>

      {devices.length > 0 && (
        <YStack gap={baseSpacing} marginTop={baseSpacing * 4}>
          <Text fontSize={fontSizes.md} color={colors.text} fontWeight="600" marginBottom={baseSpacing}>
            Connected Devices
          </Text>
          {devices.map((device: any) => (
            <XStack
              key={device.id}
              padding={baseSpacing * 2}
              backgroundColor={colors.card}
              borderRadius={cardRadius}
              borderWidth={1}
              borderColor={colors.border}
              justifyContent="space-between"
              alignItems="center"
              width={contentWidth}
              alignSelf="center"
            >
              <YStack>
                <Text fontSize={fontSizes.lg} fontWeight="600" color={colors.text}>
                  {device.name}
                </Text>
                <Text fontSize={fontSizes.sm} color={colors.subtext}>
                  {device.isCurrentDevice
                    ? (devices.length > 1 ? 'Connected' : 'Waiting for other devices')
                    : device.status + ' • Last active: ' + new Date(device.lastActive).toLocaleDateString()}
                </Text>
              </YStack>
              {!device.isCurrentDevice && (
                <TouchableOpacity>
                  <MaterialIcons 
                    name="more-vert" 
                    size={24} 
                    color={colors.text} 
                  />
                </TouchableOpacity>
              )}
            </XStack>
          ))}
        </YStack>
      )}
    </YStack>
  );
}