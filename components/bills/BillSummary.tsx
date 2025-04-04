import React from 'react';
import { useColorScheme, View } from 'react-native';
import { Button, XStack, YStack, Text, isWeb } from 'tamagui';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Edit3 } from '@tamagui/lucide-icons';
import { getAmountColor } from '@/services/billServices';

interface BillSummaryProps {
  monthlyIncome: number;
  totalMonthlyAmount: number;
  monthlyBalance: number;
  bills: any[] | undefined;
  setIsIncomeModalVisible: (visible: boolean) => void;
}

export const BillSummary: React.FC<BillSummaryProps> = ({
  monthlyIncome,
  totalMonthlyAmount,
  monthlyBalance,
  bills,
  setIsIncomeModalVisible,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const showIncomeBar = monthlyIncome > 0;
  const showBillsBar = totalMonthlyAmount > 0;
  const MAX_BAR_HEIGHT = 80;
  const maxVal = Math.max(monthlyIncome, totalMonthlyAmount, 1);
  const incomeBarHeight = showIncomeBar ? (monthlyIncome / maxVal) * MAX_BAR_HEIGHT : 0;
  const billsBarHeight = showBillsBar ? (totalMonthlyAmount / maxVal) * MAX_BAR_HEIGHT : 0;

  return (
    <>
      {isWeb ? (
        <XStack
          width="100%"
          mb="$6"
          ai="center"
          jc="flex-start"
          gap="$4"
          px="$2"
          style={{ paddingTop: 2, paddingBottom: 2 }} 
        >
          {/* Bars on the left with minimal vertical space */}
          {(showIncomeBar || showBillsBar) && (
            <XStack ai="flex-end" gap="$1" mr="$2">
              {showIncomeBar && (
                <View
                  style={{
                    width: 5,
                    height: incomeBarHeight,
                    backgroundColor: '#4CAF50',
                  }}
                />
              )}
              {showBillsBar && (
                <View
                  style={{
                    width: 5,
                    height: billsBarHeight,
                    backgroundColor: '#FF5252',
                  }}
                />
              )}
            </XStack>
          )}

          {/* Original layout: three "cards" (Income, Bills, P/L) */}
          <XStack gap="$4" ai="center" flex={1} jc="flex-start" pl="$2">
            <XStack
              width={180}
              ai="center"
              py="$2"
              px="$4"
              br="$4"
              bg={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
            >
              <YStack>
                <Text fontSize="$3" color={isDark ? '#999' : '#666'} fontFamily="$body">
                  Income
                </Text>
                <XStack ai="center" gap="$2">
                  <Text fontSize="$4" fontWeight="bold" color="#4CAF50" fontFamily="$body">
                    ${monthlyIncome.toFixed(2)}
                  </Text>
                  <Button
                    size="$1"
                    bg="transparent"
                    pressStyle={{ scale: 0.9 }}
                    hoverStyle={{
                      bg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    }}
                    onPress={() => setIsIncomeModalVisible(true)}
                    icon={<Edit3 size={14} color={isDark ? '#999' : '#666'} />}
                  />
                </XStack>
              </YStack>
            </XStack>

            <XStack
              width={180}
              ai="center"
              py="$2"
              px="$4"
              br="$4"
              bg={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
            >
              <YStack>
                <Text fontSize="$3" color={isDark ? '#999' : '#666'} fontFamily="$body">
                  Bills
                </Text>
                <Text fontSize="$4" fontWeight="bold" color="#FF5252" fontFamily="$body">
                  ${totalMonthlyAmount.toFixed(2)}
                </Text>
              </YStack>
            </XStack>

            {bills && bills.length > 0 && (
              <XStack
                width={180}
                ai="center"
                py="$2"
                px="$4"
                br="$4"
                bg={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
              >
                <YStack>
                  <Text fontSize="$3" color={isDark ? '#999' : '#666'} fontFamily="$body">
                    Monthly P/L
                  </Text>
                  <Text fontSize="$4" fontWeight="bold" color="#FF5252" fontFamily="$body">
                    ${monthlyBalance.toFixed(2)}
                  </Text>
                </YStack>
              </XStack>
            )}
          </XStack>
        </XStack>
      ) : (
        <Animated.View
          entering={FadeIn.duration(600)}
          style={{
            width: '93%',
            marginHorizontal: 'auto',
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: isDark ? '#223' : 'rgba(0, 0, 0, 0.1)',
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 10,
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={isDark ? ['rgb(34, 34, 34)', 'rgb(0, 0, 0)'] : ['#ffffff', '#eeeeee']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 16, borderRadius: 11 }}
          >
            <YStack gap="$3" px="$2">
              <XStack ai="center" jc="flex-start" gap="$2">
                {(showIncomeBar || showBillsBar) && (
                  <XStack ai="flex-end" gap="$1" mr="$5">
                    {showIncomeBar && (
                      <View
                        style={{
                          width: 10,
                          height: incomeBarHeight,
                          backgroundColor: '#4CAF50',
                        }}
                      />
                    )}
                    {showBillsBar && (
                      <View
                        style={{
                          width: 10,
                          height: billsBarHeight,
                          backgroundColor: '#FF5252',
                        }}
                      />
                    )}
                  </XStack>
                )}

                <YStack flex={1} gap="$3">
                  <XStack ai="center" jc="space-between">
                    <Text color={isDark ? '#999' : '#666'} fontSize={16} fontFamily="$body">
                      Income
                    </Text>
                    <XStack ai="center" gap="$2">
                      <Button
                        size="$1"
                        bg="transparent"
                        onPress={() => setIsIncomeModalVisible(true)}
                        icon={<Edit3 size={16} color={isDark ? '#999' : '#666'} />}
                      />
                      <Text fontSize={16} fontWeight="600" color={isDark ? '#aaa' : '#000'} fontFamily="$body">
                        ${monthlyIncome.toFixed(2)}
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
                      color={getAmountColor(totalMonthlyAmount)}
                      fontFamily="$body"
                    >
                      ${totalMonthlyAmount.toFixed(2)}
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
                        ${monthlyBalance.toFixed(2)}
                      </Text>
                    </XStack>
                  )}
                </YStack>
              </XStack>
            </YStack>
          </LinearGradient>
        </Animated.View>
      )}
    </>
  );
};
