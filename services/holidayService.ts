// services/holidayService.ts
import { CalendarEvent } from '@/store/CalendarStore';
import Holidays from 'date-holidays';

export const getUSHolidays = (year: number): CalendarEvent[] => {
  // Initialize the date-holidays library with US holidays
  const holidays = new Holidays('US');
  
  // Get all holidays for the specified year
  const holidayData = holidays.getHolidays(year);
  
  // Custom holidays not included in the library
  const customHolidays = [
    { date: new Date(year, 1, 14), name: 'Valentine\'s Day', color: '#FF69B4', icon: '💖' },
    { date: new Date(year, 2, 17), name: 'St. Patrick\'s Day', color: '#008000', icon: '☘️' },
    { date: new Date(year, 9, 31), name: 'Halloween', color: '#FF7518', icon: '🎃' },
  ];
  
  // Map colors and icons to specific holidays
  const holidayAttributes: Record<string, { color: string, icon: string }> = {
    'New Year\'s Day': { color: '#FF5252', icon: '🎆' },
    'Martin Luther King Jr. Day': { color: '#8D6E63', icon: '✊🏽' },
    'Presidents\' Day': { color: '#3F51B5', icon: '🏛️' },
    'Washington\'s Birthday': { color: '#3F51B5', icon: '🏛️' },
    'Good Friday': { color: '#795548', icon: '✝️' },
    'Easter Sunday': { color: '#FF9800', icon: '🐣' },
    'Memorial Day': { color: '#7E57C2', icon: '🎖️' },
    'Juneteenth': { color: '#8D6E63', icon: '⛓️' },
    'Independence Day': { color: '#1976D2', icon: '🎆' },
    'Labor Day': { color: '#00ACC1', icon: '👷' },
    'Columbus Day': { color: '#FF5722', icon: '🧭' },
    'Indigenous Peoples\' Day': { color: '#FF5722', icon: '🧭' },
    'Veterans Day': { color: '#7E57C2', icon: '🎖️' },
    'Thanksgiving Day': { color: '#FF8F00', icon: '🦃' },
    'Christmas Day': { color: '#D32F2F', icon: '🎄' },
    'Valentine\'s Day': { color: '#FF69B4', icon: '💖' },
    'St. Patrick\'s Day': { color: '#008000', icon: '☘️' },
    'Halloween': { color: '#FF7518', icon: '🎃' },
  };

  const currentDate = new Date().toISOString();
  
  const libraryHolidays = holidayData.map(h => {
    const name = h.name;
    const attributes = holidayAttributes[name] || { color: '#757575', icon: '📅' };
    
    return {
      id: `holiday-${name.toLowerCase().replace(/\s/g, '-')}-${year}`,
      date: h.date.toString().split('T')[0],
      title: name,
      type: 'holiday' as any,
      time: '00:00',
      createdAt: currentDate,
      updatedAt: currentDate,
      holidayColor: attributes.color,
      holidayIcon: attributes.icon
    };
  });
  
  const formattedCustomHolidays = customHolidays.map(h => {
    const attributes = holidayAttributes[h.name] || { color: h.color, icon: h.icon };
    
    return {
      id: `holiday-${h.name.toLowerCase().replace(/\s/g, '-')}-${year}`,
      date: h.date.toISOString().split('T')[0],
      title: h.name,
      type: 'holiday' as any, 
      time: '00:00',
      createdAt: currentDate,
      updatedAt: currentDate,
      holidayColor: attributes.color,
      holidayIcon: attributes.icon
    };
  });
  
  return [...libraryHolidays, ...formattedCustomHolidays];
};