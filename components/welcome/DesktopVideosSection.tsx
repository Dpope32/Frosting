import React from "react";
import { YStack, XStack, H2, Text, isWeb } from "tamagui";
import { Animated } from "react-native";
import { OptimizedVideo } from "./OptimizedVideo";

interface DesktopVideosSectionProps {
  scrollOffset: number;
  syncSectionTranslateY: Animated.Value;
}

export const DesktopVideosSection = ({
  scrollOffset,
  syncSectionTranslateY,
}: DesktopVideosSectionProps) => {
  if (!isWeb) return null;

  return (
    <Animated.View
      style={{
        transform: [{ translateY: syncSectionTranslateY }],
        width: "100%",
        paddingTop: 20,
        paddingBottom: 20,
      }}
    >
      <YStack alignItems="center" width="100%" paddingBottom="$4">
        <H2 textAlign="center" fontSize="$6">
          Adjust screens to your liking.
        </H2>
      </YStack>
      <XStack
        alignItems="center"
        justifyContent="center"
        paddingBottom="$4"
        width="100%"
      >
        <OptimizedVideo
          src={require("@/assets/videos/hero-ambient-1.mp4")}
          delay={0}
          style={{
            width: "90%",
            maxWidth: 650,
            height: "auto",
            borderRadius: 36,
            opacity: 0.95,
            objectFit: "cover",
            boxShadow: "0 6px 32px #C080FF33, 0 2px 12px #4ADECD22",
            transform: `translateY(${Math.sin(scrollOffset * 0.001) * 3}px)`,
          }}
        />
      </XStack>
    </Animated.View>
  );
};