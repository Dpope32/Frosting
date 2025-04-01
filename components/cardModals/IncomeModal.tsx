import React, { useState, useCallback } from 'react'; // Import useCallback
import { Platform, useColorScheme } from 'react-native';
import { Button, Input, Text, YStack, XStack } from 'tamagui';
import { useUserStore } from '@/store/UserStore';
import { BaseCardAnimated } from './BaseCardAnimated'; // Import BaseCardAnimated

interface IncomeModalProps {
  // isVisible is no longer needed as BaseCardAnimated handles visibility
  onClose: () => void;
  currentIncome: number;
  onSubmit: (income: number) => void;
}

// Helper function to format number with commas
const formatNumberWithCommas = (value: string): string => {
  if (!value) return '';
  // Remove non-digit characters except decimal point
  const numericValue = value.replace(/[^0-9.]/g, '');
  const parts = numericValue.split('.');
  // Add commas to the integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  // Reassemble the parts
  return parts.join('.');
};

// Helper function to parse the formatted number
const parseFormattedNumber = (value: string): number => {
  if (!value) return NaN;
  // Remove commas before parsing
  const numericValue = value.replace(/,/g, '');
  return parseFloat(numericValue);
};


// Remove isVisible from props as BaseCardAnimated handles visibility via conditional rendering in parent
export function IncomeModal({ onClose, currentIncome, onSubmit }: IncomeModalProps) {
  // Store the formatted string in state
  const [formattedIncome, setFormattedIncome] = useState(() =>
    currentIncome ? formatNumberWithCommas(currentIncome.toString()) : ''
  );
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const colorScheme = useColorScheme(); // Get color scheme
  const isDark = colorScheme === 'dark'; // Check if dark mode
  const isWeb = Platform.OS === 'web'; // Check if web platform

  const handleIncomeChange = useCallback((text: string) => {
    // Allow only numbers and a single decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    // Ensure only one decimal point
    const valueToFormat = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : parts[0];
    setFormattedIncome(formatNumberWithCommas(valueToFormat));
  }, []);


  const handleSubmit = () => {
    const incomeNum = parseFormattedNumber(formattedIncome); // Parse the formatted string
    if (!isNaN(incomeNum) && incomeNum >= 0) {
      onSubmit(incomeNum); // Submit the parsed number
      onClose();
    }
  };

  // BaseCardAnimated expects to be conditionally rendered by its parent based on an 'open' or 'isVisible' state
  // BaseCardAnimated expects to be conditionally rendered by its parent based on an 'open' or 'isVisible' state
  // It handles the overlay and animation internally.
  // Define platform/theme specific styles
  const modalWidth = isWeb ? 500 : 320;
  const modalMaxWidth = isWeb ? 460 : 360;
  // Removed inputContainerMaxWidth and inputPadding

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
