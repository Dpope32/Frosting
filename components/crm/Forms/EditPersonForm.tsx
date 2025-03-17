import React, { useRef, useState, useEffect, forwardRef } from "react";
import {
  Button,
  Sheet,
  Input,
  YStack,
  XStack,
  ScrollView,
  Circle,
  Text
} from "tamagui";
import { useUserStore } from "@/store/UserStore";
import { useImagePicker } from "@/hooks/useImagePicker";
import { Image, TextInput, Switch, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { Person } from "@/types/people";
import { format } from "date-fns";

type FormData = Omit<Person, "id" | "createdAt" | "updatedAt">;

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
};

type DebouncedInputProps = {
  value: string;
  onDebouncedChange: (val: string) => void;
} & Omit<React.ComponentProps<typeof Input>, "value">;

const DebouncedInput = forwardRef<TextInput, DebouncedInputProps>(
  ({ value, onDebouncedChange, ...props }, ref) => {
    const [text, setText] = useState(value);
    const debouncedText = useDebounce(text, 500);
    useEffect(() => {
      onDebouncedChange(debouncedText);
    }, [debouncedText]);
    useEffect(() => {
      setText(value);
    }, [value]);
    return <Input ref={ref} {...props} value={text} onChangeText={setText} />;
  }
);

export function EditPersonForm({
  person,
  visible,
  onClose,
  onSave,
}: {
  person: Person;
  visible: boolean;
  onClose: () => void;
  onSave: (updatedPerson: Person) => void;
}) {
  const [formData, setFormData] = useState<FormData>({ ...person });
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    person.birthday ? new Date(person.birthday) : new Date()
  );
  const nameRef = useRef<TextInput>(null);
  const nicknameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const occupationRef = useRef<TextInput>(null);
  const paymentsRef = useRef<TextInput>(null);

  const { pickImage: pickImageFromLibrary, isLoading: isPickingImage } = useImagePicker();

  const pickImage = async () => {
    const imageUri = await pickImageFromLibrary();
    if (imageUri) {
      setFormData((prev) => ({ ...prev, profilePicture: imageUri }));
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setFormData((prev) => ({ ...prev, birthday: format(date, "yyyy-MM-dd") }));
    }
  };

  const showDatePickerModal = () => {
    if (Platform.OS === "android") setShowDatePicker(true);
  };

  const handleSubmit = () => {
    if (!formData.name) return;
    onSave({ ...person, ...formData });
    onClose();
  };

  return (
    <Sheet
      modal
      animation="quick"
      open={visible}
      onOpenChange={onClose}
      snapPoints={[85]}
      dismissOnSnapToBottom
      dismissOnOverlayPress
      zIndex={200000}
    >
      <Sheet.Overlay animation="quick" enterStyle={{ opacity: 0.5 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Frame padding="$4" backgroundColor="$gray1">
        <Sheet.Handle />
        <YStack flex={1}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <YStack gap="$4" paddingBottom="$2" px="$4">
              <XStack gap="$4">
                <YStack flex={1} gap="$2" alignItems="center">
                  {formData.profilePicture ? (
                    <Pressable onPress={pickImage}>
                      <Image
                        source={{ uri: formData.profilePicture }}
                        style={{ width: 100, height: 100, borderRadius: 50 }}
                      />
                    </Pressable>
                  ) : (
                    <Circle
                      size={100}
                      backgroundColor="$gray5"
                      pressStyle={{ backgroundColor: "$gray6" }}
                      onPress={pickImage}
                    >
                      <Text fontSize={32} color="$gray11">
                        +
                      </Text>
                    </Circle>
                  )}
                  <XStack alignItems="center" gap="$2">
                    <Text color="$gray11">Registered</Text>
                    <Switch
                      value={formData.registered}
                      onValueChange={(val) =>
                        setFormData((prev) => ({ ...prev, registered: val }))
                      }
                      trackColor={{ false: "#767577", true: "#81b0ff" }}
                      thumbColor={formData.registered ? "#2196F3" : "#f4f3f4"}
                    />
                  </XStack>
                </YStack>
                <YStack flex={1.5} gap="$3">
                  <Pressable onPress={showDatePickerModal}>
                    <Input
                      value={
                        formData.birthday
                          ? format(new Date(formData.birthday), "MMMM d, yyyy")
                          : ""
                      }
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
                      onChange={handleDateChange}
                      minimumDate={new Date(1900, 0, 1)}
                      maximumDate={new Date()}
                    />
                  )}
                  <DebouncedInput
                    ref={phoneRef}
                    value={formData.phoneNumber || ""}
                    onDebouncedChange={(text) =>
                      setFormData((prev) => ({ ...prev, phoneNumber: text }))
                    }
                    placeholder="Phone Number"
                    returnKeyType="next"
                    theme="dark"
                  />
                  <DebouncedInput
                    ref={occupationRef}
                    value={formData.occupation || ""}
                    onDebouncedChange={(text) =>
                      setFormData((prev) => ({ ...prev, occupation: text }))
                    }
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
                  onDebouncedChange={(text) =>
                    setFormData((prev) => ({ ...prev, name: text }))
                  }
                  placeholder="Name"
                  theme="dark"
                />
                <DebouncedInput
                  flex={1}
                  ref={nicknameRef}
                  value={formData.nickname || ""}
                  onDebouncedChange={(text) =>
                    setFormData((prev) => ({ ...prev, nickname: text }))
                  }
                  placeholder="Nickname"
                  theme="dark"
                />
              </XStack>
              <DebouncedInput
                ref={emailRef}
                value={formData.email || ""}
                onDebouncedChange={(text) =>
                  setFormData((prev) => ({ ...prev, email: text }))
                }
                placeholder="Email"
                theme="dark"
              />
              <YStack gap="$3">
                <DebouncedInput
                  value={formData.address?.street || ""}
                  onDebouncedChange={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: {
                        street: text,
                        city: "",
                        state: "",
                        zipCode: "",
                        country: "",
                      },
                    }))
                  }
                  placeholder="Enter full address"
                  theme="dark"
                />
              </YStack>
              <XStack gap="$3" justifyContent="flex-end">
                <Button theme="dark" onPress={onClose} backgroundColor="$gray5">
                  Cancel
                </Button>
                <Button
                  onPress={handleSubmit}
                  backgroundColor={primaryColor}
                  borderColor={primaryColor}
                  borderWidth={2}
                >
                  <Text color="white" fontWeight="600">
                    Save Changes
                  </Text>
                </Button>
              </XStack>
            </YStack>
          </ScrollView>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
