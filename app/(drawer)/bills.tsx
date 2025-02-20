import React, { useState } from 'react';
import { ScrollView, useColorScheme } from 'react-native';
import { Button, Card, H2, Paragraph, XStack, YStack, Text } from 'tamagui';
import { Plus, X, Wifi, CreditCard, Home, Tv, ShoppingBag, Zap, Droplet, GaugeCircle, Phone, Shield, Activity, Car, DollarSign, Calendar, BookOpen, Newspaper, Cloud, Wrench, Trash, Lock, Heart, GraduationCap, PlaneTakeoff, Coffee, FileText, Percent } from '@tamagui/lucide-icons';
import { useUserStore } from '@/store/UserStore';
import { useBills } from '@/hooks/useBills';
import { AddBillModal } from '@/components/cardModals/AddBillModal';
import { useBillStore } from '@/store/BillStore';

const getOrdinalSuffix = (day: number): string => {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

const getIconForBill = (billName: string) => {
  const name = billName.toLowerCase();
  if (name.includes('wifi') || name.includes('internet')) return Wifi;
  else if (name.includes('rent') || name.includes('mortgage')) return Home;
  else if (name.includes('netflix') || name.includes('hulu') || name.includes('stream')) return Tv;
  else if (name.includes('shopping') || name.includes('amazon') || name.includes('store')) return ShoppingBag;
  else if (name.includes('electric') || name.includes('power') || name.includes('energy')) return Zap;
  else if (name.includes('water') || name.includes('aqua')) return Droplet;
  else if (name.includes('gas') || name.includes('propane')) return GaugeCircle;
  else if (name.includes('phone') || name.includes('cellular') || name.includes('mobile')) return Phone;
  else if (name.includes('insurance')) return Shield;
  else if (name.includes('gym') || name.includes('fitness') || name.includes('workout')) return Activity;
  else if (name.includes('car') || name.includes('auto') || name.includes('vehicle')) return Car;
  else if (name.includes('loan') || name.includes('debt')) return DollarSign;
  else if (name.includes('credit card') || name.includes('card payment')) return CreditCard;
  else if (name.includes('cable') || name.includes('satellite')) return Tv;
  else if (name.includes('subscription') || name.includes('membership')) return Calendar;
  else if (name.includes('magazine') || name.includes('book')) return BookOpen;
  else if (name.includes('newspaper') || name.includes('news')) return Newspaper;
  else if (name.includes('cloud') || name.includes('storage')) return Cloud;
  else if (name.includes('maintenance') || name.includes('repair')) return Wrench;
  else if (name.includes('waste') || name.includes('garbage') || name.includes('trash')) return Trash;
  else if (name.includes('security') || name.includes('alarm')) return Lock;
  else if (name.includes('health') || name.includes('medical')) return Heart;
  else if (name.includes('education') || name.includes('school') || name.includes('tuition')) return GraduationCap;
  else if (name.includes('travel') || name.includes('transport')) return PlaneTakeoff;
  else if (name.includes('food') || name.includes('meal')) return Coffee;
  else if (name.includes('service fee') || name.includes('subscription fee')) return FileText;
  else if (name.includes('tax')) return Percent;
  else if (name.includes('water heater') || name.includes('boiler')) return Droplet;
  else if (name.includes('vpn')) return Shield;
  else if (name.includes('ev') || name.includes('electric car')) return Car;
  return CreditCard;
};

const getAmountColor = (amount: number) => {
  if (amount >= 100) return '#FF6B6B';
  if (amount >= 50) return '#FFD93D';
  return '#4ECDC4';
};

export default function BillsScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { bills, addBill, deleteBill, isLoading } = useBills();
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleAddBill = (billData: { name: string; amount: number; dueDate: number }) => {
    addBill(billData);
  };

  return (
    <YStack f={1} mt={90} bg={isDark ? "#000000" : "#ffffff"}>
      <ScrollView contentContainerStyle={{ padding: 8, paddingBottom: 100 }}>
        <YStack gap="$2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <XStack 
                key={`skeleton-${index}`} 
                bg={isDark ? "#1A1A1A" : "#f5f5f5"}
                p="$4" 
                borderRadius="$4" 
                ai="center" 
                pressStyle={{ opacity: 0.7 }} 
                animation="quick"
                borderWidth={1}
                borderColor={isDark ? "#333" : "#e0e0e0"}
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
              p="$6" 
              borderRadius="$4" 
              ai="center" 
              jc="center"
              borderWidth={1}
              borderColor={isDark ? "#333" : "#e0e0e0"}
            >
              <Paragraph color={isDark ? "#666" : "#999"} fontSize="$3" textAlign="center">No bills added yet</Paragraph>
            </XStack>
          ) : bills ? (
            bills.sort((a, b) => a.dueDate - b.dueDate).map((bill) => {
              const IconComponent = getIconForBill(bill.name);
              const amountColor = getAmountColor(bill.amount);
              return (
                <XStack 
                  key={bill.id} 
                  bg={isDark ? "#1A1A1A" : "#f5f5f5"}
                  p="$4"
                  borderRadius="$4" 
                  ai="center" 
                  pressStyle={{ opacity: 0.7 }} 
                  animation="quick"
                  borderWidth={1}
                  borderColor={isDark ? "#333" : "#e0e0e0"}
                >
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
                  <YStack ml="$3" flex={1}>
                    <Text color={isDark ? "#fff" : "#000"} fontSize="$4" fontWeight="bold">{bill.name}</Text>
                    <XStack ai="center" gap="$2">
                      <Paragraph color={amountColor} fontSize="$4" fontWeight={400}>${bill.amount.toFixed(2)}</Paragraph>
                      <Paragraph color="#666" fontSize="$4">• Due {bill.dueDate}{getOrdinalSuffix(bill.dueDate)}</Paragraph>
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
        </YStack>
      </ScrollView>
      <AddBillModal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)} onSubmit={handleAddBill} />
      <Button 
        onPress={() => setIsModalVisible(true)} 
        position="absolute" 
        bottom={32} 
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
    </YStack>
  );
}
