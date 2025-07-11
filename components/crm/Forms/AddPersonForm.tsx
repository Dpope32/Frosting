import React, { useState, useCallback } from 'react'
import { format, parse, isValid } from 'date-fns'
import { XStack, Button, Text } from 'tamagui'
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'
import { useUserStore, useToastStore } from '@/store'
import { useAddPerson } from '@/hooks/usePeople'
import { useImagePicker } from '@/hooks/useImagePicker'
import type { Person } from '@/types'
import { initialFormData } from './types'
import { FormContent } from './FormContent'
import { BaseCardModal } from '@/components/baseModals/BaseCardModal'
import { useColorScheme } from '@/hooks/useColorScheme'

type FormData = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>

interface AddPersonFormProps {
  isVisible: boolean;
  onClose: () => void;
}

const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]}-${match[3]}`;
  }
  return phone;
};

export function AddPersonForm({ isVisible, onClose }: AddPersonFormProps): JSX.Element {
  const addPersonMutation = useAddPerson()
  const primaryColor: string = useUserStore( (state) => state.preferences.primaryColor)
  const showToast = useToastStore((state) => state.showToast)
  const [formData, setFormData] = useState<FormData>({ ...initialFormData })
  const [inputResetKey, setInputResetKey] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [paymentUsername, setPaymentUsername] = useState<string>('')
  const { pickImage: pickImageFromLibrary, isLoading: isPickingImage } = useImagePicker();

  const pickImage = useCallback(async (): Promise<void> => {
    const imageUri = await pickImageFromLibrary();
    if (imageUri) {
      setFormData((prev) => ({
        ...prev,
        profilePicture: imageUri,
      }));
    }
  }, [pickImageFromLibrary]);

  const handleBirthdayChange = useCallback((text: string): void => {
    try {
      const normalizedText = text.replace(/-/g, '/')
      
      if (normalizedText.length >= 8) {
        const [month, day, year] = normalizedText.split('/');
        if (month && day && year && month.length <= 2 && day.length <= 2 && year.length === 4) {
          const monthNum = parseInt(month, 10);
          const dayNum = parseInt(day, 10);
          const yearNum = parseInt(year, 10);
          
          if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31 && yearNum > 1900) {
            const formattedDate = `${yearNum}-${monthNum.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
            setFormData((prev) => ({
              ...prev,
              birthday: formattedDate,
            }));
          }
        }
      }
    } catch (error) {
      console.log('Failed to parse date:', text)
    }
  }, [])

  const updatePaymentUsername = useCallback((text: string): void => {
    setPaymentUsername(text)
  }, [])

  const handleSubmit = useCallback((): void => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    
    if (addPersonMutation.isPending) {
      return
    }
    
    if (!formData.name?.trim()) {
      showToast('Name is required', 'error', { duration: 2000 })
      return
    }

    let updatedFormData = { ...formData }
    if (paymentMethod && paymentUsername) {
      updatedFormData.socialMedia = [
        { platform: paymentMethod, username: paymentUsername }
      ]
    }
    
    const processedFormData = {
      ...updatedFormData,
      phoneNumber: updatedFormData.phoneNumber ? formatPhoneNumber(updatedFormData.phoneNumber) : undefined
    }
    
    const newPerson = {
      ...processedFormData,
      id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addPersonMutation.mutate(newPerson)
    setFormData({ ...initialFormData })
    setPaymentMethod('')
    setPaymentUsername('')
    setInputResetKey((prev) => prev + 1)
    onClose()
  }, [formData, paymentMethod, paymentUsername, addPersonMutation, onClose, showToast])

  const isDark = useColorScheme() === 'dark'

  const updateFormField = useCallback(
    (field: keyof FormData, value: any): void => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  return (
    <>
      {isVisible && (
        <BaseCardModal
          title="Add New Person"
          open={isVisible}
          onOpenChange={onClose}
          showCloseButton={true}
          hideHandle={true}
          footer={
            <XStack width="100%" px="$0" py="$2" justifyContent="space-between">
              <Button
                theme={isDark ? "dark" : "light"}
                onPress={() => onClose()}
                backgroundColor={isDark ? "$gray5" : "#E0E0E0"}
              >
                Cancel
              </Button>
              <Button
                onPress={handleSubmit}
                backgroundColor="#3B82F6"
                borderColor="#3B82F6"
                borderWidth={2}
              >
                <Text color="white" fontWeight="600" fontFamily="$body">
                  Save Contact
                </Text>
              </Button>
            </XStack>
          }
        >
          <FormContent
            isVisible={isVisible}
            formData={formData}
            inputResetKey={inputResetKey}
            updateFormField={updateFormField}
            handleSubmit={handleSubmit}
            handleBirthdayChange={handleBirthdayChange}
            pickImage={pickImage}
            primaryColor={primaryColor}
            setOpen={onClose}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            paymentUsername={paymentUsername}
            updatePaymentUsername={updatePaymentUsername}
          />
        </BaseCardModal>
      )}
    </>
  )
}
