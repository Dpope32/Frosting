import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useCallback
} from 'react'
import {
  Button,
  Input,
  YStack,
  XStack,
  ScrollView,
  Circle,
  Text,
} from 'tamagui'
import { useUserStore } from '@/store/UserStore'
import { useAddPerson } from '@/hooks/usePeople'
import { useCalendarStore } from '@/store/CalendarStore'
import * as ImagePicker from 'expo-image-picker'
import {
  Image,
  TextInput,
  Switch,
  Pressable,
  Platform,
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
      />
    )
  }
)

const FormContent = React.memo(({ 
  formData, 
  inputResetKey, 
  updateFormField, 
  handleSubmit,
  handleBirthdayChange,
  pickImage,
  primaryColor,
  setOpen
}: {
  formData: FormData;
  inputResetKey: number;
  updateFormField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  handleSubmit: () => void;
  handleBirthdayChange: (text: string) => void;
  pickImage: () => Promise<void>;
  primaryColor: string;
  setOpen: (value: boolean) => void;
}) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const nameRef = useRef<TextInput>(null)
  const birthdayRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)
  const emailRef = useRef<TextInput>(null)
  const occupationRef = useRef<TextInput>(null)

  const addressString: string = React.useMemo<string>(() => {
    if (!formData.address) return '';
    const { street, city, state, zipCode, country } = formData.address;
    return [street, city, state, zipCode, country].filter(Boolean).join(', ');
  }, [formData.address])

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      bounces={false}
      contentContainerStyle={{
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
      }}
    >
      <YStack gap="$4" paddingVertical="$8" px="$4">
        <XStack gap="$4">
          <YStack flex={1} gap="$2" alignItems="center">
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
                backgroundColor={isDark ? "$gray5" : "$gray3"}
                pressStyle={{ backgroundColor: isDark ? '$gray6' : '$gray4' }}
                onPress={pickImage}
              >
                <Text fontSize={32} color={isDark ? "$gray11" : "$gray9"}>
                  +
                </Text>
              </Circle>
            )}
            <YStack gap="$2">
              <XStack alignItems="center" gap="$2">
                <Text color={isDark ? "$gray11" : "$gray10"}>Registered</Text>
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
                <Text color={isDark ? "$gray11" : "$gray10"}>Priority?</Text>
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
          <YStack flex={1.5} gap="$3">
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
              blurOnSubmit={false}
            />
            <DebouncedInput
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
              blurOnSubmit={false}
            />
          </YStack>
        </XStack>
        <YStack gap="$3">
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
            blurOnSubmit={false}
          />
          <DebouncedInput
            key={`email-${inputResetKey}`}
            ref={emailRef}
            value={formData.email || ''}
            onDebouncedChange={(text: string) =>
              updateFormField('email', text)
            }
            placeholder="Email"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            keyboardType="email-address"
            autoCapitalize="none"
            blurOnSubmit={false}
          />
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
            <Text color="white" fontWeight="600">
              Save Contact
            </Text>
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  )
})

export function AddPersonForm(): JSX.Element {
  const mountStartTime = performance.now()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const addPersonMutation = useAddPerson()
  const primaryColor: string = useUserStore(
    (state) => state.preferences.primaryColor
  )

  useEffect(() => {
    if (addPersonMutation.isSuccess) {
      useCalendarStore.getState().syncBirthdays()
    }
  }, [addPersonMutation.isSuccess])
  
  const [open, setOpen] = useState<boolean>(false)
  const [formData, setFormData] = useState<FormData>({ ...initialFormData })
  const [inputResetKey, setInputResetKey] = useState<number>(0)

  const pickImage = useCallback(async (): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      })
      if (!result.canceled && result.assets[0]) {
        setFormData((prev) => ({
          ...prev,
          profilePicture: result.assets[0].uri,
        }))
      }
    } catch (error) {
      console.error('Error picking image:', error)
    }
  }, [])

  const handleBirthdayChange = useCallback((text: string): void => {
    try {
      const normalizedText = text.replace(/-/g, '/')
      const parsedDate = parse(normalizedText, 'MM/dd/yyyy', new Date())
      if (isValid(parsedDate)) {
        setFormData((prev) => ({
          ...prev,
          birthday: format(parsedDate, 'yyyy-MM-dd'),
        }))
      }
    } catch (error) {
      console.log('Failed to parse date:', text)
    }
  }, [])

  const handleSubmit = useCallback((): void => {
    if (!formData.name?.trim() || !formData.birthday?.trim()) return
    const processedFormData = {
      ...formData,
      phoneNumber: formData.phoneNumber ? formatPhoneNumber(formData.phoneNumber) : undefined
    }
    addPersonMutation.mutate({
      ...processedFormData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    setFormData({ ...initialFormData })
    setInputResetKey((prev) => prev + 1)
    setOpen(false)
    }, [formData, addPersonMutation])

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
              width="95%"
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
              />
            </YStack>
          </YStack>
        ) : null}
      </>
    )
  }
