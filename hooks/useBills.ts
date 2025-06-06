import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useBillStore } from '@/store/BillStore';
import { Bill, Task, WeekDay } from '@/types';
import { useMemo } from 'react';
import { useCalendarStore, CalendarEvent, useToastStore } from '@/store';
import { useProjectStore } from '@/store/ToDo';
import { format } from 'date-fns';

// Use the proper types derived from CalendarEvent
type EventToAdd = Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>;

// Using type from the Task interface but omitting fields that will be generated
type TaskToAdd = Omit<Task, 'id' | 'completed' | 'completionHistory' | 'createdAt' | 'updatedAt'>;

// Import the taskFilter function from ToDo store
const taskFilter = (tasks: Record<string, Task>): Task[] => {
  const currentDate = new Date();
  const dateStr = currentDate.toISOString().split('T')[0];
  const currentDateStrLocal = format(currentDate, 'yyyy-MM-dd');
  
  // Filter tasks that are due today
  return Object.values(tasks).filter(task => {
    // For recurring tasks, check if they're due today
    if (task.recurrencePattern !== 'one-time') {
      return true; // Include all recurring tasks
    }
    
    // For one-time tasks, check if they're due today
    if (task.scheduledDate === currentDateStrLocal) {
      return true;
    }
    
    return false;
  });
};

// Basic getDayName, ensure it's correctly defined if used elsewhere or remove if not
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
    // Disable caching to ensure fresh data on each screen visit
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  const deleteBillMutation = useMutation({
    mutationFn: (id: string): Promise<{ id: string; name: string }> => {
      console.log(`🔴 deleteBillMutation: Deleting bill ID: ${id}`);
      const billToDelete = bills?.find(b => b.id === id);
      if (!billToDelete) {
        console.error(`🔴 deleteBillMutation: Bill not found ID: ${id}`);
        throw new Error('Bill not found');
      }
      const billName = billToDelete.name;
      deleteBillFromStore(id);
      // Simplified: Add back task/event deletion if this part works
      return Promise.resolve({ id, name: billName });
    },
    onSuccess: (data: { id: string; name: string }) => {
      console.log(`🔴 deleteBillMutation: Successfully deleted ${data.name}, invalidating queries.`);
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
      console.log('🟣🟣🟣 MUTATION FN (updateBillMutation) ENTERED with updates:', JSON.stringify(updates));
      const { id, ...rest } = updates;
      updateBillInStore(id, rest);
      console.log('🟣🟣🟣 MUTATION FN: Store updated with:', JSON.stringify(rest));
      return updates;
    },
    onSuccess: (data) => {
      console.log('🟢🟢🟢 ONSUCCESS (updateBillMutation) ENTERED. Data from mutationFn:', JSON.stringify(data));
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
    onError: (error) => {
      console.error('🔴🔴🔴 ONERROR (updateBillMutation) TRIGGERED:', error);
      showToast('Update failed', 'error');
    }
  });
  
  const addBill = (billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>, options: { 
    showToastNotification?: boolean, 
    isBatchOperation?: boolean,
    batchCount?: number,
    batchCategory?: string
  } = {}) => {
    
    console.log('🚀 useBills.addBill CALLED with:', billData);
    
    const { 
      showToastNotification = true, 
      isBatchOperation = false,
      batchCount = 0,
      batchCategory = ''
    } = options;
    
    const newBill = addBillToStore(billData);
    const start = new Date();
    const end = new Date(start.getFullYear() + 5, 11, 31); // End of December 5 years from now
    
    // Collect all events and tasks to add
    const eventsToAdd: EventToAdd[] = [];
    const tasksToAdd: TaskToAdd[] = [];
    
    // Check if we should create tasks (default to true for backward compatibility)
    const shouldCreateTasks = billData.createTask !== false;
    
    // Create an event for each month from start to end
    let currentDate = new Date(start.getFullYear(), start.getMonth(), billData.dueDate);
    let count = 0;
    while (currentDate <= end) {
      const formattedDate = format(currentDate, 'yyyy-MM-dd');
      const weekDay = getDayName(currentDate);
      
      // Always collect calendar events
      eventsToAdd.push({
        date: formattedDate,
        title: `Bill Due: ${billData.name}`,
        description: `$${billData.amount.toFixed(2)} due`,
        type: 'bill'
      });
      
      // Only collect tasks if createTask is not false
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
      
      // Move to next month
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, billData.dueDate);
      count++;
    }
    addEvents(eventsToAdd);
    if (tasksToAdd.length > 0) {
      tasksToAdd.map(task => addTask(task));
    }
    
    // Show success toast based on the options
    if (showToastNotification) {
      if (isBatchOperation && batchCount > 1) {
        // For batch operations with multiple bills, show a summary toast
        showToast(`${batchCount} ${batchCategory} bill${batchCount > 1 ? 's' : ''} added successfully`, "success");
      } else {
        // For single bill additions
        showToast("Bill added successfully", "success");
      }
    }
    queryClient.invalidateQueries({ queryKey: ['bills'] });
    queryClient.refetchQueries({ queryKey: ['bills'] });
    return newBill;
  };
  
  // Add a new function for batch operations, now accepting the full Bill type (including optional createTask)
  const addBills = (billsData: (Omit<Bill, 'id' | 'createdAt' | 'updatedAt'> & { createTask?: boolean })[], options: {
    showToastNotification?: boolean,
    batchCategory?: string
  } = {}) => {
    
    const {
      showToastNotification = true,
      batchCategory = ''
    } = options;
    billsData.forEach(billData => addBillToStore(billData));
    
    // Collect all events and tasks to add
    const eventsToAdd: EventToAdd[] = [];
    const tasksToAdd: TaskToAdd[] = []; // Initialize tasksToAdd array

    // For each bill, generate events and conditionally generate tasks
    billsData.forEach(billData => {
      const shouldCreateTask = billData.createTask || false; // Check the flag

      // Generate events for the next 10 years (always)
      const start = new Date();
      const end = new Date(start.getFullYear() + 10, 11, 31); 
      
      // Create an event for each month from start to end
      let currentDate = new Date(start.getFullYear(), start.getMonth(), billData.dueDate);
      while (currentDate <= end) {
        const formattedDate = format(currentDate, 'yyyy-MM-dd');
        const weekDay = getDayName(currentDate);
        
        // Collect event for this month
        eventsToAdd.push({
          date: formattedDate,
          title: `Bill Due: ${billData.name}`,
          description: `$${billData.amount.toFixed(2)} due`,
          type: 'bill'
        });

        // Conditionally collect task for this month
        if (shouldCreateTask) {
          tasksToAdd.push({
            name: `${billData.name} Bill ($${billData.amount.toFixed(0)})`,
            schedule: [weekDay], // Note: schedule might need adjustment based on task system logic
            priority: 'high',
            category: 'bills',
            scheduledDate: formattedDate, // Task scheduled for the due date
            dueDate: billData.dueDate, // Store original due day if needed
            recurrencePattern: 'monthly' // Assuming monthly recurrence matches bill cycle
          });
        }
        
        // Move to next month
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, billData.dueDate);
      }
    });

    // Add collected events and tasks to their respective stores
    addEvents(eventsToAdd); // Add all generated calendar events
    if (tasksToAdd.length > 0) {
      tasksToAdd.map(task => addTask(task)); // Add tasks only if any were generated
    }
    
    // Show success toast
    if (showToastNotification) {
      showToast(`${billsData.length} ${batchCategory} bill${billsData.length > 1 ? 's' : ''} added successfully`, "success");
    }
    
    queryClient.invalidateQueries({ queryKey: ['bills'] });
    queryClient.refetchQueries({ queryKey: ['bills'] });
  };
  
  // Calculate total monthly bills amount
  const totalMonthlyAmount = useMemo(() => {
    if (!bills || bills.length === 0) return 0;
    return bills.reduce((total, bill) => total + bill.amount, 0);
  }, [bills]);
  
  // Calculate monthly balance (income - bills)
  const monthlyBalance = useMemo(() => {
    return monthlyIncome - totalMonthlyAmount;
  }, [monthlyIncome, totalMonthlyAmount]);
  
  return {
    bills,
    isLoading,
    addBill,
    addBills,
    updateBill: (updates: { id: string; name: string; amount: number; dueDate: number; createTask?: boolean }, options?: { onSuccess?: () => void, onError?: () => void }) => {
      console.log('🔵🔵🔵 UPDATEBILL FUNCTION (exported from useBills) CALLED with:', JSON.stringify(updates));
      return new Promise<void>((resolve, reject) => {
        console.log('🔵🔵🔵 UPDATEBILL: Calling updateBillMutation.mutate...');
        updateBillMutation.mutate(updates, {
          onSuccess: (data) => { // This data is from the mutation's onSuccess
            console.log('🔵🔵🔵 UPDATEBILL: Inner onSuccess of mutate. Data from mutation:', JSON.stringify(data));
            if (options?.onSuccess) {
              console.log('🔵🔵🔵 UPDATEBILL: Calling options.onSuccess() passed from BillsScreen.');
              options.onSuccess(); // This eventually calls setEditBillModalOpen(false) etc.
            }
            console.log('🔵🔵🔵 UPDATEBILL: Resolving promise to EditBillModal.');
            resolve();
          },
          onError: (error) => {
            console.error('🔵🔵🔵 UPDATEBILL: Inner onError of mutate:', error);
            if (options?.onError) {
              console.log('🔵🔵🔵 UPDATEBILL: Calling options.onError() passed from BillsScreen.');
              options.onError();
            }
            console.log('🔵🔵🔵 UPDATEBILL: Rejecting promise to EditBillModal.');
            reject(error);
          }
        });
      });
    },
    deleteBill: (id: string, options?: { onSuccess?: () => void, onError?: () => void }) => {
      console.log(`🔵🔵🔵 DELETEBILL FUNCTION (exported from useBills) CALLED for ID: ${id}`);
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
