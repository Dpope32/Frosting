import React, { useState, useRef } from 'react'
import { Sheet, YStack, XStack, Text, ScrollView } from 'tamagui'
import { Pressable, Platform, useColorScheme, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useVault } from '@/hooks/useVault'
import { VaultRecommendationCategory } from '@/constants/recommendations/VaultRecommendations'
import { VaultRecommendationModal } from '@/components/modals/VaultRecommendationModal'
import { useToastStore } from '@/store/ToastStore'

interface VaultListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface VaultEntry {
  id: string
  name: string
  username: string
  password: string
}

export function VaultListModal({ open, onOpenChange }: VaultListModalProps) {
  const { data, deleteVaultEntry } = useVault()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'

  // Mimic TaskListModal's ref-based scroll logic
  const [scrollY, setScrollY] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && scrollY > 0) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true })
      return
    }
    onOpenChange(newOpen)
  }

  const [socialMediaModalOpen, setSocialMediaModalOpen] = useState(false)
  const [emailCloudModalOpen, setEmailCloudModalOpen] = useState(false)
  const [shoppingModalOpen, setShoppingModalOpen] = useState(false)
  const [workModalOpen, setWorkModalOpen] = useState(false)

  const categories: VaultRecommendationCategory[] = ['Social Media', 'Misc', 'Shopping', 'Work']

  const getCategoryWidth = (category: VaultRecommendationCategory): number => {
    switch (category) {
      case 'Social Media': return 120
      case 'Misc': return 80
      case 'Shopping': return 110
      case 'Work': return 90
      default: return 120
    }
  }

  const getChipStyle = (category: VaultRecommendationCategory) => {
    switch (category) {
      case 'Social Media':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          textColor: '#3b82f6',
          fontFamily: '$body'
        }
      case 'Misc':
        return {
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          borderColor: 'rgba(139, 92, 246, 0.3)',
          textColor: '#8b5cf6',
          fontFamily: '$body'
        }
      case 'Shopping':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          textColor: '#10b981',
          fontFamily: '$body'
        }
      case 'Work':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          textColor: '#ef4444',
          fontFamily: '$body'
        }
      default:
        return {
          backgroundColor: 'rgba(107, 114, 128, 0.15)',
          borderColor: 'rgba(107, 114, 128, 0.3)',
          textColor: '#6b7280',
          fontFamily: '$body'
        }
    }
  }

  const ModifiedChip = ({ category }: { category: VaultRecommendationCategory }) => {
    const style = getChipStyle(category)
    const handlePress = () => {
      handleOpenChange(false)
      switch (category) {
        case 'Social Media': setSocialMediaModalOpen(true); break
        case 'Misc': setEmailCloudModalOpen(true); break
        case 'Shopping': setShoppingModalOpen(true); break
        case 'Work': setWorkModalOpen(true); break
      }
    }
    return (
      <XStack
        width={getCategoryWidth(category)}
        backgroundColor={style.backgroundColor}
        borderColor={style.borderColor}
        borderWidth={1}
        br={8}
        px="$4"
        py="$3"
        pressStyle={{ opacity: 0.7 }}
        marginRight="$2"
        justifyContent="center"
        alignItems="center"
        onPress={handlePress}
      >
        <Text color={style.textColor} fontSize={13} fontWeight="600" fontFamily="$body" numberOfLines={1} textAlign="center">
          {category}
        </Text>
      </XStack>
    )
  }

  const { showToast } = useToastStore()
  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete this password entry?')) {
        deleteVaultEntry(id)
        handleOpenChange(false)
        setTimeout(() => {
          showToast('Vault Entry Successfully removed', 'success')
        }, 300)
      }
    } else {
      Alert.alert(
        'Confirm Deletion',
        'Are you sure you want to delete this password entry?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes',
            style: 'destructive',
            onPress: () => {
              deleteVaultEntry(id)
              handleOpenChange(false)
              setTimeout(() => {
                showToast('Vault Entry Successfully removed', 'success')
              }, 300)
            }
          }
        ]
      )
    }
  }

  return (
    <>
      <Sheet
        modal
        open={open}
        onOpenChange={handleOpenChange}
        snapPoints={isWeb ? [90] : [80]}
        dismissOnSnapToBottom
        dismissOnOverlayPress
        animation="quick"
        zIndex={100000}
      >
        <Sheet.Overlay
          animation="quick"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Frame
          backgroundColor={isDark ? '$gray1' : 'white'}
          padding="$4"
          gap={Platform.OS === 'web' ? '$4' : '$3'}
          borderTopLeftRadius="$6"
          borderTopRightRadius="$6"
          {...(isWeb
            ? {
                style: {
                  overflowY: 'auto',
                  maxHeight: '100vh',
                  maxWidth: 800,
                  margin: '0 auto',
                  borderRadius: 8,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                }
              }
            : {})}
        >
          <ScrollView
            ref={scrollViewRef}
            bounces={false}
            showsVerticalScrollIndicator={false}
            onScroll={({ nativeEvent }) => setScrollY(nativeEvent.contentOffset.y)}
            scrollEventThrottle={16}
          >
            <YStack gap={Platform.OS === 'web' ? '$4' : '$2'}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text
                  fontSize={22}
                  fontWeight="700"
                  padding={12}
                  fontFamily="$body"
                  color={isDark ? '$gray12' : '$gray11'}
                >
                  Vault Entries
                </Text>
                <Pressable onPress={() => handleOpenChange(false)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, padding: 8 })}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </Pressable>
              </XStack>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                paddingBottom="$4"
                mt="$1"
                contentContainerStyle={{ paddingHorizontal: 4 }}
              >
                <XStack gap="$2">
                  {categories.map((category) => (
                    <ModifiedChip key={category} category={category} />
                  ))}
                </XStack>
              </ScrollView>
            </YStack>

            {data?.items && data.items.length > 0 ? (
              <YStack gap="$2" mt="$2">
                <XStack flexWrap="wrap" justifyContent="space-between" gap="$2">
                  {data.items.map((entry: VaultEntry) => (
                    <YStack
                      key={entry.id}
                      width="48%"
                      backgroundColor={isDark ? '$gray3' : '$gray2'}
                      br={8}
                      padding="$4"
                      marginBottom="$2"
                    >
                      <XStack
                        justifyContent="space-between"
                        alignItems="center"
                        marginBottom="$2"
                      >
                        <Text
                          fontFamily="$body"
                          color={isDark ? '$gray12' : '$gray11'}
                          fontSize={16}
                          fontWeight="600"
                        >
                          {entry.name}
                        </Text>
                        <Pressable
                          onPress={() => handleDelete(entry.id)}
                          style={({ pressed }) => ({
                            opacity: pressed ? 0.7 : 1,
                            padding: 6
                          })}
                        >
                          <Ionicons
                            name="close"
                            size={18}
                            color="#ff4444"
                            style={{ fontWeight: 200 }}
                          />
                        </Pressable>
                      </XStack>
                      <Text
                        fontFamily="$body"
                        color={isDark ? '$gray11' : '$gray10'}
                        fontSize={13}
                      >
                        {entry.username}
                      </Text>
                    </YStack>
                  ))}
                </XStack>
              </YStack>
            ) : (
              <YStack
                backgroundColor={isDark ? '$gray2' : '$gray3'}
                br={8}
                padding="$4"
                alignItems="center"
                mt="$4"
              >
                <Text
                  fontFamily="$body"
                  color={isDark ? '$gray12' : '$gray11'}
                  opacity={0.7}
                >
                  No vault entries found
                </Text>
              </YStack>
            )}
          </ScrollView>
        </Sheet.Frame>
      </Sheet>

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
    </>
  )
}
