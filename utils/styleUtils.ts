import { VaultRecommendationCategory, BillRecommendationCategory, getValueColor } from '@/constants';
import { TaskPriority, TaskCategory, RecurrencePattern } from '@/types';

export type ReccomendationCategory = VaultRecommendationCategory | BillRecommendationCategory ;

export const getActiveBarColor = (signalStrength: number): string => {
  switch (signalStrength) {
    case 1: return '#f97316'; // Orange 
    case 2: return '#eab308'; // Yellow 
    case 3: return '#22c55e'; // Green 
    case 4: return '#15803d'; // Dark green 
    default: return 'rgba(0, 224, 15, 0.2)'; // Greenish Grey 
  }
};

export const getCategoryColor = (category?: TaskCategory): string => {
  if (!category) return '#607d8b';
  const colors: Record<string, string> = {
    work: '#2196F3',    // Blue
    health: '#F44336',  // Red
    personal: '#9C27B0', // Purple
    family: '#FF9800',  // Orange
    wealth: '#4CAF50',  // Green
    bills: '#4CAF50',    // Same green as wealth for bills
    task: '#FF9800', // Brown
  };
  return colors[category as string] || getCustomCategoryColor(category as string);
};

  export const customCategoryColors = [
  '#1abc9c', // Turquoise
  '#3498db', // Peter River
  '#9b59b6', // Amethyst
  '#e67e22', // Carrot
  '#e74c3c', // Alizarin
];

export const getCustomCategoryColor = (categoryName: string): string => {
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    const char = categoryName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % customCategoryColors.length;
  return customCategoryColors[index];
};

export const getDarkerColor = (color: string, percent: number): string => {
  let f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
  return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
};


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
    if (color === '#22c55e') return '#166534' // Much darker green for positive values
    if (color === '#ef4444') return '#b91c1c'
  }
  return color
}

export const customCategoryIcons = [
  'star', 'planet', 'leaf', 'flame', 'bulb', 'rocket', 'paw', 'bicycle', 'cafe', 'camera',
  'car', 'cloud', 'gift', 'golf', 'ice-cream', 'musical-notes', 'pizza', 'rose', 'tennisball', 'wine'
];

export const getRandomCustomCategoryIcon = (): string => {
  const idx = Math.floor(Math.random() * customCategoryIcons.length);
  return customCategoryIcons[idx];
};

export const getCategoryIcon = (category?: TaskCategory): string => {
  if (!category) return 'pricetag-outline';
  const icons: Record<string, string> = {
    work: 'briefcase',
    health: 'heart',
    personal: 'person',
    family: 'people',
    wealth: 'cash',
    bills: 'card',
    task: 'checkmark-done',
  };
  if (icons[category]) return icons[category];
  return getRandomCustomCategoryIcon();
};
