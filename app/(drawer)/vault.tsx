import React, { useState, useEffect } from 'react'
import { ScrollView, useColorScheme, Platform } from 'react-native'
import { YStack, Button, isWeb, XStack, Text } from 'tamagui'
import { useVault } from '@/hooks/useVault'
import { BlurView } from 'expo-blur'
import { useUserStore, useToastStore } from '@/store'
import { AddVaultEntryModal } from '@/components/cardModals/creates/AddVaultEntryModal'
import { MaterialIcons } from '@expo/vector-icons'
import { VaultRecommendationModal } from '@/components/recModals/VaultRecommendationModal'
import { VaultCard } from '@/components/vault/VaultCard'
import { VaultEmpty } from '@/components/vault/VaultEmpty'
import { isIpad } from '@/utils'
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
  const togglePasswordVisibility = (id: string) => { 
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }))
  }

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
    if (windowWidth < 640) return 1
    if (windowWidth < 1024) return 2
    if (windowWidth < 1440) return 3
    if (windowWidth < 1920) return 4
    return 5
  }

  const columnCount = getColumnCount()
  const columnWidthWeb = `calc(${100 / columnCount}% - 24px)`

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
      
      <YStack 
        flex={1} 
        paddingTop={isWeb ? 90 : isIpad() ? (isDark ? 80 : 70) : 80} 
        backgroundColor={isDark ? '#0a0a0a' : '#fafafa'}
        paddingLeft={isWeb ? 24 : isIpad() ? 4 : 0}
      >
        {isWeb && (
          <XStack 
            paddingHorizontal="$6" 
            paddingBottom="$2"
            alignItems="center"
            justifyContent="space-between"
          >
            <YStack>
              <Text 
                color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} 
                fontSize="$4" 
                fontFamily="$body"
                marginTop="$1"
              >
                {data?.items.length || 0} saved passwords
              </Text>
            </YStack>
            
          </XStack>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: isWeb ? 0 : 16,
            paddingBottom: 120,
            paddingTop: isWeb ? 10 : 20,
            display: isWeb ? 'flex' : undefined,
            flexDirection: isWeb ? 'row' : undefined,
            flexWrap: isWeb ? 'wrap' : undefined,
            justifyContent: isWeb ? 'flex-start' : undefined,
            gap: isWeb ? 24 : 16,
            maxWidth: isWeb ? 1800 : undefined,
            marginHorizontal: isWeb ? 'auto' : undefined,
          }}
        >
          {data?.items.length === 0 ? (
            <YStack 
              flex={1} 
              alignItems="center" 
              justifyContent="center" 
              paddingVertical="$10"
              width="100%"
            >
              <VaultEmpty
                isDark={isDark}
                primaryColor={primaryColor}
                isWeb={isWeb}
                setSocialMediaModalOpen={setSocialMediaModalOpen}
                setEmailCloudModalOpen={setEmailCloudModalOpen}
                setShoppingModalOpen={setShoppingModalOpen}
                setWorkModalOpen={setWorkModalOpen}
              />
            </YStack>
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
            <XStack width="100%" gap="$4">
              <YStack flex={1} gap="$4">
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
              <YStack flex={1} gap="$4">
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
            <YStack gap="$4" width="100%">
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

        {/* Floating Action Button - Only show on mobile/tablet */}
        {!isWeb && (
          <Button
            onPress={() => setIsModalVisible(true)}
            position="absolute"
            bottom={32}
            right={24}
            zIndex={1000}
            size="$5"
            circular
            backgroundColor={primaryColor}
            pressStyle={{ scale: 0.95 }}
            animation="quick"
            shadowColor={primaryColor}
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.3}
            shadowRadius={8}
            elevation={8}
          >
            <MaterialIcons name="add" color="white" size={28} />
          </Button>
        )}

        {/* Dev Buttons */}
        {__DEV__ && (
          <XStack position='absolute' bottom={32} left={24} gap='$3' zIndex={1000}>
            <Button
              size='$4'
              circular
              backgroundColor='#3b82f6'
              pressStyle={{ scale: 0.95 }}
              animation='quick'
              shadowColor='#3b82f6'
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.3}
              shadowRadius={4}
              elevation={4}
              onPress={loadDevVaultEntries}
              icon={<MaterialIcons name="storage" color='#FFF' size={20} />}
            />
            <Button
              size='$4'
              circular
              backgroundColor='#ef4444'
              pressStyle={{ scale: 0.95 }}
              animation='quick'
              shadowColor='#ef4444'
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.3}
              shadowRadius={4}
              elevation={4}
              onPress={deleteAllVaultEntries}
              icon={<MaterialIcons name="delete" color='#FFF' size={20} />}
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