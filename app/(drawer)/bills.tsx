import React, { useState, useEffect } from 'react';
import { ScrollView, useColorScheme, Platform, FlatList } from 'react-native';
import { Button, XStack, YStack, Text, Spinner } from 'tamagui';
import { BillCard } from '@/components/bills/BillCard';
import { BillEmpty } from '@/components/bills/BillEmpty';
import { BillSummary } from '@/components/bills/BillSummary';
import { Plus, Database, Trash } from '@tamagui/lucide-icons';
import { useUserStore } from '@/store/UserStore';
import { useBills } from '@/hooks/useBills';
import { AddBillModal } from '@/components/cardModals/creates/AddBillModal';
import { IncomeModal } from '@/components/cardModals/IncomeModal/IncomeModal';
import { BillRecommendationModal } from '@/components/recModals/BillRecommendationModal';
import { isIpad } from '@/utils/deviceUtils';
import { EditBillModal } from '@/components/cardModals/edits/EditBillModal';
import { Bill } from '@/types/bills';
import { BillsListModal } from '@/components/listModals/BillsListModal';

export default function BillsScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [housingModalOpen, setHousingModalOpen] = useState(false);
  const [transportationModalOpen, setTransportationModalOpen] = useState(false);
  const [subscriptionsModalOpen, setSubscriptionsModalOpen] = useState(false);
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);
  const [editBillModalOpen, setEditBillModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [billsListModalOpen, setBillsListModalOpen] = useState(false);
  
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

  const [isDeletingBill, setIsDeletingBill] = useState(false);
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
  const columnWidth = `${100 / columnCount}%` ;
  const handleAddBill = (billData: { name: string; amount: number; dueDate: number }) => { addBill(billData);};

  const handleDeleteBill = (id: string) => {
    setIsDeletingBill(true);
    setTimeout(() => {
      deleteBill(id, {
        onSuccess: () => {
          setIsDeletingBill(false);
        },
        onError: () => {
          setIsDeletingBill(false);
        }
      });
    }, 0);
  };

  // Dev functions to load and clear sample bills
  const loadDevBills = () => {
    const sampleBills = [
      { name: 'Rent', amount: 1200, dueDate: 1 },
      { name: 'Internet', amount: 60, dueDate: 15 },
      { name: 'Electricity', amount: 90, dueDate: 20 },
    ];
    sampleBills.forEach((bill, index) => {
      setTimeout(() => addBill(bill), index * 300);
    });
  };

  const deleteAllBills = () => {
    bills?.forEach((bill, index) => {
      setTimeout(() => deleteBill(bill.id), index * 200);
    });
  };

  const handleEditBill = (bill: Bill) => {
    setSelectedBill(bill);
    setEditBillModalOpen(true);
  };

  const handleUpdateBill = (updatedBill: { id: string; name: string; amount: number; dueDate: number }) => {
    // First delete the old bill
    deleteBill(updatedBill.id, {
      onSuccess: () => {
        // Then add a new bill with the updated info but keeping the same ID
        addBill({
          name: updatedBill.name,
          amount: updatedBill.amount,
          dueDate: updatedBill.dueDate,
        });
        setEditBillModalOpen(false);
        setSelectedBill(null);
      },
      onError: () => {
        // Handle error
        console.error("Failed to update bill");
        setEditBillModalOpen(false);
        setSelectedBill(null);
      }
    });
  };

  return (
    <>
      <BillsListModal
        open={billsListModalOpen}
        onOpenChange={setBillsListModalOpen}
        onEditBill={handleEditBill}
      />
      <EditBillModal
        isVisible={editBillModalOpen}
        onClose={() => { setEditBillModalOpen(false); setSelectedBill(null); }}
        bill={selectedBill}
        onSubmit={handleUpdateBill}
      />
      <YStack f={1} mt={isWeb ? 65 : 95} py={isIpad() ? "$2" : "$2"} bg={isDark ? "#010101" : "#fffbf7fff"} px={isIpad() ? "$1" : "$0"}>
        <BillSummary 
          monthlyIncome={monthlyIncome}
          totalMonthlyAmount={totalMonthlyAmount}
          monthlyBalance={monthlyBalance}
          bills={bills}
          onEditIncome={() => setIsIncomeModalVisible(true)}
        />
        
        {isDeletingBill && (
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={1000}
            alignItems={isWeb ? "flex-start" : isIpad() ? "flex-start" : "center"}
            justifyContent={isWeb ? "flex-start" : isIpad() ? "flex-start" : "center"}
            pt={isWeb ? 100 : isIpad() ? 100 : 150}
            backgroundColor={isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)"}
          >
            <XStack
              backgroundColor={isDark ? "#222" : "white"}
              padding="$4"
              borderRadius="$4"
              alignItems="center"
              gap="$3"
              shadowColor="black"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.2}
              shadowRadius={8}
              elevation={8}
            >
              <Spinner size="large" color={primaryColor} />
              <YStack>
                <Text fontWeight="600" color={isDark ? "white" : "black"}>Deleting bill...</Text>
                <Text fontSize={12} color={isDark ? "#aaa" : "#666"}>This may take a moment</Text>
              </YStack>
            </XStack>
          </YStack>
        )}
        
        {isIpad() ? (
          <FlatList
            data={bills?.sort((a, b) => a.dueDate - b.dueDate) || []}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({ item }) => (
              <BillCard
                bill={item}
                currentDay={currentDay}
                primaryColor={primaryColor}
                onDelete={handleDeleteBill}
              />
            )}
            contentContainerStyle={{
              padding: 8,
              paddingBottom: 100,
              paddingHorizontal: 12,
              paddingLeft: 32,
              paddingRight: 32,
              gap: 12,
            }}
            columnWrapperStyle={{ gap: 10 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <BillEmpty
                setHousingModalOpen={setHousingModalOpen}
                setTransportationModalOpen={setTransportationModalOpen}
                setSubscriptionsModalOpen={setSubscriptionsModalOpen}
                setInsuranceModalOpen={setInsuranceModalOpen}
              />
            }
          />
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
              padding: isWeb ? 12 : 6,
              paddingBottom: 100,
              paddingHorizontal: isWeb ? 0 : 12,
              paddingLeft: isWeb ? 40 : 20,
              paddingRight: isWeb ? 20 : 20, 
              display: isWeb ? 'flex' : undefined,
              flexDirection: isWeb ? 'row' : undefined,
              flexWrap: isWeb ? 'wrap' : undefined,
              justifyContent: isWeb ? 'flex-start' : undefined,
              gap: isWeb ? 20 : 6, 
              maxWidth: isWeb ? 1780 : undefined, 
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
                  onDelete={handleDeleteBill}
                />
              ))
            ) : null}
          </ScrollView>
        )}
        
        {isModalVisible && (
          <AddBillModal 
            isVisible={isModalVisible} 
            onClose={() => setIsModalVisible(false)} 
            onSubmit={handleAddBill} 
          />
        )}
          
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
        
        {__DEV__ && (
          <XStack position="absolute" bottom={40} left={24} gap="$2" zIndex={1000}>
            <Button
              size="$4"
              circular
              bg="#00AAFF"
              pressStyle={{ scale: 0.95 }}
              animation="quick"
              elevation={4}
              onPress={loadDevBills}
              icon={<Database color="#FFF" size={20} />}
            />
            <Button
              size="$4"
              circular
              bg="#FF5555"
              pressStyle={{ scale: 0.95 }}
              animation="quick"
              elevation={4}
              onPress={deleteAllBills}
              icon={<Trash color="#FFF" size={20} />}
            />
          </XStack>
        )}
        
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
    </>
  );
}
