import React, { useRef, forwardRef } from 'react'
import { YStack, XStack, ScrollView, Text, Button, isWeb } from 'tamagui'
import { TextInput, useColorScheme } from 'react-native'
import { useMedia } from 'tamagui'
import { DebouncedInput, DateDebouncedInput, DebouncedInputHandle } from '@/components/shared/debouncedInput'
import { ProfileSection } from './ProfileSection'
import { PaymentMethodSection } from './PaymentMethodSection'
import type { FormContentProps } from './types'
import { useAutoFocus } from '@/hooks/useAutoFocus'

export const FormContent = React.memo(forwardRef<ScrollView, FormContentProps>((props, ref) => { // Use forwardRef
  const {
    isVisible,
    formData,
    inputResetKey,
    updateFormField,
    handleSubmit,
    handleBirthdayChange,
    pickImage,
    primaryColor,
    setOpen,
    paymentMethod,
    setPaymentMethod,
    paymentUsername,
    updatePaymentUsername,
  } = props;

  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const nameRef = useRef<DebouncedInputHandle>(null)
  useAutoFocus(nameRef, 1000, isVisible)
  const birthdayRef = useRef<TextInput>(null)
  const phoneRef = useRef<DebouncedInputHandle>(null)
  const emailRef = useRef<DebouncedInputHandle>(null)
  const occupationRef = useRef<DebouncedInputHandle>(null)
  const media = useMedia()
  const isSmallScreen = media.sm

  return (
    <ScrollView
      ref={ref} 
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      bounces={false}
      contentContainerStyle={{
        alignItems: isWeb ? 'center' : undefined,
      }}
    >
      <YStack 
        gap="$4" 
        p="$4"
        pt="$2"
        width={isWeb ? (isSmallScreen ? '100%' : '600px') : '100%'}
      >
        <XStack gap="$6" alignItems="flex-start">
          <YStack width={100} alignItems="center">
            <ProfileSection
              profilePicture={formData.profilePicture}
              registered={formData.registered || false}
              priority={formData.priority || false}
              onPickImage={pickImage}
              onToggleRegistered={(val: boolean) => updateFormField('registered', val)}
              onTogglePriority={(val: boolean) => updateFormField('priority', val)}
              primaryColor={primaryColor}
              isDark={isDark}
            />
          </YStack>
          
          <YStack 
            width={isWeb ? "auto" : "64%"}
            gap="$3"
            flexShrink={1}
          >
            <DebouncedInput
              key={`name-${inputResetKey}`}
              ref={nameRef}
              value={formData.name || ''}
              onDebouncedChange={(text: string) =>
                updateFormField('name', text)
              }
              placeholder="Name *"
              returnKeyType="next"
              onSubmitEditing={() => birthdayRef.current?.focus()}
              autoCapitalize="words"
              theme={isDark ? "dark" : "light"}
            />
            <DateDebouncedInput
              key={`birthday-${inputResetKey}`}
              ref={birthdayRef}
              value={formData.birthday || ''}
              onDebouncedChange={handleBirthdayChange}
              placeholder="Birthday (MM/DD/YYYY) *"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
              theme={isDark ? "dark" : "light"}
            />
            <DebouncedInput
              key={`phone-${inputResetKey}`}
              ref={phoneRef}
              value={formData.phoneNumber || ''}
              onDebouncedChange={(text: string) =>
                updateFormField('phoneNumber', text)  
              }
              placeholder="Phone Number"
              returnKeyType="next"
              onSubmitEditing={() => occupationRef.current?.focus()}
              keyboardType="phone-pad"
              autoCapitalize="none"
              theme={isDark ? "dark" : "light"}
            />
            <DebouncedInput
              key={`occupation-${inputResetKey}`}
              ref={occupationRef}
              value={formData.occupation || ''}
              onDebouncedChange={(text: string) =>
                updateFormField('occupation', text)
              }
              placeholder="Occupation"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              autoCapitalize="words"
              theme={isDark ? "dark" : "light"}
            />
          </YStack>
        </XStack>
        
        <YStack gap="$3" width="100%">
          <DebouncedInput
            key={`address-${inputResetKey}`}
            value={formData.address?.street || ''}
            onDebouncedChange={(text: string) => {
              if (text) {
                updateFormField('address', {
                  street: text,
                  city: '',
                  state: '',
                  zipCode: '',
                  country: '',
                })
              } else {
                updateFormField('address', undefined)
              }
            }}
            placeholder="Enter full address"
            autoCapitalize="words"
            theme={isDark ? "dark" : "light"}
          />
          <DebouncedInput
            key={`email-${inputResetKey}`}
            ref={emailRef}
            value={formData.email || ''}
            onDebouncedChange={(text: string) =>
              updateFormField('email', text)
            }
            placeholder="Email"
            returnKeyType="next"
            keyboardType="email-address"
            autoCapitalize="none"
            theme={isDark ? "dark" : "light"}
          />
          
          <PaymentMethodSection
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            paymentUsername={paymentUsername}
            updatePaymentUsername={updatePaymentUsername}
            primaryColor={primaryColor}
            isDark={isDark} // Pass actual theme
            inputResetKey={inputResetKey}
          />
        </YStack>
      </YStack>
    </ScrollView>
  )
}))
