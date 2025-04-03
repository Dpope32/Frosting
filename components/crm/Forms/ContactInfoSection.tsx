import React, { useCallback } from "react";
import { Input, YStack, XStack } from "tamagui";
import { Platform, TextInput, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { DebouncedInput } from "@/components/shared/debouncedInput";
import type { Person } from "@/types/people";

type ContactInfoProps = {
  formData: Omit<Person, "id" | "createdAt" | "updatedAt">;
  showDatePicker: boolean;
  selectedDate: Date;
  onDateChange: (event: any, date?: Date) => void;
  onShowDatePicker: () => void;
  onUpdateField: (field: keyof Omit<Person, "id" | "createdAt" | "updatedAt">, value: any) => void;
  nameRef: React.RefObject<TextInput>;
  nicknameRef: React.RefObject<TextInput>;
  phoneRef: React.RefObject<TextInput>;
  emailRef: React.RefObject<TextInput>;
  occupationRef: React.RefObject<TextInput>;
};

export function ContactInfoSection({
  formData,
  showDatePicker,
  selectedDate,
  onDateChange,
  onShowDatePicker,
  onUpdateField,
  nameRef,
  nicknameRef,
  phoneRef,
  emailRef,
  occupationRef
}: ContactInfoProps) {
  return (
    <>
      <XStack gap="$4">
        <YStack flex={1.5} gap="$3">
          <Pressable onPress={onShowDatePicker}>
            <Input
              value={formData.birthday ? format(new Date(formData.birthday), "MMMM d, yyyy") : ""}
              placeholder="Select Birthday"
              editable={false}
              theme="dark"
            />
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.select({ ios: "spinner", android: "calendar" })}
              onChange={onDateChange}
              minimumDate={new Date(1900, 0, 1)}
              maximumDate={new Date()}
            />
          )}
          <DebouncedInput
            ref={phoneRef}
            value={formData.phoneNumber || ""}
            onDebouncedChange={(text) => onUpdateField("phoneNumber", text)}
            placeholder="Phone Number"
            returnKeyType="next"
            theme="dark"
          />
          <DebouncedInput
            ref={occupationRef}
            value={formData.occupation || ""}
            onDebouncedChange={(text) => onUpdateField("occupation", text)}
            placeholder="Occupation"
            returnKeyType="next"
            theme="dark"
          />
        </YStack>
      </XStack>
      <XStack gap="$3">
        <DebouncedInput
          flex={1}
          ref={nameRef}
          value={formData.name || ""}
          onDebouncedChange={(text) => onUpdateField("name", text)}
          placeholder="Name"
          theme="dark"
        />
        <DebouncedInput
          flex={1}
          ref={nicknameRef}
          value={formData.nickname || ""}
          onDebouncedChange={(text) => onUpdateField("nickname", text)}
          placeholder="Nickname"
          theme="dark"
        />
      </XStack>
      <DebouncedInput
        ref={emailRef}
        value={formData.email || ""}
        onDebouncedChange={(text) => onUpdateField("email", text)}
        placeholder="Email"
        theme="dark"
      />
    </>
  );
}
