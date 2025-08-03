import React  from "react";
import {  Platform } from "react-native";
import { YStack, Text, Spinner } from "tamagui";
import Animated, { SlideInDown } from "react-native-reanimated";

import { useNetworkStore } from "@/store";
import { getWifiDetails } from "@/services";
import { getStrengthColor, isIpad } from "@/utils";

interface NetworkDetailsProps {
 isDark: boolean;
 showLoading: boolean;
}

export function NetworkDetails({
  isDark,
  showLoading
}: NetworkDetailsProps): JSX.Element | null {
  const { details, error } =
    useNetworkStore();
  const wifiDetails = getWifiDetails(details);
  const shouldDisplayField = (value: any): boolean => {
    return value !== undefined && value !== null && value !== "Unknown";
  };

  return (
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
        Network Details
      </Text>
      {showLoading ? (
        <YStack alignItems="center" mt="$2">
          <Spinner size="small" color="$gray10" />
        </YStack>
      ) : error ? (
        <Text fontFamily="$body" color="#ff6b6b" fontSize={14} mt="$2">
          {error}
        </Text>
      ) : details?.isConnected ? (
        <YStack gap="$2" mt="$2">
          {wifiDetails && shouldDisplayField(wifiDetails.ssid) && (
            <Text
              fontFamily="$body"
              color={isDark ? "#a0a0a0" : "#666666"}
              fontSize={14}
            >
              SSID: {wifiDetails.ssid}
            </Text>
          )}
          {wifiDetails && shouldDisplayField(wifiDetails.strength) && (
            <Text
              fontFamily="$body"
              color={getStrengthColor(wifiDetails.strength, isDark)}
              fontSize={14}
              fontWeight="500"
            >
              Strength: {wifiDetails.strength}
            </Text>
          )}
          {wifiDetails && shouldDisplayField(wifiDetails.frequency) && (
            <Text
              fontFamily="$body"
              color={isDark ? "#a0a0a0" : "#666666"}
              fontSize={14}
            >
              Frequency: {wifiDetails.frequency} MHz
            </Text>
          )}
          {details.details &&
            "ipAddress" in details.details &&
            shouldDisplayField(details.details.ipAddress) && (
              <Text
                fontFamily="$body"
                color={isDark ? "#a0a0a0" : "#666666"}
                fontSize={14}
              >
                IP Address: {details.details.ipAddress}
              </Text>
            )}
          {details.details &&
            "subnet" in details.details &&
            shouldDisplayField(details.details.subnet) && (
              <Text
                fontFamily="$body"
                color={isDark ? "#a0a0a0" : "#666666"}
                fontSize={14}
              >
                Subnet: {details.details.subnet}
              </Text>
            )}

          {Platform.OS === "web" && (
            <YStack gap="$1">
              <Text
                fontFamily="$body"
                color={isDark ? "#a0a0a0" : "#666666"}
                fontSize={14}
              >
                Connection Type:{" "}
                {details?.type === "wifi"
                  ? "WiFi"
                  : details?.type === "cellular"
                  ? "Cellular"
                  : "Browser"}
              </Text>
              <Text
                fontFamily="$body"
                color={isDark ? "#a0a0a0" : "#666666"}
                fontSize={14}
              >
                Browser:{" "}
                {navigator.userAgent.includes("Chrome")
                  ? "Chrome"
                  : navigator.userAgent.includes("Firefox")
                  ? "Firefox"
                  : navigator.userAgent.includes("Safari")
                  ? "Safari"
                  : navigator.userAgent.includes("Edge")
                  ? "Edge"
                  : "Unknown"}
              </Text>
              <Text
                fontFamily="$body"
                color={isDark ? "#a0a0a0" : "#666666"}
                fontSize={14}
              >
                User Agent: {navigator.userAgent.substring(0, 50)}...
              </Text>
            </YStack>
          )}

          {!wifiDetails && Platform.OS !== "web" && (
            <Text fontFamily="$body" color="#a0a0a0" fontSize={14}>
              Limited network information available on this device
            </Text>
          )}
        </YStack>
      ) : (
        <Text fontFamily="$body" color="#a0a0a0" fontSize={14} mt="$2">
          No network connection
        </Text>
      )}
    </YStack>
  );
}
