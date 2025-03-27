// services/syncServices.ts
import { useProjectStore, Task, WeekDay } from "@/store/ToDo";
import { useCalendarStore, CalendarEvent } from "@/store/CalendarStore";
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
    const creationDate = new Date(task.createdAt);
    const nextDay = new Date(creationDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return date.getDate() === nextDay.getDate() && 
           date.getMonth() === nextDay.getMonth() && 
           date.getFullYear() === nextDay.getFullYear();
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
  } else {
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
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
    }
  }
  
  return events;
};

export const syncTasksToCalendar = () => {
  const { tasks } = useProjectStore.getState();
  const { events, addEvent, deleteEvent } = useCalendarStore.getState();
  const taskEvents = events.filter(event => event.type === 'task' as CalendarEvent['type']);
  taskEvents.forEach(event => deleteEvent(event.id));
  Object.values(tasks)
    .filter(task => task.showInCalendar)
    .forEach(task => {
      const taskEvents = generateTaskEvents(task);
      taskEvents.forEach(event => addEvent(event));
    });
};
