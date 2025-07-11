import React, { useState } from 'react';
import { YStack, XStack, Text, isWeb } from 'tamagui';
import { Pressable, Platform, useColorScheme} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBills } from '@/hooks';
import { getIconForBill, getOrdinalSuffix, getAmountColor } from '@/services';
import { BillRecommendationCategory } from '@/constants/';
import { BillRecommendationModal } from '@/components/recModals/BillRecommendationModal';
import { BaseCardWithRecommendationsModal } from '../recModals/BaseCardWithRecommendationsModal'; 
import { Bill } from '@/types';
import { getChipStyle } from '@/utils';

interface BillsListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditBill: (bill: Bill) => void
}

export function BillsListModal({ open, onOpenChange, onEditBill }: BillsListModalProps) {
  const { bills, deleteBill, addBill } = useBills()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [housingModalOpen, setHousingModalOpen] = useState(false);
  const [transportationModalOpen, setTransportationModalOpen] = useState(false);
  const [subscriptionsModalOpen, setSubscriptionsModalOpen] = useState(false);
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);
  const currentDay = new Date().getDate();
  const categories: BillRecommendationCategory[] = ['Housing', 'Transportation', 'Subscriptions', 'Insurance'];

  const getCategoryWidth = (category: BillRecommendationCategory): number => {
    switch (category) {
      case 'Housing': return 100
      case 'Transportation': return 140
      case 'Subscriptions': return 130
      case 'Insurance': return 110
      default: return 120;
    }
  };

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
          setInsuranceModalOpen(true);
          break;
      } 
    };

    const style = getChipStyle(category);

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
    );
  };


  const billRecommendations = (
    <>
      {categories.map(category => (
        <ModifiedChip key={category} category={category} />
      ))}
    </>
  );

  return (
    <>
      <BaseCardWithRecommendationsModal
        open={open}
        onOpenChange={onOpenChange}
        hideHandle={false}
        title="All Bills"
        snapPoints={isWeb ? [95] : [90]}
        showCloseButton={true}
        zIndex={100000}
        recommendationChips={billRecommendations} 
      >
        <>
        {bills && bills.length > 0 ? (
          <YStack gap={Platform.OS === 'web' ? '$0' : '$1'} mt="$2"> 
            {bills.sort((a, b) => a.dueDate - b.dueDate).map((bill) => {
              const iconData = getIconForBill(bill.name);
              const IconComponent = iconData.icon;
              const iconName = iconData.name;
              const amountColor = getAmountColor(bill.amount);
              const isPastDue = bill.dueDate < currentDay;
              const isDueToday = bill.dueDate === currentDay;

              return (
                <XStack
                  key={bill.id}
                  backgroundColor={isDark ? "$gray2" : "$gray3"}
                  br={8}
                  padding="$2"
                  alignItems="center"
                  justifyContent="space-between"
                  marginBottom={8}
                  {...(isDueToday ? {
                    borderWidth: 1,
                    borderColor: isDark ? "$red9" : "$red10"
                  } : {})}
                >
                  <XStack flex={1} alignItems="center" gap="$3">
                    <YStack 
                      width={44} 
                      height={48} 
                      br="$4" 
                      ai="center" 
                      jc="center" 
                      bg={isDark ? "#333" : "#e0e0e0"}
                    >
                      <IconComponent name={iconName as any} size={22} color={isDark ? "white" : "#666"} />
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
                  <XStack>
                    <Pressable
                      onPress={() => {
                        onOpenChange(false);
                        setTimeout(() => {
                          onEditBill(bill);
                        }, 100);
                      }}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                        padding: 8
                      })}
                    >
                      <Ionicons
                        name="pencil"
                        size={22}
                        color="#888"
                        style={{ fontWeight: 200 }}
                      />
                    </Pressable>
                  </XStack>
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
        </>
      </BaseCardWithRecommendationsModal>

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
