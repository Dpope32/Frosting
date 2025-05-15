import { format } from 'date-fns';

export interface Habit {
  id: string;
  title: string;
  completionHistory: Record<string, boolean>;
  [key: string]: any;
}

/**
 * Checks if a habit has been completed for today
 * This function is used by both notification services and habit store
 */
export const isHabitCompletedForToday = (
  habit: Habit | undefined,
  habitName: string,
  habits: Record<string, Habit>
): boolean => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // If habit is directly provided, check its completion status
  if (habit && habit.completionHistory[today]) {
    return true;
  }
  
  // If no direct habit object, try to find it by name
  if (!habit && habitName) {
    const foundHabit = Object.values(habits).find(h => h.title === habitName);
    if (foundHabit && foundHabit.completionHistory[today]) {
      return true;
    }
  }
  
  return false;
};
