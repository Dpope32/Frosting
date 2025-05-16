import { useProjectStore as useTaskStore } from '@/store/ToDo'
import { useProjectStore } from '@/store';
import { getRecommendedTasks, RecommendationCategory, RecommendedTask } from '@/constants';
import { Project, Task } from '@/types';


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

  // Add each task individually to the task store
  const taskStore = useTaskStore.getState();
  tasksToAdd.forEach(task => {
    taskStore.addTask(task);
  });
  
  console.log(`Added ${tasksToAdd.length} dev tasks.`);
};

// Helper function to generate a unique ID
const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 9);
};

// Add website redesign project
export const addWebsiteRedesignProject = () => {
  // Create example project tasks
  const websiteTasks = [
    {
      id: generateId(),
      name: 'Design homepage mockup',
      completed: false,
      completionHistory: {},
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      recurrencePattern: 'one-time',
      category: 'Design',
      priority: 'high',
      time: '120', // 2 hours
      schedule: []
    },
    {
      id: generateId(),
      name: 'Set up hosting and domain',
      completed: true,
      completionHistory: {
        [new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()]: true
      },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      recurrencePattern: 'one-time',
      category: 'Tech',
      priority: 'medium',
      time: '60', // 1 hour
      schedule: []
    },
    {
      id: generateId(),
      name: 'Develop responsive layout',
      completed: false,
      completionHistory: {},
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      recurrencePattern: 'one-time',
      category: 'Development',
      priority: 'high',
      time: '180', // 3 hours
      schedule: []
    }
  ];

  // Create website redesign project
  const websiteProject = {
    id: generateId(),
    name: 'Website Redesign',
    description: 'Create a modern, responsive website with updated branding, improved UX, and faster performance.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    tags: [
      {
        id: generateId(),
        name: 'Design',
        color: '#10b981', // green
      },
      {
        id: generateId(),
        name: 'Website',
        color: '#3b82f6', // blue
      },
      {
        id: generateId(),
        name: 'High Priority',
        color: '#ef4444', // red
      }
    ],
    status: 'in_progress' as 'pending' | 'in_progress' | 'completed' | 'past_deadline',
    priority: 'high' as 'low' | 'medium' | 'high',
    isArchived: false,
    isDeleted: false,
    tasks: websiteTasks,
    people: [
      {
        id: generateId(),
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        phoneNumber: '555-123-4567',
        tags: [{
          id: generateId(),
          name: 'Designer',
          color: '#8b5cf6' // purple
        }],
        notes: 'Lead designer for the project',
        profilePicture: 'https://picsum.photos/200',
        birthday: '1990-01-15',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: generateId(),
        name: 'Alex Chen',
        email: 'alex.c@example.com',
        phoneNumber: '555-987-6543',
        tags: [{
          id: generateId(),
          name: 'Developer',
          color: '#06b6d4' // cyan
        }],
        notes: 'Frontend developer',
        profilePicture: 'https://picsum.photos/201',
        birthday: '1988-06-22',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    notes: [
      {
        id: generateId(),
        title: 'Design Requirements',
        content: '# Design Requirements\n\n- Modern, minimalist aesthetic\n- Mobile-first approach\n- Dark mode support\n- Improved navigation\n- Faster load times\n- Accessibility compliance',
        tags: [
          {
            id: generateId(),
            name: 'Requirements',
            color: '#f59e0b' // amber
          }
        ],
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: []
      }
    ],
    attachments: [
      {
        id: generateId(),
        name: 'Initial Mockup',
        url: 'https://picsum.photos/800/600',
        type: 'image'
      }
    ]
  };

  // Add project to the store
  setTimeout(() => useProjectStore.getState().addProject(websiteProject as Project), 100);
  
  console.log(`Added Website Redesign example project.`);
};

// Add mobile app development project
export const addMobileAppProject = () => {
  const appTasks = [
    {
      id: generateId(),
      name: 'Finalize app features list',
      completed: true,
      completionHistory: {
        [new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()]: true
      },
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      recurrencePattern: 'one-time',
      category: 'Planning',
      priority: 'high',
      time: '90', // 1.5 hours
      schedule: []
    },
    {
      id: generateId(),
      name: 'Create user authentication screens',
      completed: false,
      completionHistory: {},
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      recurrencePattern: 'one-time',
      category: 'Development',
      priority: 'high',
      time: '240', // 4 hours
      schedule: []
    },
    {
      id: generateId(),
      name: 'Test on iOS devices',
      completed: false,
      completionHistory: {},
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      recurrencePattern: 'one-time',
      category: 'Testing',
      priority: 'medium',
      time: '120', // 2 hours
      schedule: []
    }
  ];

  // Create mobile app project
  const appProject = {
    id: generateId(),
    name: 'Mobile App Development',
    description: 'Design and develop a cross-platform mobile app with user authentication, cloud syncing, and offline functionality. Target platforms: iOS and Android.',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    tags: [
      {
        id: generateId(),
        name: 'Mobile',
        color: '#8b5cf6', // purple
      },
      {
        id: generateId(),
        name: 'Development',
        color: '#f59e0b', // amber
      },
      {
        id: generateId(),
        name: 'Long-term',
        color: '#10b981', // green
      }
    ],
    status: 'in_progress' as 'pending' | 'in_progress' | 'completed' | 'past_deadline',
    priority: 'medium' as 'low' | 'medium' | 'high',
    isArchived: false,
    isDeleted: false,
    tasks: appTasks,
    people: [
      {
        id: generateId(),
        name: 'Michael Roberts',
        email: 'michael.r@example.com',
        phoneNumber: '555-555-1234',
        tags: [{
          id: generateId(),
          name: 'Project Manager',
          color: '#06b6d4' // cyan
        }],
        notes: 'Overall project coordination',
        profilePicture: 'https://picsum.photos/202',
        birthday: '1985-03-11',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: generateId(),
        name: 'Jessica Wong',
        email: 'jessica.w@example.com',
        phoneNumber: '555-789-0123',
        tags: [{
          id: generateId(),
          name: 'Lead Developer',
          color: '#3b82f6' // blue
        }],
        notes: 'App architecture and main development',
        profilePicture: 'https://picsum.photos/203',
        birthday: '1992-09-05',
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    notes: [
      {
        id: generateId(),
        title: 'App Features',
        content: '# Key Features\n\n1. User authentication with social login options\n2. Push notifications for important events\n3. Offline data storage and sync\n4. Dark/light theme toggle\n5. Profile customization\n6. Activity tracking dashboard',
        tags: [
          {
            id: generateId(),
            name: 'Features',
            color: '#06b6d4' // cyan
          }
        ],
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: []
      },
      {
        id: generateId(),
        title: 'Technical Architecture',
        content: '# App Architecture\n\n- **Frontend**: React Native with TypeScript\n- **Backend**: Node.js API with Express\n- **Database**: MongoDB with Mongoose\n- **Authentication**: JWT with refresh tokens\n- **Storage**: AWS S3 for user uploads\n- **Deployment**: CI/CD with GitHub Actions',
        tags: [
          {
            id: generateId(),
            name: 'Technical',
            color: '#3b82f6' // blue
          }
        ],
        createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: []
      }
    ],
    attachments: [
      {
        id: generateId(),
        name: 'App Wireframes',
        url: 'https://picsum.photos/800/600',
        type: 'image'
      },
      {
        id: generateId(),
        name: 'Database Schema',
        url: 'https://picsum.photos/801/600',
        type: 'image'
      }
    ]
  };

  // Add project to the store
  setTimeout(() => useProjectStore.getState().addProject(appProject as Project), 100);
  
  console.log(`Added Mobile App Development example project.`);
};

// Add home renovation project (more relatable to non-developers)
export const addHomeRenovationProject = () => {
  const renovationTasks = [
    {
      id: generateId(),
      name: 'Get contractor quotes',
      completed: true,
      completionHistory: {
        [new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()]: true
      },
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      recurrencePattern: 'one-time',
      category: 'Planning',
      priority: 'high',
      time: '180', // 3 hours
      schedule: []
    },
    {
      id: generateId(),
      name: 'Select new kitchen cabinets',
      completed: false,
      completionHistory: {},
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      recurrencePattern: 'one-time',
      category: 'Shopping',
      priority: 'medium',
      time: '120', // 2 hours
      schedule: []
    },
    {
      id: generateId(),
      name: 'Schedule plumbing inspection',
      completed: false,
      completionHistory: {},
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      recurrencePattern: 'one-time',
      category: 'Appointments',
      priority: 'high',
      time: '30', // 30 minutes
      schedule: []
    },
    {
      id: generateId(),
      name: 'Order new appliances',
      completed: false,
      completionHistory: {},
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      recurrencePattern: 'one-time',
      category: 'Shopping',
      priority: 'medium',
      time: '60', // 1 hour
      schedule: []
    }
  ];

  // Create home renovation project
  const renovationProject = {
    id: generateId(),
    name: 'Kitchen Renovation',
    description: 'Complete kitchen renovation including new cabinets, countertops, appliances, flooring, and lighting. Goal is to create a modern, functional cooking space.',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    tags: [
      {
        id: generateId(),
        name: 'Home',
        color: '#10b981', // green
      },
      {
        id: generateId(),
        name: 'Renovation',
        color: '#f59e0b', // amber
      },
      {
        id: generateId(),
        name: 'Big Project',
        color: '#ef4444', // red
      }
    ],
    status: 'in_progress' as 'pending' | 'in_progress' | 'completed' | 'past_deadline',
    priority: 'high' as 'low' | 'medium' | 'high',
    isArchived: false,
    isDeleted: false,
    tasks: renovationTasks,
    people: [
      {
        id: generateId(),
        name: 'John Smith',
        email: 'john.s@example.com',
        phoneNumber: '555-111-2222',
        tags: [{
          id: generateId(),
          name: 'Contractor',
          color: '#3b82f6' // blue
        }],
        notes: 'Main contractor for the renovation',
        profilePicture: 'https://picsum.photos/204',
        birthday: '1975-08-17',
        createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: generateId(),
        name: 'Lisa Martinez',
        email: 'lisa.m@example.com',
        phoneNumber: '555-333-4444',
        tags: [{
          id: generateId(),
          name: 'Designer',
          color: '#8b5cf6' // purple
        }],
        notes: 'Interior designer helping with layout and materials selection',
        profilePicture: 'https://picsum.photos/205',
        birthday: '1983-04-12',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    notes: [
      {
        id: generateId(),
        title: 'Kitchen Measurements',
        content: '# Kitchen Dimensions\n\n- Total space: 12\' x 14\'\n- Island: 3\' x 6\'\n- Ceiling height: 9\'\n- Window dimensions: 36\" x 48\"\n- Door clearance: 36\"',
        tags: [
          {
            id: generateId(),
            name: 'Measurements',
            color: '#06b6d4' // cyan
          }
        ],
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: []
      },
      {
        id: generateId(),
        title: 'Material Selections',
        content: '# Chosen Materials\n\n- Countertops: Quartz (Calacatta Laza)\n- Cabinets: White Shaker\n- Flooring: Waterproof vinyl planks\n- Backsplash: Subway tile (white)\n- Hardware: Brushed nickel',
        tags: [
          {
            id: generateId(),
            name: 'Materials',
            color: '#f59e0b' // amber
          }
        ],
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: []
      }
    ],
    attachments: [
      {
        id: generateId(),
        name: 'Kitchen Layout',
        url: 'https://picsum.photos/802/600',
        type: 'image'
      },
      {
        id: generateId(),
        name: 'Inspiration Photos',
        url: 'https://picsum.photos/803/600',
        type: 'image'
      }
    ]
  };

  // Add project to the store
  setTimeout(() => useProjectStore.getState().addProject(renovationProject as Project), 100);
  
  console.log(`Added Kitchen Renovation example project.`);
};

// Add vacation planning project (relatable to everyone)
export const addVacationProject = () => {
  const vacationTasks = [
    {
      id: generateId(),
      name: 'Research destination options',
      completed: true,
      completionHistory: {
        [new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()]: true
      },
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      recurrencePattern: 'one-time',
      category: 'Planning',
      priority: 'high',
      time: '120', // 2 hours
      schedule: []
    },
    {
      id: generateId(),
      name: 'Book flights',
      completed: false,
      completionHistory: {},
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      recurrencePattern: 'one-time',
      category: 'Bookings',
      priority: 'high',
      time: '60', // 1 hour
      schedule: []
    },
    {
      id: generateId(),
      name: 'Reserve hotel room',
      completed: false,
      completionHistory: {},
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      recurrencePattern: 'one-time',
      category: 'Bookings',
      priority: 'high',
      time: '45', // 45 minutes
      schedule: []
    },
    {
      id: generateId(),
      name: 'Create packing list',
      completed: false,
      completionHistory: {},
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      recurrencePattern: 'one-time',
      category: 'Planning',
      priority: 'medium',
      time: '30', // 30 minutes
      schedule: []
    },
    {
      id: generateId(),
      name: 'Arrange pet sitter',
      completed: false,
      completionHistory: {},
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      recurrencePattern: 'one-time',
      category: 'Arrangements',
      priority: 'medium',
      time: '20', // 20 minutes
      schedule: []
    }
  ];

  // Create vacation planning project
  const vacationProject = {
    id: generateId(),
    name: 'Summer Vacation',
    description: 'Plan a two-week summer vacation to the beach, including travel arrangements, accommodations, activities, and packing list.',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    tags: [
      {
        id: generateId(),
        name: 'Vacation',
        color: '#0ea5e9', // sky blue
      },
      {
        id: generateId(),
        name: 'Summer',
        color: '#f59e0b', // amber
      },
      {
        id: generateId(),
        name: 'Family',
        color: '#8b5cf6', // purple
      }
    ],
    status: 'in_progress' as 'pending' | 'in_progress' | 'completed' | 'past_deadline',
    priority: 'high' as 'low' | 'medium' | 'high',
    isArchived: false,
    isDeleted: false,
    tasks: vacationTasks,
    people: [
      {
        id: generateId(),
        name: 'Family Members',
        email: 'family@example.com',
        phoneNumber: '555-123-7890',
        tags: [{
          id: generateId(),
          name: 'Family',
          color: '#10b981' // green
        }],
        notes: 'Everyone traveling together',
        profilePicture: 'https://picsum.photos/206',
        birthday: '1980-01-01',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    notes: [
      {
        id: generateId(),
        title: 'Destination Research',
        content: '# Beach Options\n\n1. **Miami Beach, FL**\n   - Pro: Great nightlife\n   - Con: Crowded\n\n2. **Outer Banks, NC**\n   - Pro: More relaxed atmosphere\n   - Con: Weather can be unpredictable\n\n3. **Myrtle Beach, SC**\n   - Pro: Family-friendly activities\n   - Con: Tourist traps\n\n4. **San Diego, CA**\n   - Pro: Perfect weather\n   - Con: More expensive',
        tags: [
          {
            id: generateId(),
            name: 'Research',
            color: '#06b6d4' // cyan
          }
        ],
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: []
      },
      {
        id: generateId(),
        title: 'Budget Planning',
        content: '# Vacation Budget\n\n- Flights: $1,200\n- Hotel (13 nights): $2,600\n- Car rental: $450\n- Food: $1,000\n- Activities: $800\n- Souvenirs: $200\n- Miscellaneous: $300\n\n**Total Budget: $6,550**',
        tags: [
          {
            id: generateId(),
            name: 'Budget',
            color: '#ef4444' // red
          }
        ],
        createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: []
      }
    ],
    attachments: [
      {
        id: generateId(),
        name: 'Beach Photo',
        url: 'https://picsum.photos/804/600',
        type: 'image'
      }
    ]
  };

  // Add project to the store
  setTimeout(() => useProjectStore.getState().addProject(vacationProject as Project), 100);
  
  console.log(`Added Summer Vacation example project.`);
};

// Backwards compatibility function that adds all example projects
export const addDevProjects = () => {
  addWebsiteRedesignProject();
  addMobileAppProject();
  addHomeRenovationProject();
  addVacationProject();
  
  console.log(`Added all example projects.`);
};
