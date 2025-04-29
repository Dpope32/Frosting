import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, YStack, XStack, Button, isWeb } from 'tamagui';
import { ChevronLeft, ChevronDown, ChevronUp } from '@tamagui/lucide-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { useMarkdownStyles } from '@/hooks/useMarkdownStyles';
import type { TextStyle } from 'react-native';
import { CHANGELOG } from '@/constants/changelog';

export default function ChangeLog() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { markdownStyles } = useMarkdownStyles();

  const [expandedBullets, setExpandedBullets] = React.useState<Record<string, boolean>>({});
  const toggleBullets = (version: string) => {
    setExpandedBullets((prev) => ({ ...prev, [version]: !prev[version] }));
  };

  return (
    <View style={[
      styles.container,
      {
        paddingTop: (insets.top - 8),
        backgroundColor: isDark ? '#111' : '#fff',
      },
    ]}>
      <XStack alignItems="center" justifyContent="center" position="relative">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            left: isWeb ? 24 : 16,
            zIndex: 2,
            padding: 8,
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={isWeb ? 28 : 22} color={isDark ? '#b8b3ba' : '#708090'} />
        </TouchableOpacity>
        <Text
          style={[
            markdownStyles.heading2 as TextStyle,
            {
              flex: 1,
              textAlign: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          Update Log
        </Text>
      </XStack>
      <View style={{ height: 1, backgroundColor: isDark ? '#333' : '#eee', marginHorizontal: 16, marginBottom: 10, marginTop: 10 }} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 16 }} showsVerticalScrollIndicator={false}>
        <YStack gap={0} paddingHorizontal={16}>
          {CHANGELOG.map((entry, idx) => {
            const hasBullets = entry.bullets && entry.bullets.length > 0;
            const isExpanded = expandedBullets[entry.version] || false;
            const CardTouchable = hasBullets ? TouchableOpacity : View;
            return (
              <React.Fragment key={entry.version}>
                {idx > 0 && (
                  <View style={{ height: 1, backgroundColor: isDark ? '#333' : '#eee', marginVertical: 12 }} />
                )}
                <CardTouchable
                  activeOpacity={0.8}
                  onPress={hasBullets ? () => toggleBullets(entry.version) : undefined}
                  style={{ width: '100%' }}
                >
                  <YStack marginBottom={8} marginTop={-6}>
                    <XStack alignItems="center" justifyContent="space-between">
                      <Text style={[markdownStyles.heading3 as TextStyle, { marginBottom: 2 }]}>
                        Version <Text style={{ color: isDark ? '#00f0ff' : '#1e4fa3' }}>{entry.version}</Text>
                      </Text>
                      {hasBullets && (
                        <View>
                          {isExpanded ? (
                            <ChevronUp size={20} color={isDark ? '#b8b3ba' : '#708090'} />
                          ) : (
                            <ChevronDown size={20} color={isDark ? '#b8b3ba' : '#708090'} />
                          )}
                        </View>
                      )}
                    </XStack>
                    <Text style={[
                      markdownStyles.body as TextStyle,
                      {
                        color: isDark ? '#b8b3ba' : '#708090',
                        marginBottom: 2,
                        paddingLeft: 12,
                        paddingTop: 6,
                      },
                    ]}>
                      {entry.notes}
                    </Text>
                    {hasBullets && isExpanded && (
                      <YStack
                        marginTop={4}
                        padding={10}
                        borderRadius={8}
                        backgroundColor={isDark ? '#222' : '#e5edff'}
                      >
                        {entry.bullets.map((bullet, idx2) => (
                          <XStack key={idx2} alignItems="flex-start">
                            <Text style={[markdownStyles.body as TextStyle, { marginRight: 8, color: isDark ? '#b8b3ba' : '#708090' }]}>•</Text>
                            <Text style={[markdownStyles.body as TextStyle, { flex: 1, color: isDark ? '#b8b3ba' : '#708090' }]}>{bullet}</Text>
                          </XStack>
                        ))}
                      </YStack>
                    )}
                  </YStack>
                </CardTouchable>
              </React.Fragment>
            );
          })}
        </YStack>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 