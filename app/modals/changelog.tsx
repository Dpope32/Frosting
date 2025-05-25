import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, YStack, XStack, Button, isWeb } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { useMarkdownStyles } from '@/hooks';
import type { TextStyle } from 'react-native';
import { CHANGELOG } from '@/constants';
import { useUserStore } from '@/store';
import { isIpad } from '@/utils';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function ChangeLog() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { markdownStyles } = useMarkdownStyles();

  // Get user's primary color from UserStore
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);

  const [expandedBullets, setExpandedBullets] = React.useState<Record<string, boolean>>({});

  const toggleBullets = (version: string) => {
    setExpandedBullets((prev) => {
      const next = { ...prev, [version]: !prev[version] };
      return next;
    });
  };

  // Card press-in/press-out scale animation with reanimated
  function useCardScale() {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }), []);
    const handlePressIn = () => {
      scale.value = withSpring(0.97);
    };
    const handlePressOut = () => {
      scale.value = withSpring(1);
    };
    return { animatedStyle, handlePressIn, handlePressOut };
  }

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
          <MaterialIcons name="chevron-left" size={isWeb ? 28 : isIpad() ? 26 : 22} color={isDark ? '#b8b3ba' : '#708090'} />
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
            // Use reanimated for scale
            const { animatedStyle, handlePressIn, handlePressOut } = useCardScale();
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
                <Animated.View style={animatedStyle}>
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
                        <Text 
                         style={{
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
                              <MaterialIcons name="keyboard-arrow-up" size={20} color={isDark ? '#b8b3ba' : '#708090'} />
                            ) : (
                              <MaterialIcons name="keyboard-arrow-down" size={20} color={isDark ? '#b8b3ba' : '#708090'} />
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
                      {hasBullets && isExpanded && (
                        <Animated.View
                          style={{
                            overflow: 'hidden',
                            marginTop: 4,
                            paddingTop: 10,
                            paddingRight: 10,
                            paddingLeft: 12,
                            paddingBottom: 10,
                            borderRadius: 8,
                            backgroundColor: isDark ? '#1c1c1c' : '#f0f5ff',
                          }}
                          entering={FadeIn.duration(250)}
                        >
                          {entry.bullets.map((bullet, idx2) => (
                            <Animated.View
                              key={idx2}
                              entering={FadeInDown.delay(idx2 * 60).duration(350)}
                              style={{ width: '100%' }}
                            >
                              <XStack alignItems="flex-start" marginBottom={idx2 === entry.bullets.length - 1 ? 0 : 4}>
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
                            </Animated.View>
                          ))}
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
