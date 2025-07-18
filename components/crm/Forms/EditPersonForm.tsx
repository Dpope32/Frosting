import React, { useState, useCallback } from "react";
import { Button, Text } from "tamagui";
import { useImagePicker } from "@/hooks";
import { BaseCardModal } from "@/components/baseModals/BaseCardModal";
import { Platform, useColorScheme } from "react-native";
import type { Person } from "@/types";
import { format } from "date-fns";
import { FormContent } from "./FormContent";
import { useToastStore, useUserStore } from "@/store";
import { XStack } from "tamagui";

type FormData = Omit<Person, "id" | "createdAt" | "updatedAt">;

export function EditPersonForm({
  person,
  visible,
  onClose,
  onSave
}: {
  person: Person;
  visible: boolean;
  onClose: () => void;
  onSave: (updatedPerson: Person) => void;
}) {
  const [formData, setFormData] = useState<FormData>({ ...person });
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(person.birthday ? new Date(person.birthday) : new Date());
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentUsername, setPaymentUsername] = useState<string>("");
  const { showToast } = useToastStore();
  const { pickImage: pickImageFromLibrary } = useImagePicker();
  const updateFormField = (field: keyof FormData, value: any): void => { setFormData((prev) => ({ ...prev, [field]: value }))};
  const isDark = useColorScheme() === "dark";

  const pickImage = async () => {
    const imageUri = await pickImageFromLibrary();
    if (imageUri) {
      updateFormField("profilePicture", imageUri);
    }
  };

  const handleDateChange = (input: string | Date) => {
    if (typeof input === 'string') {
      // Handle string input from DateDebouncedInput (MM/DD/YYYY format)
      if (input.length === 10 && input.includes('/')) {
        try {
          // Parse MM/DD/YYYY format manually to avoid timezone issues
          const [month, day, year] = input.split('/');
          const monthNum = parseInt(month, 10);
          const dayNum = parseInt(day, 10);
          const yearNum = parseInt(year, 10);
          
          // Validate the date components
          if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31 && yearNum > 1900) {
            // Format directly as yyyy-MM-dd to avoid timezone conversion
            const formattedDate = `${yearNum}-${monthNum.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
            setSelectedDate(new Date(yearNum, monthNum - 1, dayNum));
            updateFormField("birthday", formattedDate);
          }
        } catch (error) {
          console.error('Error parsing date:', error);
        }
      } else if (input === '') {
        // Handle empty string
        updateFormField("birthday", '');
      }
    } else if (input instanceof Date) {
      // Handle Date object input (from date picker)
      if (Platform.OS === "android") setShowDatePicker(false);
      setSelectedDate(input);
      updateFormField("birthday", format(input, "yyyy-MM-dd"));
    }
  };

  const handleClose = () => {
    onClose();
  };

  const updatePaymentUsername = useCallback((text: string): void => {
    setPaymentUsername(text);
  }, []);

  const handleSubmit = () => {
    if (!formData.name) return;

    let updatedFormData = { ...formData };
    if (paymentMethod && paymentUsername) {
      updatedFormData.socialMedia = [{ platform: paymentMethod, username: paymentUsername }];
    }
    onSave({ ...person, ...updatedFormData });
    showToast("Person updated successfully", "success");
    handleClose();
  };

  if (!visible) return null;

  return (
    <BaseCardModal 
      title="Edit Person"
      onOpenChange={onClose}
      open={visible}
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
        formData={formData}
        inputResetKey={0}
        updateFormField={updateFormField}
        handleSubmit={handleSubmit}
        handleBirthdayChange={handleDateChange}
        pickImage={pickImage}
        primaryColor={primaryColor}
        setOpen={onClose}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        isVisible={visible}
        paymentUsername={paymentUsername}
        updatePaymentUsername={updatePaymentUsername}
      />
    </BaseCardModal>
  );
}
