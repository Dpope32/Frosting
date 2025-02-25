import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, ActivityIndicator, useColorScheme, Platform } from 'react-native';
import { YStack, Text, XStack, Button } from 'tamagui';
import { useVault } from '@/hooks/useVault';
import { BlurView } from 'expo-blur';
import { useUserStore } from '@/store/UserStore';
import { useToastStore } from '@/store/ToastStore';
import { AddVaultEntryModal } from '@/components/cardModals/AddVaultEntryModal';
import { Plus, X, Copy } from '@tamagui/lucide-icons';

interface VaultEntry {
  id: string;
  name: string;
  username: string;
  password: string;
}

export default function VaultScreen() {
  const { data, isLoading, error, addVaultEntry, deleteVaultEntry } = useVault();
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const showToast = useToastStore((state) => state.showToast);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const isWeb = Platform.OS === 'web';
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

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
  
  // Update window width on resize for web
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Calculate number of columns based on screen width
  const getColumnCount = () => {
    if (windowWidth < 768) return 1;
    if (windowWidth < 1024) return 2;
    if (windowWidth < 1280) return 3;
    if (windowWidth < 1600) return 4;
    return 5;
  };
  
  const columnCount = getColumnCount();
  const columnWidth = `calc(${100 / columnCount}% - ${(columnCount - 1) * 16 / columnCount}px)`;

  return (
    <YStack f={1} mt={90} bg={isDark ? "#000000" : "#ffffff"}>
      <ScrollView 
        contentContainerStyle={{ 
          padding: isWeb ? 16 : 8,
          paddingBottom: 100,
          display: isWeb ? 'flex' : undefined,
          flexDirection: isWeb ? 'row' : undefined,
          flexWrap: isWeb ? 'wrap' : undefined,
          justifyContent: isWeb ? 'flex-start' : undefined,
          gap: isWeb ? 16 : undefined,
          maxWidth: isWeb ? 1800 : undefined,
          marginHorizontal: isWeb ? 'auto' : undefined
        }}
      >
        {data?.items.length === 0 ? (
          <XStack 
            bg={isDark ? "#1A1A1A" : "#f5f5f5"}
            p="$6" 
            borderRadius="$4" 
            ai="center" 
            jc="center"
            borderWidth={1}
            borderColor={isDark ? "#333" : "#e0e0e0"}
            width="100%"
          >
            <Text color={isDark ? "#666" : "#999"} fontSize="$3" textAlign="center">No entries in vault</Text>
          </XStack>
        ) : (
          Platform.OS === 'web' ? (
            data?.items.map((cred: VaultEntry) => (
              <XStack 
                key={cred.id}
                bg={isDark ? "#1A1A1A" : "#f5f5f5"}
                p="$3"
                paddingHorizontal="$5"
                borderRadius="$4"
                borderWidth={1}
                borderColor={isDark ? "#333" : "#e0e0e0"}
                ai="center"
                animation="quick"
                width={columnWidth}
                minWidth={240}
                maxWidth={400}
                height={180}
                hoverStyle={isWeb ? { 
                  transform: [{ scale: 1.02 }],
                  borderColor: primaryColor,
                  shadowColor: primaryColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8
                } : undefined}
              >
                <YStack flex={1}>
                  <XStack jc="space-between" mt="$1" ai="center">
                    <Text color={isDark ? "#fff" : "#333"} mb="$2" fontSize="$5" fontWeight="bold">
                      {cred.name}
                    </Text>
                    <Button
                      size="$3"
                      bg="transparent"
                      pressStyle={{ scale: 0.9 }}
                      onPress={() => handleDelete(cred.id)}
                      icon={<X size={18} color="#ff4444" />}
                    />
                  </XStack>
                  
                  <XStack ai="center" gap="$2" mb="$2">
                    <Text color={isDark ? "#666" : "#666"} fontSize="$3" w={80}>Username:</Text>
                    <Text color={isDark ? "#fff" : "#000"} fontSize="$3" flex={1}>{cred.username}</Text>
                    <Button
                      size="$3"
                      bg="transparent"
                      pressStyle={{ scale: 0.9 }}
                      hoverStyle={isWeb ? { bg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' } : undefined}
                      onPress={() => {
                        navigator.clipboard?.writeText?.(cred.username);
                        showToast('Username copied', 'success');
                      }}
                      icon={<Copy size={18} color={isDark ? "#666" : "#999"} />}
                    />
                  </XStack>
                  
                  <XStack ai="center" gap="$2">
                    <Text color={isDark ? "#666" : "#666"} fontSize="$3" w={80}>Password:</Text>
                    <Text color={isDark ? "#fff" : "#000"} fontSize="$3" flex={1}>{cred.password}</Text>
                    <Button
                      size="$3"
                      bg="transparent"
                      pressStyle={{ scale: 0.9 }}
                      hoverStyle={isWeb ? { bg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' } : undefined}
                      onPress={() => {
                        navigator.clipboard?.writeText?.(cred.password);
                        showToast('Password copied', 'success');
                      }}
                      icon={<Copy size={18} color={isDark ? "#666" : "#999"} />}
                    />
                  </XStack>
                </YStack>
              </XStack>
            ))
          ) : (
            <YStack gap="$2" width="100%">
              {data?.items.map((cred: VaultEntry) => (
                <XStack 
                  key={cred.id}
                  bg={isDark ? "#1A1A1A" : "#f5f5f5"}
                  p="$1"
                  paddingHorizontal="$5"
                  borderRadius="$4"
                  borderWidth={1}
                  borderColor={isDark ? "#333" : "#e0e0e0"}
                  ai="center"
                  animation="quick"
                >
                <YStack flex={1}>
                  <XStack jc="space-between" mt="$1" ai="center">
                    <Text color={isDark ? "#fff" : "#333"} mb={-12} fontSize="$4" fontWeight="bold">
                      {cred.name}
                    </Text>
                    <Button
                      size="$3"
                      bg="transparent"
                      pressStyle={{ scale: 0.9 }}
                      onPress={() => handleDelete(cred.id)}
                      icon={<X size={18} color="#ff4444" />}
                    />
                  </XStack>
                  
                  <XStack ai="center" gap="$2" mb={-12}>
                    <Text color={isDark ? "#666" : "#666"} fontSize="$3" w={70}>Username:</Text>
                    <Text color={isDark ? "#fff" : "#000"} fontSize="$3" flex={1}>{cred.username}</Text>
                    <Button
                      size="$3"
                      bg="transparent"
                      pressStyle={{ scale: 0.9 }}
                      onPress={() => showToast('Username copied', 'success')}
                      icon={<Copy size={18} color={isDark ? "#666" : "#999"} />}
                    />
                  </XStack>
                  
                  <XStack ai="center" gap="$2">
                    <Text color={isDark ? "#666" : "#666"} fontSize="$3" w={70}>Password:</Text>
                    <Text color={isDark ? "#fff" : "#000"} fontSize="$3" flex={1}>{cred.password}</Text>
                    <Button
                      size="$3"
                      bg="transparent"
                      pressStyle={{ scale: 0.9 }}
                      onPress={() => showToast('Password copied', 'success')}
                      icon={<Copy size={18} color={isDark ? "#666" : "#999"} />}
                    />
                  </XStack>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          )
        )}
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
        tint={isDark ? "dark" : "light"}
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
