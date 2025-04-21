import React from 'react'
import { XStack, YStack, Text, Paragraph } from 'tamagui'
import { CheckCircle } from '@tamagui/lucide-icons'
import type { Bill } from '@/types/bills'
import { getIconForBill, getOrdinalSuffix, getAmountColor } from '@/services/billServices'
import { useColorScheme } from '@/hooks/useColorScheme'
import { LongPressDelete } from '../common/LongPressDelete'
import { useToastStore } from '@/store/ToastStore'
import { Alert, Platform } from 'react-native'

interface BillCardProps {
  bill: Bill
  currentDay: number
  primaryColor: string
  onDelete: (id: string) => void  // This is deleteBillMutation.mutate
  isWeb: boolean
  columnWidth?: string
}

export const BillCard = ({
  bill,
  currentDay,
  primaryColor,
  onDelete,
  isWeb,
  columnWidth
}: BillCardProps) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const IconComponent = getIconForBill(bill.name)
  const amountColor = getAmountColor(bill.amount)
  const showToast = useToastStore(s => s.showToast)
  
  const isPastDue = bill.dueDate < currentDay
  const isDueToday = bill.dueDate === currentDay

  const handleDelete = () => {
    const confirmDelete = () => {
      // Just call the mutation directly - it handles everything internally
      onDelete(bill.id);
    };
    
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${bill.name}"? This action cannot be undone.`)) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Delete Bill',
        `Are you sure you want to delete "${bill.name}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmDelete }
        ]
      );
    }
  }

  const content = (
    <XStack 
      bg={isDark ? "#111" : "#f5f5f5"}
      p={isWeb ? "$3" : "$3"}
      mb="$1.5"
      br="$4" 
      ai="center" 
      animation="quick"
      borderWidth={1}
      borderColor={isDueToday ? primaryColor : isDark ? "#222" : "#e0e0e0"}
      width={isWeb ? columnWidth : "100%"}
      height={isWeb ? 80 : undefined}
      position="relative"
      opacity={isPastDue ? 0.8 : 1}
      hoverStyle={isWeb ? { 
        transform: [{ scale: 1.02 }],
        borderColor: primaryColor,
        shadowColor: primaryColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8
      } : undefined}
    >
      {isPastDue && (
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          br="$4"
          bg={isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.6)"}
          ai="center"
          jc="center"
          zIndex={5}
        >
          <XStack ai="center" gap="$2">
            <CheckCircle size={18} color="#4CAF50" />
            <Text color="#4CAF50" fontSize="$4" fontWeight="bold" fontFamily="$body">Paid</Text>
          </XStack>
        </YStack>
      )}
      
      <YStack flex={1} zIndex={1} jc="center">
        <XStack jc="space-between" ai="center">
          <Text 
            color={isDark ? "#f9f9f9" : "#222"} 
            fontSize="$4" 
            fontWeight="bold"
            fontFamily="$body"
          >
            {bill.name}
            {isDueToday && " (due today!)"}
          </Text>
        </XStack>
        
        <XStack mt="$1" ai="center" gap="$1">
          <YStack 
            width={42} 
            height={28} 
            br="$6" 
            ai="center" 
            jc="center" 
            bg={isDark ? "transparent" : "transparent"}
          >
            <IconComponent size={26} color={isDark ? "white" : "#666"} />
          </YStack>
          <XStack flex={1} pl="$2">
            <Paragraph color={amountColor} fontSize="$5" fontWeight={900} fontFamily="$body">
              ${bill.amount.toFixed(2)}
            </Paragraph>
            <Paragraph pl="$3" color={isDark ? "#666" : "#666"} alignSelf="flex-end" fontSize="$4" fontFamily="$body">
              Due {bill.dueDate}{getOrdinalSuffix(bill.dueDate)}
            </Paragraph>
          </XStack>
        </XStack>
      </YStack>
    </XStack>
  )

  return (
    <LongPressDelete onDelete={handleDelete}>
      {content}
    </LongPressDelete>
  )
}