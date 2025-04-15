import { getCurrentTeamCode, getESPNTeamCode, getNBASeason } from '../../services/nbaService';
import { useUserStore } from '../../store/UserStore'; 

jest.mock('../../store/UserStore');

const mockedUseUserStore = useUserStore as jest.Mocked<typeof useUserStore>;

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
    mockedUseUserStore.getState = jest.fn().mockReturnValue({
      preferences: {
        favoriteNBATeam: 'OKC', 
      },
    });
  });

  it('should get current team code from user preferences', () => {
    const teamCode = getCurrentTeamCode();
    expect(teamCode).toBe('OKC');
    expect(mockedUseUserStore.getState).toHaveBeenCalledTimes(1);
  });

  it('should get default team code if no preference set', () => {
    mockedUseUserStore.getState = jest.fn().mockReturnValue({
      preferences: {
        favoriteNBATeam: null,
      },
    });

    const teamCode = getCurrentTeamCode();
    expect(teamCode).toBe('OKC'); 
    expect(mockedUseUserStore.getState).toHaveBeenCalledTimes(1);
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
