import React, { useState } from 'react'
import { Button, Input, YStack, XStack, isWeb } from 'tamagui'
import { useUserStore } from '@/store/UserStore'
import { BaseCardAnimated } from './BaseCardAnimated'
import {  Platform, useColorScheme } from 'react-native'
import * as Haptics from 'expo-haptics'
import { isIpad } from '@/utils/deviceUtils'
import { useAutoFocus } from '@/hooks/useAutoFocus'
import { DebouncedInput } from '@/components/shared/debouncedInput'

interface AddVaultEntryModalProps {
  isVisible: boolean
  onClose: () => void
  onSubmit: (entry: { name: string; username: string; password: string }) => void
}

export function AddVaultEntryModal({ isVisible, onClose, onSubmit }: AddVaultEntryModalProps) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const primaryColor = useUserStore(s => s.preferences.primaryColor)
  const nameInputRef = React.useRef<any>(null);
  useAutoFocus(nameInputRef, 1000, isVisible);

  const resetForm = () => {
    setName('')
    setUsername('')
    setPassword('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = () => {
    if (!name.trim() || !username.trim() || !password.trim()) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
      return
    }

    onSubmit({
      name: name.trim(),
      username: username.trim(),
      password: password.trim()
    })
    resetForm()
    onClose()
  }

  return (
    <BaseCardAnimated
      onClose={handleClose}
      title="Add New Vault Entry"
      visible={isVisible}
    >
      <YStack gap={isIpad() ? "$4" : "$2"} py={isIpad() ? "$4" : "$2"} px={isIpad() ? "$4" : "$3"}>
        <DebouncedInput
          ref={nameInputRef}
          placeholder="Name"
          value={name}
          onDebouncedChange={setName}
          autoCapitalize="none"
          backgroundColor={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
          borderColor="transparent"
          color={isDark ? '#fff' : '#000'}
          placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
        />

        <Input
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          backgroundColor={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
          borderColor="transparent"
          color={isDark ? '#fff' : '#000'}
          placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          secureTextEntry
          backgroundColor={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
          borderColor="transparent"
          color={isDark ? '#fff' : '#000'}
          placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
        />

        <XStack gap="$3" justifyContent="space-between" marginTop="$2">
          <Button
            onPress={handleClose}
            backgroundColor="rgba(255, 4, 4, 0.1)"
            borderColor="$borderColor"
            fontFamily="$body"
            fontSize={isWeb ? "$5" : "$4"}
            paddingHorizontal="$4"
            color={isDark ? "$red10" : "$red10"}
          >
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            backgroundColor={primaryColor}
            disabled={!name.trim() || !username.trim() || !password.trim()}
            fontFamily="$body"
            fontSize={isWeb ? "$5" : "$4"}
            paddingHorizontal="$4"
            color={isDark ? "$white" : "#fff"}
          >
            Save
          </Button>
        </XStack>
      </YStack>
    </BaseCardAnimated>
  )
}