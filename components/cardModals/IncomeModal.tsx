import React, { useState } from 'react';
import { Platform, useColorScheme } from 'react-native'; // Import Platform and useColorScheme
import { Button, Input, Text, YStack, XStack } from 'tamagui';
import { useUserStore } from '@/store/UserStore';
import { BaseCardAnimated } from './BaseCardAnimated'; // Import BaseCardAnimated

interface IncomeModalProps {
  // isVisible is no longer needed as BaseCardAnimated handles visibility
  onClose: () => void;
  currentIncome: number;
  onSubmit: (income: number) => void;
}

// Remove isVisible from props as BaseCardAnimated handles visibility via conditional rendering in parent
export function IncomeModal({ onClose, currentIncome, onSubmit }: IncomeModalProps) {
  const [income, setIncome] = useState(currentIncome ? currentIncome.toString() : ''); // Handle potential initial undefined value
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const colorScheme = useColorScheme(); // Get color scheme
  const isDark = colorScheme === 'dark'; // Check if dark mode
  const isWeb = Platform.OS === 'web'; // Check if web platform

  const handleSubmit = () => {
    const incomeNum = parseFloat(income);
    if (!isNaN(incomeNum) && incomeNum >= 0) {
      onSubmit(incomeNum);
      onClose();
    }
  };

  // BaseCardAnimated expects to be conditionally rendered by its parent based on an 'open' or 'isVisible' state
  // It handles the overlay and animation internally.
  // Define platform/theme specific styles
  const modalWidth = isWeb ? 350 : 320;
  const modalMaxWidth = isWeb ? 460 : 360;
  const inputContainerMaxWidth = isWeb ? 220 : 180; // Slightly wider input on web
  const inputPadding = isWeb ? '$1' : '$1'; // More padding on web input

  return (
    <BaseCardAnimated
      title="Set Monthly Income"
      onClose={onClose}
      modalWidth={modalWidth}
      modalMaxWidth={modalMaxWidth}
    >
      <YStack gap="$4">
        <XStack
          ai="flex-start"
          gap="$2"
          p={inputPadding}
          br="$4"
          maxWidth={inputContainerMaxWidth} 
          alignSelf='center' 
        >
          <Text fontSize={"$4"} color="$color">$</Text> 
          <Input
            placeholder="Amount"
            value={income}
            onChangeText={setIncome}
            keyboardType="decimal-pad"
          />
        </XStack>

        <XStack gap="$3" jc="flex-end" mt="$2">
          <Button
            onPress={onClose}
            backgroundColor={isDark ? "$backgroundPress" : "$backgroundHover"} 
            pressStyle={{ opacity: 0.7 }}
            size={isWeb ? "$4" : "$3"}
          >
            <Text fontSize={isWeb ? "$3" : "$3"}>Cancel</Text> 
          </Button>
          <Button
            onPress={handleSubmit}
            backgroundColor={primaryColor}
            disabled={!income || isNaN(parseFloat(income)) || parseFloat(income) < 0}
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
