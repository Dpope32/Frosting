// BaseCardAnimated.tsx
import React from 'react'
import { StyleSheet, TouchableWithoutFeedback, View, Dimensions } from 'react-native' 
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColorScheme } from 'react-native'
import { Text, Theme, XStack, Button, isWeb, YStack } from 'tamagui'
import Animated, {
  ZoomIn,
  FadeIn, 
  FadeOut,
} from 'react-native-reanimated'
import { MaterialIcons } from '@expo/vector-icons'
import { isIpad } from '@/utils'
interface BaseCardAnimatedProps {
  onClose: () => void 
  title: string
  children: React.ReactNode
  modalWidth?: number
  modalMaxWidth?: number
  showCloseButton?: boolean
  titleProps?: any 
  visible?: boolean
}

export function BaseCardAnimatedWS({
  title,
  children,
  onClose, 
  modalWidth = isWeb ? 700 : isIpad() ? 500 : 360,
  modalMaxWidth = isWeb ? 700 : isIpad() ? 500 : 500,
  showCloseButton = true,
  visible = true,
}: BaseCardAnimatedProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
  const actualWidth = Math.min(
    typeof modalWidth === 'number' ? modalWidth : screenWidth * 0.85,
    typeof modalMaxWidth === 'number' ? modalMaxWidth : screenWidth * 0.88
  )

  if (!visible) return null;

  // Web implementation with position:fixed uses a Portal or YStack with absolute positioning + custom styling
  if (isWeb) {
    return (
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        width="100%"
        height="100%"
        backgroundColor="rgba(0, 0, 0, 0.85)"
        alignItems="center"
        justifyContent="center"
        zIndex={10000}
        enterStyle={{ opacity: 0 }}
        animation="quick"
        {...(isWeb ? { style: { position: 'fixed' } as any } : {})}
      >
        <TouchableWithoutFeedback>
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            width: '100%',
            height: '100%'
          }}>
            <Theme name={isDark ? 'dark' : 'light'}>
              <Animated.View
                entering={ZoomIn.duration(300).springify()}
                exiting={FadeOut.duration(300)} 
                                  style={[
                    styles.modalContainer,
                    {
                      backgroundColor: isDark ? '#222' : '#fff',
                      marginTop: insets.top + 20, 
                      marginBottom: insets.bottom + 40,
                      width: actualWidth,
                      maxHeight: screenHeight * 0.9,
                    }
                  ]}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                <XStack justifyContent="space-between" py="$2" marginTop={isIpad() ? -8 : -8} marginBottom={isIpad() ? 8 : 8} px="$2" alignItems="center">
                  <Text
                    fontSize={24}
                    fontWeight="700"
                    fontFamily="$body"
                    color={isDark ? "#fffaef" : "black"}
                    marginBottom={0}
                  >
                    {title}
                  </Text>
                  {showCloseButton && (
                    <Button
                      backgroundColor="transparent"
                      onPress={onClose} 
                      padding={8}
                      pressStyle={{ opacity: 0.7 }}
                      icon={<MaterialIcons name="close" size={24} color={isDark ? "#fff" : "#000"}/>}
                    />
                  )}
                </XStack>
                <View style={{ position: 'relative' }}>
                  {children}
                </View>
              </Animated.View>
            </Theme>
          </View>
        </TouchableWithoutFeedback>
      </YStack>
    )
  }

  // Native implementation
  return (
    <Animated.View
      style={styles.overlay}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(300)}
      pointerEvents="box-none"
    >
      <TouchableWithoutFeedback>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: screenHeight * 0.1,
          }}
        >
          <Theme name={isDark ? 'dark' : 'light'}>
            <Animated.View
              entering={ZoomIn.duration(300).springify()}
              exiting={FadeOut.duration(300)} 
                              style={[
                  styles.modalContainer,
                  {
                    backgroundColor: isDark ? '#141415' : '#fff',
                    marginTop: insets.top + 20, 
                    marginBottom: insets.bottom + 20,
                    width: actualWidth,
                    maxHeight: screenHeight,
                    minHeight: 180,
                  }
                ]}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <XStack justifyContent="space-between" py="$2" marginTop={-8} marginBottom={2} pl={isIpad() ? "$2" : "$3"} pr={isIpad() ? "$2" : "$2"} alignItems="center">
                <Text
                  fontSize={20}
                  fontWeight="700"
                  fontFamily="$body"
                  color={isDark ? "#fffaef" : "black"}
                  marginBottom={0}
                >
                  {title}
                </Text>
                {showCloseButton && (
                  <Button
                    backgroundColor="transparent"
                    onPress={onClose} 
                    padding={8}
                    pressStyle={{ opacity: 0.7 }}
                    icon={<MaterialIcons name="close" size={24} color={isDark ? "#c9c9c9" : "#000"}/>}
                  />
                )}
              </XStack>
              <View style={{ position: 'relative' }}>
                {children}
              </View>
            </Animated.View>
          </Theme>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, 
  },
  modalContainer: {
    alignSelf: 'center',
    justifyContent: 'flex-start',
    borderRadius: 16,
    padding: 12,
    paddingHorizontal: isWeb? 32 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingBottom: isWeb? 16 : 12,
    zIndex: 1,
  },
})