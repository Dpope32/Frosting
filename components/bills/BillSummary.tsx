import React from 'react';
import { useColorScheme, Platform } from 'react-native';
import { Button, XStack, YStack, Text } from 'tamagui';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Edit3 } from '@tamagui/lucide-icons';

interface BillSummaryProps {
  monthlyIncome: number;
  totalMonthlyAmount: number;
  monthlyBalance: number;
  bills: any[] | undefined;
  isWeb: boolean;
  onEditIncome: () => void;
}

export const BillSummary: React.FC<BillSummaryProps> = ({
  monthlyIncome,
  totalMonthlyAmount,
  monthlyBalance,
  bills,
  isWeb,
  onEditIncome,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Calculate the height percentage for the visual bars
  const maxValue = Math.max(monthlyIncome, totalMonthlyAmount);
  const incomeHeightPercent = maxValue > 0 ? (monthlyIncome / maxValue) * 100 : 0;
  const billsHeightPercent = maxValue > 0 ? (totalMonthlyAmount / maxValue) * 100 : 0;
  
  if (isWeb) {
    return (
      <XStack 
        width="96%" 
        mx="auto" 
        p="$4" 
        mb="$6"
        ai="center"
        jc="flex-start"
        gap="$6+"
        br="$4" 
      >
        <XStack gap="$4" ai="center" flex={1} jc="flex-start" position="relative"> 
          {/* Visual bars in a separate container */}
          <XStack 
            width={20}
            height="100%"
            ai="flex-end"
            jc="flex-end"
            mr={16}
          >
            <XStack 
              height="100%" 
              ai="flex-end" 
              gap={2}
            >
              {monthlyIncome > 0 && (
                <XStack 
                  width={4} 
                  height={`${incomeHeightPercent}%`} 
                  bg="#4CAF50" 
                  borderRadius={2}
                />
              )}
              {totalMonthlyAmount > 0 && (
                <XStack 
                  width={4} 
                  height={`${billsHeightPercent}%`} 
                  bg="#FF5252" 
                  borderRadius={2}
                />
              )}
            </XStack>
          </XStack>
          
          {/* Content container */}
          <XStack gap="$4" ai="center" flex={1} jc="flex-start">
            <XStack width={180} ai="center" py="$3" px="$5" br="$5" bg={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}>
              <YStack>
                <Text fontSize="$3" color={isDark ? "#999" : "#666"} fontFamily="$body">Income</Text>
                <XStack ai="center" gap="$2">
                  <Text fontSize="$4" fontWeight="bold" color="#4CAF50" fontFamily="$body">
                    ${monthlyIncome.toFixed(0)}
                  </Text>
                  <Button
                    size="$1"
                    bg="transparent"
                    pressStyle={{ scale: 0.9 }}
                    hoverStyle={{
                      bg: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                    }}
                    onPress={onEditIncome}
                    icon={<Edit3 size={14} color={isDark ? "#999" : "#666"} />}
                  />
                </XStack>
              </YStack>
            </XStack>
            
            {bills && bills.length > 0 && (
              <XStack width={180} ai="center" py="$3" px="$5" br="$5" bg={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}>
                <YStack>
                  <Text fontSize="$3" color={isDark ? "#999" : "#666"} fontFamily="$body">Bills</Text>
                  <Text fontSize="$4" fontWeight="bold" color="#FF5252" fontFamily="$body">
                    ${totalMonthlyAmount.toFixed(0)}
                  </Text>
                </YStack>
              </XStack>
            )}
            
            {bills && bills.length > 0 && (
              <XStack width={180} ai="center" py="$3" px="$5" br="$5" bg={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}>
                <YStack>
                  <Text fontSize="$3" color={isDark ? "#999" : "#666"} fontFamily="$body">Monthly P/L</Text>
                  <Text fontSize="$4" fontWeight="bold" color={monthlyBalance >= 0 ? '#4CAF50' : '#FF5252'} fontFamily="$body">
                    ${monthlyBalance.toFixed(0)}
                  </Text>
                </YStack>
              </XStack>
            )}
          </XStack>
        </XStack>
      </XStack>
    );
  }

  return (
    <Animated.View 
      entering={FadeIn.duration(600)}
      style={{
        width: '90%',
        marginHorizontal: 'auto',
        borderRadius: 12,
        backgroundColor: isDark ? '#111' : '#fff',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
        overflow: 'hidden',
        padding: 16,
      }}
    >
      <YStack gap="$3" position="relative">
        {/* Visual bars in a separate container */}
        <XStack 
          position="absolute" 
          left={0} 
          bottom={0} 
          width={20}
          height="100%" 
          ai="flex-end"
          jc="flex-end"
          mr={16}
        >
          <XStack 
            height="100%" 
            ai="flex-end" 
            gap={2}
          >
            {monthlyIncome > 0 && (
              <XStack 
                width={4} 
                height={`${incomeHeightPercent}%`} 
                bg="#4CAF50" 
                borderRadius={2}
              />
            )}
            {totalMonthlyAmount > 0 && (
              <XStack 
                width={4} 
                height={`${billsHeightPercent}%`} 
                bg="#FF5252" 
                borderRadius={2}
              />
            )}
          </XStack>
        </XStack>
        
        {/* Content with more spacing from the bars */}
        <YStack pl={32} gap="$3">
          <XStack ai="center" jc="space-between">
            <Text color={isDark ? '#999' : '#666'} fontSize={16} fontFamily="$body">
              Income
            </Text>
            <XStack ai="center" gap="$2">
              <Button
                size="$1"
                bg="transparent"
                onPress={onEditIncome}
                icon={<Edit3 size={16} color={isDark ? '#999' : '#666'} />}
              />
              <Text
                fontSize={16}
                fontWeight="600"
                color="#4CAF50"
                fontFamily="$body"
              >
                ${monthlyIncome.toFixed(0)}
              </Text>
            </XStack>
          </XStack>
          
          <XStack ai="center" jc="space-between">
            <Text color={isDark ? '#999' : '#666'} fontSize={16} fontFamily="$body">
              Bills
            </Text>
            <Text 
              fontSize={16}
              fontWeight="600"
              color="#FF5252"
              fontFamily="$body"
            >
              ${totalMonthlyAmount.toFixed(0)}
            </Text>
          </XStack>
          
          {bills && bills.length > 0 && (
            <XStack ai="center" jc="space-between">
              <Text color={isDark ? '#999' : '#666'} fontSize={16} fontFamily="$body">
                Monthly P/L
              </Text>
              <Text 
                fontSize={16}
                fontWeight="600"
                color={monthlyBalance >= 0 ? '#4CAF50' : '#FF5252'}
                fontFamily="$body"
              >
                ${monthlyBalance.toFixed(0)}
              </Text>
            </XStack>
          )}
        </YStack>
      </YStack>
    </Animated.View>
  );
}; 