import React, { useRef, useState, useEffect, forwardRef, useCallback } from "react";
import {
  Button,
  Input,
  YStack,
  XStack,
  ScrollView,
  Circle,
  Text,
  AnimatePresence,
  useMedia,
  isWeb
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
  View,
  useColorScheme
} from "react-native";
import { PAYMENT_METHODS } from './types';
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

export function EditPersonForm({ person, visible, onClose, onSave}: {
  person: Person;
  visible: boolean;
  onClose: () => void;
  onSave: (updatedPerson: Person) => void;
}) {
  const [formData, setFormData] = useState<FormData>({ ...person });
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState( person.birthday ? new Date(person.birthday) : new Date());
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentUsername, setPaymentUsername] = useState<string>('');
  const [showPaymentMethodDropdown, setShowPaymentMethodDropdown] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const media = useMedia();
  const isSmallScreen = media.sm;
  const scaleAnim = useRef(new RNAnimated.Value(1.5)).current;
  const opacityAnim = useRef(new RNAnimated.Value(0)).current;
  const backdropOpacity = useRef(new RNAnimated.Value(0)).current;
  const nameRef = useRef<TextInput>(null);
  const nicknameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const occupationRef = useRef<TextInput>(null);

  const { pickImage: pickImageFromLibrary, isLoading: isPickingImage } = useImagePicker();

  const updateFormField = (field: keyof FormData, value: any): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(1.5);
      opacityAnim.setValue(0);
      backdropOpacity.setValue(0);
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
      onClose();
    });
  };

  const updatePaymentUsername = useCallback((text: string): void => {
    setPaymentUsername(text);
  }, []);

  const handleSubmit = () => {
    if (!formData.name) return;
    
    let updatedFormData = { ...formData };
    if (paymentMethod && paymentUsername) {
      updatedFormData.socialMedia = [
        { platform: paymentMethod, username: paymentUsername }
      ];
    }
    
    onSave({ ...person, ...updatedFormData });
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
        <YStack flex={1} backgroundColor="$gray1" br={16} overflow="hidden">
          <YStack 
            height={10} 
            backgroundColor="$gray3" 
            width="30%" 
            alignSelf="center" 
            mt={8} 
            br={4}
          />
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <YStack gap="$4" py={isWeb ? "$6" : "$2"} px={isWeb ? "$6" : "$4"}>
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
                      <Text fontFamily="$body" fontSize={32} color="$gray11">
                        +
                      </Text>
                    </Circle>
                  )}
                  <XStack alignItems="center" gap="$2">
                    <Text fontFamily="$body" color="$gray11">Registered</Text>
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
                
                <YStack gap="$2">
                  <Text color={isDark ? "$gray11" : "$gray10"} fontSize={14} fontFamily="$body">
                    Payment Method
                  </Text>
                  <XStack gap="$2" alignItems="center">
                    <YStack width={120}>
                      <Button
                        onPress={() => setShowPaymentMethodDropdown(!showPaymentMethodDropdown)}
                        theme={isDark ? "dark" : "light"}
                        backgroundColor={isDark ? "$gray2" : "white"}
                        br={8}
                        height={40}
                        borderColor={isDark ? "$gray7" : "$gray4"}
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
                          top={40}
                          left={0}
                          backgroundColor={isDark ? "$gray1" : "white"}
                          br={8}
                          zIndex={1000}
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
                      value={paymentUsername}
                      onDebouncedChange={updatePaymentUsername}
                      placeholder="Username (e.g. @username)"
                      returnKeyType="next"
                      autoCapitalize="none"
                      flex={1}
                      theme="dark"
                    />
                  </XStack>
                </YStack>
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
                  <Text fontFamily="$body" color="white" fontWeight="600">
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
    position: 'absolute',
  }
});
