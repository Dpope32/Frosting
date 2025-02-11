import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, Card, H2, Paragraph, XStack, YStack } from 'tamagui';
import { Plus, X } from '@tamagui/lucide-icons';
import { useUserStore } from '@/store/UserStore';
import { useBills } from '@/hooks/useBills';
import { AddBillModal } from '@/components/cardModals/AddBillModal';

export default function BillsScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { bills, addBill, deleteBill, isLoading } = useBills();
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const nameColors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#A29BFE', '#F78FB3'];

  const handleAddBill = (billData: { name: string; amount: number; dueDate: number }) => {
    addBill(billData);
  };

  return (
    <YStack f={1} mt={90} px="$4">
      <ScrollView contentContainerStyle={{ 
        paddingTop: 100,
        paddingBottom: 20
      }}>
        <YStack p="$4" gap="$4">
        {isLoading ? (

          Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={`skeleton-${index}`}
              elevate
              bordered
              animation="bouncy"
              scale={0.95}
            >
              <Card.Header p="$3">
                <YStack gap="$2">
                  <XStack jc="space-between" ai="center">
                    <YStack width={120} height={24} backgroundColor="$gray8" borderRadius="$2" />
                    <YStack width={32} height={32} backgroundColor="$gray8" borderRadius="$6" />
                  </XStack>
                  <YStack width={100} height={32} backgroundColor="$gray8" borderRadius="$2" />
                  <YStack width={80} height={20} backgroundColor="$gray8" borderRadius="$2" />
                </YStack>
              </Card.Header>
            </Card>
          ))
        ) : bills?.length === 0 ? (
          <Card elevate bordered animation="bouncy" scale={0.95}>
            <Card.Header p="$3">
              <Paragraph theme="alt2" textAlign="center">No bills added yet</Paragraph>
            </Card.Header>
          </Card>
        ) : bills ? (
          bills.sort((a, b) => a.dueDate - b.dueDate).map((bill, index) => (
            <Card
              key={bill.id}
              elevate
              bordered
              animation="bouncy"
              scale={0.95}
              hoverStyle={{ scale: 0.975 }}
              pressStyle={{ scale: 0.925 }}
            >
              <Card.Header p="$3">
                <YStack gap="$2">
                  <XStack jc="space-between" ai="center">
                    <H2 color={nameColors[index % nameColors.length]} fontSize="$6">{bill.name}</H2>
                    <Button
                      size="$2"
                      circular
                      backgroundColor="$red10"
                      onPress={() => deleteBill(bill.id)}
                      icon={<X size={16} color="white" />}
                    />
                  </XStack>
                  <Paragraph theme="alt2" fontSize="$7" fontWeight="bold">
                    ${bill.amount.toFixed(2)}
                  </Paragraph>
                  <Paragraph theme="alt2" fontSize="$4">
                    Due: {bill.dueDate}th
                  </Paragraph>
                </YStack>
              </Card.Header>
            </Card>
          ))
        ) : null}

        <AddBillModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSubmit={handleAddBill}
        />
        </YStack>
      </ScrollView>

      <Button
        onPress={() => setIsModalVisible(true)}
        position="absolute"
        bottom="$8"
        right="$4"
        zIndex={1000}
        size="$4"
        width={120}
        height={40}
        borderRadius="$4"
        backgroundColor={primaryColor}
        pressStyle={{ scale: 0.95 }}
        animation="quick"
        elevation={4}
      >
        <Plus color="white" size={18} />
        <Paragraph color="white" fontSize="$3" ml="$2">Add Bill</Paragraph>
      </Button>
    </YStack>
  );
}
