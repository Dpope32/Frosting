import React, { useRef, useState, useEffect, forwardRef } from "react";
import {
  Button,
  Input,
  YStack,
  XStack,
  ScrollView,
  Circle,
  Text,
  AnimatePresence,
} from "tamagui";
import { useUserStore } from "@/store/UserStore";
import { useImagePicker } from "@/hooks/useImagePicker";
import { 
  Image, 
  TextInput, 
  Switch, 
  Pressable, 
  Platform, 
  Animated as RNAnimated, 
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { Person, Address } from "@/types/people";
import { format } from "date-fns";

const { width, height } = Dimensions.get('window');

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
  
  // Animation values
  const scaleAnim = useRef(new RNAnimated.Value(1.5)).current;
  const opacityAnim = useRef(new RNAnimated.Value(0)).current;
  const backdropOpacity = useRef(new RNAnimated.Value(0)).current;
  
  // Form input refs
  const nameRef = useRef<TextInput>(null);
  const nicknameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const occupationRef = useRef<TextInput>(null);
  const paymentsRef = useRef<TextInput>(null);

  const { pickImage: pickImageFromLibrary, isLoading: isPickingImage } = useImagePicker();

  // Helper function to update form fields
  const updateFormField = (field: keyof FormData, value: any): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Run animation when visibility changes
  useEffect(() => {
    if (visible) {
      // Reset animation values
      scaleAnim.setValue(1.5);
      opacityAnim.setValue(0);
      backdropOpacity.setValue(0);
      
      // Start animations
      RNAnimated.parallel([
        RNAnimated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        RNAnimated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        RNAnimated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        })
      ]).start();
    } else {
      // Animate out
      RNAnimated.parallel([
        RNAnimated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        RNAnimated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        RNAnimated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 250,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [visible]);

  const pickImage = async () => {
    const imageUri = await pickImageFromLibrary();
    if (imageUri) {
      updateFormField('profilePicture', imageUri);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      updateFormField('birthday', format(date, "yyyy-MM-dd"));
    }
  };

  const showDatePickerModal = () => {
    if (Platform.OS === "android") setShowDatePicker(true);
  };

  const handleClose = () => {
    // Start the exit animation
    RNAnimated.parallel([
      RNAnimated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      RNAnimated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      RNAnimated.timing(scaleAnim, {
        toValue: 1.5,
        duration: 250,
        useNativeDriver: true
      })
    ]).start(() => {
      // Call the actual close function after animation completes
      onClose();
    });
  };

  const handleSubmit = () => {
    if (!formData.name) return;
    onSave({ ...person, ...formData });
    handleClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <RNAnimated.View style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      </RNAnimated.View>
      
      <RNAnimated.View 
        style={[
          styles.modalContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <YStack flex={1} backgroundColor="$gray1" borderRadius={16} overflow="hidden">
          <YStack 
            height={10} 
            backgroundColor="$gray3" 
            width="30%" 
            alignSelf="center" 
            marginTop={8} 
            borderRadius={4}
          />
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <YStack gap="$4" paddingVertical="$2" px="$4">
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
                      onValueChange={(val) => updateFormField('registered', val)}
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
                    onDebouncedChange={(text) => updateFormField('phoneNumber', text)}
                    placeholder="Phone Number"
                    returnKeyType="next"
                    theme="dark"
                  />
                  <DebouncedInput
                    ref={occupationRef}
                    value={formData.occupation || ""}
                    onDebouncedChange={(text) => updateFormField('occupation', text)}
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
                  onDebouncedChange={(text) => updateFormField('name', text)}
                  placeholder="Name"
                  theme="dark"
                />
                <DebouncedInput
                  flex={1}
                  ref={nicknameRef}
                  value={formData.nickname || ""}
                  onDebouncedChange={(text) => updateFormField('nickname', text)}
                  placeholder="Nickname"
                  theme="dark"
                />
              </XStack>
              <DebouncedInput
                ref={emailRef}
                value={formData.email || ""}
                onDebouncedChange={(text) => updateFormField('email', text)}
                placeholder="Email"
                theme="dark"
              />
              <YStack gap="$3">
                <DebouncedInput
                  value={formData.address?.street || ""}
                  onDebouncedChange={(text) => {
                    if (text) {
                      updateFormField('address', {
                        street: text,
                        city: formData.address?.city || "",
                        state: formData.address?.state || "",
                        zipCode: formData.address?.zipCode || "",
                        country: formData.address?.country || ""
                      });
                    } else {
                      updateFormField('address', undefined);
                    }
                  }}
                  placeholder="Enter full address"
                  theme="dark"
                />
              </YStack>
              <XStack gap="$3" justifyContent="flex-end" marginBottom="$4">
                <Button theme="dark" onPress={handleClose} backgroundColor="$gray5">
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
      </RNAnimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContainer: {
    width: Platform.OS === 'web' ? '60%' : '90%',
    maxWidth: 600,
    maxHeight: '80%',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    // Ensure the modal is positioned correctly
    position: 'absolute',
  }
});
