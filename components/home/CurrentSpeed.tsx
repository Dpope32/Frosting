import React from "react";
import { Platform } from "react-native";
import { YStack, Text, Spinner } from "tamagui";
import Animated, { SlideInDown } from "react-native-reanimated";

import { useNetworkSpeed } from "@/hooks";
import { getStrengthColor } from "@/utils";

interface CurrentSpeedProps {
  isDark: boolean;
  showLoading: boolean;
}

export function CurrentSpeed({
  isDark,
  showLoading,
}: CurrentSpeedProps): JSX.Element | null {
  const { speed, isLoading } = useNetworkSpeed();
  return (
    <Animated.View entering={SlideInDown.duration(500).delay(0)}>
      <YStack
        backgroundColor={
          isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"
        }
        br={12}
        padding="$4"
        borderWidth={1}
        borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0,0,0,0.1)"}
      >
        <Text
          fontFamily="$body"
          color={isDark ? "#fff" : "#000"}
          fontSize={16}
          fontWeight="500"
        >
          Current Speed
        </Text>
        {showLoading ? (
          <YStack alignItems="center" mt="$2">
            <Spinner size="small" color="$gray10" />
            <Text
              fontFamily="$body"
              color={isDark ? "#a0a0a0" : "#666666"}
              fontSize={14}
              mt="$2"
            >
              Checking speed...
            </Text>
          </YStack>
        ) : (
          <Text
            color={getStrengthColor(speed, isDark)}
            fontSize={32}
            fontWeight="600"
            mt="$2"
            fontFamily="$body"
          >
            {speed ||
              (__DEV__ ? "89 ms" : Platform.OS === "web" ? "80 ms" : "75 ms")}
          </Text>
        )}
      </YStack>
    </Animated.View>
  );
}
