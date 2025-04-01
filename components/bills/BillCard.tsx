import React from 'react'
import { Platform, Alert } from 'react-native'
import { XStack, YStack, Text, Button, Paragraph } from 'tamagui'
import { X, CheckCircle } from '@tamagui/lucide-icons'
import type { Bill } from '@/types/bills'
import { getIconForBill, getOrdinalSuffix, getAmountColor } from '@/services/billServices'
import { useColorScheme } from '@/hooks/useColorScheme'

interface BillCardProps {
  bill: Bill
  currentDay: number
  primaryColor: string
  onDelete: (id: string) => void
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
  
  const isPastDue = bill.dueDate < currentDay
  const isDueToday = bill.dueDate === currentDay

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to delete this bill?")) {
        onDelete(bill.id)
      }
    } else {
      Alert.alert(
        "Delete Bill",
        "Are you sure you want to delete this bill?",
        [
          { text: "Cancel" },
          { text: "Delete", onPress: () => onDelete(bill.id) }
        ]
      )
    }
  }

  return isWeb ? (
    <XStack 
      bg={isDark ? "#111" : "#f5f5f5"}
      px="$4"
      br="$4" 
      ai="center" 
      animation="quick"
      borderWidth={1}
      borderColor={isDueToday ? primaryColor : isDark ? "#222" : "#e0e0e0"}
      width={columnWidth}
      minWidth={320} // Increased minimum width for web
      height={120}
      position="relative"
      opacity={isPastDue ? 0.8 : 1}
      hoverStyle={{ 
        transform: [{ scale: 1.02 }],
        borderColor: primaryColor,
        shadowColor: primaryColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8
      }}
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
      
     <YStack flex={1} zIndex={1} jc="center" mt="$-1" pb="$1">
        <XStack jc="space-between" ai="center" >
          <Text 
            color={isDark ? "#f6f6f6" : "#222"} 
            fontSize="$4" 
            fontWeight="bold"
            fontFamily="$body"
          >
            {bill.name}
            {isDueToday && " (due today!)"}
          </Text>
          <Button
            size="$3"
            bg="transparent"
            pressStyle={{ scale: 0.9 }}
            hoverStyle={{
              bg: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
            }}
            onPress={handleDelete}
            icon={<X size={18} color="#ff4444" />}
          />
        </XStack>
        
        <XStack ai="center" gap="$2">
          <YStack 
            width={44} 
            height={44} 
            br="$4" 
            ai="center" 
            jc="center" 
            bg={isDark ? "#333" : "#e0e0e0"}
          >
            <IconComponent size={26} color={isDark ? "white" : "#666"} />
          </YStack>
          <YStack flex={1}>
            <Paragraph color={amountColor} fontSize="$4" fontWeight={900} fontFamily="$body">
              ${bill.amount.toFixed(2)}
            </Paragraph>
            <Paragraph color={isDark ? "#666" : "#666"} fontSize="$3" fontFamily="$body">
              Due {bill.dueDate}{getOrdinalSuffix(bill.dueDate)}
            </Paragraph>
          </YStack>
        </XStack>
      </YStack>
    </XStack>
  ) : (
    <XStack 
      bg={isDark ? "#1A1A1A" : "#f5f5f5"}
      p="$3"
      mb="$2"
      br="$4" 
      ai="center" 
      pressStyle={{ opacity: 0.7 }} 
      animation="quick"
      borderWidth={1}
      borderColor={isDueToday ? primaryColor : isDark ? "#333" : "#e0e0e0"}
      width="100%"
      position="relative"
      opacity={isPastDue ? 0.8 : 1}
    >
      <YStack 
        width={44} 
        height={44} 
        br="$4" 
        ai="center" 
        jc="center" 
        bg={isDark ? "#333" : "#e0e0e0"}
        zIndex={1}
      >
        <IconComponent size={26} color={isDark ? "white" : "#666"} />
      </YStack>
      
      {isPastDue && (
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          br="$4"
          bg={isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.8)"}
          ai="center"
          jc="center"
          zIndex={5}
        >
          <XStack ai="center" gap="$2">
            <CheckCircle size={20} color="#4CAF50" />
            <Text color="#4CAF50" fontSize="$4" fontWeight="bold" fontFamily="$body">Paid</Text>
          </XStack>
        </YStack>
      )}
      
      <YStack ml="$3" flex={1} zIndex={1}>
        <Text 
          color={isDueToday ? "$red11" : isDark ? "#fffbf7" : "#000"} 
          fontSize="$4" 
          fontWeight="bold"
          fontFamily="$body"
        >
          {bill.name}
          {isDueToday && " (due today)"}
        </Text>
        <XStack ai="center" gap="$1">
          <Paragraph color={amountColor} fontSize="$4" fontWeight={900} fontFamily="$body">
            ${bill.amount.toFixed(2)}
          </Paragraph>
          <Paragraph color="#fffbf7" fontSize="$4" fontFamily="$body"> • Due {bill.dueDate}{getOrdinalSuffix(bill.dueDate)}  </Paragraph>
        </XStack>
      </YStack>
      <Button 
        size="$3"
        bg="transparent" 
        pressStyle={{ scale: 0.9 }} 
        animation="quick" 
        onPress={handleDelete}
        icon={<X size={18} color="#ff4444" />} 
      />
    </XStack>
  )
}
