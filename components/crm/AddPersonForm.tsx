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
  Dialog
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
  Platform
} from 'react-native'
import type { Person } from '@/types/people'
import { format, parse, isValid } from 'date-fns'

type FormData = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>

const initialFormData: FormData = {
  familyId: '',
  profilePicture: '',
  name: '',
  nickname: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  },
  birthday: '',
  registered: false,
  payments: [],
  phoneNumber: '',
  email: '',
  notes: '',
  tags: [],
  lastContactDate: '',
  importantDates: [],
  socialMedia: [],
  occupation: '',
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

// Memoize form content
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
  const startTime = performance.now()
  
  useEffect(() => {
    const endTime = performance.now()
    console.log(`⏱️ FormContent Render: ${endTime - startTime}ms`)
  }, [])

  const nameRef = useRef<TextInput>(null)
  const birthdayRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)
  const emailRef = useRef<TextInput>(null)
  const occupationRef = useRef<TextInput>(null)
  const paymentsRef = useRef<TextInput>(null)

  const addressString: string = React.useMemo<string>(() => {
    const { street, city, state, zipCode, country } = formData.address
    return [street, city, state, zipCode, country].filter(Boolean).join(', ')
  }, [formData.address])

  const paymentsString: string = React.useMemo<string>(() => {
    return (formData.payments as { type: string; details: string }[])
      .map((p) => `${p.type || ''}: ${p.details || ''}`)
      .join('\n')
  }, [formData.payments])

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
                backgroundColor="$gray5"
                pressStyle={{ backgroundColor: '$gray6' }}
                onPress={pickImage}
              >
                <Text fontSize={32} color="$gray11">
                  +
                </Text>
              </Circle>
            )}
            <YStack gap="$2">
              <XStack alignItems="center" gap="$2">
                <Text color="$gray11">Registered</Text>
                <Switch
                  value={formData.registered}
                  onValueChange={(val: boolean) =>
                    updateFormField('registered', val)
                  }
                  trackColor={{
                    false: '#767577',
                    true: '#81b0ff',
                  }}
                  thumbColor={
                    formData.registered ? '#2196F3' : '#f4f3f4'
                  }
                />
              </XStack>
              <XStack alignItems="center" gap="$2">
                <Text color="$gray11">Priority?</Text>
                <Switch
                  value={formData.priority || false}
                  onValueChange={(val: boolean) =>
                    updateFormField('priority', val)
                  }
                  trackColor={{
                    false: '#767577',
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
              placeholder="Name"
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
              placeholder="Birthday (MM/DD/YYYY)"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
              blurOnSubmit={false}
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
              blurOnSubmit={false}
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
            value={formData.address.street || ''}
            onDebouncedChange={(text: string) => {
              updateFormField('address', {
                street: text,
                city: '',
                state: '',
                zipCode: '',
                country: '',
              })
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
            returnKeyType="next"
            onSubmitEditing={() => paymentsRef.current?.focus()}
            keyboardType="email-address"
            autoCapitalize="none"
            blurOnSubmit={false}
          />
          <DebouncedInput
            key={`payments-${inputResetKey}`}
            ref={paymentsRef}
            value={paymentsString}
            onDebouncedChange={(text: string) => {
              try {
                const payments = text
                  .split('\n')
                  .map((line: string) => {
                    const parts = line
                      .split(':')
                      .map((s: string) => s.trim())
                    const type = parts[0] || ''
                    const details = parts[1] || ''
                    return { type, details }
                  })
                  .filter(
                    (p: { type: string; details: string }) =>
                      p.type && p.details
                  )
                updateFormField('payments', payments as any)
              } catch (error) {
                console.error('Error parsing payments:', error)
              }
            }}
            placeholder="Payment handles (Venmo: @user)"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            multiline
            numberOfLines={2}
            autoCapitalize="none"
          />
        </YStack>
        <XStack gap="$3" justifyContent="flex-end" mt="$2">
          <Button
            theme="dark"
            onPress={() => setOpen(false)}
            backgroundColor="$gray5"
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

const DebouncedInput = forwardRef<TextInput, DebouncedInputProps>(
  (
    { value, onDebouncedChange, delay = 300, ...props },
    ref: React.Ref<TextInput>
  ) => {
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
        theme="dark"
      />
    )
  }
)

export function AddPersonForm(): JSX.Element {
  const mountStartTime = performance.now()
  
  useEffect(() => {
    const mountEndTime = performance.now()
    console.log(`⏱️ AddPersonForm Mount: ${mountEndTime - mountStartTime}ms`)
    return () => console.log('AddPersonForm Unmount')
  }, [])

  const addPersonMutation = useAddPerson()
  const primaryColor: string = useUserStore(
    (state) => state.preferences.primaryColor
  )
  const [open, setOpen] = useState<boolean>(false)
  const [formData, setFormData] = useState<FormData>({ ...initialFormData })
  const [inputResetKey, setInputResetKey] = useState<number>(0)

  const pickImage = useCallback(async (): Promise<void> => {
    try {
      const imagePickerStart = performance.now()
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      })
      const imagePickerEnd = performance.now()
      console.log(`⏱️ ImagePicker: ${imagePickerEnd - imagePickerStart}ms`)
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
      const parseStart = performance.now()
      const normalizedText = text.replace(/-/g, '/')
      const parsedDate = parse(normalizedText, 'MM/dd/yyyy', new Date())
      if (isValid(parsedDate)) {
        setFormData((prev) => ({
          ...prev,
          birthday: format(parsedDate, 'yyyy-MM-dd'),
        }))
      }
      const parseEnd = performance.now()
      console.log(`⏱️ Birthday Parse: ${parseEnd - parseStart}ms`)
    } catch (error) {
      console.log('Failed to parse date:', text)
    }
  }, [])

  const handleSubmit = useCallback((): void => {
    if (!formData.name?.trim()) return
    const submitStart = performance.now()
    const processedFormData = {
      ...formData,
      payments: (formData.payments as { type: string; details: string }[]).map(
        (p) => ({
          type: p.type?.trim() || '',
          details: p.details?.trim() || '',
        })
      ),
    }
    addPersonMutation.mutate(
      {
        ...processedFormData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        onSuccess: (): void => {
          useCalendarStore.getState().syncBirthdays()
          const submitEnd = performance.now()
          console.log(`⏱️ Form Submit: ${submitEnd - submitStart}ms`)
        },
      }
    )
    setFormData({ ...initialFormData })
    setInputResetKey((prev) => prev + 1)
    setOpen(false)
  }, [formData, addPersonMutation])

  const updateFormField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]): void => {
      const updateStart = performance.now()
      setFormData((prev) => ({ ...prev, [field]: value }))
      const updateEnd = performance.now()
      // log whats in the end form data

    },
    []
  )

  const openDialog = useCallback((): void => {
    const dialogOpenStart = performance.now()
    setOpen(true)
    console.log(`⏱️ Dialog Open Start: ${performance.now() - dialogOpenStart}ms`)
  }, [])

  const handleDialogOpenChange = useCallback((isOpen: boolean): void => {
    const dialogChangeStart = performance.now()
    if (isOpen) {
      console.log(`⏱️ Dialog Opening: ${performance.now() - dialogChangeStart}ms`)
    } else {
      console.log(`⏱️ Dialog Closing: ${performance.now() - dialogChangeStart}ms`)
      setFormData({ ...initialFormData })
      setInputResetKey((prev) => prev + 1)
    }
    setOpen(isOpen)
  }, [])

  return (
    <>
      <YStack alignItems="flex-end" padding="$4" paddingBottom="$8">
        <Button
          theme="dark"
          mt="$4"
          mb="$3"
          width={150}
          onPress={openDialog}
          backgroundColor={primaryColor}
        >
          Add Person
        </Button>
      </YStack>
      {/* Temporary test to verify Dialog.Portal bottleneck */}
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
            backgroundColor="$gray1"
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
