import { useProjectStore } from '@/store/ProjectStore'
import { getRecommendedTasks, RecommendationCategory, RecommendedTask } from '@/constants/recommendations/TaskRecommendations';
import { Task } from '@/types/task'; 
import { Project } from '@/types/project';

// Don't use hooks at module level, use getState() instead

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

  useProjectStore.getState().addProject(tasksToAdd as any);
  console.log(`Added ${tasksToAdd.length} dev tasks.`);
};

export const addDevProjects = () => {

  const sampleProjects: Project[] = [
    ({
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 9),
      name: 'Sample Project 1',
      description: 'This is a sample project',
      createdAt: new Date(),
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      tags: [
        {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
          name: 'Feature',
          color: 'blue',
        },
        {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
          name: 'Urgent',
          color: 'red',
        },
      ],
      status: 'pending',
      priority: 'medium',
      isArchived: false,
      isDeleted: false,
      tasks: [],
      people: [],
      notes: [],
      attachments: [],
    } as Project),
    ({
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 9),
      name: 'Sample Project 2',
      description: 'Another sample project',
      createdAt: new Date(),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      tags: [
        {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
          name: 'Backend',
          color: 'green',
        },
      ],
      status: 'in_progress',
      priority: 'high',
      isArchived: false,
      isDeleted: false,
      tasks: [],
      people: [],
      notes: [],
      attachments: [],
    } as Project),
  ]
  sampleProjects.forEach((project, index) => {
    setTimeout(() => useProjectStore.getState().addProject(project), index * 300)
  })
}
