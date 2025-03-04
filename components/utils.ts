import { TaskCategory } from "@/store/ToDo";

export const getCategoryColor = (category: TaskCategory): string => {
    const colors: Record<TaskCategory, string> = {
      work: '#9C27B0',
      health: '#4CAF50',
      personal: '#2196F3',
      family: '#FF9800',
      wealth: '#F44336'
    };
    return colors[category];
  };
