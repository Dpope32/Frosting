import React, { useState } from 'react';
import { ScrollView, Alert, ActivityIndicator } from 'react-native';
import { YStack, Text, XStack, Button } from 'tamagui';
import { useVault } from '@/hooks/useVault';
import { BlurView } from 'expo-blur';
import { useUserStore } from '@/store/UserStore';
import { useToastStore } from '@/store/ToastStore';
import { AddVaultEntryModal } from '@/components/cardModals/AddVaultEntryModal';
import { Plus, X, Copy } from '@tamagui/lucide-icons';

export default function VaultScreen() {
  const { data, isLoading, error, addVaultEntry, deleteVaultEntry } = useVault();
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const showToast = useToastStore((state) => state.showToast);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleAddEntry = (entry: { name: string; username: string; password: string }) => {
    addVaultEntry(entry);
    showToast('Entry added successfully', 'success');
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteVaultEntry(id);
              showToast('Entry deleted successfully', 'success');
            } catch (error) {
              Alert.alert("Error", "Failed to delete entry. Please try again.");
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <YStack f={1} jc="center" ai="center" mt={80} bg="#000000">
        <ActivityIndicator size="large" color={primaryColor} />
        <Text color="#FFFFFF" fontSize="$3">Loading vault...</Text>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack f={1} jc="center" ai="center" mt={80} bg="#000000">
        <Text color="#FF6B6B" fontSize="$3">Failed to load vault</Text>
        <Text color="#FFFFFF" fontSize="$2" ta="center" px="$4" mt="$2">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </Text>
      </YStack>
    );
  }

  return (
    <YStack f={1} mt={90} bg="#000000">
      <ScrollView 
        contentContainerStyle={{ 
          padding: 12,
          paddingBottom: 80
        }}
      >
        <YStack gap="$2">
          {data?.items.length === 0 ? (
            <XStack 
              bg="#1A1A1A" 
              p="$3" 
              borderRadius="$2"
              ai="center"
              jc="center"
            >
              <Text color="#666" fontSize="$3">No entries in vault</Text>
            </XStack>
          ) : (
            data?.items.map((cred) => (
              <XStack 
                key={cred.id}
                bg="#1A1A1A" 
                p="$3" 
                borderRadius="$2"
                ai="center"
                animation="quick"
              >
                <YStack flex={1} gap="$1">
                  <XStack jc="space-between" ai="center" mb="$1">
                    <Text color={primaryColor} fontSize="$4" fontWeight="bold">
                      {cred.name}
                    </Text>
                    <Button
                      size="$2"
                      bg="transparent"
                      pressStyle={{ scale: 0.9 }}
                      onPress={() => handleDelete(cred.id)}
                      icon={<X size={16} color="#666" />}
                    />
                  </XStack>
                  
                  <XStack ai="center" gap="$2">
                    <Text color="#666" fontSize="$3" w={70}>Username:</Text>
                    <Text color="#fff" fontSize="$3" flex={1}>{cred.username}</Text>
                    <Button
                      size="$1"
                      bg="transparent"
                      pressStyle={{ scale: 0.9 }}
                      onPress={() => showToast('Username copied', 'success')}
                      icon={<Copy size={14} color="#666" />}
                    />
                  </XStack>
                  
                  <XStack ai="center" gap="$2">
                    <Text color="#666" fontSize="$3" w={70}>Password:</Text>
                    <Text color="#fff" fontSize="$3" flex={1}>{cred.password}</Text>
                    <Button
                      size="$1"
                      bg="transparent"
                      pressStyle={{ scale: 0.9 }}
                      onPress={() => showToast('Password copied', 'success')}
                      icon={<Copy size={14} color="#666" />}
                    />
                  </XStack>
                </YStack>
              </XStack>
            ))
          )}
        </YStack>
      </ScrollView>

      <Button
        onPress={() => setIsModalVisible(true)}
        position="absolute"
        bottom="$6"
        right="$4"
        zIndex={1000}
        size="$4"
        circular
        bg={primaryColor}
        pressStyle={{ scale: 0.95 }}
        animation="quick"
        elevation={4}
      >
        <Plus color="white" size={24} />
      </Button>

      <AddVaultEntryModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleAddEntry}
      />

      <BlurView
        intensity={20}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
        }}
      />
    </YStack>
  );
}