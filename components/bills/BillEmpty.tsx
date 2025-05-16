import React from 'react'
import { XStack, YStack, Text, isWeb } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient';
import { BillRecommendationChip } from '@/constants';
import { useColorScheme } from '@/hooks';
import { useUserStore } from '@/store'
import { isIpad } from '@/utils';

interface BillEmptyProps {
  setHousingModalOpen: (open: boolean) => void
  setTransportationModalOpen: (open: boolean) => void
  setSubscriptionsModalOpen: (open: boolean) => void
  setInsuranceModalOpen: (open: boolean) => void
}

export const BillEmpty = ({
  setHousingModalOpen,
  setTransportationModalOpen,
  setSubscriptionsModalOpen,
  setInsuranceModalOpen
}: BillEmptyProps) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const primaryColor = useUserStore((state) => state.preferences.primaryColor)

  return (
    <XStack 
      p={isWeb ? "$6" : "$4"} 
      br="$4" 
      px={isWeb ? "$6" : isIpad() ? "$5" : "$4"} 
      ai="flex-start" 
      jc="center"
      borderWidth={1} 
      borderColor={isDark ? "#333" : "#e0e0e0"} 
      width={isWeb ? "100%" : "100%"} 
      overflow="hidden" 
      py={isWeb ? "$6" : "$4"}
    >
      <LinearGradient
        colors={isDark ? ['rgb(34, 34, 34)', 'rgb(0, 0, 0)'] : ['#ffffff', '#eeeeee']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <YStack gap="$3" width="100%" paddingTop={isWeb ? 32 : 12} position="relative"> 
        <YStack gap="$3" px={isWeb ? "$4" : "$4"}>
          <XStack gap="$2" ai="flex-start">
              <Text color={primaryColor} fontSize={isWeb ? "$4" : "$3"} fontWeight="bold" fontFamily="$body">•</Text>
            <YStack>
              <Text color={isDark ? "#fffbf7" : "#333"} fontSize="$4" fontWeight="bold" fontFamily="$body">
                Track Monthly Expenses
              </Text>
              <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body" mt="$1">
                Add your recurring bills and keep track of your monthly expenses in one place.
              </Text>
            </YStack>
          </XStack>
          
          <XStack gap="$2" ai="flex-start">
            <Text color={primaryColor} fontSize={isWeb ? "$4" : "$3"} fontWeight="bold" fontFamily="$body">•</Text>
            <YStack>
              <Text color={isDark ? "#fffbf7" : "#333"} fontSize="$4" fontWeight="bold" fontFamily="$body">
                Due Date Reminders
              </Text>
              <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body" mt="$1">
                Never miss a payment with visual indicators for upcoming and due bills.
              </Text>
            </YStack>
          </XStack>
          
          <XStack gap="$2" ai="flex-start">
            <Text color={primaryColor} fontSize={isWeb ? "$4" : "$3"} fontWeight="bold" fontFamily="$body">•</Text>
            <YStack>
              <Text color={isDark ? "#fffbf7" : "#333"} fontSize="$4" fontWeight="bold" fontFamily="$body">
                Budget Overview
              </Text>
              <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body" mt="$1">
                See your total monthly expenses and manage your budget more effectively.
              </Text>
            </YStack>
          </XStack>
        </YStack>
        
        <Text color={isDark ? "#666" : "#999"} fontSize="$3" textAlign="center" fontFamily="$body" mt="$2">
          Quick add from common categories:
        </Text>
        <YStack width="100%">
          <XStack 
            justifyContent={isWeb ? "space-between" : "flex-start"}
            px="$2"
            gap="$2"
            flexWrap="wrap"
            width="100%"
            flexDirection="row"
          >
            <BillRecommendationChip 
              category="Housing" 
              onPress={() => setHousingModalOpen(true)} 
              isDark={isDark}
            />
            
            <BillRecommendationChip 
              category="Transportation" 
              onPress={() => setTransportationModalOpen(true)} 
              isDark={isDark}
            />
            
            <BillRecommendationChip 
              category="Subscriptions" 
              onPress={() => setSubscriptionsModalOpen(true)} 
              isDark={isDark}
            />
            
            <BillRecommendationChip 
              category="Insurance" 
              onPress={() => setInsuranceModalOpen(true)} 
              isDark={isDark}
            />
          </XStack>
        </YStack>
        <Text color={isDark ? "#666" : "#999"} fontSize="$3" textAlign="center" fontFamily="$body" mt="$4">
          Or click the + button below to add a custom bill
        </Text>
      </YStack>
    </XStack>
  )
}
