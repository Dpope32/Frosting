import { TaskCategory } from './task';

export interface Habit {
  id: string;
  title: string;
  category: TaskCategory;
  createdAt: string; // ISO date string
  completionHistory: Record<string, boolean>; // date string -> completed
  notificationTimeValue: string; // 'HH:mm' or ''
  customMessage: string;
  description?: string;
}
