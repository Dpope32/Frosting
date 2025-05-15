import { CalendarEvent } from '@/store/CalendarStore';
import { Platform } from 'react-native';

let Calendar: any = null;

if (Platform.OS !== 'web') {
  try {
    Calendar = require('expo-calendar');
  } catch (err) {
    console.error('Error importing expo-calendar:', err);
  }
}

export const getDeviceCalendars = async (): Promise<any[]> => {
  if (Platform.OS === 'web' || !Calendar) return [];
  
  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    return calendars;
  } catch (error) {
    console.error('Error getting device calendars:', error);
    return [];
  }
};

export const getDeviceCalendarEvents = async (
  startDate: Date,
  endDate: Date
): Promise<any[]> => {
  if (Platform.OS === 'web' || !Calendar) return [];
  
  try {
    const calendars = await getDeviceCalendars();
    let allEvents: any[] = [];
    
    for (const calendar of calendars) {
      try {
        const events = await Calendar.getEventsAsync([calendar.id], startDate, endDate);
        allEvents = [...allEvents, ...events];
      } catch (calError) {
        console.error(`Error getting events from calendar "${calendar.title}":`, calError);
      }
    }
    
    return allEvents;
  } catch (error) {
    console.error('Error getting device calendar events:', error);
    return [];
  }
};

export const convertToAppCalendarEvents = (
  deviceEvents: any[]
): CalendarEvent[] => {
  
  return deviceEvents.map(event => {
    try {
      // Determine event type based on calendar or event properties
      let eventType: CalendarEvent['type'] = 'personal';
      const calendarTitle = '';  
      const eventTitle = event.title?.toLowerCase() || '';
      const eventNotes = event.notes?.toLowerCase() || '';
      
      if (eventTitle.includes('work') || eventNotes.includes('work')) {
        eventType = 'work';
      } else if (calendarTitle.includes('family') || eventTitle.includes('family') || eventNotes.includes('family')) {
        eventType = 'family';
      } else if (eventTitle.includes('birthday') || eventNotes.includes('birthday')) {
        eventType = 'birthday';
      }
      
      const startDate = new Date(event.startDate);
      
      return {
        id: `device-${event.id}`,
        date: startDate.toISOString().split('T')[0],
        time: startDate.toISOString().split('T')[1].substring(0, 5),
        title: event.title || 'Untitled Event',
        description: event.notes || undefined,
        type: eventType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error converting device event to app format:', error, event);
      // Return a default event if conversion fails
      return {
        id: `device-error-${Math.random().toString(36).substring(2, 9)}`,
        date: new Date().toISOString().split('T')[0],
        title: 'Error Converting Event',
        type: 'personal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  });
};

export const parseTimeString = (timeStr: string): string => {
  const parts = timeStr.split(' ');
  if (parts.length !== 2) return timeStr;
  let [hours, minutes] = parts[0].split(':');
  const modifier = parts[1].toUpperCase();
  if (modifier === 'PM' && hours !== '12') hours = String(parseInt(hours, 10) + 12);
  if (modifier === 'AM' && hours === '12') hours = '00';
  return `${hours.padStart(2, '0')}:${minutes}`;
};

export const generateBillEvents = (billName: string, dueDate: number): Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>[] => {
  const events = [];
  const start = new Date();
  // Extend to at least 2 years in the future
  const end = new Date(start.getFullYear() + 2, 0, 31); // End of January two years from now
  
  // Create an event for each month from start to end
  let currentDate = new Date(start.getFullYear(), start.getMonth(), dueDate);
  while (currentDate <= end) {
    events.push({
      date: currentDate.toISOString().split('T')[0],
      time: '09:00',
      title: billName,
      type: 'bill' as CalendarEvent['type'],
      description: `Monthly ${billName}`
    });
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, dueDate);
  }
  return events;
};

export const generateRandomTime = (): string => {
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const getCurrentRoundedTime = (): string => {
  const now = new Date();
  const minutes = Math.round(now.getMinutes() / 30) * 30;
  now.setMinutes(minutes, 0, 0);
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};
