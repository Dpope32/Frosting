// services/syncServices.ts
import { useProjectStore} from "@/store/ToDo";
import { Task, WeekDay } from "@/types"
import { useCalendarStore, CalendarEvent } from "@/store";
import { format } from "date-fns";

// This function determines if a task should be shown on a specific date
export const isTaskDueOnDate = (task: Task, date: Date): boolean => {
  const dateString = format(date, 'yyyy-MM-dd');
  
  // For one-time tasks, check if the date matches the scheduled date
  if (task.recurrencePattern === 'one-time') {
    return task.scheduledDate === dateString;
  }
  
  // For everyday tasks, always return true
  if (task.recurrencePattern === 'everyday') {
    return true;
  }
  
  // For tomorrow tasks, check if the date is the day after creation
  if (task.recurrencePattern === 'tomorrow') {
    // Get the creation date and add one day, both in local time
    const creationDate = new Date(task.createdAt);
    const nextDay = new Date(creationDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Compare using local date strings to avoid timezone issues
    const targetDateString = format(date, 'yyyy-MM-dd');
    const nextDayString = format(nextDay, 'yyyy-MM-dd');
    
    return targetDateString === nextDayString;
  }
  
  // Get the day name (sunday, monday, etc.)
  const dayNames: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as WeekDay[];
  const dayOfWeek = dayNames[date.getDay()];
  
  // For weekly tasks, check if the day is in the schedule
  if (task.recurrencePattern === 'weekly') {
    return task.schedule.includes(dayOfWeek);
  }
  
  // For biweekly tasks, check if the day is in the schedule and if it's the correct week
  if (task.recurrencePattern === 'biweekly') {
    if (!task.schedule.includes(dayOfWeek)) return false;
    
    const startDate = new Date(task.recurrenceDate || task.createdAt);
    const diffTime = Math.abs(date.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    
    return diffWeeks % 2 === 0;
  }
  
  // For monthly tasks, check if the day of month matches
  if (task.recurrencePattern === 'monthly') {
    const taskDate = new Date(task.recurrenceDate || task.createdAt);
    return date.getDate() === taskDate.getDate();
  }
  
  // For yearly tasks, check if the month and day match
  if (task.recurrencePattern === 'yearly') {
    const taskDate = new Date(task.recurrenceDate || task.createdAt);
    return date.getDate() === taskDate.getDate() && 
           date.getMonth() === taskDate.getMonth();
  }
  
  return false;
};

export const generateTaskEvents = (task: Task): Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>[] => {
  const events = [];
  const start = new Date();
  const end = new Date(start.getFullYear() + 2, 11, 31);
  
  if (task.recurrencePattern === 'one-time') {
    const eventDate = new Date(task.scheduledDate || task.createdAt);
    events.push({
      date: eventDate.toISOString().split('T')[0],
      time: task.time,
      title: task.name,
      type: task.category as CalendarEvent['type'],
      taskId: task.id,
      priority: task.priority, 
      updatedAt: new Date().toISOString()
    });
  } else if (task.recurrencePattern === 'tomorrow') {
    // Handle tomorrow tasks efficiently - only create one event for tomorrow
    if (!task.createdAt) {
      // If task doesn't have createdAt yet (newly created), use current date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      events.push({
        date: tomorrow.toISOString().split('T')[0],
        time: task.time,
        title: task.name,
        type: task.category as CalendarEvent['type'],
        taskId: task.id,
        priority: task.priority, 
        updatedAt: new Date().toISOString()
      });
    } else {
      // Use existing logic for tasks that have been created
      const creationDate = new Date(task.createdAt);
      const nextDay = new Date(creationDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      events.push({
        date: nextDay.toISOString().split('T')[0],
        time: task.time,
        title: task.name,
        type: task.category as CalendarEvent['type'],
        taskId: task.id,
        priority: task.priority, 
        updatedAt: new Date().toISOString()
      });
    }
  } else if (task.recurrencePattern === 'everyday') {
    // Generate events for everyday tasks more efficiently
    let currentDate = new Date(start);
    const maxDays = 365; // Limit to 1 year for performance
    let dayCount = 0;
    
    while (currentDate <= end && dayCount < maxDays) {
      events.push({
        date: currentDate.toISOString().split('T')[0],
        time: task.time,
        title: task.name,
        type: task.category as CalendarEvent['type'],
        taskId: task.id,
        priority: task.priority, 
        updatedAt: new Date().toISOString()
      });
      currentDate.setDate(currentDate.getDate() + 1);
      dayCount++;
    }
  } else {
    // For other recurring patterns, use the existing logic but with performance limits
    let currentDate = new Date(start);
    const maxDays = 730; // Limit to 2 years for performance
    let dayCount = 0;
    
    while (currentDate <= end && dayCount < maxDays) {
      if (isTaskDueOnDate(task, currentDate)) {
        events.push({
          date: currentDate.toISOString().split('T')[0],
          time: task.time,
          title: task.name,
          type: task.category as CalendarEvent['type'],
          taskId: task.id,
          priority: task.priority, 
          updatedAt: new Date().toISOString()
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
      dayCount++;
    }
  }
  
  return events;
};

export const syncTasksToCalendar = () => {
  try {
    const { tasks } = useProjectStore.getState();
    const { events, addEvent, deleteEvent } = useCalendarStore.getState();
    
    // Clear existing task events
    const taskEvents = events.filter(event => event.type === 'task' as CalendarEvent['type']);
    taskEvents.forEach(event => {
      try {
        deleteEvent(event.id);
      } catch (error) {
        console.warn('Error deleting event:', error);
      }
    });
    
    // Add new task events
    Object.values(tasks)
      .filter(task => task.showInCalendar)
      .forEach(task => {
        try {
          const taskEvents = generateTaskEvents(task);
          taskEvents.forEach(event => {
            try {
              addEvent(event);
            } catch (error) {
              console.warn('Error adding event:', error);
            }
          });
        } catch (error) {
          console.warn('Error generating events for task:', task.name, error);
        }
      });
  } catch (error) {
    console.error('Error syncing tasks to calendar:', error);
  }
};
