// BaseCardAnimated.tsx
import React from 'react'
import { StyleSheet, TouchableWithoutFeedback, View, Dimensions, Platform } from 'react-native' // Removed Modal
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColorScheme } from 'react-native'
import { Text, Theme, XStack, Button, isWeb } from 'tamagui'
import Animated, {
  ZoomIn,
  FadeIn, 
  FadeOut,
} from 'react-native-reanimated'
import { MaterialIcons } from '@expo/vector-icons'

interface BaseCardAnimatedProps {
  onClose: () => void 
  title: string
  children: React.ReactNode
  modalWidth?: number
  modalMaxWidth?: number
  showCloseButton?: boolean
  titleProps?: any 
}

export function BaseCardAnimated({
  title,
  children,
  onClose, 
  modalWidth = Platform.OS === 'web' ? 700 : 350,
  modalMaxWidth = Platform.OS === 'web' ? 700 : 500,
  showCloseButton = true,
}: BaseCardAnimatedProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
  const actualWidth = Math.min(
    typeof modalWidth === 'number' ? modalWidth : screenWidth * 0.88,
    typeof modalMaxWidth === 'number' ? modalMaxWidth : screenWidth * 0.92
  )

  // Calculate available height accounting for header and safe areas
  const headerHeight = Platform.OS === 'ios' ? 44 : 56 // Standard header heights
  const availableHeight = screenHeight - (insets.top + headerHeight + insets.bottom)

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          paddingTop: insets.top + headerHeight,
          paddingBottom: insets.bottom,
        }
      ]}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(300)}
      pointerEvents="box-none"
    >
      <TouchableWithoutFeedback 
        onPress={(e) => {
          if (Platform.OS === 'web' && e.target === e.currentTarget) {
            onClose();
          } else if (Platform.OS !== 'web') {
            onClose();
          }
        }}
      >
        <View 
          style={styles.container}
          pointerEvents={Platform.OS === 'web' ? 'auto' : 'box-none'}
        >
          <Theme name={isDark ? 'dark' : 'light'}>
              <Animated.View
                entering={ZoomIn.duration(300).springify()}
                exiting={FadeOut.duration(300)} 
                style={[
                  styles.modalContainer,
                  {
                    backgroundColor: isDark ? '#222' : '#fff',
                    width: actualWidth,
                    maxHeight: availableHeight - 40, // Leave some padding
                  }
                ]}
              >
                <XStack justifyContent="space-between" paddingVertical="$2" marginTop={-8} marginBottom={4} paddingHorizontal="$2" alignItems="center">
                  <Text
                    fontSize={isWeb? 24 : 20}
                    fontWeight="700"
                    fontFamily="$body"
                    color={isDark ? "#fffaef" : "black"}
                  >
                    {title}
                  </Text>
                  {showCloseButton && (
                    <Button
                      backgroundColor="transparent"
                      onPress={onClose} 
                      padding={0}
                      pressStyle={{ opacity: 0.7 }}
                      icon={<MaterialIcons name="close" size={22} color={isDark ? "#fff" : "#000"}/>}
                    />
                  )}
                </XStack>
                {children}
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
    zIndex: 300000,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    alignSelf: 'center',
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: isWeb? 32 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
})
