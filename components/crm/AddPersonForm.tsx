import React, { useRef, useState, useEffect, forwardRef } from 'react'
import { Button, Sheet, Input, YStack, XStack, ScrollView, Circle, Text, H4 } from 'tamagui'
import { useAddPerson } from '@/hooks/usePeople'
import * as ImagePicker from 'expo-image-picker'
import { Image, TextInput, Switch, Pressable, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import type { Person } from '@/types/people'
import { format } from 'date-fns'

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
} & Omit<React.ComponentProps<typeof Input>, 'value'>

const DebouncedInput = forwardRef<TextInput, DebouncedInputProps>(
  ({ value, onDebouncedChange, ...props }, ref) => {
    const [text, setText] = useState(value)
    const debouncedText = useDebounce(text, 500)
    useEffect(() => {
      onDebouncedChange(debouncedText)
    }, [debouncedText])
    useEffect(() => {
      setText(value)
    }, [value])
    return <Input ref={ref} {...props} value={text} onChangeText={setText} />
  }
)

export function AddPersonForm() {
  const addPersonMutation = useAddPerson()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const nameRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)
  const emailRef = useRef<TextInput>(null)
  const occupationRef = useRef<TextInput>(null)
  const paymentsRef = useRef<TextInput>(null)

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })
    if (!result.canceled) {
      setFormData(prev => ({ ...prev, profilePicture: result.assets[0].uri }))
    }
  }

  const handleSubmit = () => {
    if (!formData.name) return
    const processedFormData = {
      ...formData,
      payments: formData.payments.map(p => ({
        type: p.type ? p.type.trim() : '',
        details: p.details ? p.details.trim() : ''
      }))
    }
    addPersonMutation.mutate({
      ...processedFormData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    setFormData(initialFormData)
    setOpen(false)
  }

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false)
    if (date) {
      setSelectedDate(date)
      setFormData(prev => ({ ...prev, birthday: format(date, 'yyyy-MM-dd') }))
    }
  }

  const showDatePickerModal = () => {
    if (Platform.OS === 'android') setShowDatePicker(true)
  }

  return (
    <>
      <YStack alignItems="flex-end" padding={8}>
        <Button theme="dark" mt="$4" width={150} onPress={() => setOpen(true)}>
          Add Person
        </Button>
      </YStack>
      <Sheet
        modal
        animation="lazy"
        open={open}
        onOpenChange={setOpen}
        snapPoints={[65]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
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
                        pressStyle={{ backgroundColor: '$gray6' }}
                        onPress={pickImage}
                      >
                        <Text fontSize={32} color="$gray11">+</Text>
                      </Circle>
                    )}
                    <XStack alignItems="center" gap="$2">
                      <Text color="$gray11">Registered</Text>
                      <Switch
                        value={formData.registered}
                        onValueChange={val =>
                          setFormData(prev => ({ ...prev, registered: val }))
                        }
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={formData.registered ? '#2196F3' : '#f4f3f4'}
                      />
                    </XStack>
                  </YStack>
                  <YStack flex={1.5} gap="$3">
                    <DebouncedInput
                      ref={nameRef}
                      value={formData.name || ''}
                      onDebouncedChange={text =>
                        setFormData(prev => ({ ...prev, name: text }))
                      }
                      placeholder="Name"
                      returnKeyType="next"
                      onSubmitEditing={() => phoneRef.current?.focus()}
                      theme="dark"
                    />
                    <Pressable onPress={showDatePickerModal}>
                      <Input
                        value={
                          formData.birthday
                            ? format(new Date(formData.birthday), 'MMMM d, yyyy')
                            : ''
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
                        display={Platform.select({ ios: 'spinner', android: 'calendar' })}
                        onChange={handleDateChange}
                        minimumDate={new Date(1900, 0, 1)}
                        maximumDate={new Date()}
                      />
                    )}
                    <DebouncedInput
                      ref={phoneRef}
                      value={formData.phoneNumber || ''}
                      onDebouncedChange={text =>
                        setFormData(prev => ({ ...prev, phoneNumber: text }))
                      }
                      placeholder="Phone Number"
                      returnKeyType="next"
                      onSubmitEditing={() => occupationRef.current?.focus()}
                      theme="dark"
                    />
                    <DebouncedInput
                      ref={occupationRef}
                      value={formData.occupation || ''}
                      onDebouncedChange={text =>
                        setFormData(prev => ({ ...prev, occupation: text }))
                      }
                      placeholder="Occupation"
                      returnKeyType="next"
                      onSubmitEditing={() => emailRef.current?.focus()}
                      theme="dark"
                    />
                  </YStack>
                </XStack>
                <YStack>
                  <DebouncedInput
                    value={
                      formData.address
                        ? `${formData.address.street}, ${formData.address.city}, ${formData.address.state} ${formData.address.zipCode}, ${formData.address.country}`.replace(/(,\s*)+$/, '')
                        : ''
                    }
                    onDebouncedChange={text =>
                      setFormData(prev => ({
                        ...prev,
                        address: { street: text, city: '', state: '', zipCode: '', country: '' }
                      }))
                    }
                    placeholder="Enter full address"
                    theme="dark"
                  />
                </YStack>
                <DebouncedInput
                  ref={emailRef}
                  value={formData.email || ''}
                  onDebouncedChange={text =>
                    setFormData(prev => ({ ...prev, email: text }))
                  }
                  placeholder="Email"
                  returnKeyType="next"
                  onSubmitEditing={() => paymentsRef.current?.focus()}
                  theme="dark"
                />
                <DebouncedInput
                  ref={paymentsRef}
                  value={
                    formData.payments
                      .map(p => `${p.type}: ${p.details}`)
                      .join('\n') || ''
                  }
                  onDebouncedChange={text => {
                    try {
                      const payments = text
                        .split('\n')
                        .map(line => {
                          const [type, details] = line.split(':').map(s => s.trim())
                          return { type, details }
                        })
                        .filter(p => p.type && p.details)
                      setFormData(prev => ({ ...prev, payments }))
                    } catch {}
                  }}
                  placeholder="Payment handles (Venmo: @user)"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  theme="dark"
                  multiline
                  numberOfLines={2}
                />
                <XStack gap="$3" justifyContent="flex-end">
                  <Button theme="dark" onPress={() => setOpen(false)} backgroundColor="$gray5">
                    Cancel
                  </Button>
                  <Button onPress={handleSubmit} backgroundColor="rgba(33, 150, 243, 0.4)" borderColor="$blue10" borderWidth={2}>
                    <Text color="$blue10" fontWeight="600">
                      Save Contact
                    </Text>
                  </Button>
                </XStack>
              </YStack>
            </ScrollView>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
