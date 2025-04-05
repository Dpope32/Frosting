import React, { useState, useEffect } from 'react';
import { ScrollView, useColorScheme, Platform } from 'react-native';
import { Button, XStack, YStack, Text, isWeb } from 'tamagui';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BillCard } from '@/components/bills/BillCard';
import { BillEmpty } from '@/components/bills/BillEmpty';
import { BillSummary } from '@/components/bills/BillSummary';
import { Plus, Edit3 } from '@tamagui/lucide-icons';
import { useUserStore } from '@/store/UserStore';
import { useBills } from '@/hooks/useBills';
import { AddBillModal } from '@/components/addModals/AddBillModal';
import { IncomeModal } from '@/components/editModals/IncomeModal';
import { getAmountColor } from '@/services/billServices';
import { BillRecommendationModal } from '@/components/modals/BillRecommendationModal';

export default function BillsScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [housingModalOpen, setHousingModalOpen] = useState(false);
  const [transportationModalOpen, setTransportationModalOpen] = useState(false);
  const [subscriptionsModalOpen, setSubscriptionsModalOpen] = useState(false);
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);
  
  const { bills,  addBill,  deleteBill,  isLoading,  monthlyIncome,  setMonthlyIncome, totalMonthlyAmount, monthlyBalance} = useBills();
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentDay = new Date().getDate();
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
    if (windowWidth < 1600) return 3;
    return 4;
  };
  
  const columnCount = getColumnCount();
  const columnWidth = `calc(${100 / columnCount}% - ${(columnCount - 1) * 28 / columnCount}px)`;
  const handleAddBill = (billData: { name: string; amount: number; dueDate: number }) => { addBill(billData);};

  return (
    <YStack f={1} mt={isWeb ? 45 : 95} bg={isDark ? "#010101" : "#fffbf7fff"}>
      <BillSummary 
        monthlyIncome={monthlyIncome}
        totalMonthlyAmount={totalMonthlyAmount}
        monthlyBalance={monthlyBalance}
        bills={bills}
        setIsIncomeModalVisible={setIsIncomeModalVisible}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          padding: isWeb ? 8 : 6,
          paddingBottom: 100,
          paddingHorizontal: isWeb ? 0 : 12,
          paddingLeft: isWeb ? 40 : 16,
          paddingRight: isWeb ? 20 : 16, 
          display: isWeb ? 'flex' : undefined,
          flexDirection: isWeb ? 'row' : undefined,
          flexWrap: isWeb ? 'wrap' : undefined,
          justifyContent: isWeb ? 'flex-start' : undefined,
          gap: isWeb ? 26 : undefined, 
          maxWidth: isWeb ? 1780 : undefined, 
          marginHorizontal: isWeb ? 'auto' : undefined,
        }}
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <XStack 
              key={`skeleton-${index}`} 
              bg={isDark ? "#111" : "#f5f5f5"}
              p={isWeb ? "$3" : "$4"} 
              mb="$2"
              br="$4" 
              ai="center" 
              animation="quick"
              borderWidth={1}
              borderColor={isDark ? "#222" : "#e0e0e0"}
              width={isWeb ? columnWidth : "100%"}
              height={isWeb ? 120 : undefined}
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
              columnWidth={columnWidth}
            />
          ))
        ) : null}
      </ScrollView>
      
      <AddBillModal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)} onSubmit={handleAddBill} />
        
      {isIncomeModalVisible && (
        <IncomeModal 
          onClose={() => setIsIncomeModalVisible(false)} 
          currentIncome={monthlyIncome}
          onSubmit={setMonthlyIncome}
        />
      )}

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
