import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useBillStore } from '@/store/BillStore';
import { Bill } from '@/types/bills';
import { useMemo } from 'react';
import { useCalendarStore, CalendarEvent } from '@/store/CalendarStore';
import { useProjectStore } from '@/store/ToDo';
import { WeekDay, Task } from '@/types/task';
import { format } from 'date-fns';
import { useToastStore } from '@/store/ToastStore';

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

export function useBills() {
  const queryClient = useQueryClient();
  const {
    addBill: addBillToStore,
    deleteBill: deleteBillFromStore,
    getBills,
    monthlyIncome,
    setMonthlyIncome
  } = useBillStore();
  const { addEvent, deleteEvent, events, addEvents } = useCalendarStore();
  const { addTask, addTasks } = useProjectStore();
  const { showToast } = useToastStore();
  
  const { data: bills, isLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: () => getBills(),
    // Disable caching to ensure fresh data on each screen visit
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  // SIMPLIFIED INSTANT DELETION
  const deleteBillMutation = useMutation({
    mutationFn: (id: string): Promise<{ id: string; name: string }> => {
      
      // 1. Find the bill to delete
      const billToDelete = bills?.find(b => b.id === id);
      if (!billToDelete) {
        console.error(`[Delete] Bill not found with ID: ${id}`);
        throw new Error('Bill not found');
      }
      
      const billName = billToDelete.name;
      
      // 2. Delete from bill store immediately
      deleteBillFromStore(id);
      
      // 3. Get direct access to the stores
      const calendarStore = useCalendarStore.getState();
      const projectStore = useProjectStore.getState();
      
      // 4. Delete all events in a single operation
      const billEvents = calendarStore.events.filter(event => 
        event.type === 'bill' && event.title.includes(billName)
      );
      
      if (billEvents.length > 0) {
        useCalendarStore.setState(state => ({
          events: state.events.filter(event => 
            !billEvents.some(e => e.id === event.id)
          )
        }));
      }
      
      // 5. Delete all tasks in a single operation
      const billTasks = Object.values(projectStore.tasks).filter(task => 
        task.category === 'bills' && task.name.includes(`Pay ${billName}`)
      );
      
      if (billTasks.length > 0) {
        useProjectStore.setState(state => {
          const newTasks = { ...state.tasks };
          billTasks.forEach(task => {
            delete newTasks[task.id];
          });
          return { tasks: newTasks };
        });
      }
      return Promise.resolve({ id, name: billName });
    },
    onSuccess: (data: { id: string; name: string }) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      showToast(`Deleted ${data.name}`, 'success');
    },
    onError: (error) => {
      console.error('[Delete] Mutation error:', error);
      showToast('Failed to delete bill', 'error');
    }
  });
  
  const getDayName = (date: Date): WeekDay => {
    const days: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };
  
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
    const end = new Date(start.getFullYear() + 5, 11, 31); // End of December 5 years from now
    
    // Collect all events and tasks to add
    const eventsToAdd: EventToAdd[] = [];
    const tasksToAdd: TaskToAdd[] = [];
    // Create an event for each month from start to end
    let currentDate = new Date(start.getFullYear(), start.getMonth(), billData.dueDate);
    let count = 0;
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
      
      // Collect task for this month
      tasksToAdd.push({
        name: `${billData.name} ($${billData.amount.toFixed(1)})`,
        schedule: [weekDay],
        priority: 'high',
        category: 'bills',
        scheduledDate: formattedDate,
        dueDate: billData.dueDate,
        recurrencePattern: 'monthly'
      });
      
      // Move to next month
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, billData.dueDate);
      count++;
    }
    addEvents(eventsToAdd);
    addTasks(tasksToAdd);
    
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
            name: `Pay ${billData.name} ($${billData.amount.toFixed(2)})`,
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
      addTasks(tasksToAdd); // Add tasks only if any were generated
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
