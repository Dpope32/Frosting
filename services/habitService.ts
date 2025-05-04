import { useHabitStore } from '@/store/HabitStore';
import * as Haptics from 'expo-haptics';
import { Alert, Platform } from 'react-native';
import { TaskCategory } from '@/types/task';

const testHabits = [
  { 
    title: 'Morning Exercise', 
    category: 'health' as TaskCategory, 
    notificationTimeValue: '07:30', 
    customMessage: 'Time to get moving! Your morning workout awaits.' 
  },
  { 
    title: 'Read 30 Minutes', 
    category: 'personal' as TaskCategory, 
    notificationTimeValue: '20:00', 
    customMessage: 'Reading time! Grab your book and relax.' 
  },
  { 
    title: 'Meditate', 
    category: 'health' as TaskCategory, 
    notificationTimeValue: '08:15', 
    customMessage: 'Take a moment to clear your mind with meditation.' 
  },
  { 
    title: 'Drink Water', 
    category: 'health' as TaskCategory, 
    notificationTimeValue: '', 
    customMessage: '' 
  },
  { 
    title: 'Call Family', 
    category: 'family' as TaskCategory, 
    notificationTimeValue: '19:00', 
    customMessage: 'Don\'t forget to check in with your family today!' 
  },
];

export const generateTestHabits = async () => {
  const store = useHabitStore.getState();
  
  for (const habit of testHabits) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Add small delay to prevent render issues
    store.addHabit(habit.title, habit.category, habit.notificationTimeValue, habit.customMessage);
  }
  
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
};

export const clearAllHabits = () => {
  // In development, clear all habits immediately without confirmation
  if (__DEV__) {
    const devStore = useHabitStore.getState()
    const devIds = Object.keys(devStore.habits)
    devIds.forEach((id) => devStore.deleteHabit(id))
    return
  }
  // Get current store state and delete each habit via the store action
  const store = useHabitStore.getState();
  const habitIds = Object.keys(store.habits);
  if (Platform.OS === 'web') {
    if (window.confirm('Are you sure you want to clear all habits? This cannot be undone.')) {
      habitIds.forEach((id) => store.deleteHabit(id));
    }
  } else {
    Alert.alert(
      'Clear All Habits',
      'Are you sure you want to clear all habits? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            habitIds.forEach((id) => store.deleteHabit(id));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  }
};
