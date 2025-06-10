import React, { useEffect, useState } from 'react';
import { ActivityIndicator, TextInput } from 'react-native';
import { Text, Button, YStack, XStack, Circle, isWeb, AnimatePresence, View } from 'tamagui';
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

const loadingMessages = [
  "Connecting to workspace...",
  "Establishing secure connection...",
  "Syncing workspace data...",
  "Finalizing setup...",
  "Almost ready...",
];

const LoadingAnimation = ({ colors }: { colors: Colors }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [dots, setDots] = useState("");
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    // Cycle through messages every 3 seconds
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    // Animate dots every 500ms
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);

    // Pulse animation for circles
    const pulseInterval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 3);
    }, 600);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  return (
    <YStack alignItems="center" gap={baseSpacing * 1.5} paddingVertical={baseSpacing}>
      <XStack alignItems="center" gap={12}>
        {[0, 1, 2].map((index) => (
          <Circle
            key={index}
            size={pulseIndex === index ? 14 : 8}
            backgroundColor={pulseIndex === index ? colors.accentBg : colors.border}
            animation="bouncy"
            opacity={pulseIndex === index ? 1 : 0.4}
            scale={pulseIndex === index ? 1.2 : 1}
          />
        ))}
      </XStack>
      <AnimatePresence>
        <YStack
          key={messageIndex}
          animation="quick"
          enterStyle={{ opacity: 0, y: 10 }}
          exitStyle={{ opacity: 0, y: -10 }}
          opacity={1}
          y={0}
          alignItems="center"
          height={25}
        >
          <Text 
            color={colors.text} 
            fontSize={fontSizes.sm} 
            textAlign="center"
            fontWeight="500"
          >
            {loadingMessages[messageIndex]}{dots}
          </Text>
        </YStack>
      </AnimatePresence>

      <YStack width="90%" alignItems="center" gap={4}>
        <XStack 
          width="100%" 
          height={4} 
          backgroundColor={colors.border} 
          borderRadius={3} 
          overflow="hidden"
        >
          <View
            height="100%"
            backgroundColor={colors.accentBg}
            animation="lazy"
            width={`${Math.min((messageIndex + 1) * 20, 100)}%`}
            borderRadius={3}
          />
        </XStack>
        <Text 
          color={colors.subtext} 
          fontSize={fontSizes.xs} 
          textAlign="center"
        >
          {Math.min((messageIndex + 1) * 20, 100)}% complete
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
          borderColor: isLoading ? colors.border : colors.accentBg,
          opacity: isLoading ? 0.7 : 1,
        }}
        value={inputInviteCode}
        onChangeText={setInputInviteCode}
        placeholder="Enter workspace invite code"
        placeholderTextColor={colors.subtext}
        autoCapitalize="none"
        editable={!isLoading}
      />
      
      <Button
        onPress={connectToWorkspace}
        backgroundColor={isLoading ? colors.card : colors.accentBg}
        width={isWeb ? 400 : isIpad() ? 300 : 250}
        borderColor={isLoading ? colors.border : colors.accentBg}
        borderWidth={2}
        height={isLoading ? 120 : 50}
        pressStyle={{ scale: isLoading ? 1 : 0.97 }}
        animation="quick"
        style={{ 
          borderRadius: buttonRadius,
          shadowColor: isLoading ? 'transparent' : colors.accentBg,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <LoadingAnimation colors={colors} />
        ) : (
          <Text color={colors.text} fontFamily="$body" fontSize={fontSizes.md} fontWeight="600">
            Join Workspace
          </Text>
        )}
      </Button>

      {!isLoading && (
        <Text 
          color={colors.subtext} 
          fontSize={fontSizes.xs} 
          textAlign="center"
          paddingHorizontal={baseSpacing * 2}
        >
          This will sync your data and settings with the workspace
        </Text>
      )}
    </YStack>
  );
}
