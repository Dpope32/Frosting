// Mock AsyncStorage before importing UserStore
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  clear: jest.fn(() => Promise.resolve())
}));

import { defaultPreferences, useUserStore } from '@/store/UserStore';

describe('UserStore preferences', () => {
  beforeEach(() => {
    // Reset preferences to defaults before each test
    useUserStore.setState({ preferences: defaultPreferences });
  });

  test('initial preferences equal defaultPreferences', () => {
    const prefs = useUserStore.getState().preferences;
    expect(prefs).toEqual(defaultPreferences);
  });

  test('setPreferences merges new fields and preserves others', () => {
    const newPrefs = { primaryColor: '#FF0000', username: 'TestUser' };
    useUserStore.getState().setPreferences(newPrefs);
    const prefs = useUserStore.getState().preferences;
    expect(prefs.primaryColor).toBe(newPrefs.primaryColor);
    expect(prefs.username).toBe(newPrefs.username);
    // Unchanged field
    expect(prefs.notificationsEnabled).toBe(defaultPreferences.notificationsEnabled);
  });

  test('clearPreferences resets to defaultPreferences', () => {
    useUserStore.getState().setPreferences({ primaryColor: '#00FF00', username: 'AnotherUser' });
    // Ensure state changed
    expect(useUserStore.getState().preferences.primaryColor).toBe('#00FF00');

    useUserStore.getState().clearPreferences();
    const prefs = useUserStore.getState().preferences;
    expect(prefs).toEqual(defaultPreferences);
  });
});
