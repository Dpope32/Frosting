import { act } from 'react-test-renderer';
import { useBillStore } from '../../store/BillStore';

// Mock AsyncStorage
jest.mock('../../store/AsyncStorage', () => ({
  createPersistStorage: () => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  }),
}));

describe('BillStore', () => {
  beforeEach(() => {
    useBillStore.getState().clearBills();
  });

  it('should add a bill', () => {
    act(() => {
      useBillStore.getState().addBill({
        name: 'Rent',
        amount: 1000,
        dueDate: 1
      });
    });

    const bills = useBillStore.getState().getBills();
    expect(bills.length).toBe(1);
    expect(bills[0].name).toBe('Rent');
  });

  it('should delete a bill', () => {
    act(() => {
      useBillStore.getState().addBill({
        name: 'Rent',
        amount: 1000,
        dueDate: 1
      });
    });

    const bills = useBillStore.getState().getBills();
    const billId = bills[0].id;

    act(() => {
      useBillStore.getState().deleteBill(billId);
    });

    expect(useBillStore.getState().getBills().length).toBe(0);
  });

  it('should set monthly income', () => {
    act(() => {
      useBillStore.getState().setMonthlyIncome(5000);
    });

    expect(useBillStore.getState().monthlyIncome).toBe(5000);
  });
});
