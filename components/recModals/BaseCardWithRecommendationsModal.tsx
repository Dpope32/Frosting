import React, { useRef } from 'react';
import { Sheet, Text, Theme, isWeb, Button, XStack, YStack} from 'tamagui';
import { KeyboardAvoidingView, Platform, useColorScheme, ScrollView as RNScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { isIpad } from '@/utils';

interface BaseCardWithRecommendationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  recommendationChips?: React.ReactNode | null;
  filterChips?: React.ReactNode | null; 
  snapPoints?: number[];
  position?: number;
  dismissOnSnapToBottom?: boolean;
  zIndex?: number;
  showCloseButton?: boolean;
  hideHandle?: boolean;
}

export function BaseCardWithRecommendationsModal({
  open,
  onOpenChange,
  title,
  children,
  recommendationChips,
  filterChips,
  snapPoints = isWeb ? [95] : [90],
  position = 0,
  dismissOnSnapToBottom = true,
  zIndex = 100000,
  showCloseButton = true,
  hideHandle = false
}: BaseCardWithRecommendationsModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'ios' ? insets.top : 0;
  const handleClose = () => { onOpenChange(false); };

  return (
    <Theme name={isDark ? "dark" : "light"}>
      <Sheet
        modal
        open={open}
        onOpenChange={onOpenChange}
        snapPoints={snapPoints}
        position={position}
        dismissOnSnapToBottom={dismissOnSnapToBottom}
        zIndex={zIndex}
        disableDrag={false}
      >
        <Sheet.Overlay
          animation="quick"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor={isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.15)"}
        />
        <Sheet.Frame
          py={Platform.OS === 'web' ? "$2" : "$0"}
          paddingHorizontal={Platform.OS === 'web' ? "$6" : "$3.5"}
          backgroundColor={isDark ? "rgb(18, 18, 18)" : "rgb(255, 255, 255)"}
          borderTopLeftRadius={20}
          paddingBottom={32}
          borderTopRightRadius={20}
          borderWidth={1}
          borderColor={isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}
          gap={Platform.OS === 'web' ? "$1" : "$0"}
          shadowColor="transparent"
          shadowOffset={{ width: 0, height: 0 }}
          shadowOpacity={0}
          shadowRadius={0}
          elevation={0}
          {...(Platform.OS === 'web' ?
            {
              maxWidth: 1000,
              marginHorizontal: 'auto',
              minHeight: 500,
              maxHeight: 'calc(100vh)',
              boxShadow: 'none',
            } : {}
          )}
        >
          {!hideHandle && <Sheet.Handle marginBottom="$2" />}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, paddingTop: Math.max(topInset - 45, 0)  }}
          >
            <Animated.View entering={FadeIn.duration(400)} style={{ marginTop: hideHandle ? 8 : isIpad() ? 0 : -10, paddingHorizontal: 6 }}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text
                  fontSize={22}
                  fontWeight="700"
                  color={isDark ? "#fff" : "#000"}
                  opacity={isDark ? 1 : 0.9}
                  fontFamily="$body"
                >
                  {title}
                </Text>
                {showCloseButton && (
                  <Button
                    backgroundColor="transparent"
                    onPress={handleClose}
                    padding="$1"
                    pressStyle={{ opacity: 0.7 }}
                    icon={<MaterialIcons name="close" size={24} color={isDark ? "#fff" : "#000"} />}
                  />
                )}
              </XStack>
            </Animated.View>

            {(recommendationChips || filterChips) && (
              <YStack p="$1">
                {recommendationChips && (
                  <RNScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 4, marginBottom: filterChips ? 8 : 0 }}
                  >
                    <XStack gap="$2">
                      {recommendationChips}
                    </XStack>
                  </RNScrollView>
                )}
                {filterChips && (
                   <RNScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 4 }}
                  >
                    <XStack gap={Platform.OS === 'web' ? "$2" : "$2"}>
                      {React.Children.toArray(filterChips).map((chip, idx) => {
                        if (!chip || typeof chip !== 'object' || !('props' in chip)) return null;
                        if (!React.isValidElement(chip)) return null;
                        if (Platform.OS === 'web') return chip;
                        const extraProps: any = {
                          style: [{ ...(chip.props && chip.props.style ? chip.props.style : {}), minHeight: 38, minWidth: 38, paddingHorizontal: 14, fontSize: 12 }],
                          key: chip.key ?? idx 
                        };
                        if ('size' in chip.props) {
                          extraProps.size = chip.props.size ? chip.props.size : '$5' ;
                        }
                        return React.cloneElement(chip, extraProps);
                      })}
                    </XStack>
                  </RNScrollView>
                )}
              </YStack>
            )}
            <Sheet.ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              contentContainerStyle={Platform.OS === 'web' ? { paddingBottom: 80 } : {}}
            >
              <GestureHandlerRootView style={{ flex: 1 }}>
                <YStack f={1} p="$2" gap={isIpad() ? "$4" : "$2"}>
                  {children}
                </YStack>
              </GestureHandlerRootView>
            </Sheet.ScrollView>
          </KeyboardAvoidingView>
        </Sheet.Frame>
      </Sheet>
    </Theme>
  );
}

