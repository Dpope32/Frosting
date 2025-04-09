import React, { useState, useEffect } from 'react';
import { ScrollView, useColorScheme, Platform } from 'react-native';
import { Button, XStack, YStack, Text } from 'tamagui';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BillCard } from '@/components/bills/BillCard';
import { BillEmpty } from '@/components/bills/BillEmpty';
import { Plus, Edit3 } from '@tamagui/lucide-icons';
import { useUserStore } from '@/store/UserStore';
import { useBills } from '@/hooks/useBills';
import { AddBillModal } from '@/components/cardModals/AddBillModal';
import { IncomeModal } from '@/components/cardModals/IncomeModal';
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
    if (windowWidth < 1600) return 3;
    return 4;
  };
  
  const columnCount = getColumnCount();
  const columnWidth = `calc(${100 / columnCount}% - ${(columnCount - 1) * 29 / columnCount}px)`;
  const handleAddBill = (billData: { name: string; amount: number; dueDate: number }) => { addBill(billData);};

  return (
    <YStack f={1} mt={isWeb ? 45 : 95} py={"$2"} bg={isDark ? "#010101" : "#fffbf7fff"}>
      {isWeb ? (
        <XStack 
          width="100%" 
          height={20}
          mb="$6"
          ai="center"
          jc="flex-start"
          gap="$6+"
          px={0} 
        >
          <XStack gap="$4" ai="center" flex={1} jc="flex-start" pl="$6">
            <XStack width={180} ai="center" py="$3" px="$5" br="$5" bg={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}>
              <YStack>
                <Text fontSize="$3" color={isDark ? "#999" : "#666"} fontFamily="$body">Income</Text>
                <XStack ai="center" gap="$2">
                  <Text fontSize="$4" fontWeight="bold" color="#4CAF50" fontFamily="$body">
                    ${monthlyIncome.toFixed(0)}
                  </Text>
                  <Button
                    size="$1"
                    bg="transparent"
                    pressStyle={{ scale: 0.9 }}
                    hoverStyle={{
                      bg: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                    }}
                    onPress={() => setIsIncomeModalVisible(true)}
                    icon={<Edit3 size={14} color={isDark ? "#999" : "#666"} />}
                  />
                </XStack>
              </YStack>
            </XStack>
            
            {bills && bills.length > 0 && (
              <XStack width={180} ai="center" py="$3" px="$5" br="$5" bg={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}>
                <YStack>
                  <Text fontSize="$3" color={isDark ? "#999" : "#666"} fontFamily="$body">Bills</Text>
                  <Text fontSize="$4" fontWeight="bold" color="#FF5252" fontFamily="$body">
                    ${totalMonthlyAmount.toFixed(0)}
                  </Text>
                </YStack>
              </XStack>
            )}
            
            {bills && bills.length > 0 && (
              <XStack width={180} ai="center" py="$3" px="$5" br="$5" bg={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}>
                <YStack>
                  <Text fontSize="$3" color={isDark ? "#999" : "#666"} fontFamily="$body">Monthly P/L</Text>
                  <Text fontSize="$4" fontWeight="bold" color={monthlyBalance >= 0 ? '#4CAF50' : '#FF5252'} fontFamily="$body">
                    ${monthlyBalance.toFixed(0)}
                  </Text>
                </YStack>
              </XStack>
            )}
          </XStack>
        </XStack>
      ) : (
        <Animated.View 
          entering={FadeIn.duration(600)}
          style={{
            width: '93%',
            marginHorizontal: 'auto',
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: isDark ? '#223' : 'rgba(0, 0, 0, 0.1)',
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 10,
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={isDark ? ['rgb(34, 34, 34)', 'rgb(0, 0, 0)'] : ['#ffffff', '#eeeeee']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 16, borderRadius: 11 }}
          >
            <YStack gap="$3" px="$2">
              <XStack ai="center" jc="space-between">
                <Text color={isDark ? '#999' : '#666'} fontSize={16} fontFamily="$body">
                  Income
                </Text>
                <XStack ai="center" gap="$2">
                  <Button
                    size="$1"
                    bg="transparent"
                    onPress={() => setIsIncomeModalVisible(true)}
                    icon={<Edit3 size={16} color={isDark ? '#999' : '#666'} />}
                  />
                  <Text
                    fontSize={16}
                    fontWeight="600"
                    color={isDark ? '#aaa' : '#000'}
                    fontFamily="$body"
                  >
                    ${monthlyIncome.toFixed(0)}
                  </Text>
                </XStack>
              </XStack>
              
              <XStack ai="center" jc="space-between">
                <Text color={isDark ? '#999' : '#666'} fontSize={16} fontFamily="$body">
                  Bills
                </Text>
                <Text 
                  fontSize={16}
                  fontWeight="600"
                  color="#FF5252"
                  fontFamily="$body"
                >
                  ${totalMonthlyAmount.toFixed(0)}
                </Text>
              </XStack>
              
              {bills && bills.length > 0 && (
                <XStack ai="center" jc="space-between">
                  <Text color={isDark ? '#999' : '#666'} fontSize={16} fontFamily="$body">
                    Monthly P/L
                  </Text>
                  <Text 
                    fontSize={16}
                    fontWeight="600"
                    color={monthlyBalance >= 0 ? '#4CAF50' : '#FF5252'}
                    fontFamily="$body"
                  >
                    ${monthlyBalance.toFixed(0)}
                  </Text>
                </XStack>
              )}
            </YStack>
          </LinearGradient>
        </Animated.View>
      )}
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          padding: isWeb ? 12 : 6,
          paddingBottom: 100,
          paddingHorizontal: isWeb ? 0 : 12,
          paddingLeft: isWeb ? 40 : 16,
          paddingRight: isWeb ? 20 : 16, 
          display: isWeb ? 'flex' : undefined,
          flexDirection: isWeb ? 'row' : undefined,
          flexWrap: isWeb ? 'wrap' : undefined,
          justifyContent: isWeb ? 'flex-start' : undefined,
          gap: isWeb ? 20 : undefined, 
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
