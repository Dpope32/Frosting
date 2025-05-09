import { useMemo } from 'react';
import { useHabitStore } from '@/store/HabitStore';
import { TaskCategory } from '@/types/task';
import { isWeb } from 'tamagui';
import { differenceInDays, subDays, format } from 'date-fns';
import { triggerHaptic } from '@/services/noteService';
import { ImpactFeedbackStyle } from 'expo-haptics';
import { Habit } from '@/types/habits';
export function useHabits() {
  const { habits, addHabit, toggleHabitCompletion, deleteHabit, editHabit } = useHabitStore();
  const habitsList = useMemo(() => Object.values(habits), [habits]);

  const getCompletedToday = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return habitsList.filter(habit => habit.completionHistory[today]).length;
  };

  const getProgressPercentage = () => {
    const completed = getCompletedToday();
    return habitsList.length > 0 ? (completed / habitsList.length) * 100 : 0;
  };

  const getRecentHistory = (habit: Habit, maxDays: number = 10) => {
    const today = new Date();
    const createdAt = new Date(habit.createdAt);
    const daysSinceCreation = differenceInDays(today, createdAt);
    const daysToShow = Math.min(maxDays, daysSinceCreation + 1);
    
    const history: { date: string; completed: boolean }[] = [];
    
    for (let i = 0; i < daysToShow; i++) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      history.unshift({
        date,
        completed: habit.completionHistory[date] || false
      });
    }
    
    return history;
  };

  const handleAddHabit = (
    title: string, 
    category: TaskCategory, 
    notificationTimeValue: string,
    customMessage: string,
    description: string
  ) => {
    addHabit(title, category, notificationTimeValue, customMessage, description);
  };

  const handleToggleHabit = (habitId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    toggleHabitCompletion(habitId, today);
    if (!isWeb) {
      triggerHaptic(ImpactFeedbackStyle.Light);
    }
  };

  return {
    habits: habitsList,
    addHabit: handleAddHabit as (
      title: string,
      category: TaskCategory,
      notificationTimeValue: string,
      customMessage: string,
      description: string
    ) => void,
    toggleHabit: handleToggleHabit,
    deleteHabit,
    editHabit,
    getRecentHistory,
    completedToday: getCompletedToday(),
    progressPercentage: getProgressPercentage()
  };
} 