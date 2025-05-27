import React from 'react'
import { YStack, XStack, Text, ScrollView, Button } from 'tamagui'
import { Pressable } from 'react-native'
import { PAYMENT_METHODS } from './types'
import { DebouncedInput } from '@/components/shared/debouncedInput'

type PaymentMethodSectionProps = {
  paymentMethod: string
  setPaymentMethod: (method: string) => void
  paymentUsername: string
  updatePaymentUsername: (username: string) => void
  primaryColor: string
  isDark: boolean
  inputResetKey: number
}

export function PaymentMethodSection({
  paymentMethod,
  setPaymentMethod,
  paymentUsername,
  updatePaymentUsername,
  primaryColor,
  isDark,
  inputResetKey
}: PaymentMethodSectionProps) {
  const [showPaymentMethodDropdown, setShowPaymentMethodDropdown] = React.useState(false)

  return (
    <YStack gap="$2">
      <Text color={isDark ? "$gray11" : "$gray10"} fontSize={14} fontFamily="$body">
        Payment Method
      </Text>
      <XStack gap="$2" alignItems="center">
        <YStack width={120} zIndex={2000}> 
          <Button
            onPress={() => setShowPaymentMethodDropdown(!showPaymentMethodDropdown)}
            theme={isDark ? "dark" : "light"}
            br={8}
            height={40}
            borderColor={isDark ? "#3c3c3c" : "#f9f9f9"}
            borderWidth={1}
            px="$2"
            pressStyle={{ opacity: 0.8 }}
            width="100%"
          >
            <XStack flex={1} alignItems="center" justifyContent="space-between">
              <Text 
                color={isDark ? "$gray12" : "$gray11"} 
                fontSize={14} 
                fontFamily="$body"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {paymentMethod || 'Platform'}
              </Text>
              <Text fontFamily="$body" color={isDark ? "$gray11" : "$gray10"} fontSize={14}>
                {showPaymentMethodDropdown ? '▲' : '▼'}
              </Text>
            </XStack>
          </Button>
          
          {showPaymentMethodDropdown && (
            <YStack
              position="absolute"
              bottom={42}
              left={0}
              backgroundColor={isDark ? "$gray1" : "white"}
              br={8}
              zIndex={5000}
              overflow="hidden"
              shadowColor="black"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.1}
              shadowRadius={8}
              maxHeight={200}
              borderWidth={1}
              borderColor={isDark ? "$gray7" : "$gray4"}
              width={120}
            >
              <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                <YStack>
                  {PAYMENT_METHODS.map((method) => (
                    <Pressable
                      key={method}
                      onPress={() => {
                        setPaymentMethod(method);
                        setShowPaymentMethodDropdown(false);
                      }}
                      style={({ pressed }) => ({
                        backgroundColor: paymentMethod === method 
                          ? primaryColor 
                          : isDark ? "#1c1c1e" : "white",
                        height: 40,
                        justifyContent: 'center',
                        opacity: pressed ? 0.8 : 1,
                        borderBottomWidth: 1,
                        borderColor: isDark ? "#2c2c2e" : "#e5e5ea",
                        padding: 12
                      })}
                    >
                      <Text
                        color={paymentMethod === method ? '#fff' : isDark ? "#fff" : "#000"}
                        fontSize={14}
                        fontWeight={paymentMethod === method ? '600' : '400'}
                        fontFamily="$body"
                      >
                        {method}
                      </Text>
                    </Pressable>
                  ))}
                </YStack>
              </ScrollView>
            </YStack>
          )}
        </YStack>
        
        <DebouncedInput
          key={`payment-username-${inputResetKey}`}
          value={paymentUsername}
          onDebouncedChange={updatePaymentUsername}
          placeholder="Username"
          returnKeyType="next"
          autoCapitalize="none"
          flex={1}
          theme={isDark ? "dark" : "light"}
        />
      </XStack>
    </YStack>
  )
}