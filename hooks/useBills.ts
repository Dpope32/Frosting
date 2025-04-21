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

export function useBills() {
  const queryClient = useQueryClient();
  const {
    addBill: addBillToStore,
    deleteBill: deleteBillFromStore,
    getBills,
    monthlyIncome,
    setMonthlyIncome
  } = useBillStore();
  const { addEvent, deleteEvent, events } = useCalendarStore();
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
  
  // PERFORMANCE OPTIMIZATION: Efficient batch deletion
  const deleteBillMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const billToDelete = bills?.find(b => b.id === id);
        if (!billToDelete) {
          throw new Error('Bill not found');
        }
        
        const billName = billToDelete.name;
        
        // 1. Delete from store - this should be fast
        deleteBillFromStore(id);
        
        // 2. Use Promise.all for batch deletion of events (this is a key optimization)
        // First, efficiently find all event IDs to delete
        const eventIdsToDelete = events
          .filter(event => event.type === 'bill' && event.title.includes(billName))
          .map(event => event.id);
          
        // Then delete them all in parallel
        await Promise.all(eventIdsToDelete.map(eventId => 
          // Use a small timeout to prevent UI blockage
          new Promise(resolve => setTimeout(() => {
            deleteEvent(eventId);
            resolve(null);
          }, 0))
        ));
        
        return { id, name: billName };
      } catch (error) {
        console.error('Error deleting bill:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      showToast(`Deleted ${data.name}`, 'success');
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      showToast('Failed to delete bill', 'error');
    }
  });
  
  const getDayName = (date: Date): WeekDay => {
    const days: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };
  
  const addBill = (billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBill = addBillToStore(billData);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // PERFORMANCE OPTIMIZATION: Use batch processing for adding events
    const eventsToAdd: EventToAdd[] = [];
    const tasksToAdd: TaskToAdd[] = [];
    
    // Generate events for current month through next 5 years
    for (let i = 0; i < 60; i++) {
      const eventDate = new Date(currentYear, currentMonth + i, billData.dueDate);
      const formattedDate = format(eventDate, 'yyyy-MM-dd');
      
      eventsToAdd.push({
        date: formattedDate,
        title: `Bill Due: ${billData.name}`,
        description: `$${billData.amount.toFixed(2)} due`,
        type: 'bill'  // Now correctly typed as one of the allowed event types
      });
      
      // Create task data
      const weekDay = getDayName(eventDate);
      tasksToAdd.push({
        name: `Pay ${billData.name} ($${billData.amount.toFixed(2)})`,
        schedule: [weekDay],
        priority: 'high',
        category: 'bills',
        scheduledDate: formattedDate,
        recurrencePattern: 'monthly',
        dueDate: billData.dueDate
      });
    }
    
    // Batch add events to improve performance
    setTimeout(() => {
      // Add events in chunks to prevent UI freezing
      const CHUNK_SIZE = 10;
      for (let i = 0; i < eventsToAdd.length; i += CHUNK_SIZE) {
        const chunk = eventsToAdd.slice(i, i + CHUNK_SIZE);
        setTimeout(() => {
          chunk.forEach(event => addEvent(event));
        }, 0);
      }
      
      // Add tasks in chunks
      for (let i = 0; i < tasksToAdd.length; i += CHUNK_SIZE) {
        const chunk = tasksToAdd.slice(i, i + CHUNK_SIZE);
        setTimeout(() => {
          chunk.forEach(task => addTask(task));
        }, 0);
      }
    }, 0);
    
    // Show success toast
    showToast("Bill added successfully", "success");
    
    // Force immediate refetch to update UI
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
    deleteBill: deleteBillMutation.mutate,
    monthlyIncome,
    setMonthlyIncome,
    totalMonthlyAmount,
    monthlyBalance
  };
}