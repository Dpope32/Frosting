// Remove the import from '@/store/ToDo'
// import { WeekDay, TaskPriority, TaskCategory, RecurrencePattern } from '@/store/ToDo'

// Add the type definitions
export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskCategory = 'work' | 'health' | 'personal' | 'family' | 'wealth'
export type RecurrencePattern = 'one-time' | 'tomorrow' | 'everyday' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface Task {
  id: string
  name: string
  schedule: WeekDay[]
  time?: string
  priority: TaskPriority
  category: TaskCategory
  completed: boolean
  completionHistory: Record<string, boolean>
  createdAt: string
  updatedAt: string
  scheduledDate?: string
  recurrencePattern: RecurrencePattern
  recurrenceDate?: string
  showInCalendar?: boolean
}
