import { getCurrentTeamCode, getESPNTeamCode, getNBASeason } from '../../services/nbaService';

// Create a mock function for useUserStore
const mockUseUserStore = jest.fn();

jest.mock('../../store/UserStore', () => ({
  useUserStore: () => mockUseUserStore()
}));

// Mock constants/nba
jest.mock('../../constants/nba', () => ({
  espnTeamCodes: {
    'OKC': 'okc',
    'LAL': 'lal'
  },
  getCurrentNBASeason: jest.fn(() => 2025)
}));

describe('nbaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation
    mockUseUserStore.mockReturnValue({
      preferences: {
        favoriteNBATeam: 'OKC'
      }
    });
  });

  it('should get current team code from user preferences', () => {
    const teamCode = getCurrentTeamCode();
    expect(teamCode).toBe('OKC');
    expect(mockUseUserStore).toHaveBeenCalled();
  });

  it('should get default team code if no preference set', () => {
    mockUseUserStore.mockReturnValueOnce({
      preferences: {
        favoriteNBATeam: null
      }
    });
    
    const teamCode = getCurrentTeamCode();
    expect(teamCode).toBe('OKC');
    expect(mockUseUserStore).toHaveBeenCalled();
  });

  it('should convert team code to ESPN format', () => {
    expect(getESPNTeamCode('OKC')).toBe('okc');
    expect(getESPNTeamCode('LAL')).toBe('lal');
    expect(getESPNTeamCode('UNKNOWN')).toBe('okc');
  });

  it('should get current NBA season', () => {
    const season = getNBASeason();
    expect(season).toBe(2025);
  });
});