import { getValueColor } from '@/constants/valueHelper';
import { TaskPriority, TaskCategory, RecurrencePattern } from '@/types/task';

export const getCategoryColor = (category?: TaskCategory): string => {
  if (!category) return '#607d8b';
  const colors: Record<TaskCategory, string> = {
    work: '#2196F3',    // Blue
    health: '#F44336',  // Red
    personal: '#9C27B0', // Purple
    family: '#FF9800',  // Orange
    wealth: '#4CAF50',  // Green
    bills: '#4CAF50',    // Same green as wealth for bills
    task: '#FF9800', // Brown
  };
  return colors[category];
};

// Priority colors and icons
export const getPriorityColor = (priority?: TaskPriority): string => {
  if (!priority) return '#607d8b'; // Default gray
  const colors: Record<TaskPriority, string> = {
    high: '#F44336',    // Red
    medium: '#FF9800',  // Orange
    low: '#4CAF50'      // Green
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
    'one-time': '#2196F3', // Blue
    'tomorrow': '#795548', // Brown
    'everyday': '#E91E63', // Pink
    'weekly': '#9C27B0',   // Purple
    'biweekly': '#FF9800', // Orange
    'monthly': '#4CAF50',  // Green
    'yearly': '#F44336'    // Red
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

// Tag colors
export const tagColors = [
  '#2196F3', // Blue
  '#F44336', // Red
  '#9C27B0', // Purple
  '#FF9800', // Orange
  '#4CAF50', // Green
  '#E91E63', // Pink
  '#00BCD4', // Cyan
  '#FFEB3B', // Yellow
  '#795548', // Brown
  '#607D8B', // Blue Grey
];

export const getRandomTagColor = (): string => {
  const randomIndex = Math.floor(Math.random() * tagColors.length);
  return tagColors[randomIndex];
};

export const getPriorityIonIcon = (priority?: string) => {
  if (!priority) return 'flag-outline';
  const icons: Record<string, any> = {
    high: 'alert-circle',
    medium: 'alert',
    low: 'information-circle-outline',
  };
  return icons[priority] || 'flag-outline';
};

// Habit color by category or fallback
export const getHabitColor = (category?: string): string => {
  // Map habit categories to colors, fallback to tagColors[0]
  if (!category) return tagColors[0];
  const habitColors: Record<string, string> = {
    health: '#4CAF50',    // Green
    productivity: '#2196F3', // Blue
    mindfulness: '#9C27B0', // Purple
    learning: '#FF9800',  // Orange
    fitness: '#F44336',   // Red
    reading: '#795548',   // Brown
    hydration: '#00BCD4', // Cyan
    // Add more as needed
  };
  return habitColors[category.toLowerCase()] || getCategoryColor(category as any) || tagColors[0];
};


export const getStrengthColor = (
  strength: string | number | undefined | null,
  isDark: boolean
): string => {
  if (strength === null || strength === undefined || strength === '...' || strength === 'Offline') {
    return isDark ? '#a1a1aa' : '#18181b'
  }
  if (typeof strength === 'string' && strength.includes('ms')) {
    const value = parseInt(strength)
    if (isNaN(value)) return isDark ? '#a1a1aa' : '#18181b'
    if (isDark) {
      if (value <= 50) return '#15803d'
      if (value <= 100) return '#22c55e'
      if (value <= 200) return '#eab308'
      if (value <= 300) return '#f97316'
      return '#ef4444'
    } else {
      if (value <= 50) return '#15803d'
      if (value <= 100) return '#16a34a'
      if (value <= 200) return '#ca8a04'
      if (value <= 300) return '#ea580c'
      return '#dc2626'
    }
  }
  if (typeof strength === 'string' && strength.includes('Mbps')) {
    const value = parseInt(strength)
    if (isNaN(value)) return isDark ? '#a1a1aa' : '#18181b'
    if (isDark) {
      if (value >= 1000) return '#15803d'
      if (value >= 300) return '#22c55e'
      if (value >= 100) return '#eab308'
      return '#f97316'
    } else {
      if (value >= 1000) return '#15803d'
      if (value >= 300) return '#16a34a'
      if (value >= 100) return '#ca8a04'
      return '#ea580c'
    }
  }
  const value = typeof strength === 'string' ? parseInt(strength.replace('%', '')) : (strength as number)
  if (isDark) {
    if (value <= 20) return '#ef4444'
    if (value <= 40) return '#f97316'
    if (value <= 60) return '#eab308'
    if (value <= 80) return '#22c55e'
    return '#15803d'
  } else {
    if (value <= 20) return '#dc2626'
    if (value <= 40) return '#ea580c'
    if (value <= 60) return '#ca8a04'
    if (value <= 80) return '#16a34a'
    return '#15803d'
  }
}

export const getStockValueColor = (value: number, isDark: boolean): string => {
  const color = getValueColor('portfolio', value, '', isDark)
  if (!isDark) {
    if (color === '#22c55e') return '#15803d'
    if (color === '#ef4444') return '#b91c1c'
  }
  return color
}
