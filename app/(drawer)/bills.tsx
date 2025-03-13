import React, { useState, useEffect } from 'react';
import { ScrollView, useColorScheme, Platform, Alert } from 'react-native';
import { Button, Paragraph, XStack, YStack, Text, Card } from 'tamagui';
import { Plus, X, CheckCircle, DollarSign, Edit3 } from '@tamagui/lucide-icons';
import { useUserStore } from '@/store/UserStore';
import { useBills } from '@/hooks/useBills';
import { AddBillModal } from '@/components/cardModals/AddBillModal';
import { IncomeModal } from '@/components/cardModals/IncomeModal';
import { getIconForBill, getOrdinalSuffix, getAmountColor } from '@/services/billServices';
import { BillRecommendationChip } from '@/utils/BillRecommendations';
import { BillRecommendationModal } from '@/components/cardModals/BillRecommendationModal';

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
        width={isWeb ? "95%" : "95%"}
        mx="auto"
        p="$4"
        borderRadius="$4"
        bg={isDark ? "#1A1A1A" : "#f5f5f5"}
        borderWidth={1}
        borderColor={isDark ? "#333" : "#e0e0e0"}
        mb="$4"
      >
        <YStack gap="$2">
          <XStack ai="center" jc="space-between">
            <XStack ai="center" gap="$1">
              <Text 
                fontSize="$4" 
                fontWeight="bold" 
                color={isDark ? "#fffbf7" : "#000"}
                fontFamily="$body"
              >
                Monthly Income:
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
              Total Bills:
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
            paddingHorizontal={isWeb ? "$4" : "$4"}
            ai="flex-start" 
            jc="center"
            borderWidth={1}
            borderColor={isDark ? "#333" : "#e0e0e0"}
            width="100%"
          >
            <YStack gap="$4" width="100%" >
              <Text color={isDark ? "#fffbf7" : "#333"} fontSize="$5" fontWeight="bold" textAlign="center" fontFamily="$body">
                Bill Management Center
              </Text>
              
              <YStack gap="$3" paddingHorizontal={isWeb ? "$4" : "$4"}>
                <XStack gap="$2" ai="flex-start">
                  <Text color={primaryColor} fontSize={isWeb ? "$4" : "$3"} fontWeight="bold" fontFamily="$body">•</Text>
                  <YStack>
                    <Text color={isDark ? "#fffbf7" : "#333"} fontSize="$3" fontWeight="bold" fontFamily="$body">
                      Track Monthly Expenses
                    </Text>
                    <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body" marginTop="$1">
                      Add your recurring bills and keep track of your monthly expenses in one place.
                    </Text>
                  </YStack>
                </XStack>
                
                <XStack gap="$2" ai="flex-start">
                  <Text color={primaryColor} fontSize={isWeb ? "$4" : "$3"} fontWeight="bold" fontFamily="$body">•</Text>
                  <YStack>
                    <Text color={isDark ? "#fffbf7" : "#333"} fontSize="$3" fontWeight="bold" fontFamily="$body">
                      Due Date Reminders
                    </Text>
                    <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body" marginTop="$1">
                      Never miss a payment with visual indicators for upcoming and due bills.
                    </Text>
                  </YStack>
                </XStack>
                
                <XStack gap="$2" ai="flex-start">
                  <Text color={primaryColor} fontSize={isWeb ? "$4" : "$3"} fontWeight="bold" fontFamily="$body">•</Text>
                  <YStack>
                    <Text color={isDark ? "#fffbf7" : "#333"} fontSize="$3" fontWeight="bold" fontFamily="$body">
                      Budget Overview
                    </Text>
                    <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body" marginTop="$1">
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
                height={120}
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
                    bg={isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.6)"}
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
                      color={ isDark ? "#fffbf7" : "#333"} 
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
                      <Paragraph color={amountColor} fontSize="$4" fontWeight={900} fontFamily="$body">${bill.amount.toFixed(2)}</Paragraph>
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
                    bg={isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.8)"}
                    ai="center"
                    jc="center"
                    zIndex={5}
                  >
                    <XStack ai="center" gap="$2">
                      <CheckCircle size={20} color="#4CAF50" />
                      <Text color="#4CAF50" fontSize="$4" fontWeight="bold" fontFamily="$body">Paid</Text>
                    </XStack>
                  </YStack>
                )}
                
                <YStack ml="$3" flex={1} zIndex={1}>
                  <Text 
                    color={isDueToday ? "$red11" : isDark ? "#fffbf7" : "#000"} 
                    fontSize="$4" 
                    fontWeight="bold"
                    fontFamily="$body"
                  >
                    {bill.name}
                    {isDueToday && " (due today)"}
                  </Text>
                  <XStack ai="center" gap="$1">
                    <Paragraph color={amountColor} fontSize="$4" fontWeight={900} fontFamily="$body"> ${bill.amount.toFixed(2)}</Paragraph>
                    <Paragraph color="#fffbf7" fontSize="$4" fontFamily="$body">• Due {bill.dueDate}{getOrdinalSuffix(bill.dueDate)}</Paragraph>
                  </XStack>
                </YStack>
                <Button 
                  size="$3"
                  bg="transparent" 
                  pressStyle={{ scale: 0.9 }} 
                  animation="quick" 
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
                  icon={<X size={18} color="#ff4444" />} 
                />
              </XStack>
            );
          })
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
