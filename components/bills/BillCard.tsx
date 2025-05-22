// @ts-nocheck
import React from 'react'
import { XStack, YStack, Text, Paragraph, isWeb } from 'tamagui'
import { CheckCircle } from '@tamagui/lucide-icons'
import type { Bill } from '@/types'
import { getIconForBill, getOrdinalSuffix, getAmountColor } from '@/services'
import { useColorScheme } from '@/hooks/useColorScheme'
import { LongPressDelete } from '../common/LongPressDelete'
import { Alert, Platform } from 'react-native'
import { isIpad } from '@/utils'

interface BillCardProps {
  bill: Bill
  currentDay: number
  primaryColor: string
  onDelete: (id: string) => void
}

export const BillCard = ({
  bill,
  currentDay,
  primaryColor,
  onDelete,
}: BillCardProps) => {
  const isDark = useColorScheme() === 'dark'
  const Icon = getIconForBill(bill.name)
  const amountColor = getAmountColor(bill.amount)
  const isPast = bill.dueDate < currentDay
  const isToday = bill.dueDate === currentDay
  const confirmDelete = () => onDelete(bill.id)
  const handleDelete = (onComplete: (deleted: boolean) => void) => {
    if (Platform.OS === 'web') {
      const deleted = window.confirm(`Delete "${bill.name}"?`);
      if (deleted) {
        confirmDelete();
      }
      onComplete(deleted);
    } else {
      Alert.alert('Delete Bill', `Delete "${bill.name}"?`, [
        { text: 'Cancel', style: 'cancel', onPress: () => onComplete(false) },
        { text: 'Delete', style: 'destructive', onPress: () => { confirmDelete(); onComplete(true); } }
      ]);
    }
  };

  return (
    <LongPressDelete onDelete={handleDelete} progressBarStyle={{ paddingHorizontal: isIpad() ? 10 : 3}} isDark={isDark}>
      <XStack
        jc="center"
        minHeight={isWeb ? 100 : isIpad() ? 95 : 75}
        height={isWeb ? 100 : isIpad() ? 95 : 75}
        flexShrink={0}
        bg={isDark ? '#111' : 'rgba(234, 234, 234, 0.75)'}
        p="$3"
        mb={0} 
        br="$4"
        ai="center"
        borderWidth={1}
        borderColor={isToday ? primaryColor : isDark ? '#222' : '#9c9c9c'}
        width={isWeb ? 320 : isIpad() ? 260 : '100%'}
        maxWidth={isWeb ? 320 : isIpad() ? 260 : '100%'}
        position="relative"
        opacity={isPast ? 0.8 : 1}
        overflow="hidden"
        hoverStyle={
          isWeb
            ? {
                transform: [{ scale: 1.02 }],
                borderColor: primaryColor,
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8
              }
            : undefined
        }
      >
        {isPast && (
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            br="$4"
            bg={isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.7)'}
            ai="center"
            jc="center"
            zIndex={5}
          >
            <XStack ai="center" gap="$2">
              <CheckCircle size={18} color="rgba(0, 255, 17, 0.8)" />
              <Text color="rgba(0, 255, 17, 0.8)" fontSize={isIpad() ? 18 : 16} fontWeight="bold" fontFamily="$body">
                Paid
              </Text>
            </XStack>
          </YStack>
        )}

        <YStack flex={1} jc="center" zIndex={1} style={{ minWidth: 0, marginHorizontal: isIpad() ? 10 : isWeb? 16 : 4, marginTop: isIpad() ? 4 : 4 }}>
          <XStack jc="space-between" ai="center" style={{ minWidth: 0, marginTop: isIpad() ? -4 : 4, paddingLeft: isWeb? 16 : 0}}>
            <Text
              color={isDark ? '#cccccc' : '#222'}
              fontSize={isIpad() ? "$4" : 16}
              fontWeight="bold"
              fontFamily="$body"
              numberOfLines={1}
            >
              {bill.name}
              {isToday && ' (due today!)'}
            </Text>
          </XStack>

          <XStack mt={isIpad() ? "$2" : "$1"} ai="center" gap="$1" style={{ minWidth: 0, paddingLeft: isWeb? 6 : 0, marginBottom: isWeb? 8 : 0 }}>
            <YStack width={42} height={28} br="$6" ai="center" jc="center">
              <Icon size={isIpad() ? 26 : 18} color={isDark ? '#ccc' : '#666'} />
            </YStack>
            <XStack flex={1} pl="$2" jc="space-between" style={{ minWidth: 0 }}>
              <Paragraph color={amountColor} fontSize={isIpad() ? "$5" : 15} fontWeight={600} fontFamily="$body">
                ${bill.amount.toFixed(2)}
              </Paragraph>
              <Paragraph
                pl="$3"
                color={isDark ? '#666' : '#666'}
                alignSelf="flex-end"
                fontSize={isIpad() ? "$4" : 14}
                fontFamily="$body"
                numberOfLines={1}
              >
                Due {bill.dueDate}
                {getOrdinalSuffix(bill.dueDate)}
              </Paragraph>
            </XStack>
          </XStack>
        </YStack>
      </XStack>
    </LongPressDelete>
  )
}
