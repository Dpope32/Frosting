import React from 'react'
import { StyleSheet, Modal, TouchableWithoutFeedback, View, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColorScheme } from 'react-native'
import { Text, Theme, XStack, Button } from 'tamagui'
import Animated, {
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated'
import { MaterialIcons } from '@expo/vector-icons'

interface BaseCardAnimatedProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  modalWidth?: number
  modalMaxWidth?: number
  showCloseButton?: boolean
}

/**
 * Custom modal component that closes when clicking outside.
 * Uses React Native's Modal with TouchableWithoutFeedback for overlay clicks.
 */
export function BaseCardAnimated({
  open,
  onOpenChange,
  title,
  children,
  modalWidth = 350,
  modalMaxWidth = 500,
  showCloseButton = true
}: BaseCardAnimatedProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
  
  // Calculate actual width based on screen size and constraints
  const actualWidth = Math.min(
    typeof modalWidth === 'number' ? modalWidth : screenWidth * 0.85,
    typeof modalMaxWidth === 'number' ? modalMaxWidth : screenWidth * 0.95
  )
  
  return (
    <Theme name={isDark ? 'dark' : 'light'}>
      <Modal
        visible={open}
        transparent={true}
        animationType="fade"
        onRequestClose={() => onOpenChange(false)}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={() => onOpenChange(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <Animated.View
                entering={ZoomIn.duration(300).springify()}
                exiting={ZoomOut.duration(200).springify()}
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
                <XStack justifyContent="space-between" alignItems="center" marginBottom={16}>
                  <Text
                    style={[
                      styles.title,
                      { color: isDark ? '#fff' : '#000', marginBottom: 0 }
                    ]}
                  >
                    {title}
                  </Text>
                  {showCloseButton && (
                    <Button 
                      backgroundColor="transparent" 
                      onPress={() => {onOpenChange(false)}} 
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Theme>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0, // Lower z-index for the overlay
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
    zIndex: 1, // Lower z-index to ensure dropdowns can appear above
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16
  }
})