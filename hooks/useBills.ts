import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Bill, useBillStore } from '@/store/BillStore';
import { useMemo } from 'react';
import { useCalendarStore } from '@/store/CalendarStore';
import { useProjectStore, WeekDay } from '@/store/ToDo';
import { format } from 'date-fns';
import { useToastStore } from '@/store/ToastStore';

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

  const getDayName = (date: Date): WeekDay => {
    const days: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };

  const addBill = (billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBill = addBillToStore(billData);
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Generate events for current month through next 5 years
    for (let i = 0; i < 60; i++) {
      const eventDate = new Date(currentYear, currentMonth + i, billData.dueDate);
      const formattedDate = format(eventDate, 'yyyy-MM-dd');
      
      addEvent({
        date: formattedDate,
        title: `Bill Due: ${billData.name}`,
        description: `$${billData.amount.toFixed(2)} due`,
        type: 'bill'
      });

      // Add task for bill payment
      const weekDay = getDayName(eventDate);
      addTask({
        name: `Pay ${billData.name} ($${billData.amount.toFixed(2)})`,
        schedule: [weekDay],
        priority: 'high',
        category: 'wealth',
        scheduledDate: formattedDate,
        recurrencePattern: 'one-time'
      });
    }

    // Show success toast
    showToast("Bill added successfully", "success");

    // Force immediate refetch to update UI
    queryClient.invalidateQueries({ queryKey: ['bills'] });
    queryClient.refetchQueries({ queryKey: ['bills'] });
  };

  const deleteBill = async (id: string) => {
    // Delete the bill from store
    deleteBillFromStore(id);
    
    // Delete associated calendar events
    const billEvents = events.filter(
      event => event.type === 'bill' && event.title.includes(bills?.find(b => b.id === id)?.name || '')
    );
    
    for (const event of billEvents) {
      deleteEvent(event.id);
    }

    // Show success toast
    showToast("Bill deleted successfully", "success");

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
    deleteBill,
    monthlyIncome,
    setMonthlyIncome,
    totalMonthlyAmount,
    monthlyBalance
  };
}
