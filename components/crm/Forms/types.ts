import type { Person } from '@/types'

export type FormData = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>

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
    favorite: false,
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
    /** Whether the form content is visible, used to trigger autofocus */
    isVisible: boolean;
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
