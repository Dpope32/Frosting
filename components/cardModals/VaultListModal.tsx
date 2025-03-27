import React, { useState } from 'react'
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
  const [socialMediaModalOpen, setSocialMediaModalOpen] = useState(false)
  const [emailCloudModalOpen, setEmailCloudModalOpen] = useState(false)
  const [shoppingModalOpen, setShoppingModalOpen] = useState(false)
  const [workModalOpen, setWorkModalOpen] = useState(false)
  
  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: string]: boolean }>({})
  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const categories: VaultRecommendationCategory[] = ['Social Media', 'Misc', 'Shopping', 'Work']
  
  // Get appropriate width for each category
  const getCategoryWidth = (category: VaultRecommendationCategory): number => {
    switch (category) {
      case 'Social Media': return 120
      case 'Misc': return 80
      case 'Shopping': return 110
      case 'Work': return 90
      default: return 120
    }
  }

  // Creating a modified chip component to ensure full text is visible
  const ModifiedChip = ({ category }: { category: VaultRecommendationCategory }) => {
    const handlePress = () => {
      onOpenChange(false)
      switch (category) {
        case 'Social Media':
          setSocialMediaModalOpen(true)
          break
        case 'Misc':
          setEmailCloudModalOpen(true)
          break
        case 'Shopping':
          setShoppingModalOpen(true)
          break
        case 'Work':
          setWorkModalOpen(true)
          break
      }
    }
    
    const style = getChipStyle(category)
    
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
        <Text  color={style.textColor} fontSize={13}  fontWeight="600" fontFamily="$body" numberOfLines={1} textAlign="center"> {category} </Text>
      </XStack>
    )
  }

  const getChipStyle = (category: VaultRecommendationCategory) => {
    switch (category) {
      case 'Social Media':
        return {
          backgroundColor: "rgba(59, 130, 246, 0.15)", // blue
          borderColor: "rgba(59, 130, 246, 0.3)",
          textColor: "#3b82f6"
        }
      case 'Misc':
        return {
          backgroundColor: "rgba(139, 92, 246, 0.15)", // purple
          borderColor: "rgba(139, 92, 246, 0.3)",
          textColor: "#8b5cf6"
        }
      case 'Shopping':
        return {
          backgroundColor: "rgba(16, 185, 129, 0.15)", // green
          borderColor: "rgba(16, 185, 129, 0.3)",
          textColor: "#10b981"
        }
      case 'Work':
        return {
          backgroundColor: "rgba(239, 68, 68, 0.15)", // red
          borderColor: "rgba(239, 68, 68, 0.3)",
          textColor: "#ef4444"
        }
      default:
        return {
          backgroundColor: "rgba(107, 114, 128, 0.15)", // gray
          borderColor: "rgba(107, 114, 128, 0.3)",
          textColor: "#6b7280"
        }
    }
  }

  // Get the showToast function from the toast store
  const { showToast } = useToastStore()

  // Handle the delete entry with confirmation
  const handleDelete = (id: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this password entry?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => {
            deleteVaultEntry(id)
            // Close the modal before showing the toast
            onOpenChange(false)
            // Short timeout to ensure modal closing animation completes
            setTimeout(() => {
              showToast("Vault Entry Successfully removed", "success")
            }, 300)
          },
          style: "destructive"
        }
      ]
    )
  }

  return (
    <>
      <Sheet
        modal
        open={open}
        onOpenChange={onOpenChange}
        snapPoints={isWeb ? [95] : [80]}
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
          backgroundColor={isDark ? "$gray1" : "white"}
          padding="$4"
          gap={Platform.OS === 'web' ? '$4' : '$3'}
          borderTopLeftRadius="$6"
          borderTopRightRadius="$6"
          {...(isWeb ? {
            style: {
              overflowY: 'auto',
              maxHeight: '100vh',
              maxWidth: 800,
              margin: '0 auto',
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }
          } : {})}
        >
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <YStack gap={Platform.OS === 'web' ? '$4' : '$2'}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text
                  fontSize={20}
                  fontWeight="700"
                  fontFamily="$body"
                  color={isDark ? "$gray12" : "$gray11"}
                >
                  Vault Entries
                </Text>
              </XStack>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                paddingBottom="$4" 
                mt="$1"
                contentContainerStyle={{ 
                  paddingHorizontal: 4
                }}
              >
                <XStack gap="$2">
                  {categories.map(category => (
                    <ModifiedChip key={category} category={category} />
                  ))}
                </XStack>
              </ScrollView>
            </YStack>
            
            {data?.items && data.items.length > 0 ? (
              <YStack gap={Platform.OS === 'web' ? '$1' : '$3'} mt="$2">
                {data.items.map((entry: VaultEntry) => (
                  <XStack
                    key={entry.id}
                    backgroundColor={isDark ? "$gray2" : "$gray3"}
                    br={8}
                    padding="$3"
                    alignItems="center"
                    justifyContent="space-between"
                    marginBottom="$2"
                  >
                    <YStack flex={1}>
                      <Text
                        fontFamily="$body"
                        color={isDark ? "$gray12" : "$gray11"}
                        fontSize={16}
                        fontWeight="600"
                      >
                        {entry.name}
                      </Text>
                      
                      <XStack gap="$2" mt="$1" alignItems="center">
                        <Text
                          fontFamily="$body"
                          color={isDark ? "$gray11" : "$gray10"}
                          fontSize={13}
                        >
                          {entry.username}
                        </Text>
                      </XStack>
                      

                    </YStack>
                    
                    <Pressable
                      onPress={() => handleDelete(entry.id)}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                        padding: 8
                      })}
                    >
                      <Ionicons
                        name="close"
                        size={24}
                        color="#ff4444"
                        style={{ fontWeight: 200 }}
                      />
                    </Pressable>
                  </XStack>
                ))}
              </YStack>
            ) : (
              <YStack
                backgroundColor={isDark ? "$gray2" : "$gray3"}
                br={8}
                padding="$4"
                alignItems="center"
                mt="$4"
              >
                <Text
                  fontFamily="$body"
                  color={isDark ? "$gray12" : "$gray11"}
                  opacity={0.7}
                >
                  No vault entries found
                </Text>
              </YStack>
            )}
          </ScrollView>
        </Sheet.Frame>
      </Sheet>
      
      {/* Add the recommendation modals */}
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
