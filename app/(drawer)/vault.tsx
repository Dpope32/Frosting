import React, { useState, useEffect } from 'react'
import { ScrollView, useColorScheme, Platform } from 'react-native'
import { YStack, Button, isWeb } from 'tamagui'
import { useVault } from '@/hooks/useVault'
import { BlurView } from 'expo-blur'
import { useUserStore } from '@/store/UserStore'
import { useToastStore } from '@/store/ToastStore'
import { AddVaultEntryModal } from '@/components/cardModals/AddVaultEntryModal'
import { Plus } from '@tamagui/lucide-icons'
import { VaultRecommendationModal } from '@/components/modals/VaultRecommendationModal'
import { VaultCard } from '@/components/vault/VaultCard'
import { VaultEmpty } from '@/components/vault/VaultEmpty'

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
    <YStack f={1} mt={isWeb ? 50 : 90} bg={isDark ? '#010101' : '#f6f6f6'} marginLeft={isWeb? 24 : 0}>
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
          <VaultEmpty
            isDark={isDark}
            primaryColor={primaryColor}
            isWeb={isWeb}
            setSocialMediaModalOpen={setSocialMediaModalOpen}
            setEmailCloudModalOpen={setEmailCloudModalOpen}
            setShoppingModalOpen={setShoppingModalOpen}
            setWorkModalOpen={setWorkModalOpen}
          />
        ) : Platform.OS === 'web' ? (
          data?.items.map((cred: VaultEntry) => (
            <VaultCard
              key={cred.id}
              cred={cred}
              isDark={isDark}
              primaryColor={primaryColor}
              visiblePasswords={visiblePasswords}
              togglePasswordVisibility={togglePasswordVisibility}
              isWeb={isWeb}
              columnWidthWeb={columnWidthWeb}
            />
          ))
        ) : (
          <YStack gap="$2" width="100%">
            {data?.items.map((cred: VaultEntry) => (
              <VaultCard
                key={cred.id}
                cred={cred}
                isDark={isDark}
                primaryColor={primaryColor}
                visiblePasswords={visiblePasswords}
                togglePasswordVisibility={togglePasswordVisibility}
                isWeb={isWeb}
              />
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
