import React, { useState, useEffect } from 'react'
import { ScrollView, useColorScheme, Platform } from 'react-native'
import { YStack, Button, isWeb, XStack } from 'tamagui'
import { useVault } from '@/hooks/useVault'
import { BlurView } from 'expo-blur'
import { useUserStore } from '@/store/UserStore'
import { useToastStore } from '@/store/ToastStore'
import { AddVaultEntryModal } from '@/components/cardModals/creates/AddVaultEntryModal'
import { Plus, Database, Trash } from '@tamagui/lucide-icons'
import { VaultRecommendationModal } from '@/components/recModals/VaultRecommendationModal'
import { VaultCard } from '@/components/vault/VaultCard'
import { VaultEmpty } from '@/components/vault/VaultEmpty'
import { isIpad } from '@/utils/deviceUtils'
import { EditVaultModal } from '@/components/cardModals/edits/EditVaultModal'
import { VaultListModal } from '@/components/listModals/VaultListModal'
import { VaultEntry } from '@/types/vault'


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

  // Dev functions to load and clear vault entries
  const loadDevVaultEntries = () => {
    const sampleEntries = [
      { name: 'Google', username: 'user.userlastname@gmail.com', password: 'password123' },
      { name: 'GitHub', username: 'devuser', password: 'ghpass' },
      { name: 'Twitter', username: 'tweetuser', password: 'twpass' },
    ];
    sampleEntries.forEach((entry, index) => {
      setTimeout(() => {
        addVaultEntry(entry);
      }, index * 200);
    });
  };

  const deleteAllVaultEntries = () => {
    data?.items.forEach((item, index) => {
      setTimeout(() => {
        deleteVaultEntry(item.id);
      }, index * 200);
    });
  };

  // Split items into two columns for iPad landscape
  const items = data?.items || []
  const leftColumnItems = items.filter((_, idx) => idx % 2 === 0)
  const rightColumnItems = items.filter((_, idx) => idx % 2 === 1)

  const [editVaultModalOpen, setEditVaultModalOpen] = useState(false)
  const [selectedVaultEntry, setSelectedVaultEntry] = useState<VaultEntry | null>(null)
  const [vaultListModalOpen, setVaultListModalOpen] = useState(false)

  const handleEditVault = (entry: VaultEntry) => {
    setSelectedVaultEntry(entry)
    setEditVaultModalOpen(true)
  }

  return (
    <>
      <VaultListModal
        open={vaultListModalOpen}
        onOpenChange={setVaultListModalOpen}
        onEditVault={handleEditVault}
      />
      <EditVaultModal
        isVisible={editVaultModalOpen}
        onClose={() => { setEditVaultModalOpen(false); setSelectedVaultEntry(null) }}
        vaultEntry={selectedVaultEntry}
        onSubmit={() => { setEditVaultModalOpen(false); setSelectedVaultEntry(null) }}
      />
      <YStack f={1} pt={isWeb ? 90 : isIpad() ? isDark? 80:  70 : 90} bg={isDark ? '#000000' : '#f6f6f6'} paddingLeft={isWeb? 24 : isIpad() ? 4 : 0}>
        <ScrollView
        showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: isWeb ? 8 : 6,
            paddingBottom: 100,
            paddingHorizontal: isWeb ? 0 : 16,
            paddingTop: isWeb ? 0 : 20,
            paddingLeft: isWeb ? isIpad() ? 12 : 0 : 16,
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
                onDelete={() => {
                  deleteVaultEntry(cred.id)
                  showToast('Entry deleted', 'success')
                }}
              />
            ))
          ) : isIpad() ? (
            <XStack width="100%" gap="$3">
              <YStack flex={1} gap="$3">
                {leftColumnItems.map((cred: VaultEntry) => (
                  <VaultCard
                    key={cred.id}
                    cred={cred}
                    isDark={isDark}
                    primaryColor={primaryColor}
                    visiblePasswords={visiblePasswords}
                    togglePasswordVisibility={togglePasswordVisibility}
                    isWeb={isWeb}
                    onDelete={() => {
                      deleteVaultEntry(cred.id)
                      showToast('Entry deleted', 'success')
                    }}
                  />
                ))}
              </YStack>
              <YStack flex={1} gap="$3">
                {rightColumnItems.map((cred: VaultEntry) => (
                  <VaultCard
                    key={cred.id}
                    cred={cred}
                    isDark={isDark}
                    primaryColor={primaryColor}
                    visiblePasswords={visiblePasswords}
                    togglePasswordVisibility={togglePasswordVisibility}
                    isWeb={isWeb}
                    onDelete={() => {
                      deleteVaultEntry(cred.id)
                      showToast('Entry deleted', 'success')
                    }}
                  />
                ))}
              </YStack>
            </XStack>
          ) : (
            <YStack gap="$3" width="100%">
              {data?.items.map((cred: VaultEntry) => (
                <VaultCard
                  key={cred.id}
                  cred={cred}
                  isDark={isDark}
                  primaryColor={primaryColor}
                  visiblePasswords={visiblePasswords}
                  togglePasswordVisibility={togglePasswordVisibility}
                  isWeb={isWeb}
                  onDelete={() => {
                    deleteVaultEntry(cred.id)
                    showToast('Entry deleted', 'success')
                  }}
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

        {__DEV__ && (
          <XStack position='absolute' bottom={32} left={24} gap='$2' zIndex={1000}>
            <Button
              size='$4'
              circular
              bg='#00AAFF'
              pressStyle={{ scale: 0.95 }}
              animation='quick'
              elevation={4}
              onPress={loadDevVaultEntries}
              icon={<Database color='#FFF' size={20} />}
            />
            <Button
              size='$4'
              circular
              bg='#FF5555'
              pressStyle={{ scale: 0.95 }}
              animation='quick'
              elevation={4}
              onPress={deleteAllVaultEntries}
              icon={<Trash color='#FFF' size={20} />}
            />
          </XStack>
        )}

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
    </>
  )
}
