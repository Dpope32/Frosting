import { CalendarEvent } from '@/store/CalendarStore';

/**
 * Parses a time string in 12-hour format to 24-hour format
 * @param timeStr Time string in format "HH:MM AM/PM"
 * @returns Time string in format "HH:MM"
 */
export const parseTimeString = (timeStr: string): string => {
  const parts = timeStr.split(' ');
  if (parts.length !== 2) return timeStr;
  let [hours, minutes] = parts[0].split(':');
  const modifier = parts[1].toUpperCase();
  if (modifier === 'PM' && hours !== '12') hours = String(parseInt(hours, 10) + 12);
  if (modifier === 'AM' && hours === '12') hours = '00';
  return `${hours.padStart(2, '0')}:${minutes}`;
};

/**
 * Generates bill events for the calendar
 * @param billName Name of the bill
 * @param dueDate Day of the month when the bill is due
 * @returns Array of calendar events for the bill
 */
// In generateBillEvents function, modify to extend further
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

/**
 * Generates a random date between now and the end of the year
 */
export const generateRandomDate = (yearsAhead: number = 1): Date => {
  const start = new Date();
  const end = new Date(start.getFullYear() + yearsAhead, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

/**
 * Generates a random time in 24-hour format
 */
export const generateRandomTime = (): string => {
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Gets the current time rounded to the nearest 30 minutes
 */
export const getCurrentRoundedTime = (): string => {
  const now = new Date();
  const minutes = Math.round(now.getMinutes() / 30) * 30;
  now.setMinutes(minutes, 0, 0);
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};
