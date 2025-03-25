import type { Person } from '@/types/people'
import { Input} from 'tamagui'


type FormData = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>

export const initialFormData: FormData = {
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
  
  export const PAYMENT_METHODS = [
    'Venmo',
    'PayPal',
    'CashApp',
    'Zelle',
    'Apple Pay',
    'Google Pay',
    'Other'
  ]

 export type FormContentProps = {
    formData: FormData;
    inputResetKey: number;
    updateFormField: (field: keyof FormData, value: any) => void;
    handleSubmit: () => void;
    handleBirthdayChange: (text: string) => void;
    pickImage: () => Promise<void>;
    primaryColor: string;
    setOpen: (value: boolean) => void;
    paymentMethod: string;
    setPaymentMethod: (method: string) => void;
    paymentUsername: string;
    updatePaymentUsername: (username: string) => void;
  }

  
export type DebouncedInputProps = {
    value: string
    onDebouncedChange: (val: string) => void
    delay?: number
  } & Omit<React.ComponentProps<typeof Input>, 'value'>