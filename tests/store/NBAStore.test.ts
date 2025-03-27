import { act } from 'react-test-renderer';
import { useNBAStore } from '../../store/NBAStore';
import { useProjectStore } from '../../store/ToDo';
import { useCalendarStore } from '../../store/CalendarStore';
import { useUserStore } from '../../store/UserStore';
import { nbaTeams } from '../../constants/nba';

// Mock AsyncStorage
jest.mock('../../store/AsyncStorage', () => ({
  createPersistStorage: () => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  }),
}));

// Mock the other stores
jest.mock('../../store/ToDo', () => ({
  useProjectStore: {
    getState: jest.fn(() => ({
      tasks: {},
      addTask: jest.fn(),
      deleteTask: jest.fn(),
    })),
  },
}));

jest.mock('../../store/CalendarStore', () => ({
  useCalendarStore: {
    getState: jest.fn(() => ({
      events: [],
      addEvent: jest.fn(),
      deleteEvent: jest.fn(),
    })),
  },
}));

jest.mock('../../store/UserStore', () => ({
  useUserStore: {
    getState: jest.fn(() => ({
      preferences: {
        showNBAGamesInCalendar: true,
        favoriteNBATeam: 'OKC',
      },
    })),
  },
}));

jest.mock('../../constants/nba', () => ({
  nbaTeams: [
    { code: 'OKC', name: 'Oklahoma City Thunder' },
    { code: 'LAL', name: 'Los Angeles Lakers' },
  ],
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => '2025-03-27'),
}));

describe('NBAStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset store to initial state
    act(() => {
      useNBAStore.getState().setGames([]);
      useNBAStore.getState().setTeamInfo('OKC', 'Oklahoma City Thunder');
      useNBAStore.getState().setLoading(false);
      useNBAStore.getState().setError(null);
    });
  });

  it('should set games', () => {
    const sampleGames = [
      {
        id: 1,
        date: '2025-03-30T19:00:00Z',
        homeTeam: 'Oklahoma City Thunder',
        awayTeam: 'Los Angeles Lakers',
        status: 'scheduled',
        season: 2025,
        teamCode: 'OKC',
      },
    ] as any;

    act(() => {
      useNBAStore.getState().setGames(sampleGames);
    });

    expect(useNBAStore.getState().games).toEqual(sampleGames);
  });

  it('should set team information', () => {
    act(() => {
      useNBAStore.getState().setTeamInfo('LAL', 'Los Angeles Lakers');
    });

    expect(useNBAStore.getState().teamCode).toBe('LAL');
    expect(useNBAStore.getState().teamName).toBe('Los Angeles Lakers');
  });

  it('should set loading state', () => {
    expect(useNBAStore.getState().isLoading).toBe(false);
    
    act(() => {
      useNBAStore.getState().setLoading(true);
    });

    expect(useNBAStore.getState().isLoading).toBe(true);
  });

  it('should set error state', () => {
    expect(useNBAStore.getState().error).toBeNull();
    
    act(() => {
      useNBAStore.getState().setError('Failed to fetch games');
    });

    expect(useNBAStore.getState().error).toBe('Failed to fetch games');
  });

  it('should delete all game tasks', () => {
    // Mock tasks with NBA games
    const mockTasks = {
      '1': { name: '🏀 Thunder vs Lakers', id: '1' },
      '2': { name: 'Regular task', id: '2' },
    };
    
    const mockDeleteTask = jest.fn();
    
    (useProjectStore.getState as jest.Mock).mockReturnValueOnce({
      tasks: mockTasks,
      deleteTask: mockDeleteTask,
    });

    act(() => {
      useNBAStore.getState().deleteAllGameTasks();
    });

    expect(mockDeleteTask).toHaveBeenCalledWith('1');
    expect(mockDeleteTask).not.toHaveBeenCalledWith('2');
  });

  it('should sync game tasks', () => {
    // Sample games - use a fixed date string for consistent testing
    const sampleGames = [
      {
        id: 1,
        date: '2025-04-15T19:00:00Z', // Future game
        homeTeam: 'Oklahoma City Thunder',
        awayTeam: 'Los Angeles Lakers',
        status: 'scheduled',
        season: 2025,
        teamCode: 'OKC',
      },
    ];

    const mockAddTask = jest.fn();
    const mockDeleteAllGameTasks = jest.spyOn(useNBAStore.getState(), 'deleteAllGameTasks');
    
    (useProjectStore.getState as jest.Mock).mockReturnValue({
      tasks: {},
      addTask: mockAddTask,
      deleteTask: jest.fn(),
    });

    act(() => {
      useNBAStore.getState().setGames(sampleGames as any);
      useNBAStore.getState().syncGameTasks();
    });

    expect(mockDeleteAllGameTasks).toHaveBeenCalled();
    expect(mockAddTask).toHaveBeenCalledWith(expect.objectContaining({
      name: expect.stringContaining('🏀 Thunder'),
      category: 'personal',
      priority: 'medium',
    }));
  });

  it('should clear NBA calendar events', () => {
    const mockEvents = [
      { id: '1', type: 'nba' },
      { id: '2', type: 'birthday' },
    ];
    
    const mockDeleteEvent = jest.fn();
    
    (useCalendarStore.getState as jest.Mock).mockReturnValue({
      events: mockEvents,
      deleteEvent: mockDeleteEvent,
    });

    act(() => {
      useNBAStore.getState().clearNBACalendarEvents();
    });

    expect(mockDeleteEvent).toHaveBeenCalledWith('1');
    expect(mockDeleteEvent).not.toHaveBeenCalledWith('2');
  });

  it('should sync NBA games to calendar', () => {
    // Sample games - use a fixed date string for consistent testing
    const sampleGames = [
      {
        id: 1,
        date: '2025-04-15T19:00:00Z', // Future game
        homeTeam: 'Oklahoma City Thunder',
        awayTeam: 'Los Angeles Lakers',
        status: 'scheduled',
        season: 2025,
        teamCode: 'OKC',
      },
    ];

    const mockAddEvent = jest.fn();
    const mockClearNBACalendarEvents = jest.spyOn(useNBAStore.getState(), 'clearNBACalendarEvents');
    
    (useCalendarStore.getState as jest.Mock).mockReturnValue({
      events: [],
      addEvent: mockAddEvent,
      deleteEvent: jest.fn(),
    });

    act(() => {
      useNBAStore.getState().setGames(sampleGames as any);
      useNBAStore.getState().syncNBAGames();
    });

    expect(mockClearNBACalendarEvents).toHaveBeenCalled();
    expect(mockAddEvent).toHaveBeenCalledWith(expect.objectContaining({
      title: expect.stringContaining('Oklahoma City Thunder'),
      type: 'nba',
      teamCode: 'OKC',
    }));
  });

  it('should not sync NBA games to calendar when preference is disabled', () => {
    (useUserStore.getState as jest.Mock).mockReturnValueOnce({
      preferences: {
        showNBAGamesInCalendar: false,
      },
    });

    const mockAddEvent = jest.fn();
    const mockClearNBACalendarEvents = jest.spyOn(useNBAStore.getState(), 'clearNBACalendarEvents');
    
    (useCalendarStore.getState as jest.Mock).mockReturnValue({
      events: [],
      addEvent: mockAddEvent,
      deleteEvent: jest.fn(),
    });

    act(() => {
      useNBAStore.getState().syncNBAGames();
    });

    expect(mockClearNBACalendarEvents).toHaveBeenCalled();
    expect(mockAddEvent).not.toHaveBeenCalled();
  });
});