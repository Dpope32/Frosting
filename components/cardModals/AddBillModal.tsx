import React, { useState } from 'react';
import { Modal } from 'react-native';
import { Button, Input, Text, YStack, XStack } from 'tamagui';

interface AddBillModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (entry: { name: string; amount: number; dueDate: number }) => void;
}

export function AddBillModal({ isVisible, onClose, onSubmit }: AddBillModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = () => {
    const amountNum = parseFloat(amount);
    const dueDateNum = parseInt(dueDate, 10);
    
    if (name && !isNaN(amountNum) && !isNaN(dueDateNum) && dueDateNum >= 1 && dueDateNum <= 31) {
      onSubmit({
        name,
        amount: amountNum,
        dueDate: dueDateNum
      });
      setName('');
      setAmount('');
      setDueDate('');
      onClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <YStack
        f={1}
        jc="center"
        ai="center"
        backgroundColor="rgba(0, 0, 0, 0.5)"
        px="$4"
      >
        <YStack
          backgroundColor="$background"
          p="$4"
          borderRadius="$4"
          width="100%"
          maxWidth={400}
          gap="$4"
        >
          <Text color="$color" fontSize="$6" fontWeight="bold" mb="$2">
            Add New Bill
          </Text>
          
          <Input
            placeholder="Bill Name"
            value={name}
            onChangeText={setName}
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            placeholderTextColor="$placeholderColor"
            color="$color"
          />
          
          <Input
            placeholder="Amount ($)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            placeholderTextColor="$placeholderColor"
            color="$color"
          />
          
          <Input
            placeholder="Due Date (1-31)"
            value={dueDate}
            onChangeText={setDueDate}
            keyboardType="number-pad"
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            placeholderTextColor="$placeholderColor"
            color="$color"
          />

          <XStack gap="$3" jc="flex-end">
            <Button
              onPress={onClose}
              backgroundColor="$backgroundHover"
              borderColor="$borderColor"
            >
              Cancel
            </Button>
            <Button
              onPress={handleSubmit}
              backgroundColor="$blue10"
              disabled={!name || !amount || !dueDate}
            >
              Save
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </Modal>
  );
}
