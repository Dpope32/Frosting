// src/utils/styleUtils.ts

import { TaskPriority, TaskCategory, RecurrencePattern } from '@/types/task';

export const getCategoryColor = (category?: TaskCategory): string => {
  if (!category) return '#607d8b'; 
  
  const colors: Record<TaskCategory, string> = {
    work: '#2196F3',     // Blue
    health: '#F44336',   // Red
    personal: '#9C27B0', // Purple
    family: '#FF9800',   // Orange
    wealth: '#4CAF50'    // Green 
  };
  
  return colors[category];
};

// Priority colors and icons
export const getPriorityColor = (priority?: TaskPriority): string => {
  if (!priority) return '#607d8b'; // Default gray
  
  const colors: Record<TaskPriority, string> = {
    high: '#F44336',   // Red
    medium: '#FF9800', // Orange
    low: '#4CAF50'     // Green
  };
  
  return colors[priority];
};

export const getPriorityIcon = (priority?: TaskPriority): string => {
  if (!priority) return 'flag-outline';
  
  const icons: Record<TaskPriority, string> = {
    high: 'alert-circle',
    medium: 'alert',
    low: 'information-circle-outline'
  };
  
  return icons[priority];
};

export const getRecurrenceColor = (pattern?: RecurrencePattern): string => {
  if (!pattern) return '#607d8b'; 
  
  const colors: Record<RecurrencePattern, string> = {
    'one-time': '#E91E63',  // Pink 
    'tomorrow': '#795548',  // Brown 
    'everyday': '#2196F3',  // Blue
    'weekly': '#9C27B0',    // Purple
    'biweekly': '#FF9800',  // Orange
    'monthly': '#4CAF50',   // Green
    'yearly': '#F44336'     // Red
  };
  
  return colors[pattern];
};

export const getRecurrenceIcon = (pattern?: RecurrencePattern): string => {
  if (!pattern) return 'calendar-outline';
  
  const icons: Record<RecurrencePattern, string> = {
    'one-time': 'calendar',
    'tomorrow': 'arrow-forward-circle-outline',
    'everyday': 'today-outline',
    'weekly': 'repeat',
    'biweekly': 'repeat',
    'monthly': 'calendar-number-outline',
    'yearly': 'calendar-clear-outline'
  };
  
  return icons[pattern];
};

export const withOpacity = (color: string, opacity: number = 0.15): string => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

export const dayColors = {
    mon: '#3F51B5', 
    tue: '#673AB7',
    wed: '#9C27B0', 
    thu: '#E91E63', 
    fri: '#F44336', 
    sat: '#FF9800',
    sun: '#FFC107'  
  };