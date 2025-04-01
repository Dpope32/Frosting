import React, { useState } from 'react'
import { Sheet, YStack, XStack, Text, ScrollView } from 'tamagui'
import { Pressable, Platform, useColorScheme, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useBills } from '@/hooks/useBills'
import { getIconForBill, getOrdinalSuffix, getAmountColor } from '@/services/billServices'
import { BillRecommendationCategory } from '@/constants/recommendations/BillRecommendations'
import { BillRecommendationModal } from '@/components/modals/BillRecommendationModal'

interface BillsListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BillsListModal({ open, onOpenChange }: BillsListModalProps) {
  const { bills, deleteBill } = useBills()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'
  const [housingModalOpen, setHousingModalOpen] = useState(false)
  const [transportationModalOpen, setTransportationModalOpen] = useState(false)
  const [subscriptionsModalOpen, setSubscriptionsModalOpen] = useState(false)
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false)
  
  const currentDay = new Date().getDate()

  const categories: BillRecommendationCategory[] = ['Housing', 'Transportation', 'Subscriptions', 'Insurance']
  
  // Get appropriate width for each category
  const getCategoryWidth = (category: BillRecommendationCategory): number => {
    switch (category) {
      case 'Housing': return 100
      case 'Transportation': return 140
      case 'Subscriptions': return 130
      case 'Insurance': return 110
      default: return 120
    }
  }

  // Creating a modified chip component to ensure full text is visible
  const ModifiedChip = ({ category }: { category: BillRecommendationCategory }) => {
    const handlePress = () => {
      onOpenChange(false)
      switch (category) {
        case 'Housing':
          setHousingModalOpen(true)
          break
        case 'Transportation':
          setTransportationModalOpen(true)
          break
        case 'Subscriptions':
          setSubscriptionsModalOpen(true)
          break
        case 'Insurance':
          setInsuranceModalOpen(true)
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
        <Text 
          color={style.textColor} 
          fontSize={12} 
          fontWeight="600"
          numberOfLines={1}
          fontFamily="$body"
          textAlign="center"
        >
          {category}
        </Text>
      </XStack>
    )
  }
  
  const getChipStyle = (category: BillRecommendationCategory) => {
    switch (category) {
      case 'Housing':
        return {
          backgroundColor: "rgba(16, 185, 129, 0.15)", // green
          borderColor: "rgba(16, 185, 129, 0.3)",
          textColor: "#10b981"
        }
      case 'Transportation':
        return {
          backgroundColor: "rgba(59, 130, 246, 0.15)", // blue
          borderColor: "rgba(59, 130, 246, 0.3)",
          textColor: "#3b82f6"
        }
      case 'Subscriptions':
        return {
          backgroundColor: "rgba(139, 92, 246, 0.15)", // purple
          borderColor: "rgba(139, 92, 246, 0.3)",
          textColor: "#8b5cf6"
        }
      case 'Insurance':
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

  return (
    <>
      <Sheet
        modal
        open={open}
        onOpenChange={onOpenChange}
        snapPoints = {isWeb ? [95] : [85]}
        dismissOnSnapToBottom
        dismissOnOverlayPress
        animation="quick"
        zIndex={100000}
      >
        <Sheet.Overlay
          animation="quick"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          opacity={0.7}
        />
        <Sheet.Frame
          backgroundColor={isDark ? "$gray1" : "white"}
          padding="$4"
          gap={Platform.OS === 'web' ? '$4' : '$5'}
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
                  padding={12}
                  fontFamily="$body"
                  color={isDark ? "$gray12" : "$gray11"}
                >
                  All Bills
                </Text>
                <Pressable onPress={() => onOpenChange(false)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 0.7, padding: 8 })}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </Pressable>
              </XStack>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                paddingBottom="$4" 
                mt="$1"
                contentContainerStyle={{ 
                  px: 4
                }}
              >
                <XStack gap="$2">
                  {categories.map(category => (
                    <ModifiedChip key={category} category={category} />
                  ))}
                </XStack>
              </ScrollView>
            </YStack>
            
            {bills && bills.length > 0 ? (
              <YStack gap={Platform.OS === 'web' ? '$0' : '$3'} mt="$2">
                {bills.sort((a, b) => a.dueDate - b.dueDate).map((bill) => {
                  const IconComponent = getIconForBill(bill.name)
                  const amountColor = getAmountColor(bill.amount)
                  const isPastDue = bill.dueDate < currentDay
                  const isDueToday = bill.dueDate === currentDay
                  
                  return (
                    <XStack
                      key={bill.id}
                      backgroundColor={isDark ? "$gray2" : "$gray3"}
                      br={8}
                      padding="$3"
                      alignItems="center"
                      justifyContent="space-between"
                      marginBottom="$2"
                      {...(isDueToday ? {
                        borderWidth: 1,
                        borderColor: isDark ? "$red9" : "$red10"
                      } : {})}
                    >
                      <XStack flex={1} alignItems="center" gap="$3">
                        <YStack 
                          width={44} 
                          height={44} 
                          br="$4" 
                          ai="center" 
                          jc="center" 
                          bg={isDark ? "#333" : "#e0e0e0"}
                        >
                          <IconComponent size={22} color={isDark ? "white" : "#666"} />
                        </YStack>
                        
                        <YStack>
                          <Text
                            fontFamily="$body"
                            color={isDueToday ? "$red11" : isDark ? "$gray12" : "$gray11"}
                            fontSize={16}
                            fontWeight="500"
                          >
                            {bill.name}
                            {isDueToday && " (due today!)"}
                          </Text>
                          <XStack gap="$2" mt="$1" alignItems="center">
                            <Text
                              fontFamily="$body"
                              color={amountColor}
                              fontSize={14}
                              fontWeight="700"
                            >
                              ${bill.amount.toFixed(2)}
                            </Text>
                            <Text
                              fontFamily="$body"
                              color={isDark ? "$gray11" : "$gray10"}
                              fontSize={13}
                            >
                              • Due {bill.dueDate}{getOrdinalSuffix(bill.dueDate)}
                            </Text>
                            {isPastDue && (
                              <XStack
                                backgroundColor={isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.05)"}
                                px="$2"
                                py="$1"
                                br={4}
                                alignItems="center"
                              >
                                <Text 
                                  fontFamily="$body" 
                                  color="#4CAF50" 
                                  fontSize={12} 
                                  fontWeight="600"
                                >
                                  PAID
                                </Text>
                              </XStack>
                            )}
                          </XStack>
                        </YStack>
                      </XStack>
                      
                      <Pressable
                        onPress={() => {
                          if (Platform.OS === 'web') {
                            if (window.confirm("Are you sure you want to delete this bill?")) {
                              deleteBill(bill.id);
                            }
                          } else {
                            Alert.alert(
                              "Delete Bill",
                              "Are you sure you want to delete this bill?",
                              [
                                { text: "Cancel" },
                                { text: "Delete", onPress: () => deleteBill(bill.id) }
                              ]
                            );
                          }
                        }}
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
                  )
                })}
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
                  No bills found
                </Text>
              </YStack>
            )}
          </ScrollView>
        </Sheet.Frame>
      </Sheet>
      
      <BillRecommendationModal 
        open={housingModalOpen} 
        onOpenChange={setHousingModalOpen} 
        category="Housing" 
      />
      
      <BillRecommendationModal 
        open={transportationModalOpen} 
        onOpenChange={setTransportationModalOpen} 
        category="Transportation" 
      />
      
      <BillRecommendationModal 
        open={subscriptionsModalOpen} 
        onOpenChange={setSubscriptionsModalOpen} 
        category="Subscriptions" 
      />
      
      <BillRecommendationModal 
        open={insuranceModalOpen} 
        onOpenChange={setInsuranceModalOpen} 
        category="Insurance" 
      />
    </>
  )
}
