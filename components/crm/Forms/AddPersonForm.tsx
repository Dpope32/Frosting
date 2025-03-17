import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useCallback
} from 'react'
import { Platform } from 'react-native'
import {
  Button,
  Input,
  YStack,
  XStack,
  ScrollView,
  Circle,
  Text,
  useMedia,
} from 'tamagui'
import { useUserStore } from '@/store/UserStore'
import { useAddPerson } from '@/hooks/usePeople'
import { useCalendarStore } from '@/store/CalendarStore'
import { useImagePicker } from '@/hooks/useImagePicker'
import {
  Image,
  TextInput,
  Switch,
  Pressable,
  View,
  useColorScheme
} from 'react-native'
import { Plus } from '@tamagui/lucide-icons'
import type { Person } from '@/types/people'
import { format, parse, isValid } from 'date-fns'

type FormData = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>

const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  // Format as XXX XXX-XXXX
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]}-${match[3]}`;
  }
  return phone;
};

const initialFormData: FormData = {
  name: '',
  birthday: '',
  profilePicture: '',
  nickname: '',
  phoneNumber: '',
  email: '',
  occupation: '',
  address: undefined,
  registered: false,
  notes: '',
  tags: [],
  lastContactDate: '',
  importantDates: [],
  socialMedia: [],
  favoriteColor: '',
  relationship: '',
  additionalInfo: '',
  priority: false,
}

// Payment method options
const PAYMENT_METHODS = [
  'Venmo',
  'PayPal',
  'CashApp',
  'Zelle',
  'Apple Pay',
  'Google Pay',
  'Other'
]

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debounced
}

type DebouncedInputProps = {
  value: string
  onDebouncedChange: (val: string) => void
  delay?: number
} & Omit<React.ComponentProps<typeof Input>, 'value'>

const DebouncedInput = forwardRef<TextInput, DebouncedInputProps>(
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

// Special version of DebouncedInput that formats dates with slashes automatically
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

// Helper to determine if we're on web
const isWeb = Platform.OS === 'web'

type FormContentProps = {
  formData: FormData;
  inputResetKey: number;
  updateFormField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  handleSubmit: () => void;
  handleBirthdayChange: (text: string) => void;
  pickImage: () => Promise<void>;
  primaryColor: string;
  setOpen: (value: boolean) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  paymentUsername: string;
  setPaymentUsername: (username: string) => void;
}

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
    setPaymentUsername
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
                updateFormField('phoneNumber', formatPhoneNumber(text))
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
            <Text color={isDark ? "$gray11" : "$gray10"} fontSize={14} fontFamily="$body">Payment Method</Text>
            <XStack gap="$2" alignItems="center">
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
                width={120}
                position="relative"
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
              
              <DebouncedInput
                value={paymentUsername}
                onDebouncedChange={setPaymentUsername}
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
      // The text should already have slashes from the DateDebouncedInput component
      // But we'll normalize it just in case
      const normalizedText = text.replace(/-/g, '/')
      
      // Only try to parse if we have enough characters for a valid date
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

  const handleSubmit = useCallback((): void => {
    // Prevent multiple submissions
    if (addPersonMutation.isPending) return;
    
    if (!formData.name?.trim() || !formData.birthday?.trim()) return;
    
    // Add payment method to socialMedia if both fields are filled
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
    
    // Log the entire Person object when saving
    console.log("Saving Person:", JSON.stringify(newPerson, null, 2));
    
    addPersonMutation.mutate(newPerson);
    
    // Reset form and close modal
    setFormData({ ...initialFormData });
    setPaymentMethod('');
    setPaymentUsername('');
    setInputResetKey((prev) => prev + 1);
    setOpen(false);
  }, [formData, paymentMethod, paymentUsername, addPersonMutation]);

  const updateFormField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]): void => {
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

      {open ? (
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="rgba(0,0,0,0.5)"
          justifyContent="center"
          alignItems="center"
          zIndex={1000}
        >
          <YStack
            backgroundColor={isDark ? "$gray1" : "rgba(255,255,255,0.93)"}
            padding="$4"
            width={isWeb ? (isSmallScreen ? "95%" : "600px") : "95%"}
            maxHeight="85%"
            borderRadius="$4"
          >
            <Button
              position="absolute"
              top="$3"
              right="$3"
              size="$2"
              circular
              backgroundColor={isDark ? "$gray3" : "$gray4"}
              onPress={() => setOpen(false)}
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
              setPaymentUsername={setPaymentUsername}
            />
          </YStack>
        </YStack>
      ) : null}
    </>
  )
}
