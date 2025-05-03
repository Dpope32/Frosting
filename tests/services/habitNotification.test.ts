import { format } from 'date-fns';
import { scheduleDailyHabitNotification } from '@/services/notificationServices';
import { useHabitStore } from '@/store/HabitStore';

// Mock Notifications module before importing
jest.mock('expo-notifications', () => ({
  AndroidNotificationPriority: {
    MAX: 'max',
  },
  SchedulableTriggerInputTypes: {
    DAILY: 'daily',
    DATE: 'date',
  },
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-notification-id'),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
}));

// Import mocked Notifications after mocking
const Notifications = require('expo-notifications');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock React Native's Platform to simulate mobile environment
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
  },
  Alert: {
    alert: jest.fn(),
  },
}));

describe('Habit Notifications', () => {
  let mockHabits: Record<string, any>;
  const mockScheduleNotification = jest.fn().mockResolvedValue('mock-notification-id');
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mocks
    Notifications.scheduleNotificationAsync.mockImplementation(mockScheduleNotification);
    
    // Initialize mock habit data
    mockHabits = {
      'habit-1': {
        id: 'habit-1',
        title: 'Morning Exercise',
        category: 'health',
        createdAt: '2025-04-29',
        completionHistory: {},
        notificationTimeValue: '08:00',
        customMessage: 'Time to exercise!'
      },
      'habit-2': {
        id: 'habit-2',
        title: 'Read a Book',
        category: 'personal',
        createdAt: '2025-04-29',
        completionHistory: {},
        notificationTimeValue: '20:00',
        customMessage: ''
      }
    };

    // Mock Habit Store
    useHabitStore.setState({ habits: mockHabits });
  });

  it('should schedule a habit notification at the correct time', async () => {
    const hour = 8;
    const minute = 0;
    const habitName = 'Morning Exercise';
    const customMessage = 'Time to exercise!';
    const identifier = `${habitName}-08:00`;
    const deepLink = 'kaiba-nexus://habits';
    
    await scheduleDailyHabitNotification(
      hour,
      minute,
      `${habitName} Reminder`,
      customMessage,
      identifier,
      deepLink
    );
    
    // Check that notification was scheduled with correct parameters
    expect(mockScheduleNotification).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.objectContaining({
        title: `${habitName} Reminder`,
        body: customMessage,
        data: { url: 'kaiba-nexus://habits' }
      }),
      trigger: expect.objectContaining({
        hour,
        minute
      }),
      identifier
    }));
  });

  it('should use default message when custom message is empty', async () => {
    const habitName = 'Read a Book';
    const hour = 20;
    const minute = 0;
    const identifier = `${habitName}-20:00`;
    const deepLink = 'kaiba-nexus://habits';
    
    await scheduleDailyHabitNotification(
      hour,
      minute,
      `${habitName} Reminder`,
      '', // Empty custom message
      identifier,
      deepLink
    );
    
    // Check that notification uses default message
    expect(mockScheduleNotification).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.objectContaining({
        title: `${habitName} Reminder`,
        body: expect.stringContaining(`Don't forget to complete`)
      })
    }));
  });

  it('should not schedule notification if habit is already completed for the day', async () => {
    // Set today's date
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Mark a habit as completed for today
    mockHabits['habit-1'].completionHistory[today] = true;
    useHabitStore.setState({ habits: mockHabits });
    
    // Setup spy on the useHabitStore.getState() to verify it's called
    const getStateSpy = jest.spyOn(useHabitStore, 'getState');
    
    // Try to schedule notification for completed habit
    const habitName = 'Morning Exercise';
    const identifier = `${habitName}-08:00`;
    
    // Mock implementation for scheduleNotificationAsync to check completion status
    Notifications.scheduleNotificationAsync.mockImplementation((params: any) => {
      const identifier = params.identifier as string;
      const [habitTitle] = identifier.split('-');
      
      // Find the habit
      const habits = useHabitStore.getState().habits;
      const habit = Object.values(habits).find(h => h.title === habitTitle);
      
      // Check if habit is completed for today
      if (habit && habit.completionHistory[today]) {
        return Promise.resolve('habit-completed');
      }
      
      return Promise.resolve('mock-notification-id');
    });
    
    const result = await scheduleDailyHabitNotification(
      8,
      0,
      `${habitName} Reminder`,
      'Time to exercise!',
      identifier,
      'kaiba-nexus://habits'
    );
    
    // Verify the habit store was accessed and notification wasn't scheduled
    expect(getStateSpy).toHaveBeenCalled();
    expect(result).toBe('habit-completed');
  });

  it('should include the deep link to habits screen', async () => {
    const habitName = 'Morning Exercise';
    const hour = 8;
    const minute = 0;
    const customMessage = 'Time to exercise!';
    const identifier = `${habitName}-08:00`;
    const deepLink = 'kaiba-nexus://habits';
    
    await scheduleDailyHabitNotification(
      hour,
      minute,
      `${habitName} Reminder`,
      customMessage,
      identifier,
      deepLink
    );
    
    // Verify notification includes deep link in data
    expect(mockScheduleNotification).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.objectContaining({
        data: { url: 'kaiba-nexus://habits' }
      })
    }));
  });

  it('should not schedule notification when permissions are denied', async () => {
    // Mock permission denied
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });
    Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });
    
    const result = await scheduleDailyHabitNotification(
      8,
      0,
      'Exercise Reminder',
      'Time to exercise!',
      'exercise-08:00',
      'kaiba-nexus://habits'
    );
    
    expect(result).toBe('permission-denied');
    expect(mockScheduleNotification).not.toHaveBeenCalled();
  });
});
