import React, { useRef, useEffect } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { isIpad } from "@/utils";
import Svg, {
  Defs,
  Mask,
  Rect,
  Text as SvgText,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";

export default function KaibaSvg() {
  const pulseValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseValue, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  return (
    <View
      style={{
        height: isIpad() ? 130 : 90,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animated.View
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          opacity: pulseValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.8, 1, 0.8],
          }),
          transform: [
            {
              scale: pulseValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.01],
              }),
            },
          ],
        }}
      >
        <Svg height="100%" width="100%">
          <Defs>
            <Mask id="textMask">
              <Rect width="100%" height="100%" fill="black" />
              <SvgText
                fontSize={isIpad() ? 100 : 60}
                fontWeight="bold"
                x="50%"
                y={isIpad() ? 90 : 60}
                textAnchor="middle"
                fill="white"
              >
                Kaiba
              </SvgText>
            </Mask>

            <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#1e3a8a" />
              <Stop offset="25%" stopColor="#3b82f6" />
              <Stop offset="50%" stopColor="#60a5fa" />
              <Stop offset="75%" stopColor="#93c5fd" />
              <Stop offset="100%" stopColor="#dbeafe" />
            </SvgLinearGradient>
          </Defs>

          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#gradient)"
            mask="url(#textMask)"
          />
        </Svg>
      </Animated.View>

      <Text
        style={{
          fontSize: isIpad() ? 100 : 60,
          fontWeight: "bold",
          color: "transparent",
          letterSpacing: 2,
          textAlign: "center",
          opacity: 0,
          width: "100%",
        }}
      >
        Kaiba
      </Text>
    </View>
  );
}
