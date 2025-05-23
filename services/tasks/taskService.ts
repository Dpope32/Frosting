import { Task, TaskPriority, TaskCategory, WeekDay, RecurrencePattern } from '@/types'

export const WEEKDAYS: Record<string, WeekDay> = {
  sun: 'sunday',
  mon: 'monday',
  tue: 'tuesday',
  wed: 'wednesday',
  thu: 'thursday',
  fri: 'friday',
  sat: 'saturday',
}

export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

export const RECURRENCE_PATTERNS: { label: string; value: RecurrencePattern; icon: string }[] = [
  { label: 'One-time', value: 'one-time', icon: 'calendar-sharp' },
  { label: 'Tomorrow', value: 'tomorrow', icon: 'arrow-forward-circle' },
  { label: 'Everyday', value: 'everyday', icon: 'repeat' },
  { label: 'Weekly', value: 'weekly', icon: 'calendar' },
  { label: 'Biweekly', value: 'biweekly', icon: 'calendar-outline' },
  { label: 'Monthly', value: 'monthly', icon: 'calendar-clear' },
  { label: 'Yearly', value: 'yearly', icon: 'calendar-number' }
]

export const getDefaultTask = (): Omit<Task, 'id' | 'completed' | 'completionHistory' | 'createdAt' | 'updatedAt'> => {
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()
  return {
    name: '',
    schedule: WEEKDAYS[currentDay as keyof typeof WEEKDAYS]
      ? [WEEKDAYS[currentDay as keyof typeof WEEKDAYS]]
      : [],
    time: undefined,
    priority: null as unknown as TaskPriority,
    category: null as unknown as TaskCategory,
    recurrencePattern: 'one-time',
    recurrenceDate: new Date().toISOString().split('T')[0]
  }
}
