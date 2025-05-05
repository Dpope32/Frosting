import { useProjectStore } from '@/store/ToDo';
import { getRecommendedTasks, RecommendationCategory, RecommendedTask } from '@/constants/recommendations/TaskRecommendations';
import { Task } from '@/types/task'; 

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
  const tasksToAdd: Omit<Task, 'id' | 'completed' | 'completionHistory' | 'createdAt' | 'updatedAt'>[] = allRecommendedTasks.slice(0, 10).map(task => ({
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

  useProjectStore.getState().addTasks(tasksToAdd);
  console.log(`Added ${tasksToAdd.length} dev tasks.`);
};
