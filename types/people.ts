export type PaymentMethod = {
  platform: 'cashapp' | 'venmo' | 'paypal' | 'zelle';
  username: string;
};

export type Person = {
  id: string;
  familyId: string;
  profilePicture?: string;
  name: string;
  nickname?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  birthday: string; // ISO date string
  registered: boolean;
  payments: PaymentMethod[];
  phoneNumber: string;
  email?: string;
  notes?: string;
  tags?: string[];
  lastContactDate?: string;
  importantDates?: Array<{
    date: string;
    description: string;
    recurring: boolean;
  }>;
  socialMedia?: Array<{
    platform: string;
    username: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type Family = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};
