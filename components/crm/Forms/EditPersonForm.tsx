import React, { useState, useCallback } from "react";
import { useUserStore } from "@/store/UserStore";
import { useImagePicker } from "@/hooks/useImagePicker";
import { BaseCardAnimated } from "@/components/cardModals/BaseCardAnimated";
import { Platform, useColorScheme } from "react-native";
import type { Person } from "@/types/people";
import { format } from "date-fns";
import { FormContent } from "./FormContent";

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

  const { pickImage: pickImageFromLibrary } = useImagePicker();
  const updateFormField = (field: keyof FormData, value: any): void => { setFormData((prev) => ({ ...prev, [field]: value }))};


  const pickImage = async () => {
    const imageUri = await pickImageFromLibrary();
    if (imageUri) {
      updateFormField("profilePicture", imageUri);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      updateFormField("birthday", format(date, "yyyy-MM-dd"));
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
    handleClose();
  };

  if (!visible) return null;

  return (
    <BaseCardAnimated 
      title="Edit Person"
      onClose={handleClose}
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
        paymentUsername={paymentUsername}
        updatePaymentUsername={updatePaymentUsername}
      />
    </BaseCardAnimated>
  );
}
