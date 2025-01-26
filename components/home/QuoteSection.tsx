import React, { useEffect, useState, useCallback } from 'react'
import { View, useWindowDimensions, Image, Alert, Pressable } from 'react-native'
import { BlurView } from 'expo-blur'
import MyTracker from '@splicer97/react-native-mytracker'
import { useUserStore } from '@/store/UserStore'
import {
  useProjectStore,
  useStoreHydrated,
  Task,
} from '@/store/ToDo'
import { LinearGradient } from 'expo-linear-gradient'
import { YStack, Text, Stack, XStack, ScrollView, Button } from 'tamagui'
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated'
import { useStoicQuote, useRefreshStoicQuote } from '@/hooks/useStoicQuote'
import { Ionicons } from '@expo/vector-icons'

export const QuoteSection = () => {
    const { data, isLoading } = useStoicQuote();
    const refreshQuote = useRefreshStoicQuote();
  
    if (isLoading || !data) return null;
  
    return (
      <Stack marginTop="$4">
        <XStack alignItems="center" gap="$2">
          <YStack flex={1}>
            <Text
              fontFamily="$SpaceMono"
              fontSize={14}
              color="#dbd0c6"
              fontWeight="600"
              style={{
                textShadowColor: 'rgba(0, 0, 0, 0.5)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 3,
              }}
            >
              {data.data.quote}
            </Text>
            <Text
              fontFamily="$SpaceMono"
              fontSize={12}
              color="#dbd0c6"
              opacity={0.9}
              marginTop="$1"
              style={{
                textShadowColor: 'rgba(0, 0, 0, 0.5)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 3,
              }}
            >
              - {data.data.author}
            </Text>
          </YStack>
          <Pressable onPress={refreshQuote} style={{ marginTop: -38 }}>
            <Ionicons name="refresh" size={14} color="#dbd0c6" />
          </Pressable>
        </XStack>
      </Stack>
    );
  };