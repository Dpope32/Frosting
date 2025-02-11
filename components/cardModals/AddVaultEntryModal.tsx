import React, { useState } from 'react';
import { Modal } from 'react-native';
import { Button, Input, Text, YStack, XStack } from 'tamagui';
import { useUserStore } from '@/store/UserStore';

interface AddVaultEntryModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (entry: { name: string; username: string; password: string }) => void;
}

export function AddVaultEntryModal({ isVisible, onClose, onSubmit }: AddVaultEntryModalProps) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);

  const handleSubmit = () => {
    if (name && username && password) {
      onSubmit({ name, username, password });
      setName('');
      setUsername('');
      setPassword('');
      onClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <YStack
        f={1}
        jc="center"
        ai="center"
        backgroundColor="rgba(0, 0, 0, 0.5)"
        px="$4"
      >
        <YStack
          backgroundColor="$background"
          p="$4"
          borderRadius="$4"
          width="100%"
          maxWidth={400}
          gap="$4"
        >
          <Text color="$color" fontSize="$6" fontWeight="bold" mb="$2">
            Add New Entry
          </Text>
          
          <Input
            placeholder="Name"
            value={name}
            onChangeText={setName}
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            placeholderTextColor="$placeholderColor"
            color="$color"
          />
          
          <Input
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            placeholderTextColor="$placeholderColor"
            color="$color"
          />
          
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            placeholderTextColor="$placeholderColor"
            color="$color"
          />

          <XStack gap="$3" jc="flex-end">
            <Button
              onPress={onClose}
              backgroundColor="$backgroundHover"
              borderColor="$borderColor"
            >
              Cancel
            </Button>
            <Button
              onPress={handleSubmit}
              backgroundColor={primaryColor}
              disabled={!name || !username || !password}
            >
              Save
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </Modal>
  );
}
