import React, { useRef, useState, useEffect, forwardRef, useCallback } from 'react'
import { Button, Sheet, Input, YStack, XStack, ScrollView, Circle, Text } from 'tamagui'
import { useUserStore } from '@/store/UserStore'
import { useAddPerson } from '@/hooks/usePeople'
import { useCalendarStore } from '@/store/CalendarStore'
import * as ImagePicker from 'expo-image-picker'
import { Image, TextInput, Switch, Pressable, KeyboardAvoidingView, Platform } from 'react-native'
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
  const [debounced, setDebounced] = useState(value)
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
  ({ value, onDebouncedChange, delay = 300, ...props }, ref) => {
    const [text, setText] = useState(value)
    const debouncedText = useDebounce(text, delay)
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

export function AddPersonForm() {
  const addPersonMutation = useAddPerson()
  const primaryColor = useUserStore((state) => state.preferences.primaryColor)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({ ...initialFormData })
  const [inputResetKey, setInputResetKey] = useState(0)
  const nameRef = useRef<TextInput>(null)
  const birthdayRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)
  const emailRef = useRef<TextInput>(null)
  const occupationRef = useRef<TextInput>(null)
  const paymentsRef = useRef<TextInput>(null)

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      })
      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({ ...prev, profilePicture: result.assets[0].uri }))
      }
    } catch (error) {
      console.error('Error picking image:', error)
    }
  }, [])

  const handleBirthdayChange = useCallback((text: string) => {
    try {
      // Replace hyphens with forward slashes
      const normalizedText = text.replace(/-/g, '/');
      const parsedDate = parse(normalizedText, 'MM/dd/yyyy', new Date());
      
      if (isValid(parsedDate)) {
        setFormData(prev => ({
          ...prev,
          birthday: format(parsedDate, 'yyyy-MM-dd')
        }));
      }
    } catch (error) {
      // Don't update formData if parsing fails
      console.log('Failed to parse date:', text);
    }
  }, [])

  const handleSubmit = useCallback(() => {
    if (!formData.name?.trim()) return
    const processedFormData = {
      ...formData,
      payments: formData.payments.map(p => ({
        type: p.type?.trim() || '',
        details: p.details?.trim() || ''
      }))
    }
    addPersonMutation.mutate({
      ...processedFormData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, {
      onSuccess: () => {
        useCalendarStore.getState().syncBirthdays()
      }
    })
    setFormData({ ...initialFormData })
    setInputResetKey(prev => prev + 1)
    setOpen(false)
  }, [formData, addPersonMutation])

  const updateFormField = useCallback(<K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const addressString = React.useMemo(() => {
    if (!formData.address) return ''
    const { street, city, state, zipCode, country } = formData.address
    return [street, city, state, zipCode, country]
      .filter(Boolean)
      .join(', ')
  }, [formData.address])

  const paymentsString = React.useMemo(() => {
    return formData.payments
      .map(p => `${p.type || ''}: ${p.details || ''}`)
      .join('\n')
  }, [formData.payments])

  return (
    <>
      <YStack alignItems="flex-end" padding="$4" paddingBottom="$8">
        <Button 
          theme="dark" 
          mt="$4" 
          mb="$3" 
          width={150} 
          onPress={useCallback(() => setOpen(true), [])}
          backgroundColor={primaryColor}
        >
          Add Person
        </Button>
      </YStack>
      <Sheet
        modal
        animation="quick"
        open={open}
        onOpenChange={useCallback((isOpen: boolean) => {
          setOpen(isOpen);
          if (!isOpen) {
            setFormData({ ...initialFormData });
            setInputResetKey(prev => prev + 1);
          }
        }, [])}
        snapPoints={[70]}
        dismissOnSnapToBottom
        dismissOnOverlayPress
        zIndex={100000}
      >
        <Sheet.Overlay 
          animation="quick" 
          enterStyle={{ opacity: 0.5 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Frame
          padding="$4"
          backgroundColor="$gray1"
          gap="$5"
        >
          <Sheet.Handle />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <YStack flex={1}>
              <ScrollView 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                bounces={false}
              >
                <YStack gap="$4" paddingBottom="$8" px="$4">
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
                          pressStyle={{ backgroundColor: '$gray6' }}
                          onPress={pickImage}
                        >
                          <Text fontSize={32} color="$gray11">+</Text>
                        </Circle>
                      )}
                      <YStack gap="$2">
                        <XStack alignItems="center" gap="$2">
                          <Text color="$gray11">Registered</Text>
                          <Switch
                            value={formData.registered}
                            onValueChange={val => updateFormField('registered', val)}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={formData.registered ? '#2196F3' : '#f4f3f4'}
                          />
                        </XStack>
                        <XStack alignItems="center" gap="$2">
                          <Text color="$gray11">Priority?</Text>
                          <Switch
                            value={formData.priority || false}
                            onValueChange={val => updateFormField('priority', val)}
                            trackColor={{ false: '#767577', true: '#FFD700' }}
                            thumbColor={formData.priority ? '#FFA500' : '#f4f3f4'}
                          />
                        </XStack>
                      </YStack>
                    </YStack>
                    <YStack flex={1.5} gap="$3">
                      <DebouncedInput
                        key={`name-${inputResetKey}`}
                        ref={nameRef}
                        value={formData.name || ''}
                        onDebouncedChange={text => updateFormField('name', text)}
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
                        onDebouncedChange={text => updateFormField('phoneNumber', text)}
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
                        onDebouncedChange={text => updateFormField('occupation', text)}
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
                      value={addressString}
                      onDebouncedChange={text => {
                        // First split by commas to get the main parts
                        const parts = text.split(',').map(s => s.trim());
                        
                        // Initialize address components
                        let street = '', city = '', state = '', zipCode = '', country = '';
                        
                        // Handle US address format
                        if (parts.length > 0) {
                          street = parts[0]; // First part is always street
                          
                          if (parts.length > 1) {
                            // Handle city, state, zip in second part
                            const cityStatePart = parts[1].trim();
                            const cityStateMatch = cityStatePart.match(/^(.*?)\s*([A-Z]{2})\s*(\d{5})?$/);
                            
                            if (cityStateMatch) {
                              city = cityStateMatch[1].trim();
                              state = cityStateMatch[2];
                              zipCode = cityStateMatch[3] || '';
                            } else {
                              // If no match, treat entire part as city
                              city = cityStatePart;
                            }
                            
                            // If there's a third part and it's not matched as zip code, treat as country
                            if (parts.length > 2) {
                              country = parts[2].trim();
                            }
                          }
                        }
                        
                        updateFormField('address', { street, city, state, zipCode, country });
                      }}
                      placeholder="Enter full address"
                      autoCapitalize="words"
                      blurOnSubmit={false}
                    />
                    <DebouncedInput
                      key={`email-${inputResetKey}`}
                      ref={emailRef}
                      value={formData.email || ''}
                      onDebouncedChange={text => updateFormField('email', text)}
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
                      onDebouncedChange={text => {
                        try {
                          const payments = text
                            .split('\n')
                            .map(line => {
                              const [type, details] = line.split(':').map(s => s.trim())
                              return { type, details }
                            })
                            .filter(p => p.type && p.details)
                          updateFormField('payments', payments)
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
                    <Button theme="dark" onPress={() => setOpen(false)} backgroundColor="$gray5">
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
            </YStack>
          </KeyboardAvoidingView>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
