import React, { useState, useCallback } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { Button, Input, Text, YStack, XStack } from 'tamagui';
import { useUserStore } from '@/store/UserStore';
import { BaseCardAnimated } from './BaseCardAnimated';

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
  const [formattedIncome, setFormattedIncome] = useState(() =>
    currentIncome ? formatNumberWithCommas(currentIncome.toString()) : ''
  );
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';

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

  const modalWidth = isWeb ? 400 : 320;
  const modalMaxWidth = isWeb ? 420 : 360;
  const inputBgColor = isDark ? '$color3' : '$color2';
  const inputTextColor = isDark ? '$color12' : '$color12';
  const cancelColor = isDark ? '$red10' : '$red10';

  return (
    <BaseCardAnimated
      title="Set Monthly Income"
      onClose={onClose}
      modalWidth={modalWidth}
      modalMaxWidth={modalMaxWidth}
      showCloseButton={true}
    >
      <YStack gap="$3" px="$2">
        <XStack
          ai="center"
          jc="center"
          gap="$1"
          br={isWeb ? "$6" : "$3"}
          borderColor={isDark ? '$color8' : '$color8'}
          borderWidth={1}
          p="$2"
          backgroundColor={inputBgColor}
        >
          <Text 
            fontSize="$4" 
            color={"$green11Dark"} 
            fontWeight="bold" 
            fontFamily="$body"
            pl="$2"
            mt={isWeb ? "$1" : "$0"}
          >
            $
          </Text>
          <Input
            placeholder="Amount"
            value={formattedIncome}
            onChangeText={handleIncomeChange}
            keyboardType="decimal-pad"
            flex={1}
            size="$3"
            borderWidth={0}
            backgroundColor={inputBgColor}
            color={inputTextColor}
            fontSize="$5"
            fontWeight="500"
            placeholderTextColor={isDark ? '$color9' : '$color8'}
          />
        </XStack>

        <XStack gap="$3" jc="flex-end" mt="$2">
          <Button
            onPress={onClose}
            backgroundColor="transparent"
            pressStyle={{ opacity: 0.7 }}
            size={isWeb ? "$4" : "$3"}
            borderColor={cancelColor}
            borderWidth={1}
          >
            <Text 
              fontFamily="$body" 
              fontSize="$3" 
              color={cancelColor}
              fontWeight="500"
            >
              Cancel
            </Text>
          </Button>
          <Button
            onPress={handleSubmit}
            backgroundColor={primaryColor}
            disabled={!formattedIncome || isNaN(parseFormattedNumber(formattedIncome)) || parseFormattedNumber(formattedIncome) < 0}
            pressStyle={{ opacity: 0.7 }}
            size={isWeb ? "$4" : "$3"}
          >
            <Text 
              color="white" 
              fontSize="$3" 
              fontFamily="$body"
              fontWeight="500"
              paddingHorizontal={isWeb ? "$2" : "$1"}
            >
              Save
            </Text>
          </Button>
        </XStack>
      </YStack>
    </BaseCardAnimated>
  );
}