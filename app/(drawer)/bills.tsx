import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, Card, H2, Paragraph, XStack, YStack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useBills } from '@/hooks/useBills';
import { AddBillModal } from '@/components/cardModals/AddBillModal';

export default function BillsScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { bills, addBill, deleteBill, isLoading } = useBills();
  const nameColors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#A29BFE', '#F78FB3'];

  const handleAddBill = (billData: { name: string; amount: number; dueDate: number }) => {
    addBill(billData);
  };

  return (
    <ScrollView style={{ paddingTop: 100 }}>
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
                      icon={<Ionicons name="trash-outline" size={16} color="white" />}
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

      <Button
        onPress={() => setIsModalVisible(true)}
        position="absolute"
        bottom={20}
        right={20}
        zIndex={1000}
        size="$4"
        width={120}
        height={40}
        borderRadius="$4"
        backgroundColor="$blue10"
        pressStyle={{ scale: 0.95 }}
        animation="quick"
        elevation={4}
      >
        <Ionicons name="add" size={18} color="white" />
        <Paragraph color="white" fontSize="$3" ml="$2">Add Bill</Paragraph>
      </Button>
    </ScrollView>
  );
}
