// --- add fake timers at the very top ---
jest.useFakeTimers();

// Mock AsyncStorage before importing BillStore
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  clear: jest.fn(() => Promise.resolve())
}));

import { useBillStore, getOrdinalSuffix } from '@/store/BillStore';

describe('BillStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useBillStore.setState({ bills: {}, monthlyIncome: 0 });
  });

  // --- clear pending timers after each test ---
  afterEach(() => {
    jest.clearAllTimers();
  });

  test('initial state', () => {
    const { bills, monthlyIncome } = useBillStore.getState();
    expect(bills).toEqual({});
    expect(monthlyIncome).toBe(0);
  });

  test('addBill adds and returns new bill', () => {
    const billData = { name: 'TestBill', amount: 100, dueDate: 15 };
    // addBill returns void, so inspect state directly
    useBillStore.getState().addBill(billData as any);
    const state = useBillStore.getState();
    const keys = Object.keys(state.bills);
    expect(keys).toHaveLength(1);
    const id = keys[0];
    const newBill = state.bills[id]!;
    expect(newBill.id).toBe(id);
    expect(newBill).toHaveProperty('createdAt');
    expect(newBill).toHaveProperty('updatedAt');
    expect(newBill.name).toBe('TestBill');
    expect(newBill.amount).toBe(100);
    expect(newBill.dueDate).toBe(15);
  });

  test('getBills returns bills sorted by dueDate', () => {
    useBillStore.getState().addBill({ name: 'B', amount: 20, dueDate: 20 } as any);
    useBillStore.getState().addBill({ name: 'A', amount: 10, dueDate: 5 } as any);
    const bills = useBillStore.getState().getBills();
    expect(bills.map(b => b.name)).toEqual(['A', 'B']);
  });

  test('deleteBill removes the bill', () => {
    // add a bill and capture its id
    useBillStore.getState().addBill({ name: 'Removable', amount: 50, dueDate: 10 } as any);
    const state1 = useBillStore.getState();
    const keys1 = Object.keys(state1.bills);
    expect(keys1).toHaveLength(1);
    const id = keys1[0];
    expect(state1.bills[id]).toBeDefined();
    // delete and verify removal
    useBillStore.getState().deleteBill(id);
    expect(useBillStore.getState().bills[id]).toBeUndefined();
  });

  test('clearBills empties all bills', () => {
    useBillStore.getState().addBill({ name: 'Some', amount: 30, dueDate: 5 } as any);
    expect(Object.keys(useBillStore.getState().bills).length).toBeGreaterThan(0);
    useBillStore.getState().clearBills();
    expect(useBillStore.getState().bills).toEqual({});
  });

  test('setMonthlyIncome sets income correctly and clamps negatives', () => {
    useBillStore.getState().setMonthlyIncome(500);
    expect(useBillStore.getState().monthlyIncome).toBe(500);
    useBillStore.getState().setMonthlyIncome(-200);
    expect(useBillStore.getState().monthlyIncome).toBe(0);
  });

  test('getOrdinalSuffix generates correct suffixes', () => {
    expect(getOrdinalSuffix(1)).toBe('st');
    expect(getOrdinalSuffix(2)).toBe('nd');
    expect(getOrdinalSuffix(3)).toBe('rd');
    expect(getOrdinalSuffix(4)).toBe('th');
    expect(getOrdinalSuffix(11)).toBe('th');
    expect(getOrdinalSuffix(12)).toBe('th');
    expect(getOrdinalSuffix(13)).toBe('th');
    expect(getOrdinalSuffix(21)).toBe('st');
  });
}); 