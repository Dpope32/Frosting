import React, { useState } from 'react'
import { Button, Input, Text, YStack, XStack, Stack } from 'tamagui'
import { useUserStore } from '@/store/UserStore'
import { BaseCardModal } from './BaseCardModal'
import Animated, { SlideInRight, FadeIn } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { TouchableOpacity, Platform, useColorScheme, View } from 'react-native'
import * as Haptics from 'expo-haptics'

interface AddVaultEntryModalProps {
  isVisible: boolean
  onClose: () => void
  onSubmit: (entry: { name: string; username: string; password: string }) => void
}

export function AddVaultEntryModal({ isVisible, onClose, onSubmit }: AddVaultEntryModalProps) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const primaryColor = useUserStore((state) => state.preferences.primaryColor)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const evaluatePasswordStrength = (pwd: string) => {
    // A simple password strength evaluator
    let strength = 0
    
    if (pwd.length >= 8) strength += 1
    if (pwd.length >= 12) strength += 1
    if (/[A-Z]/.test(pwd)) strength += 1
    if (/[a-z]/.test(pwd)) strength += 1
    if (/[0-9]/.test(pwd)) strength += 1
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1
    
    return Math.min(5, strength)
  }

  const handlePasswordChange = (text: string) => {
    setPassword(text)
    setPasswordStrength(evaluatePasswordStrength(text))
  }

  const handleSubmit = () => {
    if (name && username && password) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }
      onSubmit({ name, username, password })
      setName('')
      setUsername('')
      setPassword('')
      setPasswordStrength(0)
      onClose()
    }
  }

  const getStrengthColor = (strength: number) => {
    if (strength < 2) return '#FF4444'
    if (strength < 4) return '#FFBB33'
    return '#00C851'
  }

  const getStrengthText = (strength: number) => {
    if (strength < 2) return 'Weak'
    if (strength < 4) return 'Medium'
    return 'Strong'
  }

  return (
    <BaseCardModal
      open={isVisible}
      onOpenChange={onClose}
      title="Add New Entry"
      snapPoints={[80]}
      showCloseButton={true}
      zIndex={200000}
    >
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={{ width: '100%' }}
      >
        <YStack gap="$4" paddingBottom="$4">
          <Animated.View entering={SlideInRight.delay(150).duration(400)}>
            <XStack alignItems="center" gap="$2">
              <Ionicons name="bookmark-outline" size={18} color={isDark ? "#aaa" : "#666"} />
              <Input
                flex={1}
                placeholder="Service or Website Name"
                value={name}
                onChangeText={setName}
                backgroundColor="$backgroundHover"
                borderColor="$borderColor"
                placeholderTextColor="$placeholderColor"
                fontFamily="$body"
                color="$color"
              />
            </XStack>
          </Animated.View>
          
          <Animated.View entering={SlideInRight.delay(250).duration(400)}>
            <XStack alignItems="center" gap="$2">
              <Ionicons name="person-outline" size={18} color={isDark ? "#aaa" : "#666"} />
              <Input
                flex={1}
                placeholder="Username or Email"
                value={username}
                onChangeText={setUsername}
                backgroundColor="$backgroundHover"
                borderColor="$borderColor"
                placeholderTextColor="$placeholderColor"
                fontFamily="$body"
                color="$color"
              />
            </XStack>
          </Animated.View>
          
          <Animated.View entering={SlideInRight.delay(350).duration(400)}>
            <XStack alignItems="center" gap="$2">
              <Ionicons name="lock-closed-outline" size={18} color={isDark ? "#aaa" : "#666"} />
              <Input
                flex={1}
                placeholder="Password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                backgroundColor="$backgroundHover"
                borderColor="$borderColor"
                placeholderTextColor="$placeholderColor"
                fontFamily="$body"
                color="$color"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={18} 
                  color={isDark ? "#aaa" : "#666"} 
                />
              </TouchableOpacity>
            </XStack>
            
            {/* Password strength indicator */}
            {password.length > 0 && (
              <YStack mt="$2" gap="$1">
                <XStack alignItems="center" justifyContent="space-between">
                  <Text fontFamily="$body" fontSize={12} color="$color" opacity={0.7}>
                    Password strength: {getStrengthText(passwordStrength)}
                  </Text>
                  <Text fontFamily="$body" fontSize={12} color={getStrengthColor(passwordStrength)}>
                    {passwordStrength}/5
                  </Text>
                </XStack>
                <XStack height={4} backgroundColor={isDark ? "$gray3" : "$gray2"} br={2} overflow="hidden">
                  <Animated.View 
                    style={{
                      width: `${(passwordStrength / 5) * 100}%`,
                      height: '100%',
                      backgroundColor: getStrengthColor(passwordStrength)
                    }}
                  />
                </XStack>
                
                {passwordStrength < 3 && (
                  <Text fontFamily="$body" fontSize={11} color="$color" opacity={0.7} mt="$1">
                    Tip: Use a mix of letters, numbers, and symbols
                  </Text>
                )}
              </YStack>
            )}
          </Animated.View>
          
          <Animated.View entering={FadeIn.delay(450).duration(400)}>
            <XStack gap="$3" jc="flex-end" mt="$2">
              <Button
                onPress={onClose}
                backgroundColor="$backgroundHover"
                borderColor="$borderColor"
                fontFamily="$body"
              >
                Cancel
              </Button>
              <Button
                onPress={handleSubmit}
                backgroundColor={primaryColor}
                disabled={!name || !username || !password}
                fontFamily="$body"
                pressStyle={{ scale: 0.97 }}
              >
                Save
              </Button>
            </XStack>
          </Animated.View>
        </YStack>
      </Animated.View>
    </BaseCardModal>
  )
}