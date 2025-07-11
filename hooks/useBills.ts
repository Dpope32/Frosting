import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useBillStore } from '@/store/BillStore';
import { Bill, Task, WeekDay } from '@/types';
import { useMemo } from 'react';
import { useCalendarStore, CalendarEvent, useToastStore } from '@/store';
import { useProjectStore } from '@/store/ToDo';
import { format } from 'date-fns';

export type EventToAdd = Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>;
export type TaskToAdd = Omit<Task, 'id' | 'completed' | 'completionHistory' | 'createdAt' | 'updatedAt'>;

const getDayName = (date: Date): WeekDay => {
  const days: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

export function useBills() {
  const queryClient = useQueryClient();
  const {
    addBill: addBillToStore,
    deleteBill: deleteBillFromStore,
    updateBill: updateBillInStore,
    getBills,
    monthlyIncome,
    setMonthlyIncome
  } = useBillStore();
  const { addEvents } = useCalendarStore();
  const { addTask } = useProjectStore();
  const { showToast } = useToastStore();
  
  const { data: bills, isLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: () => getBills(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  const deleteBillMutation = useMutation({
    mutationFn: (id: string): Promise<{ id: string; name: string }> => {
      const billToDelete = bills?.find(b => b.id === id);
      if (!billToDelete) {
        throw new Error('Bill not found');
      }
      const billName = billToDelete.name;
      deleteBillFromStore(id);
      return Promise.resolve({ id, name: billName });
    },
    onSuccess: (data: { id: string; name: string }) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      showToast(`Deleted ${data.name}`, 'success');
    },
    onError: (error) => {
      console.error('🔴 deleteBillMutation: Error:', error);
      showToast('Failed to delete bill', 'error');
    }
  });
  
  const updateBillMutation = useMutation({
    mutationFn: async (updates: { id: string; name: string; amount: number; dueDate: number; createTask?: boolean }) => {
      const { id, ...rest } = updates;
      updateBillInStore(id, rest);
      return updates;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills'] }),
    onError: () => showToast('Update failed', 'error')
  });
  
  const addBill = (billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>, options: { 
    showToastNotification?: boolean, 
    isBatchOperation?: boolean,
    batchCount?: number,
    batchCategory?: string
  } = {}) => {
    
    const { 
      showToastNotification = true, 
      isBatchOperation = false,
      batchCount = 0,
      batchCategory = ''
    } = options;
    
    const newBill = addBillToStore(billData);
    const start = new Date();
    const end = new Date(start.getFullYear() + 5, 11, 31);
    
    const eventsToAdd: EventToAdd[] = [];
    const tasksToAdd: TaskToAdd[] = [];
    
    const shouldCreateTasks = billData.createTask !== false;
    let currentDate = new Date(start.getFullYear(), start.getMonth(), billData.dueDate);
    let count = 0;
    while (currentDate <= end) {
      const formattedDate = format(currentDate, 'yyyy-MM-dd');
      const weekDay = getDayName(currentDate);
      
      eventsToAdd.push({
        date: formattedDate,
        title: `Bill Due: ${billData.name}`,
        description: `$${billData.amount.toFixed(2)} due`,
        type: 'bill'
      });
      
      if (shouldCreateTasks) {
        tasksToAdd.push({
          name: `${billData.name} Bill ($${billData.amount.toFixed(0)})`,
          schedule: [weekDay],
          priority: 'high',
          category: 'bills',
          scheduledDate: formattedDate,
          dueDate: billData.dueDate,
          recurrencePattern: 'monthly'
        });
      }
      
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, billData.dueDate);
      count++;
    }
    addEvents(eventsToAdd);
    if (tasksToAdd.length > 0) {
      tasksToAdd.map(task => addTask(task));
    }
    
    if (showToastNotification) {
      if (isBatchOperation && batchCount > 1) {
        showToast(`${batchCount} ${batchCategory} bill${batchCount > 1 ? 's' : ''} added successfully`, "success");
      } else {
        showToast("Bill added successfully", "success");
      }
    }
    queryClient.invalidateQueries({ queryKey: ['bills'] });
    queryClient.refetchQueries({ queryKey: ['bills'] });
    return newBill;
  };
  
  const totalMonthlyAmount = useMemo(() => {
    if (!bills || bills.length === 0) return 0;
    return bills.reduce((total, bill) => total + bill.amount, 0);
  }, [bills]);
  
  const monthlyBalance = useMemo(() => {
    return monthlyIncome - totalMonthlyAmount;
  }, [monthlyIncome, totalMonthlyAmount]);
  
  return {
    bills,
    isLoading,
    addBill,
    updateBill: (updates: { id: string; name: string; amount: number; dueDate: number; createTask?: boolean }, options?: { onSuccess?: () => void, onError?: () => void }) => {
      return new Promise<void>((resolve, reject) => {
        updateBillMutation.mutate(updates, {
          onSuccess: () => {
            if (options?.onSuccess) options.onSuccess();
            resolve();
          },
          onError: (error) => {
            if (options?.onError) {
              options.onError();
            }
            reject(error);
          }
        });
      });
    },
    deleteBill: (id: string, options?: { onSuccess?: () => void, onError?: () => void }) => {
      deleteBillMutation.mutate(id, {
        onSuccess: () => {
          if (options?.onSuccess) options.onSuccess();
        },
        onError: () => {
          if (options?.onError) options.onError();
        }
      });
    },
    monthlyIncome,
    setMonthlyIncome,
    totalMonthlyAmount,
    monthlyBalance
  };
}
