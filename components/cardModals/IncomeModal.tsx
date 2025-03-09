import React, { useState } from 'react';
import { Modal } from 'react-native';
import { Button, Input, Text, YStack, XStack } from 'tamagui';
import { useUserStore } from '@/store/UserStore';

interface IncomeModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentIncome: number;
  onSubmit: (income: number) => void;
}

export function IncomeModal({ isVisible, onClose, currentIncome, onSubmit }: IncomeModalProps) {
  const [income, setIncome] = useState(currentIncome.toString());
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);

  const handleSubmit = () => {
    const incomeNum = parseFloat(income);
    if (!isNaN(incomeNum) && incomeNum >= 0) {
      onSubmit(incomeNum);
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
          <Text color="$color" fontFamily="$body" fontSize="$6" fontWeight="bold" mb="$2">
            Set Monthly Income
          </Text>
          
          <Input
            placeholder="Monthly Income ($)"
            value={income}
            onChangeText={setIncome}
            keyboardType="decimal-pad"
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
              backgroundColor={primaryColor}
              disabled={!income || isNaN(parseFloat(income)) || parseFloat(income) < 0}
            >
              Save
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </Modal>
  );
}
