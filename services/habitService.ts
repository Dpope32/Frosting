import { useHabitStore } from '@/store/HabitStore';
import * as Haptics from 'expo-haptics';
import { Alert, Platform } from 'react-native';
import { TaskCategory } from '@/types/task';
import { NotificationTime } from '@/store/HabitStore';

const testHabits = [
  { title: 'Morning Exercise', category: 'health' as TaskCategory, notificationTime: 'morning' as NotificationTime },
  { title: 'Read 30 Minutes', category: 'personal' as TaskCategory, notificationTime: 'evening' as NotificationTime },
  { title: 'Meditate', category: 'health' as TaskCategory, notificationTime: 'morning' as NotificationTime },
  { title: 'Drink Water', category: 'health' as TaskCategory, notificationTime: 'none' as NotificationTime },
  { title: 'Call Family', category: 'family' as TaskCategory, notificationTime: 'evening' as NotificationTime },
];

export const generateTestHabits = async () => {
  const store = useHabitStore.getState();
  
  for (const habit of testHabits) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Add small delay to prevent render issues
    store.addHabit(habit.title, habit.category, habit.notificationTime);
  }
  
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
};

export const clearAllHabits = () => {
  if (Platform.OS === 'web') {
    if (window.confirm('Are you sure you want to clear all habits? This cannot be undone.')) {
      useHabitStore.getState().habits = {};
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
            useHabitStore.getState().habits = {};
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  }
}; 