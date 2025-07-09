import React, { useState, useEffect } from 'react';
import { ScrollView, useColorScheme, Platform, FlatList } from 'react-native';
import { Button, XStack, YStack, Text, Spinner, isWeb } from 'tamagui';
import { BillCard } from '@/components/bills/BillCard';
import { BillEmpty } from '@/components/bills/BillEmpty';
import { BillSummary } from '@/components/bills/BillSummary';
import { MaterialIcons } from '@expo/vector-icons';
import { useUserStore } from '@/store';
import { useBills } from '@/hooks';
import { AddBillModal } from '@/components/cardModals/creates/AddBillModal';
import { IncomeModal } from '@/components/cardModals/edits/IncomeModal';
import { BillRecommendationModal } from '@/components/recModals/BillRecommendationModal';
import { isIpad } from '@/utils';
import { EditBillModal } from '@/components/cardModals/edits/EditBillModal';
import { Bill } from '@/types';
import { BillsListModal } from '@/components/listModals/BillsListModal';
import { loadDevBills, deleteAllBills } from '@/services/dev/devBills';
import { useQueryClient } from '@tanstack/react-query';
import { useCalendarStore, useToastStore } from '@/store';
import { useProjectStore } from '@/store/ToDo';
import { useBillStore } from '@/store/BillStore';

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
  const { bills, addBill, updateBill, deleteBill, isLoading, monthlyIncome, setMonthlyIncome, totalMonthlyAmount, monthlyBalance } = useBills();
  const [isDeletingBill, setIsDeletingBill] = useState(false);
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentDay = new Date().getDate();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  // Get additional hooks needed for dev functions
  const queryClient = useQueryClient();
  const { addEvents } = useCalendarStore();
  const { addTask } = useProjectStore();
  const { showToast } = useToastStore();
  const { getBills } = useBillStore();
  
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleResize = () => setWindowWidth(window.innerWidth);
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

  const handleEditBill = (bill: Bill) => {
    setSelectedBill(bill);
    setEditBillModalOpen(true);
  };

  const handleUpdateBill = async (updatedBillData: { id: string; name: string; amount: number; dueDate: number; createTask?: boolean }) => {
    if (typeof updateBill === 'function') {
      try {
        await updateBill(updatedBillData, {
          onSuccess: () => {
            setEditBillModalOpen(false);
            setSelectedBill(null);
          },
          onError: () => {
            setEditBillModalOpen(false);
            setSelectedBill(null);
          }
        });
      } catch (error) {
        console.error('Error updating bill:', error);
        setEditBillModalOpen(false);
        setSelectedBill(null);
        throw error;
      }
    } else {
      console.error('updateBill is not a function');
      throw new Error('updateBill is not a function');
    }
  };

  const handleLoadDevBills = () => {
    loadDevBills({
      addBill,
      addEvents,
      addTask,
      showToast,
      invalidateQueries: () => queryClient.invalidateQueries({ queryKey: ['bills'] }),
      refetchQueries: () => queryClient.refetchQueries({ queryKey: ['bills'] })
    });
  };

  const handleDeleteAllBills = () => {
    deleteAllBills({
      getBills,
      deleteBill: (id: string) => deleteBill(id)
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
        onClose={() => { 
          setSelectedBill(null);
          setEditBillModalOpen(false); 
        }}
        bill={selectedBill}
        onSubmit={handleUpdateBill}
      />
      <YStack f={1} paddingTop={isWeb ? 65 : isIpad() ? (isDark ? 90 : 80) : 100} pb={isIpad() ? "$2" : "$2"} backgroundColor={isDark ? '#0a0a0a' : '#fafafa'} px={isIpad() ? "$1" : "$0"}>
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
            backgroundColor={isDark ? "rgba(0, 0, 0, 0.87)" : "rgba(0, 0, 0, 0.6)"}
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
            renderItem={({ item }) => (
              <BillCard
                bill={item}
                currentDay={currentDay}
                primaryColor={primaryColor}
                onDelete={handleDeleteBill}
              />
            )}
            contentContainerStyle={{
              paddingTop: 0,
              paddingBottom: 100,
              paddingHorizontal: '5%',
              gap: 8,
            }}
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
              gap: isWeb ? 20 : 7, 
              maxWidth: isWeb ? 1780 : undefined, 
            }}
          >
            {isLoading ? (
              Array.from({ length: bills?.length || 10 }).map((_, index) => (
                <XStack 
                  key={`skeleton-${index}`} 
                  bg={isDark ? "#111" : "#f5f5f5"}
                  p={isWeb ? "$3" : "$2"} 
                  mb="$1"
                  br="$4" 
                  ai="center" 
                  animation="quick"
                  borderWidth={1}
                  borderColor={isDark ? "#222" : "#e0e0e0"}
                  width={isWeb ? columnWidth : "100%"}
                  minHeight={isWeb ? 60 : isIpad() ? 55 : 50}
                  height={isWeb ? 60 : isIpad() ? 55 : 50}
                >
                  <YStack width={40} height={30} bg={isDark ? "#333" : "#e0e0e0"} br="$4" />
                  <XStack mx="$3" flex={1} gap="$1">
                    <YStack width={100} mx="$8" height={20} bg={isDark ? "#333" : "#e0e0e0"} br="$2" />
                    <YStack width={60}mx="$3"  height={16} bg={isDark ? "#333" : "#e0e0e0"} br="$2" />
                  </XStack>
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
            onSubmit={(entry) => { 
              addBill(entry);
              setIsModalVisible(false);
            }}
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
          <MaterialIcons name="add" color="white" size={24} />
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
              onPress={handleLoadDevBills}
              icon={<MaterialIcons name="storage" color="#FFF" size={20} />}
            />
            <Button
              size="$4"
              circular
              bg="#FF5555"
              pressStyle={{ scale: 0.95 }}
              animation="quick"
              elevation={4}
              onPress={handleDeleteAllBills}
              icon={<MaterialIcons name="delete" color="#FFF" size={20} />}
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
