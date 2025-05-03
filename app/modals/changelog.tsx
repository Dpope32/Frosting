// @ts-nocheck
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, YStack, XStack, Button, isWeb } from 'tamagui';
import { ChevronLeft, ChevronDown, ChevronUp } from '@tamagui/lucide-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { useMarkdownStyles } from '@/hooks/useMarkdownStyles';
import type { TextStyle } from 'react-native';
import { CHANGELOG } from '@/constants/changelog';
import { useUserStore } from '@/store/UserStore';
import { isIpad } from '@/utils/deviceUtils';

export default function ChangeLog() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { markdownStyles } = useMarkdownStyles();

  // Get user's primary color from UserStore
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);

  const [expandedBullets, setExpandedBullets] = React.useState<Record<string, boolean>>({});
  const [animations, setAnimations] = React.useState<Record<string, Animated.Value>>({});

  React.useEffect(() => {
    // Initialize animations for all changelog versions on mount
    const initialAnimations: Record<string, Animated.Value> = {};
    CHANGELOG.forEach(entry => {
      initialAnimations[entry.version] = new Animated.Value(0);
    });
    setAnimations(initialAnimations);
  }, []);

  const toggleBullets = (version: string) => {
    setExpandedBullets((prev) => {
      const next = { ...prev, [version]: !prev[version] };
      if (!animations[version]) {
        setAnimations((a) => ({ ...a, [version]: new Animated.Value(prev[version] ? 1 : 0) }));
      }
      Animated.timing(
        animations[version] || new Animated.Value(0),
        {
          toValue: !prev[version] ? 1 : 0,
          duration: 200,
          useNativeDriver: false,
        }
      ).start();
      return next;
    });
  };

  return (
    <View style={[
      styles.container,
      {
        paddingTop: (isIpad() ? 20 : insets.top - 14),
        backgroundColor: isDark ? '#121212' : '#fff',
      },
    ]}>
      <XStack alignItems="center" justifyContent="center" position="relative">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            left: isWeb ? 24 : 16,
            top: isIpad() ? 12 : 10,
            zIndex: 2,
            padding: 8,
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={isWeb ? 28 : isIpad() ? 26 : 22} color={isDark ? '#b8b3ba' : '#708090'} />
        </TouchableOpacity>
        <Text
          style={{
            ...markdownStyles.heading2 as TextStyle,
            flex: 1,
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          } as TextStyle}
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
            const accentColor = primaryColor || (isDark ? '#00f0ff' : '#1e4fa3');
            const cardBg = 'transparent';
            const scaleAnim = React.useRef(new Animated.Value(1)).current;
            const handlePressIn = () => {
              Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
            };
            const handlePressOut = () => {
              Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
            };
            const bulletAnim = animations[entry.version] || new Animated.Value(isExpanded ? 1 : 0);
            const maxBulletHeight = 500; 
            const bulletMaxHeight = bulletAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, maxBulletHeight],
            });
            const animatedCardStyle: any = {
              transform: [{ scale: scaleAnim }],
              marginBottom: 8,
            };
            const cardTouchableStyle: any = {
              flexDirection: 'row',
              alignItems: 'flex-start',
              backgroundColor: cardBg,
              borderRadius: 0,
              overflow: 'visible',
              minHeight: 64,
            };
            return (
              <React.Fragment key={entry.version}>
                <Animated.View style={{ ...animatedCardStyle } as any}>
                  <CardTouchable
                    activeOpacity={0.92}
                    onPress={hasBullets ? () => toggleBullets(entry.version) : undefined}
                    onPressIn={hasBullets ? handlePressIn : undefined}
                    onPressOut={hasBullets ? handlePressOut : undefined}
                    style={{ ...cardTouchableStyle } as any}
                  >
                    <YStack
                      width={34}
                      alignItems="center"
                      paddingTop={12}
                      backgroundColor="transparent"
                    >
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: accentColor,
                          borderWidth: 2,
                          borderColor: isDark ? '#000' : '#fff',
                        }}
                      />
                      {idx < CHANGELOG.length - 1 && (
                        <View
                          style={{
                            width: 2,
                            flex: 1,
                            backgroundColor: isDark ? '#2f2f2f' : '#d0d7e2',
                            marginTop: 2,
                          }}
                        />
                      )}
                    </YStack>
                    <YStack flex={1} paddingVertical={12} paddingRight={16} marginLeft={4}>
                      <XStack alignItems="center" justifyContent="space-between">
                        <Text style={{
                          ...markdownStyles.heading3 as TextStyle,
                          marginBottom: 2,
                          marginTop: 0,
                          fontWeight: '700',
                          fontSize: 18
                        } as TextStyle}>
                          Version{' '}
                          <Text style={{ color: accentColor, display: 'inline' }}>
                            {entry.version}
                          </Text>
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
                      <XStack alignItems="flex-start" justifyContent="space-between" style={{ width: '100%' }}>
                        <Text style={{
                          ...markdownStyles.body as TextStyle,
                          color: isDark ? '#b8b3ba' : '#708090',
                          marginBottom: 2,
                          paddingLeft: 4,
                          paddingTop: 2,
                          fontSize: 15,
                          flex: 1,
                        } as TextStyle}>
                          {entry.notes}
                        </Text>
                        {!isExpanded && entry.date && (
                          <Text style={{
                            ...markdownStyles.body as TextStyle,
                            color: isDark ? '#b8b3ba' : '#708090',
                            fontSize: 13,
                            opacity: 0.7,
                            paddingLeft: 12,
                            paddingTop: isWeb ? 0 : 6,
                            flexShrink: 0,
                          }}>
                            {new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </Text>
                        )}
                      </XStack>
                      {hasBullets && (
                        <Animated.View style={{
                          overflow: 'hidden',
                          maxHeight: bulletMaxHeight,
                          opacity: bulletAnim,
                        }}>
                          <YStack
                            marginTop={4}
                            paddingTop={10}
                            paddingRight={10}
                            paddingLeft={12}
                            paddingBottom={10}
                            borderRadius={8}
                            backgroundColor={isDark ? '#1c1c1c' : '#f0f5ff'}
                          >
                            {entry.bullets.map((bullet, idx2) => (
                              <XStack key={idx2} alignItems="flex-start" marginBottom={idx2 === entry.bullets.length - 1 ? 0 : 4}>
                                <Text style={{
                                  ...markdownStyles.body as TextStyle,
                                  marginRight: 8,
                                  color: accentColor,
                                  fontSize: 18
                                } as TextStyle}>•</Text>
                                <Text style={{
                                  ...markdownStyles.body as TextStyle,
                                  flex: 1,
                                  color: isDark ? '#b8b3ba' : '#708090',
                                  fontSize: 15
                                } as TextStyle}>{bullet}</Text>
                              </XStack>
                            ))}
                          </YStack>
                        </Animated.View>
                      )}
                    </YStack>
                  </CardTouchable>
                </Animated.View>
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
