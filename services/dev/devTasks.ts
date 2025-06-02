import { useProjectStore as useTaskStore } from '@/store/ToDo'
import { getRecommendedTasks, RecommendationCategory, RecommendedTask } from '@/constants';
import { Task } from '@/types';

export const addDevTasks = () => {
  const categories: RecommendationCategory[] = ['Cleaning', 'Wealth', 'Gym', 'Self-Care'];
  let allRecommendedTasks: RecommendedTask[] = [];

  categories.forEach(category => {
    allRecommendedTasks = allRecommendedTasks.concat(getRecommendedTasks(category));
  });

  // Shuffle tasks
  for (let i = allRecommendedTasks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allRecommendedTasks[i], allRecommendedTasks[j]] = [allRecommendedTasks[j], allRecommendedTasks[i]];
  }

  // Select up to 10 tasks
  const tasksToAdd: Omit<Task, 'id' | 'completed' | 'completionHistory' | 'createdAt' | 'updatedAt'>[] = allRecommendedTasks.slice(0, 5).map(task => ({
    name: task.name,
    recurrencePattern: task.recurrencePattern,
    category: task.category,
    priority: task.priority,
    time: task.time,
    schedule: task.schedule,
  }));

  // Set the first 5 tasks to 'one-time'
  for (let i = 0; i < Math.min(5, tasksToAdd.length); i++) {
    tasksToAdd[i].recurrencePattern = 'one-time';
    tasksToAdd[i].schedule = []; 
  }

  // Add each task individually to the task store
  const taskStore = useTaskStore.getState();
  tasksToAdd.forEach(task => {
    taskStore.addTask(task);
  });
};

