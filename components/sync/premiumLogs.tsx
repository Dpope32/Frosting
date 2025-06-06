import React, { useRef, useEffect, useState, useMemo } from 'react';
import { View, TouchableOpacity, Animated, ScrollView, ActivityIndicator, useWindowDimensions, Platform } from 'react-native';
import { Text, YStack, XStack, isWeb } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserStore } from '@/store';
import { baseSpacing, fontSizes, cardRadius, getColors } from '@/components/sync/sharedStyles';
import { clearLogQueue, setLogUpdateCallback } from '@/components/sync/syncUtils';
import { isIpad } from '@/utils';
import { DebouncedInput } from '@/components/shared/debouncedInput';

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
  isExporting?: boolean;
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
  maxHeight,
  isExporting = false,
}: PremiumLogsProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const colors = getColors(isDark, primaryColor);
  const fadeAnims = useRef<{[key: string]: Animated.Value}>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const wideMode = isWeb || isIpad();
  const webWidth = width ? width * 0.7025 : '100%';
  // Better responsive width calculation
  const adjustedContentWidth = useMemo(() => {
    if (isWeb) {
      return webWidth;
    }
    if (isIpad()) {
      return Math.min(width - baseSpacing * 3, 600);
    }
    return Math.min(width - baseSpacing * 2, 350);
  }, [width]);
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && syncLogs.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [syncLogs.length, autoScroll]);

  // Deduplicate and filter logs
  const processedLogs = useMemo(() => {
    // First filter out any logs containing "yahoo" or "geocoding"
    const filteredLogs = syncLogs.filter(log => {
      const messageLC = log.message.toLowerCase();
      const detailsLC = log.details?.toLowerCase() || '';
      return !(messageLC.includes('yahoo') || messageLC.includes('geocoding') || 
               detailsLC.includes('yahoo') || detailsLC.includes('geocoding'));
    });
    
    // Deduplicate by message content and timestamp proximity (within 1 second)
    const deduped = filteredLogs.reduce((acc, log) => {
      const isDuplicate = acc.some(existing => 
        existing.message === log.message &&
        Math.abs(existing.timestamp.getTime() - log.timestamp.getTime()) < 1000
      );
      
      if (!isDuplicate) {
        acc.push(log);
      }
      return acc;
    }, [] as typeof syncLogs);

    // Apply filters
    let filtered = deduped;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.slice(-100); // Keep last 100 logs for performance
  }, [syncLogs, statusFilter, searchTerm]);

  // Status counts for filter badges
  const statusCounts = useMemo(() => {
    // Use filtered logs for counts, not including yahoo or geocoding
    const filteredLogs = syncLogs.filter(log => {
      const messageLC = log.message.toLowerCase();
      const detailsLC = log.details?.toLowerCase() || '';
      return !(messageLC.includes('yahoo') || messageLC.includes('geocoding') || 
               detailsLC.includes('yahoo') || detailsLC.includes('geocoding'));
    });
    
    return filteredLogs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [syncLogs]);

  // Clean up logs when component unmounts
  useEffect(() => {
    return () => {
      clearLogQueue();
      setLogUpdateCallback(null);
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'verbose': return '🔍';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '🔄';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'verbose': return isDark ? '#9CA3AF' : '#6B7280';
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'warning': return isDark ? '#F39C12' : '#D35400';
      default: return colors.text;
    }
  };

  const StatusFilterChip = ({ status, label, count }: { status: string; label: string; count?: number }) => (
    <TouchableOpacity
      onPress={() => setStatusFilter(status === statusFilter ? 'all' : status)}
      style={{
        paddingHorizontal: wideMode ? 16 : 12,
        paddingVertical: wideMode ? 8 : 6,
        borderRadius: wideMode ? 20 : 16,
        backgroundColor: status === statusFilter ? colors.accent : colors.card,
        borderWidth: 1,
        borderColor: status === statusFilter ? colors.accent : colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minHeight: wideMode ? 36 : 28,
      }}
    >
      <Text 
        fontSize={wideMode ? 14 : 12} 
        color={status === statusFilter ? isDark ? "#3e3e3e" : "#f9f9f9" : colors.subtext} 
        fontWeight="500" 
        fontFamily="$body"
      >
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={{
          borderRadius: wideMode ? 12 : 10,
          paddingHorizontal: wideMode ? 8 : 6,
          paddingVertical: wideMode ? 3 : 2,
          minWidth: wideMode ? 20 : 18,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text 
            fontSize={wideMode ? 11 : 10} 
            color="white" 
            fontWeight="600"
            textAlign="center"
          >
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {isLoading && (
        <XStack 
          alignItems="center" 
          gap={baseSpacing}
          marginBottom={baseSpacing * 2}
          justifyContent="center"
        >
          <ActivityIndicator size="small" color={colors.accent} />
          <Text fontSize={fontSizes.sm} fontFamily="$body" color={colors.subtext}>
            {syncStatus === 'syncing' ? 'Sync in progress...' : 'Preparing sync...'}
          </Text>
        </XStack>
      )}

      <View style={{
        width: adjustedContentWidth,
        backgroundColor: colors.card,
        borderRadius: cardRadius,
        borderWidth: 1,
        borderColor: colors.border,
        padding: wideMode ? baseSpacing * 3 : baseSpacing * 2,
        maxHeight: maxHeight || (wideMode ? 600 : 450),
        alignSelf: 'center',
      }}>
        <XStack 
          alignItems="center" 
          justifyContent="space-between" 
          paddingBottom={baseSpacing}
          flexWrap={wideMode ? 'nowrap' : 'wrap'}
          gap={wideMode ? 0 : baseSpacing}
        >
          <XStack 
            gap={wideMode ? 16 : 10} 
            alignItems="center"
            flexShrink={0}
          >
            <TouchableOpacity 
              onPress={() => {
                const { useProjectStore: useTaskStore } = require('@/store/ToDo');
                useTaskStore.getState().debugSyncState();
              }}
              style={{ paddingHorizontal: 8, paddingVertical: 6, backgroundColor: 'transparent', borderRadius: 12, borderWidth: 1, borderColor: isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",  width: 80, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text fontFamily="$body"  fontSize={wideMode ? 15 : 14} color={colors.text}>Debug</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={exportLogs}
              disabled={isExporting}
              style={{ opacity: isExporting ? 0.5 : 1, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'transparent', borderRadius: 12, borderWidth: 1, borderColor: colors.accent,  width: 70, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text 
                color={isExporting ? colors.subtext : colors.accent} 
                fontFamily="$body" 
                fontWeight="500" 
                fontSize={wideMode ? 15 : 14}
              >
                {isExporting ? 'Exporting...' : 'Export'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearLogs} style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'transparent', borderRadius: 12, borderWidth: 1, borderColor: colors.error, width: 60, alignItems: 'center', justifyContent: 'center' }}>
              <Text 
                color={colors.error} 
                fontFamily="$body" 
                fontWeight="500" 
                fontSize={wideMode ? 15 : 14}
              >
                Clear
              </Text>
            </TouchableOpacity>
            <XStack justifyContent="flex-end" flex={1} >  
            <TouchableOpacity 
            onPress={() => setAutoScroll(!autoScroll)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: autoScroll ? isDark ? colors.successBgDark : colors.successBgLight : colors.subtext + '15',
              paddingHorizontal: wideMode ? 8 : 6,
              paddingVertical: wideMode ? 4 : 3,
              borderRadius: wideMode ? 12 : 10,
              marginRight: -8,
            }}
          >
            <Ionicons 
              name={autoScroll ? "play" : "pause"} 
              size={wideMode ? 16 : 14} 
              color={autoScroll ? isDark ? colors.successText : colors.successText : colors.subtext} 
            />
          </TouchableOpacity>
          </XStack>
          </XStack>
        </XStack>

        <View style={{
          borderRadius: 24,
          paddingHorizontal: wideMode ? 16 : 10,
          marginBottom: baseSpacing,
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: wideMode ? 44 : 30,
          height: wideMode ? 44 : 30,
          marginTop:4,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Ionicons name="search" size={wideMode ? 18 : 16} color={colors.subtext} />
          <DebouncedInput
            onDebouncedChange={setSearchTerm}
            style={{
              flex: 1,
              marginLeft: wideMode ? 12 : 8,
              color: colors.text,
              fontSize: wideMode ? 15 : 14,
              fontFamily: '$body',
              backgroundColor: 'transparent',
              borderRightWidth: 0,
              borderTopWidth: 0,
              borderLeftWidth: 0,
              borderBottomWidth: 0,
            }}
            placeholder="Search logs..."
            placeholderTextColor={colors.subtext}
            value={searchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchTerm('')}
              style={{ padding: 4 }}
            >
              <Ionicons name="close-circle" size={wideMode ? 18 : 16} color={colors.subtext} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: baseSpacing}}
          contentContainerStyle={{ 
            gap: wideMode ? 12 : 6, 
            paddingHorizontal: wideMode ? 8 : 4,
            paddingVertical: 4,
            alignItems: 'center',
          }}
        >
          <StatusFilterChip status="all" label="All" count={syncLogs.length} />
          <StatusFilterChip status="error" label="Errors" count={statusCounts.error} />
          <StatusFilterChip status="warning" label="Warnings" count={statusCounts.warning} />
          <StatusFilterChip status="success" label="Success" count={statusCounts.success} />
          <StatusFilterChip status="info" label="Info" count={statusCounts.info} />
          <StatusFilterChip status="verbose" label="Verbose" count={statusCounts.verbose} />
        </ScrollView>
        
        <XStack 
          justifyContent="space-between" 
          alignItems="center" 
          marginBottom={baseSpacing}
          flexWrap={wideMode ? 'nowrap' : 'wrap'}
          gap={wideMode ? 0 : baseSpacing}
        />

        {/* Logs Container */}
        <ScrollView 
          ref={scrollViewRef}
          style={{ 
            maxHeight: wideMode ? 700 : 500,
            height: processedLogs.length > 0 ? (wideMode ? 500 : 400) : (wideMode ? 350 : 250),
          }}
          contentContainerStyle={{ 
            paddingBottom: baseSpacing * 3,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => setAutoScroll(false)}
        > 
          <YStack gap={wideMode ? baseSpacing * 1.5 : baseSpacing} alignItems="flex-start">
            {processedLogs.length === 0 ? (
              <YStack 
                alignItems="center" 
                justifyContent="center" 
                padding={baseSpacing * 6}
                width="100%"
                flex={1}
              >
                <Ionicons name="document-outline" size={wideMode ? 64 : 48} color={colors.subtext} />
                <Text 
                  fontSize={wideMode ? fontSizes.lg : fontSizes.md} 
                  color={colors.subtext} 
                  textAlign="center" 
                  marginTop={baseSpacing * 2} 
                  fontFamily="$body"
                  fontWeight="500"
                >
                  {searchTerm ? 'No logs match your search' : 'No logs yet'}
                </Text>
                <Text 
                  fontSize={wideMode ? fontSizes.md : fontSizes.sm} 
                  color={colors.subtext} 
                  textAlign="center" 
                  marginTop={baseSpacing} 
                  fontFamily="$body"
                  maxWidth={wideMode ? 400 : 280}
                >
                  {searchTerm ? 'Try adjusting your search terms or clear filters' : 'Logs will appear here during sync operations'}
                </Text>
              </YStack>
            ) : (
              processedLogs.map((log) => {
                if (!fadeAnims.current[log.id]) {
                  fadeAnims.current[log.id] = new Animated.Value(0);
                  Animated.timing(fadeAnims.current[log.id], {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: !isWeb,
                  }).start();
                }
                
                const icon = getStatusIcon(log.status);
                const textColor = getStatusColor(log.status);
                
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
                        backgroundColor: log.status === 'error' ? 'rgba(239, 68, 68, 0.1)' : 
                                       log.status === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 
                                       'transparent',
                        borderRadius: wideMode ? 10 : 6,
                        padding: log.status === 'error' || log.status === 'warning' ? (wideMode ? 12 : 8) : 0,
                        marginVertical: wideMode ? 4 : 2,
                      }}
                    >
                      <Text 
                        fontSize={wideMode ? fontSizes.lg : fontSizes.md} 
                        marginRight={wideMode ? baseSpacing : baseSpacing / 2}
                        style={{ lineHeight: wideMode ? 24 : 20 }}
                      >
                        {icon}
                      </Text>
                      <YStack flex={1}>
                        <Text 
                          fontSize={wideMode ? fontSizes.md : fontSizes.sm} 
                          fontFamily="$body" 
                          color={textColor} 
                          fontWeight="500"
                          style={{ lineHeight: wideMode ? 22 : 18 }}
                        >
                          {log.message}
                        </Text>
                        <Text 
                          fontSize={wideMode ? fontSizes.sm : fontSizes.xs} 
                          fontFamily="$body" 
                          color={colors.subtext}
                          marginTop={wideMode ? 4 : 2}
                        >
                          {log.timestamp.toLocaleTimeString()} · {Math.floor((Date.now() - log.timestamp.getTime()) / 1000)}s ago
                          {log.details && ' · Tap for details'}
                        </Text>
                        
                        {log.details && showDetails[log.id] && (
                          <View style={{
                            backgroundColor: isDark ? '#1E1E1E' : '#F0F0F0',
                            padding: wideMode ? baseSpacing * 1.5 : baseSpacing,
                            borderRadius: wideMode ? 10 : 6,
                            marginTop: wideMode ? baseSpacing : baseSpacing / 2,
                            marginBottom: wideMode ? baseSpacing : baseSpacing / 2,
                            maxHeight: wideMode ? 400 : 300,
                          }}>
                            <ScrollView showsVerticalScrollIndicator={false}>
                              <Text 
                                fontSize={wideMode ? fontSizes.sm : fontSizes.xs} 
                                color={colors.subtext} 
                                fontFamily="$body"
                                style={{ 
                                  lineHeight: wideMode ? 20 : 16,
                                }}
                              >
                                {log.details}
                              </Text>
                            </ScrollView>
                          </View>
                        )}
                      </YStack>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })
            )}
          </YStack>
        </ScrollView>
      </View>

      {/* Status Cards */}
      <YStack 
        alignItems="center"
        marginTop={baseSpacing * 3}
        marginBottom={baseSpacing * 2}
        gap={baseSpacing * 1.5}
        width={adjustedContentWidth}
      >
      </YStack>
    </View>
  );
};