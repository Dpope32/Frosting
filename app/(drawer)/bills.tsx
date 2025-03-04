import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, useColorScheme, Platform } from 'react-native';
import { Button, Paragraph, XStack, YStack, Text, Card } from 'tamagui';
import { Plus, X, CheckCircle, DollarSign } from '@tamagui/lucide-icons';
import { useUserStore } from '@/store/UserStore';
import { useBills } from '@/hooks/useBills';
import { AddBillModal } from '@/components/cardModals/AddBillModal';
import { getIconForBill, getOrdinalSuffix, getAmountColor } from '@/services/billServices';
import { BillRecommendationChip } from '@/utils/BillRecommendations';
import { BillRecommendationModal } from '@/components/cardModals/BillRecommendationModal';

export default function BillsScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [housingModalOpen, setHousingModalOpen] = useState(false);
  const [transportationModalOpen, setTransportationModalOpen] = useState(false);
  const [subscriptionsModalOpen, setSubscriptionsModalOpen] = useState(false);
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);
  
  const { bills, addBill, deleteBill, isLoading } = useBills();
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
  const columnWidth = `calc(${100 / columnCount}% - ${(columnCount - 1) * 16 / columnCount}px)`;
  const handleAddBill = (billData: { name: string; amount: number; dueDate: number }) => { addBill(billData);};

  const totalMonthlyAmount = useMemo(() => {
    if (!bills || bills.length === 0) return 0;
    return bills.reduce((total, bill) => total + bill.amount, 0);
  }, [bills]);

  return (
    <YStack f={1} mt={isWeb? 40 : 90} bg={isDark ? "#000000" : "#ffffff"}>
      <ScrollView 
      showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          padding: isWeb ? 8 : 8,
          paddingHorizontal: isWeb ? 0 : 8,
          paddingLeft: isWeb ? 24 : 0,
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
              p="$4" 
              mb="$2"
              borderRadius="$4" 
              ai="center" 
              pressStyle={{ opacity: 0.7 }} 
              animation="quick"
              borderWidth={1}
              borderColor={isDark ? "#333" : "#e0e0e0"}
              width={isWeb ? columnWidth : "100%"}
            >
              <YStack width={44} height={44} bg={isDark ? "#333" : "#e0e0e0"} borderRadius="$4" />
              <YStack ml="$3" flex={1} gap="$1">
                <YStack width={100} height={20} bg={isDark ? "#333" : "#e0e0e0"} borderRadius="$2" />
                <YStack width={60} height={16} bg={isDark ? "#333" : "#e0e0e0"} borderRadius="$2" />
              </YStack>
            </XStack>
          ))
        ) : bills?.length === 0 ? (
          <XStack 
            bg={isDark ? "#1A1A1A" : "#f5f5f5"}
            p={isWeb ? "$4" : "$5"}
            borderRadius="$4" 
            paddingHorizontal={isWeb ? "$4" : "$1"}
            ai="flex-start" 
            jc="center"
            borderWidth={1}
            borderColor={isDark ? "#333" : "#e0e0e0"}
            width="100%"
          >
            <YStack gap="$4" width="100%" >
              <Text color={isDark ? "#fff" : "#333"} fontSize="$5" fontWeight="bold" textAlign="center" fontFamily="$body">
                Bill Management Center
              </Text>
              
              <YStack gap="$3" paddingHorizontal={isWeb ? "$4" : "$5"}>
                <XStack gap="$2" ai="flex-start">
                  <Text color={primaryColor} fontSize="$4" fontWeight="bold" fontFamily="$body">•</Text>
                  <YStack>
                    <Text color={isDark ? "#fff" : "#333"} fontSize="$3" fontWeight="bold" fontFamily="$body">
                      Track Monthly Expenses
                    </Text>
                    <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                      Add your recurring bills and keep track of your monthly expenses in one place.
                    </Text>
                  </YStack>
                </XStack>
                
                <XStack gap="$2" ai="flex-start">
                  <Text color={primaryColor} fontSize="$4" fontWeight="bold" fontFamily="$body">•</Text>
                  <YStack>
                    <Text color={isDark ? "#fff" : "#333"} fontSize="$3" fontWeight="bold" fontFamily="$body">
                      Due Date Reminders
                    </Text>
                    <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                      Never miss a payment with visual indicators for upcoming and due bills.
                    </Text>
                  </YStack>
                </XStack>
                
                <XStack gap="$2" ai="flex-start">
                  <Text color={primaryColor} fontSize="$4" fontWeight="bold" fontFamily="$body">•</Text>
                  <YStack>
                    <Text color={isDark ? "#fff" : "#333"} fontSize="$3" fontWeight="bold" fontFamily="$body">
                      Budget Overview
                    </Text>
                    <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                      See your total monthly expenses and manage your budget more effectively.
                    </Text>
                  </YStack>
                </XStack>
              </YStack>
              
              <Text color={isDark ? "#666" : "#999"} fontSize="$3" textAlign="center" fontFamily="$body" mt="$2" >
                Quick add from common categories:
              </Text>
              <YStack width="100%">
                <XStack 
                  justifyContent={isWeb ? "space-between" : "flex-start"}
                  paddingHorizontal="$2"
                  gap="$2"
                  flexWrap="wrap"
                  width="100%"
                  flexDirection="row"
                >
                  <BillRecommendationChip 
                    category="Housing" 
                    onPress={() => setHousingModalOpen(true)} 
                    isDark={isDark}
                  />
                  
                  <BillRecommendationChip 
                    category="Transportation" 
                    onPress={() => setTransportationModalOpen(true)} 
                    isDark={isDark}
                  />
                  
                  <BillRecommendationChip 
                    category="Subscriptions" 
                    onPress={() => setSubscriptionsModalOpen(true)} 
                    isDark={isDark}
                  />
                  
                  <BillRecommendationChip 
                    category="Insurance" 
                    onPress={() => setInsuranceModalOpen(true)} 
                    isDark={isDark}
                  />
                </XStack>
              </YStack>
              <Text color={isDark ? "#666" : "#999"} fontSize="$3" textAlign="center" fontFamily="$body" mt="$4">
                Or click the + button below to add a custom bill
              </Text>
            </YStack>
          </XStack>
        ) : bills ? (
          bills.sort((a, b) => a.dueDate - b.dueDate).map((bill) => {
            const IconComponent = getIconForBill(bill.name);
            const amountColor = getAmountColor(bill.amount);
            
            const isPastDue = bill.dueDate < currentDay;
            const isDueToday = bill.dueDate === currentDay;
            
            return isWeb ? (
              <XStack 
                key={bill.id} 
                bg={isDark ? "#1A1A1A" : "#f5f5f5"}
                paddingHorizontal="$4"
                borderRadius="$4" 
                ai="center" 
                animation="quick"
                borderWidth={1}
                borderColor={isDueToday ? primaryColor : isDark ? "#333" : "#e0e0e0"}
                width={columnWidth}
                minWidth={240}
                maxWidth={400}
                height={140}
                position="relative"
                opacity={isPastDue ? 0.8 : 1}
                hoverStyle={{ 
                  transform: [{ scale: 1.02 }],
                  borderColor: primaryColor,
                  shadowColor: primaryColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8
                }}
              >
                {isPastDue && (
                  <YStack
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    borderRadius="$4"
                    bg={isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.3)"}
                    ai="center"
                    jc="center"
                    zIndex={5}
                  >
                    <XStack ai="center" gap="$2">
                      <CheckCircle size={18} color="#4CAF50" />
                      <Text color="#4CAF50" fontSize="$4" fontWeight="bold" fontFamily="$body">Paid</Text>
                    </XStack>
                  </YStack>
                )}
                
                <YStack flex={1} zIndex={1}>
                  <XStack jc="space-between" mt="$1" ai="center">
                    <Text 
                      color={isDueToday ? "$red11" : isDark ? "#fff" : "#333"} 
                      mb="$2" 
                      fontSize={isWeb ? "$4" : "$4"} 
                      fontWeight={isDueToday ? "bold" : "bold"}
                      fontFamily="$body"
                    >
                      {bill.name}
                      {isDueToday && " (due today!)"}
                    </Text>
                    <Button
                      size="$3"
                      bg="transparent"
                      pressStyle={{ scale: 0.9 }}
                      onPress={() => deleteBill(bill.id)}
                      icon={<X size={18} color="#ff4444" />}
                    />
                  </XStack>
                  
                  <XStack ai="center" gap="$2" mb="$2">
                    <YStack 
                      width={44} 
                      height={44} 
                      borderRadius="$4" 
                      ai="center" 
                      jc="center" 
                      bg={isDark ? "#333" : "#e0e0e0"}
                    >
                      <IconComponent size={26} color={isDark ? "white" : "#666"} />
                    </YStack>
                    <YStack flex={1}>
                      <Paragraph color={amountColor} fontSize="$4" fontWeight={500} fontFamily="$body">${bill.amount.toFixed(2)}</Paragraph>
                      <Paragraph color="#666" fontSize="$3" fontFamily="$body">Due {bill.dueDate}{getOrdinalSuffix(bill.dueDate)}</Paragraph>
                    </YStack>
                  </XStack>
                </YStack>
              </XStack>
            ) : (
              <XStack 
                key={bill.id} 
                bg={isDark ? "#1A1A1A" : "#f5f5f5"}
                p="$3"
                mb="$2"
                borderRadius="$4" 
                ai="center" 
                pressStyle={{ opacity: 0.7 }} 
                animation="quick"
                borderWidth={1}
                borderColor={isDueToday ? primaryColor : isDark ? "#333" : "#e0e0e0"}
                width="100%"
                position="relative"
                opacity={isPastDue ? 0.8 : 1}
              >
                <YStack 
                  width={44} 
                  height={44} 
                  borderRadius="$4" 
                  ai="center" 
                  jc="center" 
                  bg={isDark ? "#333" : "#e0e0e0"}
                  zIndex={1}
                >
                  <IconComponent size={26} color={isDark ? "white" : "#666"} />
                </YStack>
                
                {isPastDue && (
                  <YStack
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    borderRadius="$4"
                    bg={isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.3)"}
                    ai="center"
                    jc="center"
                    zIndex={5}
                  >
                    <XStack ai="center" gap="$2">
                      <CheckCircle size={24} color="#4CAF50" />
                      <Text color="#4CAF50" fontSize="$3" fontWeight="bold" fontFamily="$body">Paid</Text>
                    </XStack>
                  </YStack>
                )}
                
                <YStack ml="$3" flex={1} zIndex={1}>
                  <Text 
                    color={isDueToday ? "$red11" : isDark ? "#fff" : "#000"} 
                    fontSize="$4" 
                    fontWeight="bold"
                    fontFamily="$body"
                  >
                    {bill.name}
                    {isDueToday && " (due today!)"}
                  </Text>
                  <XStack ai="center" gap="$2">
                    <Paragraph color={amountColor} fontSize="$4" fontWeight={800} fontFamily="$body">$ {bill.amount.toFixed(2)}</Paragraph>
                    <Paragraph color="#666" fontSize="$4" fontFamily="$body">• Due {bill.dueDate}{getOrdinalSuffix(bill.dueDate)}</Paragraph>
                  </XStack>
                </YStack>
                <Button 
                  size="$3"
                  bg="transparent" 
                  pressStyle={{ scale: 0.9 }} 
                  animation="quick" 
                  onPress={() => deleteBill(bill.id)} 
                  icon={<X size={18} color="#ff4444" />} 
                />
              </XStack>
            );
          })
        ) : null}
      </ScrollView>
      
      {bills && bills.length > 0 && (
        <Card
          position="absolute"
          bottom={32}
          left={10}
          right={0}
          mx="auto"
          width={isWeb ? 300 : "60%"}
          p={isWeb ? "$4" : "$3"}
          borderRadius="$4"
          bg={isDark ? "#3a3a3a" : "#f5f5f5"}
          borderWidth={1}
          borderColor={isDark ? "#333" : "#e0e0e0"}
          zIndex={999}
        >
          <XStack ai="center" jc="space-between">
            <XStack ai="center" gap="$3">
              <DollarSign size={20} color="$green9" />
              <Text 
                fontSize="$4" 
                fontWeight="bold" 
                color={isDark ? "#fff" : "#000"}
                fontFamily="$body"
                mr={isWeb? "$4" : 0}
              >
              Total: 
              </Text>
            </XStack>
            <Text 
              fontSize="$4" 
              fontWeight={800} 
              color={getAmountColor(totalMonthlyAmount)}
              fontFamily="$body"
            >
              ${Math.round(totalMonthlyAmount)}
            </Text>
          </XStack>
        </Card>
      )}
      
      <AddBillModal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)} onSubmit={handleAddBill} />
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
