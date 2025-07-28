import { format } from 'date-fns'
import { Task, WeekDay } from '@/types'

export const dayNames: WeekDay[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
]

// Helper function to extract local date string from any timestamp
export const getLocalDateString = (timestamp: string): string => {
  // Parse the timestamp and format it in local timezone
  return format(new Date(timestamp), 'yyyy-MM-dd');
}; 