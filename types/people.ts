// types/people.ts
import type { Tag } from '@/types'

export type SocialLink = {
  platform: string
  username: string
}

export type ImportantDate = {
  date: string
  description: string
  recurring: boolean
}

export type Address = {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export type Person = {
  id: string
  familyId?: string
  profilePicture?: string
  name: string
  nickname?: string
  address?: Address
  birthday: string
  registered?: boolean
  favorite?: boolean
  phoneNumber?: string
  email?: string
  notes?: string
  tags?: Tag[]
  lastContactDate?: string
  importantDates?: ImportantDate[]
  socialMedia?: SocialLink[]
  occupation?: string
  favoriteColor?: string
  relationship?: string
  additionalInfo?: string
  priority?: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}
