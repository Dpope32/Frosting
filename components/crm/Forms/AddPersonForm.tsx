import React, { useState, useEffect, useCallback } from 'react'
import { View } from 'react-native'
import { Button } from 'tamagui'
import { format, parse, isValid } from 'date-fns'
import { Plus } from '@tamagui/lucide-icons'

import { useUserStore } from '@/store/UserStore'
import { useAddPerson } from '@/hooks/usePeople'
import { useCalendarStore } from '@/store/CalendarStore'
import { useToastStore } from '@/store/ToastStore'
import { useImagePicker } from '@/hooks/useImagePicker'
import type { Person } from '@/types/people'
import { initialFormData } from './types'
import { FormContent } from './FormContent'
import { BaseCardAnimated } from '@/components/cardModals/BaseCardAnimated'

type FormData = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>

const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]}-${match[3]}`;
  }
  return phone;
};


export function AddPersonForm(): JSX.Element {
  const addPersonMutation = useAddPerson()
  const primaryColor: string = useUserStore( (state) => state.preferences.primaryColor)
  const showToast = useToastStore((state) => state.showToast)
  useEffect(() => {
    if (addPersonMutation.isSuccess) {
      useCalendarStore.getState().syncBirthdays()
    }
  }, [addPersonMutation.isSuccess])
  
  const [open, setOpen] = useState<boolean>(false)
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
        const parsedDate = parse(normalizedText, 'MM/dd/yyyy', new Date())
        if (isValid(parsedDate)) {
          setFormData((prev) => ({
            ...prev,
            birthday: format(parsedDate, 'yyyy-MM-dd'),
          }))
        }
      }
    } catch (error) {
      console.log('Failed to parse date:', text)
    }
  }, [])

  const updatePaymentUsername = useCallback((text: string): void => {
    setPaymentUsername(text)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSubmit = useCallback((): void => {
    if (addPersonMutation.isPending) return;
    if (!formData.name?.trim() || !formData.birthday?.trim()) return;
    
    let updatedFormData = { ...formData };
    if (paymentMethod && paymentUsername) {
      updatedFormData.socialMedia = [
        { platform: paymentMethod, username: paymentUsername }
      ];
    }
    const processedFormData = {
      ...updatedFormData,
      phoneNumber: updatedFormData.phoneNumber ? formatPhoneNumber(updatedFormData.phoneNumber) : undefined
    };
    const newPerson = {
      ...processedFormData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addPersonMutation.mutate(newPerson);
    
    setTimeout(() => {
      showToast('Successfully added contact', 'success', { duration: 2000 });
    }, 1000);
    
    setFormData({ ...initialFormData });
    setPaymentMethod('');
    setPaymentUsername('');
    setInputResetKey((prev) => prev + 1);
    handleClose();
  }, [formData, paymentMethod, paymentUsername, addPersonMutation, handleClose]);

  const updateFormField = useCallback(
    (field: keyof FormData, value: any): void => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  return (
    <>
      <View style={{ position: 'absolute', bottom: 32, right: 24, zIndex: 1000 }}>
        <Button
          size="$4"
          circular
          bg={primaryColor}
          pressStyle={{ scale: 0.95 }}
          animation="quick"
          elevation={4}
          onPress={() => setOpen(true)}
        >
          <Plus color="white" size={24} />
        </Button>
      </View>

      {open && (
        <BaseCardAnimated 
          title="Add New Person"
          onClose={handleClose}
        >
          <FormContent
              formData={formData}
              inputResetKey={inputResetKey}
              updateFormField={updateFormField}
              handleSubmit={handleSubmit}
              handleBirthdayChange={handleBirthdayChange}
              pickImage={pickImage}
              primaryColor={primaryColor}
              setOpen={setOpen}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              paymentUsername={paymentUsername}
              updatePaymentUsername={updatePaymentUsername}
            />
        </BaseCardAnimated>
      )}
    </>
  )
}
