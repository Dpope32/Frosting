// StockCardAnimated.tsx
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

interface StockCardAnimatedProps {
  open: boolean
  onClose: () => void 
  title: string
  children: React.ReactNode
  modalWidth?: number
  modalMaxWidth?: number
  showCloseButton?: boolean
  titleProps?: any 
}

export function StockCardAnimated({
  open,
  title,
  children,
  onClose, 
  modalWidth = Platform.OS === 'web' ? 700 : 360,
  modalMaxWidth = Platform.OS === 'web' ? 700 : 500,
  showCloseButton = true,
}: StockCardAnimatedProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
  const actualWidth = Math.min(
    typeof modalWidth === 'number' ? modalWidth : screenWidth * 0.88,
    typeof modalMaxWidth === 'number' ? modalMaxWidth : screenWidth * 0.92
  )

  if (!open) return null

  return (
    <Animated.View
      style={styles.overlay}
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
          style={{flex: 1, justifyContent: 'center', alignItems: 'center' }} 
          pointerEvents={Platform.OS === 'web' ? 'auto' : 'box-none'}
        >
       <View onStartShouldSetResponder={() => true}> 
            <Theme name={isDark ? 'dark' : 'light'}>
                <Animated.View
                  entering={ZoomIn.duration(300).springify()}
                  exiting={FadeOut.duration(300)} 
                style={[
                  styles.modalContainer,
                  {
                    backgroundColor: isDark ? '#222' : '#fff',
                    marginTop: insets.top + 20, 
                    marginBottom: insets.bottom +20,
                    width: actualWidth,
                    maxHeight: screenHeight,
                  }
                ]}
              >
                <XStack justifyContent="space-between" py="$2" marginTop={isWeb ? -8 : -8} marginBottom={isWeb ? 8 : 2} px="$2" alignItems="center">
                <Text
                    fontSize={isWeb? 24 : 20}
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
    padding: 20,
    paddingHorizontal: isWeb? 32 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingBottom: isWeb? 50 : 24,
    zIndex: 1,
  },
})
