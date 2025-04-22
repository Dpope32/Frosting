import { useMemo } from 'react';
import { useHabitStore, Habit, NotificationTime } from '@/store/HabitStore';
import { TaskCategory } from '@/types/task';
import { differenceInDays, subDays, format } from 'date-fns';

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
    notificationTime: NotificationTime
  ) => {
    addHabit(title, category, notificationTime);
  };

  const handleToggleHabit = (habitId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    toggleHabitCompletion(habitId, today);
  };

  return {
    habits: habitsList,
    addHabit: handleAddHabit,
    toggleHabit: handleToggleHabit,
    deleteHabit,
    editHabit,
    getRecentHistory,
    completedToday: getCompletedToday(),
    progressPercentage: getProgressPercentage()
  };
} 