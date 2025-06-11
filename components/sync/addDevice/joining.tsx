import React, { useEffect, useState, useRef, useMemo } from 'react';
import { ActivityIndicator, TextInput, Platform, Animated, View, Modal } from 'react-native';
import { Text, Button, YStack, XStack, Circle, isWeb, Stack, Spinner } from 'tamagui';
import { baseSpacing, fontSizes, cardRadius, buttonRadius, Colors } from '@/components/sync/sharedStyles';
import { isIpad } from '@/utils/deviceUtils';

// Conditional BlurView import to prevent crashes
let BlurView: any = null;
try {
  if (Platform.OS !== 'web') {
    BlurView = require('expo-blur').BlurView;
  }
} catch (error) {
  console.warn('BlurView not available:', error);
}

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

      <Text 
        color={colors.text} 
        fontSize={fontSizes.sm} 
        textAlign="center"
        fontFamily="$body"
        fontWeight="500"
      >
        Joining workspace{dots}
      </Text>

      <YStack width="100%" alignItems="center" gap={4}>
        <View 
          style={{
            width: '100%',
            height: 3,
            backgroundColor: colors.border,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <View
            style={{
              height: '100%',
              backgroundColor: colors.accentBg,
              width: `${progress}%`,
              borderRadius: 2,
            }}
          />
        </View>
        <Text 
          color={colors.subtext} 
          fontSize={fontSizes.xs} 
          textAlign="center"
          fontFamily="$body"
        >
          {progress}%
        </Text>
      </YStack>
    </YStack>
  );
};

const JoiningOverlay = ({ colors, isDark }: { colors: Colors; isDark: boolean }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [dots, setDots] = useState('');
  const isComponentMounted = useRef(true);

  const isIpadDevice = !!isIpad(); 
  const safeWidth = isIpadDevice ? 400 : 380;
  const safeMaxWidth = isIpadDevice ? 400 : 380;

  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  // Fade in animation
  useEffect(() => {
    const animation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    });
    animation.start();
    return () => {
      animation.stop();
    };
  }, [fadeAnim]);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isComponentMounted.current) return;
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const animatedViewStyle = useMemo(() => ({
    opacity: fadeAnim,
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center' as 'center',
    alignItems: 'center' as 'center',
    zIndex: 99999,
  }), [fadeAnim]);

  const backgroundColor = isDark ? "rgba(14, 14, 15, 0.75)" : "rgba(0, 0, 0, 0.35)";

  const ContentComponent = () => {
    return (
      <XStack alignItems="center" justifyContent="center" gap="$3" paddingVertical="$2">
        <Spinner 
          size="large" 
          color={colors.accentBg}
          opacity={0.9}
        />
        
        <YStack alignItems="center" gap="$1">
          <Text 
            fontFamily="$body"
            fontSize={isWeb ? 16 : 14}
            fontWeight="600"
            color="$color"
            opacity={0.9}
          >
            Joining workspace{dots}
          </Text>
          <Text
            fontFamily="$body"
            fontSize={isWeb ? 13 : 11}
            color="$color"
            opacity={0.7}
          >
            Connecting to workspace...
          </Text>
        </YStack>
      </XStack>
    );
  };

  return (
    <Modal visible={true} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={animatedViewStyle}>
      {Platform.OS === 'web' || !BlurView ? (
        <Stack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          justifyContent="center"
          alignItems="center"
          style={{ 
            backdropFilter: 'blur(20px)', 
            backgroundColor: backgroundColor,
          }}
        >
          <Stack    
            backgroundColor={isDark ? 'rgba(35, 38, 47, 0.95)' : 'rgba(247, 248, 250, 0.95)'} 
            borderRadius={16} 
            padding="$3" 
            borderColor={isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.1)"} 
            borderWidth={1}
            style={{ 
              boxShadow: isDark 
                ? '0px 4px 24px rgba(0, 0, 0, 0.45), inset 0px 0px 1px rgba(255, 255, 255, 0.12)' 
                : '0px 4px 24px rgba(0, 0, 0, 0.15), inset 0px 0px 1px rgba(255, 255, 255, 0.2)',
              width: safeWidth,
              maxWidth: safeMaxWidth,
            }}
          >
            <ContentComponent />
          </Stack>
        </Stack>
      ) : (
        <BlurView 
          intensity={Platform.OS === 'ios' ? 80 : 120} 
          tint={isDark ? 'dark' : 'light'} 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View style={{
            backgroundColor: isDark ? 'rgba(35, 38, 47, 0.95)' : 'rgba(247, 248, 250, 0.95)', 
            padding: 12, 
            borderRadius: 16,
            borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.1)",
            borderWidth: 1,
            shadowColor: isDark ? "#000" : "rgba(0, 0, 0, 0.15)", 
            shadowOffset: { width: 0, height: 4 }, 
            shadowOpacity: 0.35,  
            shadowRadius: 12,
            elevation: 5, 
            width: safeWidth, 
            maxWidth: safeMaxWidth, 
          }}>
            <ContentComponent />
          </View>
        </BlurView>
      )}
    </Animated.View>
    </Modal>
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
    <>
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
          backgroundColor={colors.accentBg}
          width={isWeb ? 400 : isIpad() ? 300 : 250}
          borderColor={colors.border}
          borderWidth={2}
          height={40}
          pressStyle={{ scale: isLoading ? 1 : 0.97 }}
          animation="quick"
          style={{ borderRadius: buttonRadius }}
          disabled={isLoading}
          paddingHorizontal={baseSpacing}
        >
          <Text color={colors.text} fontFamily="$body" fontSize={fontSizes.md} fontWeight="600">
            Join Workspace
          </Text>
        </Button>
      </YStack>
      
      {isLoading && <JoiningOverlay colors={colors} isDark={isDark} />}
    </>
  );
}