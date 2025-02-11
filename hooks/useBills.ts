import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Bill, useBillStore } from '@/store/BillStore';
import { useCalendarStore } from '@/store/CalendarStore';
import { useProjectStore, WeekDay } from '@/store/ToDo';
import { format, setDate } from 'date-fns';

export function useBills() {
  const queryClient = useQueryClient();
  const { addBill: addBillToStore, deleteBill: deleteBillFromStore, getBills } = useBillStore();
  const { addEvent, deleteEvent, events } = useCalendarStore();
  const { addTask } = useProjectStore();

  const { data: bills, isLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: () => getBills(),
  });

  const getDayName = (date: Date): WeekDay => {
    const days: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };

  const addBill = (billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBill = addBillToStore(billData);
    
    // Create calendar events for the next 12 months
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Generate events for current month through next 11 months
    for (let i = 0; i < 12; i++) {
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
        isOneTime: true,
        scheduledDate: formattedDate
      });
    }

    queryClient.invalidateQueries({ queryKey: ['bills'] });
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

    queryClient.invalidateQueries({ queryKey: ['bills'] });
  };

  return {
    bills,
    isLoading,
    addBill,
    deleteBill
  };
}
