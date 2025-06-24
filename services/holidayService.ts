import { CalendarEvent } from '@/store/';
import Holidays from 'date-holidays';

// List of holidays to exclude from display
const EXCLUDED_HOLIDAYS = [
  'Columbus Day',
  'Juneteenth',
  'Indigenous Peoples\' Day'
];

export const getUSHolidays = (year: number): CalendarEvent[] => {
  // Initialize the date-holidays library with US holidays
  const holidays = new Holidays('US');
  // Get all holidays for the specified year
  const holidayData = holidays.getHolidays(year);
  // Custom holidays not included in the library
  const customHolidays = [
    { date: new Date(year, 1, 14), name: 'Valentine\'s Day', color: '#E91E63', icon: '💖' },
    { date: new Date(year, 2, 17), name: 'St. Patrick\'s Day', color: '#388E3C', icon: '☘️' },
    { date: new Date(year, 9, 31), name: 'Halloween', color: '#FF8F00', icon: '🎃' },
  ];
  
  // Map colors and icons to specific holidays with themed colors
  const holidayAttributes: Record<string, { color: string, icon: string }> = {
    'New Year\'s Day': { color: '#FFB300', icon: '🎆' },
    'Martin Luther King Jr. Day': { color: '#424242', icon: '✊🏽' },
    'Presidents\' Day': { color: '#1976D2', icon: '🏛️' },
    'Washington\'s Birthday': { color: '#1976D2', icon: '🏛️' },
    'Good Friday': { color: '#795548', icon: '✝️' },
    'Easter Sunday': { color: '#7B1FA2', icon: '🐣' },
    'Memorial Day': { color: '#C62828', icon: '🎖️' },
    'Independence Day': { color: '#1976D2', icon: '🎆' },
    'Labor Day': { color: '#1976D2', icon: '👷' },
    'Columbus Day': { color: '#FF5722', icon: '🧭' },
    'Indigenous Peoples\' Day': { color: '#FF5722', icon: '🧭' },
    'Veterans Day': { color: '#C62828', icon: '🎖️' },
    'Thanksgiving Day': { color: '#F57C00', icon: '🦃' },
    'Christmas Day': { color: '#C62828', icon: '🎄' },
    'Valentine\'s Day': { color: '#E91E63', icon: '💖' },
    'St. Patrick\'s Day': { color: '#388E3C', icon: '☘️' },
    'Halloween': { color: '#FF8F00', icon: '🎃' },
  };
  
  const currentDate = new Date().toISOString();
  
  // Filter out excluded holidays
  const filteredHolidayData = holidayData.filter(h => !EXCLUDED_HOLIDAYS.includes(h.name));
  
  const libraryHolidays = filteredHolidayData.map(h => {
    const name = h.name;
    const attributes = holidayAttributes[name] || { color: '#757575', icon: '📅' };
    
    // FIX: Format the date correctly to ISO format without the time part
    // Original: h.date.toString().split('T')[0] - this doesn't work with the date format from the library
    const holidayDate = new Date(h.date);
    const formattedDate = `${holidayDate.getFullYear()}-${String(holidayDate.getMonth() + 1).padStart(2, '0')}-${String(holidayDate.getDate()).padStart(2, '0')}`;
    
    return {
      id: `holiday-${name.toLowerCase().replace(/\s/g, '-')}-${year}`,
      date: formattedDate,
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
    
    // FIX: Format the date correctly for custom holidays too
    const formattedDate = `${h.date.getFullYear()}-${String(h.date.getMonth() + 1).padStart(2, '0')}-${String(h.date.getDate()).padStart(2, '0')}`;
    
    return {
      id: `holiday-${h.name.toLowerCase().replace(/\s/g, '-')}-${year}`,
      date: formattedDate,
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