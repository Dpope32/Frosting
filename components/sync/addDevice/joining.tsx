import React, { useEffect, useState } from 'react';
import { ActivityIndicator, TextInput } from 'react-native';
import { Text, Button, YStack, XStack, Circle, isWeb, View } from 'tamagui';
import { baseSpacing, fontSizes, cardRadius, buttonRadius, Colors } from '@/components/sync/sharedStyles';
import { isIpad } from '@/utils/deviceUtils';

type JoiningProps = {
  colors: Colors;
  inputInviteCode: string;
  setInputInviteCode: (text: string) => void;
  connectToWorkspace: () => void;
  isLoading: boolean;
  isDark: boolean;
};

const LoadingAnimation = ({ colors }: { colors: Colors }) => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!progress) return;
    
    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // Stop at 95% to avoid reaching 100% before actual completion
        return prev + 1;
      });
    }, 200);

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
    };
  }, [progress]);

  useEffect(() => {
    // Start progress when component mounts
    setProgress(1);
  }, []);

  return (
    <YStack alignItems="center" gap={baseSpacing} width="100%">
      {/* Simple spinning dots */}
      <XStack alignItems="center" gap={6}>
        {[0, 1, 2].map((index) => (
          <Circle
            key={index}
            size={6}
            backgroundColor={colors.accentBg}
            animation="bouncy"
            scale={1}
            opacity={0.3 + (Math.sin(Date.now() / 200 + index) + 1) * 0.35}
          />
        ))}
      </XStack>

      {/* Simple message */}
      <Text 
        color={colors.text} 
        fontSize={fontSizes.sm} 
        textAlign="center"
        fontWeight="500"
      >
        Joining workspace{dots}
      </Text>

      {/* Clean progress bar */}
      <YStack width="100%" alignItems="center" gap={4}>
        <View 
          width="100%" 
          height={3} 
          backgroundColor={colors.border} 
          borderRadius={2} 
          overflow="hidden"
        >
          <View
            height="100%"
            backgroundColor={colors.accentBg}
            width={`${progress}%`}
            borderRadius={2}
            animation="lazy"
          />
        </View>
        <Text 
          color={colors.subtext} 
          fontSize={fontSizes.xs} 
          textAlign="center"
        >
          {progress}%
        </Text>
      </YStack>
    </YStack>
  );
};

export function Joining({
  colors,
  inputInviteCode,
  setInputInviteCode,
  connectToWorkspace,
  isLoading,
  isDark,
}: JoiningProps) {
  return (
    <YStack gap={baseSpacing * 2} paddingBottom={baseSpacing * 2} alignItems="center" justifyContent="center">
      <TextInput
        style={{
          backgroundColor: colors.card,
          padding: baseSpacing * 1.5,
          borderRadius: cardRadius,
          color: colors.text,
          fontSize: fontSizes.md,
          width: isWeb ? 400 : isIpad() ? 300 : 250,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: isLoading ? 0.6 : 1,
        }}
        value={inputInviteCode}
        onChangeText={setInputInviteCode}
        placeholder="Invite Code"
        placeholderTextColor={colors.subtext}
        autoCapitalize="none"
        editable={!isLoading}
      />
      
      <Button
        onPress={connectToWorkspace}
        backgroundColor={isLoading ? colors.card : colors.accentBg}
        width={isWeb ? 400 : isIpad() ? 300 : 250}
        borderColor={colors.border}
        borderWidth={2}
        height={isLoading ? 80 : 40}
        pressStyle={{ scale: isLoading ? 1 : 0.97 }}
        animation="quick"
        style={{ borderRadius: buttonRadius }}
        disabled={isLoading}
        paddingHorizontal={baseSpacing}
      >
        {isLoading ? (
          <LoadingAnimation colors={colors} />
        ) : (
          <Text color={colors.text} fontFamily="$body" fontSize={fontSizes.md} fontWeight="600">
            Join Workspace
          </Text>
        )}
      </Button>
    </YStack>
  );
}
