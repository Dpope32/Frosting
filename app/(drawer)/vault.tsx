import React, { useState, useEffect } from 'react'
import { ScrollView, Alert, ActivityIndicator, useColorScheme, Platform } from 'react-native'
import { YStack, Text, XStack, Button } from 'tamagui'
import { useVault } from '@/hooks/useVault'
import { BlurView } from 'expo-blur'
import { useUserStore } from '@/store/UserStore'
import { useToastStore } from '@/store/ToastStore'
import { AddVaultEntryModal } from '@/components/cardModals/AddVaultEntryModal'
import { Plus, X, Eye, EyeOff } from '@tamagui/lucide-icons'

interface VaultEntry {
  id: string
  name: string
  username: string
  password: string
}

export default function VaultScreen() {
  const { data, addVaultEntry, deleteVaultEntry } = useVault()
  const primaryColor = useUserStore((state) => state.preferences.primaryColor)
  const showToast = useToastStore((state) => state.showToast)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)

  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: string]: boolean }>({})
  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAddEntry = (entry: { name: string; username: string; password: string }) => {
    addVaultEntry(entry)
    showToast('Entry added successfully', 'success')
  }

  const handleDelete = (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteVaultEntry(id)
            showToast('Entry deleted successfully', 'success')
          } catch {
            Alert.alert('Error', 'Failed to delete entry. Please try again.')
          }
        },
      },
    ])
  }

  useEffect(() => {
    if (Platform.OS !== 'web') return
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getColumnCount = () => {
    if (windowWidth < 768) return 1
    if (windowWidth < 1024) return 2
    if (windowWidth < 1280) return 3
    if (windowWidth < 1600) return 4
    return 5
  }

  const columnCount = getColumnCount()
  const columnWidth = `calc(${50 / columnCount}% - ${(columnCount - 1) * 8 / columnCount}px)`

  return (
    <YStack f={1} mt={isWeb ? 50 : 90} bg={isDark ? '#000000' : '#ffffff'} marginLeft={isWeb? 24 : 0}>
      <ScrollView
      showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: isWeb ? 8 : 8,
          paddingBottom: 100,
          paddingHorizontal: isWeb ? 0 : 16,
          paddingLeft: isWeb ? 24 : 16,
          display: isWeb ? 'flex' : undefined,
          flexDirection: isWeb ? 'row' : undefined,
          flexWrap: isWeb ? 'wrap' : undefined,
          justifyContent: isWeb ? 'flex-start' : undefined,
          gap: isWeb ? 32 : undefined,
          maxWidth: isWeb ? 1800 : undefined,
          marginHorizontal: isWeb ? 'auto' : undefined,
        }}
      >
        {data?.items.length === 0 ? (
          <XStack
            bg={isDark ? '#1A1A1A' : '#f5f5f5'}
            p="$6"
            borderRadius="$4"
            ai="center"
            jc="center"
            borderWidth={1}
            borderColor={isDark ? '#333' : '#e0e0e0'}
            width="100%"
          >
            <Text color={isDark ? '#666' : '#999'} fontSize="$3" textAlign="center" fontFamily="$body">
              No entries in vault
            </Text>
          </XStack>
        ) : Platform.OS === 'web' ? (
          data?.items.map((cred: VaultEntry) => (
            <XStack
              key={cred.id}
              bg={isDark ? '#1A1A1A' : '#f5f5f5'}
              paddingHorizontal="$4"
              borderRadius="$4"
              borderWidth={1}
              borderColor={isDark ? '#333' : '#e0e0e0'}
              ai="center"
              animation="quick"
              width={columnWidth}
              minWidth={300}
              maxWidth={400}
              height={140}
              hoverStyle={{
                transform: [{ scale: 1.02 }],
                borderColor: primaryColor,
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
              }}
            >
              <YStack flex={1}>
                <XStack jc="space-between" ai="center" mt="$1" mb="$2">
                  <Text color={isDark ? '#fff' : '#333'} fontSize="$4" fontWeight="bold" fontFamily="$body">
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
                  <Text color={isDark ? '#666' : '#666'} fontSize="$3" w={70} fontFamily="$body">
                    Username:
                  </Text>
                  <Text color={isDark ? '#fff' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
                    {cred.username}
                  </Text>
                </XStack>

                <XStack ai="center" gap="$2">
                  <Text color={isDark ? '#666' : '#666'} fontSize="$3" w={70} fontFamily="$body">
                    Password:
                  </Text>
                  <Text color={isDark ? '#fff' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
                    {visiblePasswords[cred.id] ? cred.password : '••••••••'}
                  </Text>
                  <Button
                    size="$3"
                    bg="transparent"
                    pressStyle={{ scale: 0.9 }}
                    hoverStyle={{
                      bg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    }}
                    onPress={() => togglePasswordVisibility(cred.id)}
                    icon={
                      visiblePasswords[cred.id] ? (
                        <EyeOff size={18} color={isDark ? '#666' : '#999'} />
                      ) : (
                        <Eye size={18} color={isDark ? '#666' : '#999'} />
                      )
                    }
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
                bg={isDark ? '#1A1A1A' : '#f5f5f5'}
                p="$2"
                paddingHorizontal={isWeb? 0 : "$4"}
                borderRadius="$4"
                borderWidth={1}
                borderColor={isDark ? '#333' : '#e0e0e0'}
                ai="center"
                animation="quick"
                mb="$2"
              >
                <YStack flex={1}>
                  <XStack jc="space-between" ai="center" mb="$0">
                    <Text color={isDark ? '#fff' : '#333'} fontSize="$4" fontWeight="bold" fontFamily="$body">
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

                  <XStack ai="center" gap="$1" mb="$0">
                    <Text color={isDark ? '#666' : '#666'} fontSize="$3" w={70} fontFamily="$body">
                      Username:
                    </Text>
                    <Text color={isDark ? '#fff' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
                      {cred.username}
                    </Text>
                  </XStack>

                  <XStack ai="center" gap="$1">
                    <Text color={isDark ? '#666' : '#666'} fontSize="$3" w={70} fontFamily="$body">
                      Password:
                    </Text>
                    <Text color={isDark ? '#fff' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
                      {visiblePasswords[cred.id] ? cred.password : '••••••••'}
                    </Text>
                    <Button
                      size="$3"
                      bg="transparent"
                      pressStyle={{ scale: 0.9 }}
                      onPress={() => togglePasswordVisibility(cred.id)}
                      icon={
                        visiblePasswords[cred.id] ? (
                          <EyeOff size={18} color={isDark ? '#666' : '#999'} />
                        ) : (
                          <Eye size={18} color={isDark ? '#666' : '#999'} />
                        )
                      }
                    />
                  </XStack>
                </YStack>
              </XStack>
            ))}
          </YStack>
        )}
      </ScrollView>

      <Button
        onPress={() => setIsModalVisible(true)}
        position="absolute"
        bottom={32}
        right={24}
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
        tint={isDark ? 'dark' : 'light'}
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
  )
}
