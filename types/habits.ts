import { TaskCategory } from './task';

export type NotificationTime = 'none' | 'morning' | 'afternoon' | 'evening' | 'night';
export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  name: string;
  category: TaskCategory;
  frequency: Frequency;
  notificationTime: NotificationTime;
  createdAt: Date;
  completedDates: Date[];
}

export const frequencyOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
] as const;

export const notificationTimeOptions = [
  { label: 'None', value: 'none' },
  { label: 'Morning', value: 'morning' },
  { label: 'Afternoon', value: 'afternoon' },
  { label: 'Evening', value: 'evening' },
  { label: 'Night', value: 'night' },
] as const;

export const notificationScheduleTimes = {
  morning: { hours: 9, minutes: 0 },
  afternoon: { hours: 14, minutes: 0 },
  evening: { hours: 18, minutes: 0 },
  night: { hours: 21, minutes: 0 },
} as const;