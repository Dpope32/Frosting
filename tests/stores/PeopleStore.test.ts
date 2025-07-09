import { usePeopleStore } from '@/store/People';
import type { Person } from '@/types';

// Mock AsyncStorage BEFORE any imports
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock expo-notifications BEFORE any imports to prevent warnings
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  setNotificationHandler: jest.fn(),
  AndroidNotificationPriority: { HIGH: 'high', DEFAULT: 'default' },
  SchedulableTriggerInputTypes: { DATE: 'date', TIME_INTERVAL: 'timeInterval' },
}));

// Mock notification services to prevent expo-notifications warnings
jest.mock('@/services/notificationServices', () => ({
  scheduleHabitNotification: jest.fn(),
  cancelHabitNotification: jest.fn(),
  updateHabitNotification: jest.fn(),
  clearAllHabitNotifications: jest.fn(),
}));

// Mock the sync utilities
jest.mock('@/components/sync/syncUtils', () => ({
  addSyncLog: jest.fn(),
}));

// Mock StorageUtils
jest.mock('@/store/AsyncStorage', () => ({
  StorageUtils: {
    set: jest.fn(() => Promise.resolve()),
    get: jest.fn(() => Promise.resolve({})),
  },
  createPersistStorage: jest.fn(() => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  })),
}));

// Mock calendar store to prevent birthday sync issues
jest.mock('@/store', () => ({
  useCalendarStore: {
    getState: jest.fn(() => ({
      addEvent: jest.fn(),
    })),
  },
}));

describe('PeopleStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    usePeopleStore.setState({
      contacts: {},
      isSyncEnabled: false,
    });
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const createTestPerson = (overrides: Partial<Person> = {}): Person => ({
    id: 'test-id-' + Math.random(),
    name: 'Test Person',
    email: 'test@example.com',
    phoneNumber: '(555) 123-4567',
    birthday: '1990-01-01',
    occupation: 'Developer',
    relationship: 'Friend',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TX',
      zipCode: '12345',
      country: 'USA'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    priority: false,
    ...overrides,
  });

  test('addPerson adds a new person', async () => {
    const personData = createTestPerson();
    const result = await usePeopleStore.getState().addPerson(personData);
    
    // Check that the person was returned with expected properties
    expect(result.name).toBe(personData.name);
    expect(result.email).toBe(personData.email);
    expect(result.phoneNumber).toBe(personData.phoneNumber);
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeDefined();
    expect(result.updatedAt).toBeDefined();
    
    // Check that the person was stored
    const storedPerson = usePeopleStore.getState().contacts[result.id];
    expect(storedPerson).toBeDefined();
    expect(storedPerson.name).toBe(personData.name);
  });

  test('updatePerson updates existing person', () => {
    const person = createTestPerson();
    usePeopleStore.setState({ contacts: { [person.id]: person } });
    
    const updates = { name: 'Updated Name', occupation: 'Designer' };
    usePeopleStore.getState().updatePerson(person.id, updates);
    
    const updatedPerson = usePeopleStore.getState().contacts[person.id];
    expect(updatedPerson.name).toBe('Updated Name');
    expect(updatedPerson.occupation).toBe('Designer');
    expect(updatedPerson.updatedAt).toBeDefined();
  });

  test('deletePerson soft deletes the person', () => {
    const person = createTestPerson();
    usePeopleStore.setState({ contacts: { [person.id]: person } });
    
    // Verify person exists and is not deleted
    expect(usePeopleStore.getState().contacts[person.id]).toBeDefined();
    expect(usePeopleStore.getState().contacts[person.id].deletedAt).toBeUndefined();
    
    // Delete the person
    usePeopleStore.getState().deletePerson(person.id);
    
    // Person should still exist but be marked as deleted
    const deletedPerson = usePeopleStore.getState().contacts[person.id];
    expect(deletedPerson).toBeDefined();
    expect(deletedPerson.deletedAt).toBeDefined();
    expect(deletedPerson.updatedAt).toBeDefined();
  });

  test('deletePerson handles non-existent person', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    usePeopleStore.getState().deletePerson('non-existent-id');
    
    expect(consoleSpy).toHaveBeenCalledWith('❌ PeopleStore: Person with id non-existent-id not found');
    consoleSpy.mockRestore();
  });

  test('getActiveContacts filters out deleted contacts', () => {
    const activePerson = createTestPerson({ id: 'active', name: 'Active Person' });
    const deletedPerson = createTestPerson({ 
      id: 'deleted', 
      name: 'Deleted Person',
      deletedAt: new Date().toISOString()
    });
    
    usePeopleStore.setState({
      contacts: {
        [activePerson.id]: activePerson,
        [deletedPerson.id]: deletedPerson,
      }
    });
    
    const activeContacts = usePeopleStore.getState().getActiveContacts();
    
    expect(activeContacts).toHaveLength(1);
    expect(activeContacts[0].id).toBe('active');
    expect(activeContacts[0].name).toBe('Active Person');
  });

  test('clearContacts clears all contacts', () => {
    const person = createTestPerson();
    usePeopleStore.setState({ contacts: { [person.id]: person } });
    
    expect(Object.keys(usePeopleStore.getState().contacts)).toHaveLength(1);
    
    usePeopleStore.getState().clearContacts();
    
    expect(usePeopleStore.getState().contacts).toEqual({});
  });

  test('togglePeopleSync toggles sync state', () => {
    expect(usePeopleStore.getState().isSyncEnabled).toBe(false);
    
    usePeopleStore.getState().togglePeopleSync();
    expect(usePeopleStore.getState().isSyncEnabled).toBe(true);
    
    usePeopleStore.getState().togglePeopleSync();
    expect(usePeopleStore.getState().isSyncEnabled).toBe(false);
  });

  test('hydrateFromSync skips when local sync is disabled', () => {
    usePeopleStore.setState({ isSyncEnabled: false });
    
    const person = createTestPerson();
    usePeopleStore.getState().hydrateFromSync?.({
      contacts: { [person.id]: person },
      isSyncEnabled: true
    });
    
    expect(usePeopleStore.getState().contacts).toEqual({});
  });

  test('hydrateFromSync ignores incoming sync state when local sync is enabled', () => {
    usePeopleStore.setState({ isSyncEnabled: true });
    
    const person = createTestPerson();
    usePeopleStore.getState().hydrateFromSync?.({
      contacts: { [person.id]: person },
      isSyncEnabled: false  // This should be ignored now
    });
    
    // Should hydrate contacts because LOCAL sync is enabled, regardless of incoming sync state
    expect(usePeopleStore.getState().contacts).toEqual({ [person.id]: person });
    // Should preserve local sync preference
    expect(usePeopleStore.getState().isSyncEnabled).toBe(true);
  });

  test('hydrateFromSync skips when local sync is disabled regardless of incoming sync state', () => {
    usePeopleStore.setState({ isSyncEnabled: false });
    
    const person = createTestPerson();
    usePeopleStore.getState().hydrateFromSync?.({
      contacts: { [person.id]: person },
      isSyncEnabled: true  // This should be ignored when local sync is OFF
    });
    
    // Should NOT hydrate contacts because LOCAL sync is disabled
    expect(usePeopleStore.getState().contacts).toEqual({});
    // Should preserve local sync preference
    expect(usePeopleStore.getState().isSyncEnabled).toBe(false);
  });

  test('hydrateFromSync handles person deletions', () => {
    // Enable sync
    usePeopleStore.setState({ isSyncEnabled: true });
    
    // Add a local person
    const localPerson = createTestPerson({ id: 'local-1', name: 'Local Person' });
    usePeopleStore.setState({ contacts: { [localPerson.id]: localPerson } });
    
    // Simulate incoming deletion from sync with future timestamp
    const futureDate = new Date(Date.now() + 10000).toISOString();
    const deletedPerson = {
      ...localPerson,
      deletedAt: futureDate,
      updatedAt: futureDate
    };
    
    usePeopleStore.getState().hydrateFromSync?.({
      contacts: { [localPerson.id]: deletedPerson }
    });
    
    // Person should be marked as deleted
    const updatedPerson = usePeopleStore.getState().contacts[localPerson.id];
    expect(updatedPerson.deletedAt).toBeDefined();
    
    // getActiveContacts should not include deleted person
    const activeContacts = usePeopleStore.getState().getActiveContacts();
    expect(activeContacts).toHaveLength(0);
  });

  test('hydrateFromSync merges newer data', () => {
    usePeopleStore.setState({ isSyncEnabled: true });
    
    const oldDate = new Date('2023-01-01').toISOString();
    const newDate = new Date('2023-01-02').toISOString();
    
    // Add local person with old timestamp
    const localPerson = createTestPerson({ 
      id: 'merge-test',
      name: 'Old Name',
      updatedAt: oldDate
    });
    usePeopleStore.setState({ contacts: { [localPerson.id]: localPerson } });
    
    // Simulate incoming update with newer timestamp
    const updatedPerson = {
      ...localPerson,
      name: 'New Name',
      occupation: 'Updated Job',
      updatedAt: newDate
    };
    
    usePeopleStore.getState().hydrateFromSync?.({
      contacts: { [localPerson.id]: updatedPerson }
    });
    
    const mergedPerson = usePeopleStore.getState().contacts[localPerson.id];
    expect(mergedPerson.name).toBe('New Name');
    expect(mergedPerson.occupation).toBe('Updated Job');
  });

  test('hydrateFromSync preserves newer local data', () => {
    usePeopleStore.setState({ isSyncEnabled: true });
    
    const oldDate = new Date('2023-01-01').toISOString();
    const newDate = new Date('2023-01-02').toISOString();
    
    // Add local person with newer timestamp
    const localPerson = createTestPerson({ 
      id: 'preserve-test',
      name: 'Newer Local Name',
      updatedAt: newDate
    });
    usePeopleStore.setState({ contacts: { [localPerson.id]: localPerson } });
    
    // Simulate incoming update with older timestamp
    const olderPerson = {
      ...localPerson,
      name: 'Older Remote Name',
      updatedAt: oldDate
    };
    
    usePeopleStore.getState().hydrateFromSync?.({
      contacts: { [localPerson.id]: olderPerson }
    });
    
    // Should keep the newer local data
    const resultPerson = usePeopleStore.getState().contacts[localPerson.id];
    expect(resultPerson.name).toBe('Newer Local Name');
  });

  test('hydrateFromSync adds new contacts', () => {
    usePeopleStore.setState({ isSyncEnabled: true });
    
    const newPerson = createTestPerson({ id: 'new-person', name: 'New Person' });
    
    usePeopleStore.getState().hydrateFromSync?.({
      contacts: { [newPerson.id]: newPerson }
    });
    
    expect(usePeopleStore.getState().contacts[newPerson.id]).toEqual(newPerson);
  });
}); 