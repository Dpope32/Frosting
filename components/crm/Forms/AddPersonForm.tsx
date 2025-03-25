import React, { useRef, useState, useEffect, forwardRef, useCallback} from 'react'
import { Image, TextInput, Switch, Pressable, View, useColorScheme, Animated as RNAnimated, StyleSheet, TouchableWithoutFeedback, Platform} from 'react-native'
import { Button, Input, YStack, XStack, ScrollView, Circle, Text, useMedia, isWeb} from 'tamagui'
import { useUserStore } from '@/store/UserStore'
import { useAddPerson } from '@/hooks/usePeople'
import { useCalendarStore } from '@/store/CalendarStore'
import { useImagePicker } from '@/hooks/useImagePicker'
import { Plus } from '@tamagui/lucide-icons'
import type { Person } from '@/types/people'
import { format, parse, isValid } from 'date-fns'
import { PAYMENT_METHODS, initialFormData, FormContentProps, DebouncedInputProps } from './types'

type FormData = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>

const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]}-${match[3]}`;
  }
  return phone;
};


function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debounced
}

const DebouncedInput = forwardRef<any, DebouncedInputProps>(
  (
    { value, onDebouncedChange, delay = 300, ...props },
    ref: React.Ref<TextInput>
  ) => {
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'
    const [text, setText] = useState<string>(value)
    const debouncedText = useDebounce<string>(text, delay)
    useEffect(() => {
      if (debouncedText !== value) {
        onDebouncedChange(debouncedText)
      }
    }, [debouncedText, onDebouncedChange, value])
    return (
      <Input
        ref={ref}
        {...props}
        value={text}
        onChangeText={setText}
        theme={isDark ? "dark" : "light"}
        backgroundColor={isDark ? "$gray2" : "white"}
        borderColor={isDark ? "$gray7" : "$gray4"}
        fontFamily="$body"
      />
    )
  }
)

const DateDebouncedInput = forwardRef<TextInput, DebouncedInputProps>(
  (
    { value, onDebouncedChange, delay = 300, ...props },
    ref: React.Ref<TextInput>
  ) => {
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'
    const [text, setText] = useState<string>(value)
    const debouncedText = useDebounce<string>(text, delay)
    
    useEffect(() => {
      if (debouncedText !== value) {
        onDebouncedChange(debouncedText)
      }
    }, [debouncedText, onDebouncedChange, value])
    
    const formatDateWithSlashes = (input: string): string => {
      // Remove any non-numeric characters
      const cleaned = input.replace(/\D/g, '')
      
      // Format with slashes
      if (cleaned.length <= 2) {
        return cleaned
      } else if (cleaned.length <= 4) {
        return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
      } else {
        return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`
      }
    }
    
    const handleDateChange = (input: string) => {
      const formatted = formatDateWithSlashes(input)
      setText(formatted)
    }
    
    return (
      <Input
        ref={ref}
        {...props}
        value={text}
        onChangeText={handleDateChange}
        theme={isDark ? "dark" : "light"}
        backgroundColor={isDark ? "$gray2" : "white"}
        borderColor={isDark ? "$gray7" : "$gray4"}
        fontFamily="$body"
      />
    )
  }
)

const FormContent = React.memo((props: FormContentProps) => {
  const {
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
    updatePaymentUsername
  } = props;

  const [showPaymentMethodDropdown, setShowPaymentMethodDropdown] = useState(false);
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const nameRef = useRef<TextInput>(null)
  const birthdayRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)
  const emailRef = useRef<TextInput>(null)
  const occupationRef = useRef<TextInput>(null)
  const media = useMedia()
  const isSmallScreen = media.sm

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      bounces={false}
      contentContainerStyle={{
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        alignItems: isWeb ? 'center' : undefined,
      }}
    >
      <YStack 
        gap="$4" 
        paddingVertical="$8" 
        px="$4"
        width={isWeb ? (isSmallScreen ? '100%' : '600px') : '100%'}
      >
        <XStack gap="$4" flexDirection={isWeb && !isSmallScreen ? 'column' : 'row'}>
          <YStack 
            flex={isWeb && !isSmallScreen ? undefined : 1} 
            gap="$2" 
            alignItems="center"
            width={isWeb && !isSmallScreen ? '100%' : undefined}
          >
            {formData.profilePicture ? (
              <Pressable onPress={pickImage}>
                <Image
                  source={{ uri: formData.profilePicture }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                  }}
                />
              </Pressable>
            ) : (
              <Circle
                size={100}
                backgroundColor={isDark ? "$gray5" : "$gray5"}
                pressStyle={{ backgroundColor: isDark ? '$gray6' : '$gray4' }}
                onPress={pickImage}
              >
              <Text fontSize={32} color={isDark ? "$gray11" : "$gray11"} fontFamily="$body">
                  +
                </Text>
              </Circle>
            )}
            <YStack gap="$2">
              <XStack alignItems="center" gap="$2">
                <Text color={isDark ? "$gray11" : "$gray10"} fontFamily="$body">Registered</Text>
                <Switch
                  value={formData.registered || false}
                  onValueChange={(val: boolean) =>
                    updateFormField('registered', val)
                  }
                  
                  trackColor={{
                    false: isDark ? '#767577' : '#E0E0E0',
                    true: primaryColor,
                    
                  }}
                  thumbColor={
                    formData.registered ? '#FFFFFF' : '#f4f3f4'
                  }
                />
              </XStack>
              <XStack alignItems="center" gap="$2">
                <Text color={isDark ? "$gray11" : "$gray10"} fontFamily="$body">Priority?</Text>
                <Switch
                  value={formData.priority || false}
                  onValueChange={(val: boolean) =>
                    updateFormField('priority', val)
                  }
                  trackColor={{
                    false: isDark ? '#767577' : '#E0E0E0',
                    true: '#FFD700',
                  }}
                  thumbColor={
                    formData.priority ? '#FFA500' : '#f4f3f4'
                  }
                />
              </XStack>
            </YStack>
          </YStack>
          <YStack 
            flex={isWeb && !isSmallScreen ? undefined : 1.5} 
            gap="$3"
            width={isWeb && !isSmallScreen ? '100%' : undefined}
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
                  borderRadius={8}
                  height={40}
                  borderColor={isDark ? "$gray7" : "$gray4"}
                  borderWidth={1}
                  paddingHorizontal="$2"
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
                    borderRadius={8}
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
                key={`payment-username-${inputResetKey}`}
                value={paymentUsername}
                onDebouncedChange={updatePaymentUsername}
                placeholder="Username (e.g. @username)"
                returnKeyType="next"
                autoCapitalize="none"
                flex={1}
              />
            </XStack>
          </YStack>
        </YStack>
        <XStack gap="$3" justifyContent="flex-end" mt="$2">
          <Button
            theme={isDark ? "dark" : "light"}
            onPress={() => setOpen(false)}
            backgroundColor={isDark ? "$gray5" : "$gray3"}
          >
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            backgroundColor={primaryColor}
            borderColor={primaryColor}
            borderWidth={2}
          >
            <Text color="white" fontWeight="600" fontFamily="$body">
              Save Contact
            </Text>
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  )
})

export function AddPersonForm(): JSX.Element {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const addPersonMutation = useAddPerson()
  const primaryColor: string = useUserStore( (state) => state.preferences.primaryColor)
  const media = useMedia()
  const isSmallScreen = media.sm
  const scaleAnim = useRef(new RNAnimated.Value(1.5)).current;
  const opacityAnim = useRef(new RNAnimated.Value(0)).current;
  const backdropOpacity = useRef(new RNAnimated.Value(0)).current;

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

  useEffect(() => {
    if (open) {
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
  }, [open]);

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
      setOpen(false);
    });
  }, [backdropOpacity, opacityAnim, scaleAnim]);

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
        <View style={styles.container}>
          <RNAnimated.View style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity }]}>
            <TouchableWithoutFeedback onPress={handleClose}>
              <View style={styles.backdrop} />
            </TouchableWithoutFeedback>
          </RNAnimated.View>
          
          <RNAnimated.View 
            style={[
              styles.modalContainer,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
                width: isWeb ? (isSmallScreen ? "95%" : 600) : "95%",
                maxHeight: "85%",
                backgroundColor: isDark ? "#1E1E1E" : "rgba(255,255,255,0.93)",
              }
            ]}
          >
            <Button
              position="absolute"
              top="$3"
              right="$3"
              size="$2"
              circular
              backgroundColor={isDark ? "$gray3" : "$gray4"}
              onPress={handleClose}
              zIndex={1001}
            >
              ✕
            </Button>
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
          </RNAnimated.View>
        </View>
      )}
    </>
  )
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
    position: 'absolute',
    maxWidth: 600,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  }
});
