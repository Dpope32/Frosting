// BaseCardAnimated.tsx
import React from 'react'
import { StyleSheet, TouchableWithoutFeedback, View, Dimensions, Platform } from 'react-native' // Removed Modal
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColorScheme } from 'react-native'
import { Text, Theme, XStack, Button } from 'tamagui'
import Animated, {
  ZoomIn,
  FadeIn, // Added FadeIn for overlay
  FadeOut,
} from 'react-native-reanimated'
import { MaterialIcons } from '@expo/vector-icons'

interface BaseCardAnimatedProps {
  // open prop is no longer needed here, parent will conditionally render this component
  onClose: () => void // Changed onOpenChange to onClose
  title: string
  children: React.ReactNode
  modalWidth?: number
  modalMaxWidth?: number
  showCloseButton?: boolean
}

export function BaseCardAnimated({
  // Removed open, onOpenChange from destructuring
  title,
  children,
  onClose, // Added onClose to destructuring
  modalWidth = Platform.OS === 'web' ? 700 : 350,
  modalMaxWidth = Platform.OS === 'web' ? 700 : 500,
  showCloseButton = true,
}: BaseCardAnimatedProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
  const actualWidth = Math.min(
    typeof modalWidth === 'number' ? modalWidth : screenWidth * 0.85,
    typeof modalMaxWidth === 'number' ? modalMaxWidth : screenWidth * 0.95
  )

  return (
    // Use Animated.View for the overlay with FadeIn/FadeOut
    <Animated.View
      style={styles.overlay}
      entering={FadeIn.duration(200)} // Faster fade for overlay
      exiting={FadeOut.duration(300)} // Keep modal content fade duration
    >
      <TouchableWithoutFeedback onPress={onClose}> 
        {/* This inner View prevents the overlay press from propagating */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Theme name={isDark ? 'dark' : 'light'}>
              {/* Animated View for the modal content itself */}
              <Animated.View
                entering={ZoomIn.duration(300).springify()}
                exiting={FadeOut.duration(300)} // Keep FadeOut for content
                style={[
                  styles.modalContainer,
                  {
                    backgroundColor: isDark ? '#222' : '#fff',
                    marginTop: insets.top + 20,
                    marginBottom: insets.bottom + 20,
                    width: actualWidth,
                    maxHeight: screenHeight - 80,
                  }
                ]}
              >
                <XStack justifyContent="space-between" px="$2" alignItems="center" marginBottom={16}>
                  <Text
                    fontSize={24}
                    fontWeight="700"
                    fontFamily="$body"
                    color={isDark ? "#fffaef" : "#black"}
                    marginBottom={0}
                  >
                    {title}
                  </Text>
                  {showCloseButton && (
                    <Button
                      backgroundColor="transparent"
                      onPress={onClose} // Correct usage of onClose
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, // Make overlay cover the whole screen
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensure it's on top
  },
  modalContainer: {
    alignSelf: 'center',
    justifyContent: 'flex-start',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
})
