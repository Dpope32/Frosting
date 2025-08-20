import { billTypes } from '@/constants/billTypes';
import { Bill, WeekDay } from '@/types';
import { format } from 'date-fns';
import { EventToAdd, TaskToAdd } from '@/hooks/useBills';
import { ToastType } from '@/store/ToastStore';

const getDayName = (date: Date): WeekDay => {
    const days: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };

export const loadDevBills = (hooks: {
  addBill: (billData: any) => void;
  addEvents: (events: EventToAdd[]) => void;
  addTask: (task: TaskToAdd) => void;
  showToast: (message: string, type?: ToastType) => void;
  invalidateQueries: () => void;
  refetchQueries: () => void;
}) => {
    const { addBill, addEvents, addTask, showToast, invalidateQueries, refetchQueries } = hooks;
    
    const numBills = Math.floor(Math.random() * 3) + 3;
    const selectedBills = [];
    const usedIndices = new Set();
    
    for (let i = 0; i < numBills; i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * billTypes.length);
      } while (usedIndices.has(randomIndex));
      
      usedIndices.add(randomIndex);
      const bill = billTypes[randomIndex];
      const randomDueDate = Math.floor(Math.random() * 28) + 1;
      const amountVariation = (Math.random() - 0.5) * 0.4;
      const adjustedAmount = Math.round(bill.amount * (1 + amountVariation));
      
      selectedBills.push({
        name: bill.name,
        amount: adjustedAmount,
        dueDate: randomDueDate,
        createTask: false
      });
    }
    selectedBills.sort((a, b) => a.dueDate - b.dueDate);
    addBills(selectedBills, { batchCategory: 'dev' }, hooks);
  };


export const deleteAllBills = (hooks: {
  getBills: () => any[] | undefined;
  deleteBill: (id: string) => void;
}) => {
    const { getBills, deleteBill } = hooks;
    
    getBills()?.forEach((bill, index) => {
      setTimeout(() => deleteBill(bill.id), index * 200);
    });
  }; 
    
 export const addBills = (billsData: (Omit<Bill, 'id' | 'createdAt' | 'updatedAt'> & { createTask?: boolean })[], options: {
    showToastNotification?: boolean,
    batchCategory?: string
  } = {}, hooks: {
    addBill: (billData: any) => void;
    addEvents: (events: EventToAdd[]) => void;
    addTask: (task: TaskToAdd) => void;
    showToast: (message: string, type?: ToastType) => void;
    invalidateQueries: () => void;
    refetchQueries: () => void;
  }) => {
    
    const { addBill, addEvents, addTask, showToast, invalidateQueries, refetchQueries } = hooks;
    
    const {
      showToastNotification = true,
      batchCategory = ''
    } = options;
    billsData.forEach(billData => addBill(billData));
    
    // Collect all events and tasks to add
    const eventsToAdd: EventToAdd[] = [];
    const tasksToAdd: TaskToAdd[] = []; // Initialize tasksToAdd array

    // For each bill, generate events and conditionally generate tasks
    billsData.forEach(billData => {
      const shouldCreateTask = billData.createTask || false; // Check the flag

      // PERFORMANCE FIX: Reduce from 10 years to 2 years maximum
      const start = new Date();
      const end = new Date(start.getFullYear() + 2, 11, 31); 
      
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
    
    invalidateQueries();
    refetchQueries();
  };