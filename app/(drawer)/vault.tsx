import React, { useState, useEffect } from 'react'
import { ScrollView, useColorScheme, Platform } from 'react-native'
import { YStack, Text, XStack, Button, isWeb } from 'tamagui'
import { useVault } from '@/hooks/useVault'
import { BlurView } from 'expo-blur'
import { useUserStore } from '@/store/UserStore'
import { useToastStore } from '@/store/ToastStore'
import { AddVaultEntryModal } from '@/components/cardModals/AddVaultEntryModal'
import { Plus, Eye, EyeOff } from '@tamagui/lucide-icons'
import { VaultRecommendationChip } from '@/constants/recommendations/VaultRecommendations'
import { VaultRecommendationModal } from '@/components/modals/VaultRecommendationModal'

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
  const [socialMediaModalOpen, setSocialMediaModalOpen] = useState(false)
  const [emailCloudModalOpen, setEmailCloudModalOpen] = useState(false)
  const [shoppingModalOpen, setShoppingModalOpen] = useState(false)
  const [workModalOpen, setWorkModalOpen] = useState(false)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)

  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: string]: boolean }>({})
  const togglePasswordVisibility = (id: string) => { setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }))}

  const handleAddEntry = (entry: { name: string; username: string; password: string }) => {
    addVaultEntry(entry)
    showToast('Entry added successfully', 'success')
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
  const columnWidthWeb = `calc(${100 / columnCount}% - ${(columnCount - 100) / columnCount}px)`

  return (
    <YStack f={1} mt={isWeb ? 50 : 90} bg={isDark ? '#000000' : '#f6f6f6'} marginLeft={isWeb? 24 : 0}>
      <ScrollView
      showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: isWeb ? 8 : 6,
          paddingBottom: 100,
          paddingHorizontal: isWeb ? 0 : 12,
          paddingLeft: isWeb ? 12 : 16,
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
            p="$4"
            borderRadius="$4"
            ai="flex-start"
            jc="center"
            borderWidth={1}
            borderColor={isDark ? '#222' : '#e0e0e0'}
            width="100%"
          >
            <YStack gap="$3" width="100%" paddingTop={16}>
              
              <YStack gap="$3" px="$2">
                <XStack gap="$2" ai="flex-start">
                  <Text color={primaryColor} fontSize={isWeb ? "$4" : "$3"} fontWeight="bold" fontFamily="$body">•</Text>
                  <YStack>
                    <Text color={isDark ? '#f6f6f6' : '#222'} fontSize="$4" fontWeight="bold" fontFamily="$body">
                      Store Your Credentials
                    </Text>
                    <Text color={isDark ? '#aaa' : '#666'} fontSize="$3" fontFamily="$body" marginTop="$1">
                      Add usernames and passwords for all your accounts in one secure location.
                    </Text>
                  </YStack>
                </XStack>
                
                <XStack gap="$2" ai="flex-start">
                  <Text color={primaryColor} fontSize={isWeb ? "$4" : "$3"} fontWeight="bold" fontFamily="$body">•</Text>
                  <YStack>
                    <Text color={isDark ? '#f6f6f6' : '#222'} fontSize="$4" fontWeight="bold" fontFamily="$body">
                      End-to-End Encryption
                    </Text>
                    <Text color={isDark ? '#aaa' : '#666'} fontSize="$3" fontFamily="$body" marginTop="$1">
                      All data is stored locally and protected using advanced cryptography techniques.
                    </Text>
                  </YStack>
                </XStack>
                
                <XStack gap="$2" ai="flex-start">
                  <Text color={primaryColor} fontSize={isWeb ? "$4" : "$3"} fontWeight="bold" fontFamily="$body">•</Text>
                  <YStack>
                    <Text color={isDark ? '#f6f6f6' : '#222'} fontSize="$4" fontWeight="bold" fontFamily="$body">
                      Easy Access & Management
                    </Text>
                    <Text color={isDark ? '#aaa' : '#666'} fontSize="$3" fontFamily="$body" marginTop="$1">
                      Quickly view, add, or remove entries with a simple and intuitive interface.
                    </Text>
                  </YStack>
                </XStack>
              </YStack>
              
              <Text color={isDark ? '#666' : '#888'} fontSize="$3" textAlign="center" fontFamily="$body" mt="$6" mb="$2">
                Quick add from common categories:
              </Text>
              
              <YStack width="100%">
                <XStack 
                  justifyContent={isWeb ? "space-between" : "flex-start"}
                  paddingHorizontal="$2"
                  gap="$2"
                  flexWrap="wrap"
                  width="100%"
                  flexDirection="row"
                >
                <VaultRecommendationChip 
                  category="Social Media" 
                  onPress={() => setSocialMediaModalOpen(true)} 
                  isDark={isDark}
                  isMainScreen={true}
                />

                <VaultRecommendationChip 
                  category="Misc" 
                  onPress={() => setEmailCloudModalOpen(true)} 
                  isDark={isDark}
                  isMainScreen={true}
                />

                <VaultRecommendationChip 
                  category="Shopping" 
                  onPress={() => setShoppingModalOpen(true)} 
                  isDark={isDark}
                  isMainScreen={true}
                />

                <VaultRecommendationChip 
                  category="Work" 
                  onPress={() => setWorkModalOpen(true)} 
                  isDark={isDark}
                  isMainScreen={true}
                />
                </XStack>
              </YStack>
              
              <Text color={isDark ? '#666' : '#888'} fontSize="$3" textAlign="center" fontFamily="$body" mt="$4">
                Or click the + button below to add a custom entry
              </Text>
            </YStack>
          </XStack>
        ) : Platform.OS === 'web' ? (
          data?.items.map((cred: VaultEntry) => (
            <XStack
              key={cred.id}
              bg={isDark ? '#1A1A1A' : '#f5f5f5'}
              paddingHorizontal="$4"
              borderRadius="$4"
              borderWidth={1}
              borderColor={isDark ? '#222' : '#e0e0e0'}
              ai="center"
              animation="quick"
              width={columnWidthWeb}
              minWidth={240}
              maxWidth={400}
              height={120}
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
                <XStack jc="space-between" ai="center" mt="$1" mb="$1.5">
                  <Text color={isDark ? '#f6f6f6' : '#222'} fontSize="$4" fontWeight="bold" fontFamily="$body">
                    {cred.name}
                  </Text>
                </XStack>

                <XStack ai="center" gap="$2" mb="$2">
                  <Text color={isDark ? '#666' : '#666'} fontSize="$3" w={70} fontFamily="$body">
                    Username:
                  </Text>
                  <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
                    {cred.username}
                  </Text>
                </XStack>

                <XStack ai="center" gap="$2">
                  <Text color={isDark ? '#666' : '#666'} fontSize="$3" w={70} fontFamily="$body">
                    Password:
                  </Text>
                  <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
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
                p="$1.5"
                paddingHorizontal={isWeb? 0 : "$4"}
                borderRadius="$4"
                borderWidth={1}
                borderColor={isDark ? '#222' : '#e0e0e0'}
                ai="center"
                animation="quick"
                mb="$1"
              >
                <YStack flex={1}>
                  <XStack jc="space-between" ai="center" paddingVertical="$2">
                    <Text color={isDark ? '#f6f6f6' : '#222'} fontSize="$4" fontWeight="bold" fontFamily="$body">
                      {cred.name}
                    </Text>
                  </XStack>

                  <XStack ai="center" gap="$1" mb="$1" ml="$3">
                    <Text color={isDark ? '#666' : '#666'} fontSize="$3" w={70} fontFamily="$body">
                      Username:
                    </Text>
                    <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
                      {cred.username}
                    </Text>
                  </XStack>

                  <XStack ai="center" gap="$1" ml="$3">
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
      
      <VaultRecommendationModal 
        open={socialMediaModalOpen} 
        onOpenChange={setSocialMediaModalOpen} 
        category="Social Media" 
      />
      
      <VaultRecommendationModal 
        open={emailCloudModalOpen} 
        onOpenChange={setEmailCloudModalOpen} 
        category="Misc" 
      />
      
      <VaultRecommendationModal 
        open={shoppingModalOpen} 
        onOpenChange={setShoppingModalOpen} 
        category="Shopping" 
      />
      
      <VaultRecommendationModal 
        open={workModalOpen} 
        onOpenChange={setWorkModalOpen} 
        category="Work" 
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