import React, { useState } from 'react';
import { ScrollView, Alert, ActivityIndicator } from 'react-native';
import { YStack, Text, Card, XStack, Button } from 'tamagui';
import { useVault } from '@/hooks/useVault';
import { BlurView } from 'expo-blur';
import { useUserStore } from '@/store/UserStore';
import { useToastStore } from '@/store/ToastStore';
import { AddVaultEntryModal } from '@/components/cardModals/AddVaultEntryModal';
import { Plus, X } from '@tamagui/lucide-icons';

export default function VaultScreen() {
  const { data, isLoading, error, addVaultEntry, deleteVaultEntry } = useVault();
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const nameColors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#A29BFE', '#F78FB3'];
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleAddEntry = (entry: { name: string; username: string; password: string }) => {
    addVaultEntry(entry);
    showToast('Entry added successfully', 'success');
  };

  const showToast = useToastStore((state) => state.showToast);

  const handleDelete = (id: string) => {
    console.log('(NOBRIDGE) LOG [VaultScreen] Delete button clicked for id:', id);
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry?",
      [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => console.log('(NOBRIDGE) LOG [VaultScreen] Delete cancelled')
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            console.log('(NOBRIDGE) LOG [VaultScreen] Delete confirmed, calling deleteVaultEntry...');
            try {
              await deleteVaultEntry(id);
              console.log('(NOBRIDGE) LOG [VaultScreen] Delete completed successfully');
              showToast('Entry deleted successfully', 'success');
            } catch (error) {
              console.log('(NOBRIDGE) LOG [VaultScreen] Delete failed:', error);
              Alert.alert(
                "Error",
                "Failed to delete entry. Please try again."
              );
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <YStack f={1} jc="center" ai="center" mt={80} backgroundColor="#1a1a1a">
        <ActivityIndicator size="large" color={primaryColor} />
        <Text color="#FFFFFF" fontSize="$4" mt="$4">Loading vault...</Text>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack f={1} jc="center" ai="center" mt={80} backgroundColor="#1a1a1a">
        <Text color="#FF6B6B" fontSize="$4">Failed to load vault</Text>
        <Text color="#FFFFFF" fontSize="$3" ta="center" px="$4" mt="$2">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </Text>
      </YStack>
    );
  }

  return (
    <YStack f={1} mt={90} px="$4" backgroundColor="#121212">
      <ScrollView 
        contentContainerStyle={{ 
          paddingVertical: 20,
          paddingBottom: 100
        }}
      >
        {data?.items.map((cred, index) => (
          <Card
            key={cred.id}
            mb="$3"
            p="$3"
            backgroundColor="rgba(30, 30, 30, 0.95)"
            borderRadius="$3"
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.2)"
          >
            <XStack justifyContent="space-between" alignItems="center" mb="$2">
              <Text
                color={nameColors[index % nameColors.length]}
                fontSize="$4"
                fontWeight="bold"
              >
                {cred.name}
              </Text>
              <Button
                size="$2"
                circular
                onPress={() => handleDelete(cred.id)}
                backgroundColor="transparent"
                pressStyle={{ scale: 0.95 }}
                p="$1"
              >
                <X color="rgba(255, 255, 255, 0.5)" size={14} />
              </Button>
            </XStack>
            <YStack gap="$1" px="$1">
              <XStack gap="$2" alignItems="center">
                <Text color="rgba(255, 255, 255, 0.5)" fontSize="$3" w={70}>Username:</Text>
                <Text color="#F5F5DC" fontSize="$3" flex={1}>{cred.username}</Text>
              </XStack>
              <XStack gap="$2" alignItems="center">
                <Text color="rgba(255, 255, 255, 0.5)" fontSize="$3" w={70}>Password:</Text>
                <Text color="#F5F5DC" fontSize="$3" flex={1}>{cred.password}</Text>
              </XStack>
            </YStack>
          </Card>
        ))}
      </ScrollView>

      <Button
        onPress={() => setIsModalVisible(true)}
        position="absolute"
        bottom="$8"
        right="$4"
        zIndex={1000}
        size="$4"
        width={120}
        height={40}
        borderRadius="$4"
        backgroundColor={primaryColor}
        pressStyle={{ scale: 0.95 }}
        animation="quick"
        elevation={4}
      >
        <Plus color="white" size={18} />
        <Text color="white" fontSize="$3" ml="$2">Add Entry</Text>
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
