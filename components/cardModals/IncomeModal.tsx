import React, { useState, useCallback } from 'react'; 
import { useColorScheme } from 'react-native';
import { Button, Input, Text, YStack, XStack, isWeb } from 'tamagui';
import { useUserStore } from '@/store/UserStore';
import { BaseCardAnimated } from '../baseModals/BaseCardAnimated'; 

interface IncomeModalProps {
  onClose: () => void;
  currentIncome: number;
  onSubmit: (income: number) => void;
}

const formatNumberWithCommas = (value: string): string => {
  if (!value) return '';
  const numericValue = value.replace(/[^0-9.]/g, '');
  const parts = numericValue.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

const parseFormattedNumber = (value: string): number => {
  if (!value) return NaN;
  const numericValue = value.replace(/,/g, '');
  return parseFloat(numericValue);
};


export function IncomeModal({ onClose, currentIncome, onSubmit }: IncomeModalProps) {
  const [formattedIncome, setFormattedIncome] = useState(() => currentIncome ? formatNumberWithCommas(currentIncome.toString()) : '' );
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const colorScheme = useColorScheme(); 
  const isDark = colorScheme === 'dark'; 
  const modalWidth = isWeb ? 500 : 320;
  const modalMaxWidth = isWeb ? 460 : 360;
  
  const handleIncomeChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const valueToFormat = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : parts[0];
    setFormattedIncome(formatNumberWithCommas(valueToFormat));
  }, []);


  const handleSubmit = () => {
    const incomeNum = parseFormattedNumber(formattedIncome); 
    if (!isNaN(incomeNum) && incomeNum >= 0) {
      onSubmit(incomeNum); 
      onClose();
    }
  };

  return (
    <BaseCardAnimated
      title="Set Monthly Income"
      onClose={onClose}
      modalWidth={modalWidth}
      modalMaxWidth={modalMaxWidth}
    >
      <YStack gap="$4" px="$2" py="$3"> 
        <XStack
          ai="center" 
          gap="$2"
          br="$4"
          borderColor="$borderColor" 
          borderWidth={1}
          p="$2"
        >
          <Text fontSize={"$4"} color="$color" mt="$1">$</Text>
          <Input
            placeholder="Amount"
            value={formattedIncome} 
            onChangeText={handleIncomeChange} 
            keyboardType="decimal-pad"
            flex={1} 
            size="$3"
            borderWidth={0} 
            backgroundColor="transparent"
            focusStyle={{ 
              borderWidth: 0,
            }}
          />
        </XStack>

        <XStack gap="$3" jc="flex-end" mt="$2">
          <Button
            onPress={onClose}
            backgroundColor={isDark ? "#transparent" : "#transparent"} 
            pressStyle={{ opacity: 0.7 }}
            size={isWeb ? "$4" : "$3"}
          >
            <Text fontFamily="$body" fontSize="$3" >Cancel</Text> 
          </Button>
          <Button
            onPress={handleSubmit}
            backgroundColor={primaryColor}
            disabled={!formattedIncome || isNaN(parseFormattedNumber(formattedIncome)) || parseFormattedNumber(formattedIncome) < 0}
            pressStyle={{ opacity: 0.7 }}
            size={isWeb ? "$4" : "$3"}
          >
             <Text color="white">Save</Text>
          </Button>
        </XStack>
      </YStack>
    </BaseCardAnimated>
  );
}
