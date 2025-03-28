import React, { useState, useEffect } from 'react';
import { ScrollView, useColorScheme, Platform, Alert } from 'react-native';
import { Button, Paragraph, XStack, YStack, Text, Card } from 'tamagui';
import { BillCard } from '@/components/bills/BillCard';
import { BillEmpty } from '@/components/bills/BillEmpty';
import { Plus, X, CheckCircle, Edit3 } from '@tamagui/lucide-icons';
import { useUserStore } from '@/store/UserStore';
import { useBills } from '@/hooks/useBills';
import { AddBillModal } from '@/components/cardModals/AddBillModal';
import { IncomeModal } from '@/components/cardModals/IncomeModal';
import { getIconForBill, getOrdinalSuffix, getAmountColor } from '@/services/billServices';
import { BillRecommendationChip } from '@/constants/recommendations/BillRecommendations';
import { BillRecommendationModal } from '@/components/modals/BillRecommendationModal';

export default function BillsScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [housingModalOpen, setHousingModalOpen] = useState(false);
  const [transportationModalOpen, setTransportationModalOpen] = useState(false);
  const [subscriptionsModalOpen, setSubscriptionsModalOpen] = useState(false);
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);
  
  const { 
    bills, 
    addBill, 
    deleteBill, 
    isLoading, 
    monthlyIncome, 
    setMonthlyIncome,
    totalMonthlyAmount,
    monthlyBalance
  } = useBills();
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentDay = new Date().getDate();
  const isWeb = Platform.OS === 'web';
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const getColumnCount = () => {
    if (windowWidth < 768) return 1;
    if (windowWidth < 1024) return 2;
    if (windowWidth < 1280) return 3;
    return 4;
  };
  
  const columnCount = getColumnCount();
  const columnWidth = `calc(${100 / columnCount}% - ${(columnCount - 1) * 38 / columnCount}px)`;
  const handleAddBill = (billData: { name: string; amount: number; dueDate: number }) => { addBill(billData);};

  return (
    <YStack f={1} mt={isWeb? 60 : 95} bg={isDark ? "#000000" : "#fffbf7fff"}>
      <Card
        width={isWeb ? "30%" : "95%"}
        marginLeft={isWeb ? "$1" : "$0"}
        mx="auto"
        p="$4"
        br="$4"
        bg={isDark ? "#1A1A1A" : "#f5f5f5"}
        borderWidth={1}
        borderColor={isDark ? "#333" : "#e0e0e0"}
        mb="$4"
      >
        <YStack gap="$2" paddingLeft={isWeb ? "$1" : "$0"}>
          <XStack ai="center" jc="space-between">
            <XStack ai="center" gap="$1">
              <Text 
                fontSize="$4" 
                fontWeight="bold" 
                color={isDark ? "#fffbf7" : "#000"}
                fontFamily="$body"
              >
                Income:
              </Text>
            </XStack>
            <XStack ai="center" gap="$2">
            <Button
                size="$2"
                bg="transparent"
                onPress={() => setIsIncomeModalVisible(true)}
                icon={<Edit3 size={18} color={isDark ? "#999" : "#666"} />}
              />
              <Text 
                fontSize="$4" 
                fontWeight="bold" 
                color={isDark ? "#fffbf7" : "#000"}
                fontFamily="$body"
              >
                ${monthlyIncome.toFixed(2)}
              </Text>
            </XStack>
          </XStack>
          
          <XStack ai="center" jc="space-between" pt="$4" borderTopWidth={1} borderColor={isDark ? "#333" : "#e0e0e0"}>
            <Text fontSize="$4" fontWeight="bold" color={isDark ? "#fffbf7" : "#000"} fontFamily="$body">
              Bills:
            </Text>
            <Text 
              fontSize="$4" 
              fontWeight="bold" 
              color={getAmountColor(totalMonthlyAmount)}
              fontFamily="$body"
            >
              ${totalMonthlyAmount.toFixed(2)}
            </Text>
          </XStack>
          
          {bills && bills.length > 0 && (
            <XStack ai="center" jc="space-between" pt="$4" borderTopWidth={1} borderColor={isDark ? "#333" : "#e0e0e0"}>
              <Text fontSize="$4" fontWeight="bold" color={isDark ? "#fffbf7" : "#000"} fontFamily="$body">
                Monthly P/L:
              </Text>
              <Text 
                fontSize="$4" 
                fontWeight="bold" 
                color={monthlyBalance >= 0 ? "#4CAF50" : "#FF5252"}
                fontFamily="$body"
              >
                ${monthlyBalance.toFixed(2)}
              </Text>
            </XStack>
          )}
        </YStack>
      </Card>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          padding: isWeb ? 4 : 8,
          paddingHorizontal: isWeb ? 0 : 8,
          paddingLeft: isWeb ? 40 : 12,
          paddingRight: isWeb ? 24 : 12,
          paddingBottom: 100,
          display: isWeb ? 'flex' : undefined,
          flexDirection: isWeb ? 'row' : undefined,
          flexWrap: isWeb ? 'wrap' : undefined,
          justifyContent: isWeb ? 'flex-start' : undefined,
          gap: isWeb ? 32 : undefined,
          maxWidth: isWeb ? 1800 : undefined,
          marginHorizontal: isWeb ? 'auto' : undefined
        }}
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <XStack 
              key={`skeleton-${index}`} 
              bg={isDark ? "#1A1A1A" : "#f5f5f5"}
              p={isWeb ? "$3" : "$4"} 
              mb="$2"
              br="$4" 
              ai="center" 
              pressStyle={{ opacity: 0.7 }} 
              animation="quick"
              borderWidth={1}
              borderColor={isDark ? "#333" : "#e0e0e0"}
              width={isWeb ? columnWidth : "100%"}
            >
              <YStack width={44} height={44} bg={isDark ? "#333" : "#e0e0e0"} br="$4" />
              <YStack ml="$3" flex={1} gap="$1">
                <YStack width={100} height={20} bg={isDark ? "#333" : "#e0e0e0"} br="$2" />
                <YStack width={60} height={16} bg={isDark ? "#333" : "#e0e0e0"} br="$2" />
              </YStack>
            </XStack>
          ))
        ) : bills?.length === 0 ? (
          <BillEmpty
            isWeb={isWeb}
            setHousingModalOpen={setHousingModalOpen}
            setTransportationModalOpen={setTransportationModalOpen}
            setSubscriptionsModalOpen={setSubscriptionsModalOpen}
            setInsuranceModalOpen={setInsuranceModalOpen}
          />
        ) : bills ? (
          bills.sort((a, b) => a.dueDate - b.dueDate).map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              currentDay={currentDay}
              primaryColor={primaryColor}
              onDelete={deleteBill}
              isWeb={isWeb}
            />
          ))
        ) : null}
      </ScrollView>
      
      <AddBillModal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)} onSubmit={handleAddBill} />
      <IncomeModal 
        isVisible={isIncomeModalVisible} 
        onClose={() => setIsIncomeModalVisible(false)} 
        currentIncome={monthlyIncome}
        onSubmit={setMonthlyIncome}
      />
      <Button 
        onPress={() => setIsModalVisible(true)} 
        position="absolute" 
        bottom={40} 
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
    </YStack>
  );
}
