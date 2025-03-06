// services/holidayService.ts
import { CalendarEvent } from '@/store/CalendarStore';

// Create a utility function to get US federal holidays for a year
export const getUSHolidays = (year: number): CalendarEvent[] => {
  const holidays = [
    { date: new Date(year, 0, 1), name: 'New Year\'s Day', color: '#FF5252', icon: '🎆' },
    { date: new Date(year, 0, 1 + (15 - new Date(year, 0, 1).getDay()) % 7 + (new Date(year, 0, 1).getDay() > 1 ? 7 : 0)), name: 'MLK Day', color: '#8D6E63', icon: '✊🏽' },
    { date: new Date(year, 1, 1 + (15 - new Date(year, 1, 1).getDay()) % 7 + (new Date(year, 1, 1).getDay() > 1 ? 7 : 0)), name: 'Presidents Day', color: '#3F51B5', icon: '🏛️' },
    { date: new Date(year, 4, 1 + (0 + 7 - new Date(year, 4, 1).getDay()) % 7 + (new Date(year, 4, 1).getDay() === 0 ? 7 : 0)), name: 'Memorial Day', color: '#7E57C2', icon: '🎖️' },
    { date: new Date(year, 5, 19), name: 'Juneteenth', color: '#8D6E63', icon: '⛓️' },
    { date: new Date(year, 6, 4), name: 'Independence Day', color: '#1976D2', icon: '🎆' },
    { date: new Date(year, 8, 1 + (1 - new Date(year, 8, 1).getDay()) % 7), name: 'Labor Day', color: '#00ACC1', icon: '👷' },
    { date: new Date(year, 9, 1 + (8 - new Date(year, 9, 1).getDay()) % 7), name: 'Indigenous Peoples\' Day', color: '#689F38', icon: '🏞️' },
    { date: new Date(year, 10, 11), name: 'Veterans Day', color: '#7E57C2', icon: '🎖️' },
    { date: new Date(year, 10, 1 + (22 + (4 - new Date(year, 10, 1).getDay())) % 7), name: 'Thanksgiving', color: '#FF8F00', icon: '🦃' },
    { date: new Date(year, 11, 25), name: 'Christmas', color: '#D32F2F', icon: '🎄' },
  ];

  const currentDate = new Date().toISOString();
  
  // Convert to CalendarEvent objects
  return holidays.map(h => ({
    id: `holiday-${h.name.toLowerCase().replace(/\s/g, '-')}-${year}`,
    date: h.date.toISOString().split('T')[0],
    title: h.name,
    type: 'holiday' as any, // Type assertion for now
    time: '00:00',
    createdAt: currentDate,
    updatedAt: currentDate,
    // Include custom properties that we'll use but won't be in the type
    holidayColor: h.color,
    holidayIcon: h.icon
  }));
};