import React from 'react';
import { useColorScheme } from 'react-native';
import { Button, XStack, YStack, Text, isWeb } from 'tamagui';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { isIpad } from '@/utils';

interface BillSummaryProps {
  monthlyIncome: number;
  totalMonthlyAmount: number;
  monthlyBalance: number;
  bills: any[] | undefined;
  onEditIncome: () => void;
}

export const BillSummary: React.FC<BillSummaryProps> = ({
  monthlyIncome,
  totalMonthlyAmount,
  monthlyBalance,
  bills,
  onEditIncome,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const maxValue = Math.max(monthlyIncome, totalMonthlyAmount);
  const incomeHeightPercent = maxValue > 0 ? (monthlyIncome / maxValue) * 100 : 0;
  const billsHeightPercent = maxValue > 0 ? (totalMonthlyAmount / maxValue) * 100 : 0;
  
  if (isWeb) {
    return (
      <XStack 
        width="100%" 
        mx="$1" 
        p="$3" 
        my="$3"
        ml="$-5"
        ai="center"
        jc="flex-start"
        gap="$6"
        br="$4"
        position="relative"
      >
        <XStack gap="$4" ai="center" flex={1} jc="flex-start"> 
          <XStack 
            width={20}
            height="100%"
            ai="flex-start"
            jc="flex-start"
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
          
          <XStack gap="$4" ai="center" flex={1} jc="flex-start">
            <XStack width={isIpad() ? 180 : 150} ai="center" py="$3" px="$3" br="$5" bg={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}>
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
                    icon={<MaterialIcons name="edit" size={14} color={isDark ? "#999" : "#666"} />}
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
        width: isIpad() ? '90%' : '90%',
        marginHorizontal: 'auto',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
        overflow: 'hidden',
        padding: 16,
        position: 'relative',
      }}
    >
      <LinearGradient
        colors={isDark ? ['rgb(34, 34, 34)', 'rgb(0, 0, 0)'] : ['#ffffff', '#eeeeee']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 12, borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.5)" }}
      />
      <YStack gap="$3" position="relative">
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
                icon={<MaterialIcons name="edit" size={16} color={isDark ? '#999' : '#666'} />}
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