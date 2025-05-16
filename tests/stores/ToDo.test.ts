// --- Set up fake timers for date manipulation ---
jest.useFakeTimers();

// Mock AsyncStorage before importing ToDo store
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  clear: jest.fn(() => Promise.resolve())
}));

import { useProjectStore } from '@/store/ToDo';
import { Task } from '@/types';
import { format, subDays } from 'date-fns';

// Helper to create mock dates
const createDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Counter for generating unique task IDs in tests
let taskCounter = 0;

// Reusable task creation helper
const createMockTask = (
  overrides: Partial<Task> = {}
): Omit<Task, 'id' | 'completed' | 'completionHistory' | 'createdAt' | 'updatedAt'> => {
  // taskCounter is no longer needed for ID generation, but keep it for potential debug names if desired
  taskCounter++;
  return {
    name: overrides.name || `Test Task ${taskCounter}`, // Add counter to name for easier debugging
    schedule: overrides.schedule || ['monday', 'wednesday', 'friday'],
    priority: overrides.priority || 'medium',
    category: overrides.category || 'personal',
    recurrencePattern: overrides.recurrencePattern || 'weekly',
    ...overrides,
    // The store's addTask function generates the ID, completed, history, and timestamps
  };
};

// Helper to get today's date in YYYY-MM-DD format
const getTodayFormatted = () => format(new Date(), 'yyyy-MM-dd');

// Helper to set a specific date for testing
const mockSpecificDate = (dateString: string) => {
  const mockDate = createDate(dateString);
  jest.setSystemTime(mockDate);
};

describe('ToDoStore', () => {
  let dateNowSpy: jest.SpyInstance;
  let mockTimestamp = 1735711200000; // A fixed starting timestamp (Jan 1, 2025)

  // Reset store, timers, and mock Date.now before each test
  beforeEach(() => {
    useProjectStore.setState({
      tasks: {},
      hydrated: true,
      todaysTasks: []
    });
    // Mock Date.now to return a unique value for each call in tests
    dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => {
      mockTimestamp += 1000; // Increment by 1 second for uniqueness
      return mockTimestamp;
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    dateNowSpy.mockRestore(); // Restore original Date.now
    mockTimestamp = 1735711200000; // Reset timestamp for next test suite
  });

  /**
   * BASIC STORE OPERATIONS
   */
  
  test('initial state has empty tasks', () => {
    const { tasks, todaysTasks } = useProjectStore.getState();
    expect(tasks).toEqual({});
    expect(todaysTasks).toEqual([]);
  });

  test('addTask creates a task with default fields', () => {
    const mockTask = createMockTask();
    useProjectStore.getState().addTask(mockTask);
    
    const state = useProjectStore.getState();
    expect(Object.keys(state.tasks).length).toBe(1);
    
    const taskId = Object.keys(state.tasks)[0];
    const task = state.tasks[taskId];
    
    expect(task).toMatchObject({
      ...mockTask,
      id: expect.any(String),
      completed: false,
      completionHistory: {},
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });
  });

  test('bills get monthly recurrence pattern by default', () => {
    // Create bill without specifying recurrencePattern to test default behavior
    const billTask = createMockTask({ 
      name: 'Electric Bill',
      category: 'bills',
      dueDate: 15,
      recurrencePattern: undefined  // explicitly undefined so default kicks in
    });
    
    useProjectStore.getState().addTask(billTask);
    
    const state = useProjectStore.getState();
    const taskId = Object.keys(state.tasks)[0];
    expect(state.tasks[taskId].recurrencePattern).toBe('monthly');
  });

  test('deleteTask removes a task', () => {
    // Add task
    const mockTask = createMockTask();
    useProjectStore.getState().addTask(mockTask);
    
    // Verify task exists
    const state1 = useProjectStore.getState();
    const taskId = Object.keys(state1.tasks)[0];
    expect(state1.tasks[taskId]).toBeDefined();
    
    // Delete task
    useProjectStore.getState().deleteTask(taskId);
    
    // Verify task was removed
    const state2 = useProjectStore.getState();
    expect(state2.tasks[taskId]).toBeUndefined();
  });

  test('updateTask correctly modifies task fields', () => {
    // Add task
    const mockTask = createMockTask();
    useProjectStore.getState().addTask(mockTask);
    
    // Get task ID
    const state = useProjectStore.getState();
    const taskId = Object.keys(state.tasks)[0];
    
    // Update task
    useProjectStore.getState().updateTask(taskId, {
      name: 'Updated Task',
      priority: 'high'
    });
    
    // Verify updates
    const updatedState = useProjectStore.getState();
    const updatedTask = updatedState.tasks[taskId];
    
    expect(updatedTask.name).toBe('Updated Task');
    expect(updatedTask.priority).toBe('high');
    // Original fields should remain
    expect(updatedTask.category).toBe(mockTask.category);
  });

  test('clearing the schedule when setting recurrencePattern to one-time', () => {
    // Add recurring task
    const mockTask = createMockTask({
      name: 'Weekly to One-time',
      recurrencePattern: 'weekly',
      schedule: ['monday', 'wednesday']
    });
    
    useProjectStore.getState().addTask(mockTask);
    
    // Get task ID
    const state = useProjectStore.getState();
    const taskId = Object.keys(state.tasks)[0];
    
    // Update to one-time
    useProjectStore.getState().updateTask(taskId, {
      recurrencePattern: 'one-time'
    });
    
    // Verify schedule is cleared
    const updatedState = useProjectStore.getState();
    expect(updatedState.tasks[taskId].schedule).toEqual([]);
  });

  /**
   * TASK COMPLETION LOGIC
   */
  
  test('toggleTaskCompletion marks task as completed for today', () => {
    // Add task
    const mockTask = createMockTask();
    useProjectStore.getState().addTask(mockTask);
    
    // Get task ID
    const state = useProjectStore.getState();
    const taskId = Object.keys(state.tasks)[0];
    
    // Toggle completion
    useProjectStore.getState().toggleTaskCompletion(taskId);
    
    // Verify task is marked complete for today
    const updatedState = useProjectStore.getState();
    const updatedTask = updatedState.tasks[taskId];
    const todayStr = getTodayFormatted();
    
    expect(updatedTask.completed).toBe(true);
    expect(updatedTask.completionHistory[todayStr]).toBe(true);
  });

  test('toggleTaskCompletion a second time marks task as incomplete', () => {
    // Add task
    const mockTask = createMockTask();
    useProjectStore.getState().addTask(mockTask);
    
    // Get task ID
    const state = useProjectStore.getState();
    const taskId = Object.keys(state.tasks)[0];
    
    // Toggle completion twice
    useProjectStore.getState().toggleTaskCompletion(taskId);
    useProjectStore.getState().toggleTaskCompletion(taskId);
    
    // Verify task is marked incomplete
    const updatedState = useProjectStore.getState();
    const updatedTask = updatedState.tasks[taskId];
    const todayStr = getTodayFormatted();
    
    expect(updatedTask.completed).toBe(false);
    expect(updatedTask.completionHistory[todayStr]).toBe(false);
  });

  test('completed history older than 30 days gets cleaned', () => {
    // Create task with 31-day old completion
    const mockTask = createMockTask();
    useProjectStore.getState().addTask(mockTask);
    
    // Get task ID
    const state = useProjectStore.getState();
    const taskId = Object.keys(state.tasks)[0];
    
    // Manually set an old history entry (31 days ago)
    const thirtyOneDaysAgo = format(subDays(new Date(), 31), 'yyyy-MM-dd');
    const task = state.tasks[taskId];
    task.completionHistory = {
      [thirtyOneDaysAgo]: true
    };
    useProjectStore.setState({ tasks: { ...state.tasks } });
    
    // Toggle completion to trigger history cleanup
    useProjectStore.getState().toggleTaskCompletion(taskId);
    
    // Verify old history was cleaned
    const updatedState = useProjectStore.getState();
    const updatedTask = updatedState.tasks[taskId];
    
    expect(updatedTask.completionHistory[thirtyOneDaysAgo]).toBeUndefined();
    expect(Object.keys(updatedTask.completionHistory).length).toBe(1); // Only today
  });

  /**
   * TASK FILTERING LOGIC
   * 
   * These tests verify the core logic that determines which tasks are shown on a given day
   */
  
  /**
   * ONE-TIME TASKS
   */
  test('one-time tasks always show until completed', () => {
    // Mock a specific date
    mockSpecificDate('2025-01-01');
    const todayStr = getTodayFormatted();
    
    // Add one-time task
    const mockTask = createMockTask({
      name: 'One-time Test',
      recurrencePattern: 'one-time',
      schedule: []
    });
    
    useProjectStore.getState().addTask(mockTask);
    
    // Task should appear in today's tasks
    let todaysTasks = useProjectStore.getState().getTodaysTasks();
    expect(todaysTasks.length).toBe(1);
    
    // Complete the task
    const taskId = Object.keys(useProjectStore.getState().tasks)[0];
    useProjectStore.getState().toggleTaskCompletion(taskId);
    
    // Task should still appear today (for untoggling if needed)
    todaysTasks = useProjectStore.getState().getTodaysTasks();
    expect(todaysTasks.length).toBe(1);
    
    // Move to next day
    mockSpecificDate('2025-01-02');
    useProjectStore.getState().recalculateTodaysTasks();
    
    // Task should not appear anymore (completed one-time tasks don't show on future days)
    todaysTasks = useProjectStore.getState().getTodaysTasks();
    expect(todaysTasks.length).toBe(0);
  });

  test('completed one-time tasks still show on completion day', () => {
    // Add one-time task
    const mockTask = createMockTask({
      name: 'One-time Test',
      recurrencePattern: 'one-time',
      schedule: []
    });
    
    useProjectStore.getState().addTask(mockTask);
    
    // Complete the task
    const taskId = Object.keys(useProjectStore.getState().tasks)[0];
    useProjectStore.getState().toggleTaskCompletion(taskId);
    
    // Task should still be in today's tasks
    const todaysTasks = useProjectStore.getState().getTodaysTasks();
    expect(todaysTasks.length).toBe(1);
  });

  /**
   * BIRTHDAY TASKS
   */
  test('birthday tasks appear on the scheduled date', () => {
    // Set date to January 1st
    mockSpecificDate('2025-01-01');
    
    // In the isTaskDue function, birthdays require:
    // 1. The name to contain "birthday" or 🎂 or 🎁
    // 2. A scheduledDate to be set
    // 3. That scheduledDate to match today's date
    const birthdayTask = createMockTask({
      name: "Jane's birthday 🎂",
      recurrencePattern: 'one-time',
      scheduledDate: '2025-01-01', // Matches current mock date
      schedule: [],
      category: 'personal'
    });
    
    useProjectStore.getState().addTask(birthdayTask);
    useProjectStore.getState().recalculateTodaysTasks();
    
    // Task should appear today
    let todaysTasks = useProjectStore.getState().getTodaysTasks();
    expect(todaysTasks.length).toBe(1);
  });

  test('birthday tasks use month-day matching as fallback', () => {
    // Set date to January 1st, 2026
    mockSpecificDate('2026-01-01');
    
    // Birthday from a previous year (2025) should still show today (2026)
    // if the month-day matches (both Jan 1)
    const birthdayTask = createMockTask({
      name: "Jane's birthday 🎂",
      recurrencePattern: 'one-time',
      scheduledDate: '2025-01-01',  // Different year from mock date
      schedule: [],
      category: 'personal'
    });
    
    useProjectStore.getState().addTask(birthdayTask);
    useProjectStore.getState().recalculateTodaysTasks();
    
    // Should still appear because month-day matches (1-1)
    let todaysTasks = useProjectStore.getState().getTodaysTasks();
    expect(todaysTasks.length).toBe(1);
  });

  /**
   * TOMORROW TASKS
   */
  test('tomorrow tasks appear the day after creation', () => {
    // Set date to January 1st
    mockSpecificDate('2025-01-01');
    
    // Add 'tomorrow' task
    const tomorrowTask = createMockTask({
      name: "Do this tomorrow",
      recurrencePattern: 'tomorrow',
      schedule: []
    });
    
    useProjectStore.getState().addTask(tomorrowTask);
    
    // Should NOT appear on creation date
    let todaysTasks = useProjectStore.getState().getTodaysTasks();
    expect(todaysTasks.length).toBe(0);
    
    // Set date to January 2nd (next day)
    mockSpecificDate('2025-01-02');
    useProjectStore.getState().recalculateTodaysTasks();
    
    // Should appear the day after creation
    todaysTasks = useProjectStore.getState().getTodaysTasks();
    expect(todaysTasks.length).toBe(1);
    
    // Task should be converted to one-time
    const task = todaysTasks[0];
    
    // First we need to wait for the setTimeout to execute
    jest.runAllTimers();
    
    // Get the updated task from the store
    const updatedTask = useProjectStore.getState().tasks[task.id];
    expect(updatedTask.recurrencePattern).toBe('one-time');
  });

  /**
   * EVERYDAY TASKS
   */
  test('everyday tasks appear every day', () => {
    // Add everyday task
    const everydayTask = createMockTask({
      name: "Daily task",
      recurrencePattern: 'everyday',
    });
    
    useProjectStore.getState().addTask(everydayTask);
    
    // Should appear on any date
    let days = ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04'];
    
    days.forEach(day => {
      mockSpecificDate(day);
      useProjectStore.getState().recalculateTodaysTasks();
      const todaysTasks = useProjectStore.getState().getTodaysTasks();
      expect(todaysTasks.length).toBe(1);
    });
  });

  /**
   * WEEKLY TASKS
   */
  test('weekly tasks appear only on scheduled days', () => {
    // Add weekly task for Monday and Wednesday
    const weeklyTask = createMockTask({
      name: "Weekly task",
      recurrencePattern: 'weekly',
      schedule: ['monday', 'wednesday']
    });
    
    useProjectStore.getState().addTask(weeklyTask);
    
    // Monday (2025-01-06) - Should appear
    mockSpecificDate('2025-01-06'); // Monday
    useProjectStore.getState().recalculateTodaysTasks();
    expect(useProjectStore.getState().getTodaysTasks().length).toBe(1);
    
    // Tuesday (2025-01-07) - Should NOT appear
    mockSpecificDate('2025-01-07'); // Tuesday
    useProjectStore.getState().recalculateTodaysTasks();
    expect(useProjectStore.getState().getTodaysTasks().length).toBe(0);
    
    // Wednesday (2025-01-08) - Should appear
    mockSpecificDate('2025-01-08'); // Wednesday
    useProjectStore.getState().recalculateTodaysTasks();
    expect(useProjectStore.getState().getTodaysTasks().length).toBe(1);
  });

  /**
   * BIWEEKLY TASKS
   */
  test('biweekly tasks appear on scheduled days every other week', () => {
    // Mock specific date (Monday)
    mockSpecificDate('2025-01-06'); // Monday
    
    // Add biweekly task for Mondays 
    const biweeklyTask = createMockTask({
      name: "Biweekly task",
      recurrencePattern: 'biweekly',
      schedule: ['monday'],
      // Set recurrence date to today so it starts on current week
      recurrenceDate: format(new Date(), 'yyyy-MM-dd')
    });
    
    useProjectStore.getState().addTask(biweeklyTask);
    
    // First Monday (2025-01-06) - Should appear
    expect(useProjectStore.getState().getTodaysTasks().length).toBe(1);
    
    // Next Monday (2025-01-13) - Should NOT appear (odd week)
    mockSpecificDate('2025-01-13'); // Next Monday
    useProjectStore.getState().recalculateTodaysTasks();
    expect(useProjectStore.getState().getTodaysTasks().length).toBe(0);
    
    // Two weeks later (2025-01-20) - Should appear (even week)
    mockSpecificDate('2025-01-20'); // Two weeks later
    useProjectStore.getState().recalculateTodaysTasks();
    expect(useProjectStore.getState().getTodaysTasks().length).toBe(1);
  });

  /**
   * MONTHLY TASKS
   */
  test('monthly tasks appear on the same day each month', () => {
    // Mock specific date (15th of January)
    mockSpecificDate('2025-01-15');
    
    // Add monthly task that recurs on the 15th
    const monthlyTask = createMockTask({
      name: "Monthly task",
      recurrencePattern: 'monthly',
      // Set recurrence date to 15th
      recurrenceDate: '2025-01-15',
      // Use a non-'bills' category as those are handled separately
      category: 'personal'
    });
    
    useProjectStore.getState().addTask(monthlyTask);
    useProjectStore.getState().recalculateTodaysTasks();
    
    // January 15th - Should appear
    expect(useProjectStore.getState().getTodaysTasks().length).toBe(1);
    
    // January 16th - Should NOT appear
    mockSpecificDate('2025-01-16');
    useProjectStore.getState().recalculateTodaysTasks();
    expect(useProjectStore.getState().getTodaysTasks().length).toBe(0);
    
    // February 15th - Should appear
    mockSpecificDate('2025-02-15');
    useProjectStore.getState().recalculateTodaysTasks();
    expect(useProjectStore.getState().getTodaysTasks().length).toBe(1);
  });

  /**
   * BILLS
   */
  test('bill tasks appear on their due date', () => {
    // Add a bill due on the 20th
    const billTask = createMockTask({
      name: "Electric Bill",
      category: 'bills',
      dueDate: 20
    });
    
    useProjectStore.getState().addTask(billTask);
    
    // January 19th - Should NOT appear
    mockSpecificDate('2025-01-19');
    useProjectStore.getState().recalculateTodaysTasks();
    expect(useProjectStore.getState().getTodaysTasks().length).toBe(0);
    
    // January 20th - Should appear
    mockSpecificDate('2025-01-20');
    useProjectStore.getState().recalculateTodaysTasks();
    expect(useProjectStore.getState().getTodaysTasks().length).toBe(1);
    
    // February 20th - Should appear again
    mockSpecificDate('2025-02-20');
    useProjectStore.getState().recalculateTodaysTasks();
    expect(useProjectStore.getState().getTodaysTasks().length).toBe(1);
  });

  /**
   * YEARLY TASKS
   */
  test('yearly tasks appear on the same day each year', () => {
    // Mock specific date (March 15th 2025)
    mockSpecificDate('2025-03-15');
    
    // Add yearly task
    const yearlyTask = createMockTask({
      name: "Annual Review",
      recurrencePattern: 'yearly',
      // Set recurrence date to March 15th
      recurrenceDate: '2025-03-15'
    });
    
    useProjectStore.getState().addTask(yearlyTask);
    useProjectStore.getState().recalculateTodaysTasks();
    
    // March 15th 2025 - Should appear
    expect(useProjectStore.getState().getTodaysTasks().length).toBe(1);
    
    // March 16th 2025 - Should NOT appear
    mockSpecificDate('2025-03-16');
    useProjectStore.getState().recalculateTodaysTasks();
    expect(useProjectStore.getState().getTodaysTasks().length).toBe(0);
    
    // March 15th 2026 - Should appear
    mockSpecificDate('2026-03-15');
    useProjectStore.getState().recalculateTodaysTasks();
    expect(useProjectStore.getState().getTodaysTasks().length).toBe(1);
  });

  /**
   * TASK SORTING
   */
  test('completed tasks are sorted to the bottom', () => {
    // Mock date
    mockSpecificDate('2025-01-01');
    
    // Add three tasks - set schedule to match today's day (wednesday for 2025-01-01)
    // so the tasks actually show up in todaysTasks
    const task1 = createMockTask({ name: "Task 1", priority: 'high', schedule: ['wednesday'] });
    const task2 = createMockTask({ name: "Task 2", priority: 'medium', schedule: ['wednesday'] });
    const task3 = createMockTask({ name: "Task 3", priority: 'low', schedule: ['wednesday'] });
    
    useProjectStore.getState().addTask(task1);
    useProjectStore.getState().addTask(task2);
    useProjectStore.getState().addTask(task3);
    useProjectStore.getState().recalculateTodaysTasks();
    
    // Get task IDs
    const state = useProjectStore.getState();
    const taskIds = Object.keys(state.tasks);
    
    // Complete the high priority task
    useProjectStore.getState().toggleTaskCompletion(taskIds[0]);
    
    // Get sorted tasks
    const todaysTasks = useProjectStore.getState().getTodaysTasks();
    
    // Verify we have all 3 tasks
    expect(todaysTasks.length).toBe(3);
    
    // Completed task should be last
    expect(todaysTasks[0].name).not.toBe("Task 1");
    expect(todaysTasks[2].name).toBe("Task 1");
  });

  test('non-completed tasks are sorted by priority', () => {
    // Mock date for consistency
    mockSpecificDate('2025-01-01'); // Wednesday
    
    // Add tasks with different priorities - matching today's day of week
    const lowTask = createMockTask({ name: "Low Priority", priority: 'low', schedule: ['wednesday'] });
    const mediumTask = createMockTask({ name: "Medium Priority", priority: 'medium', schedule: ['wednesday'] });
    const highTask = createMockTask({ name: "High Priority", priority: 'high', schedule: ['wednesday'] });
    
    useProjectStore.getState().addTask(lowTask);
    useProjectStore.getState().addTask(mediumTask); 
    useProjectStore.getState().addTask(highTask);
    useProjectStore.getState().recalculateTodaysTasks();
    
    // Get sorted tasks
    const todaysTasks = useProjectStore.getState().getTodaysTasks();
    
    // Verify we have all 3 tasks
    expect(todaysTasks.length).toBe(3);
    
    // Should be sorted high -> medium -> low
    expect(todaysTasks[0].name).toBe("High Priority");
    expect(todaysTasks[1].name).toBe("Medium Priority");
    expect(todaysTasks[2].name).toBe("Low Priority");
  });

  test('tasks with time come before tasks without time', () => {
    // Mock date for consistency
    mockSpecificDate('2025-01-01'); // Wednesday
    
    // Add tasks with and without time - matching today's day of week
    const taskWithTime = createMockTask({ 
      name: "With Time", 
      time: "10:00",
      priority: 'low', // Lower priority but has time
      schedule: ['wednesday']
    });
    
    const taskWithoutTime = createMockTask({ 
      name: "Without Time", 
      priority: 'high', // Higher priority but no time
      schedule: ['wednesday']
    });
    
    useProjectStore.getState().addTask(taskWithTime);
    useProjectStore.getState().addTask(taskWithoutTime); 
    useProjectStore.getState().recalculateTodaysTasks();
    
    // Get sorted tasks
    const todaysTasks = useProjectStore.getState().getTodaysTasks();
    
    // Verify we have both tasks
    expect(todaysTasks.length).toBe(2);
    
    // Task with time should come first even with lower priority
    expect(todaysTasks[0].name).toBe("With Time");
    expect(todaysTasks[1].name).toBe("Without Time");
  });

  test('tasks with times are sorted chronologically', () => {
    // Mock date for consistency
    mockSpecificDate('2025-01-01'); // Wednesday
    
    // Add tasks with different times - matching today's day of week
    const earlyTask = createMockTask({ 
      name: "Early", 
      time: "08:00", 
      schedule: ['wednesday']
    });
    
    const midTask = createMockTask({ 
      name: "Mid", 
      time: "12:00", 
      schedule: ['wednesday']
    });
    
    const lateTask = createMockTask({ 
      name: "Late", 
      time: "18:00", 
      schedule: ['wednesday']
    });
    
    // Add out of order
    useProjectStore.getState().addTask(lateTask);
    useProjectStore.getState().addTask(earlyTask);
    useProjectStore.getState().addTask(midTask);
    useProjectStore.getState().recalculateTodaysTasks();
    
    // Get sorted tasks
    const todaysTasks = useProjectStore.getState().getTodaysTasks();
    
    // Verify we have all 3 tasks
    expect(todaysTasks.length).toBe(3);
    
    // Should be sorted by time
    expect(todaysTasks[0].name).toBe("Early");
    expect(todaysTasks[1].name).toBe("Mid");
    expect(todaysTasks[2].name).toBe("Late");
  });

  /**
   * PERSISTENCE AND REHYDRATION
   */
  test('midnight rollover keeps recurring tasks visible', () => {
    // Set date to January 1st
    mockSpecificDate('2025-01-01');
    
    // Add a recurring task
    const weeklyTask = createMockTask({
      name: "Weekly Meeting",
      recurrencePattern: 'weekly',
      schedule: ['wednesday']
    });
    
    useProjectStore.getState().addTask(weeklyTask);
    
    // Set to Wednesday Jan 1 and mark complete
    mockSpecificDate('2025-01-01'); // Wednesday
    useProjectStore.getState().recalculateTodaysTasks();
    const taskId = Object.keys(useProjectStore.getState().tasks)[0];
    useProjectStore.getState().toggleTaskCompletion(taskId);
    
    // Task should be marked as completed for today
    expect(useProjectStore.getState().tasks[taskId].completed).toBe(true);
    
    // Move to next Wednesday
    mockSpecificDate('2025-01-08'); // Next Wednesday
    useProjectStore.getState().recalculateTodaysTasks();
    
    // Task should appear again and be marked as not completed
    const todaysTasks = useProjectStore.getState().getTodaysTasks();
    expect(todaysTasks.length).toBe(1);
    expect(todaysTasks[0].completed).toBe(false);
  });
});
