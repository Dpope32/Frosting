// store/CalendarStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createPersistStorage } from './AsyncStorage'
import { useProjectStore } from './ToDo'
import { WeekDay } from '@/types/task'
import { scheduleEventNotification } from '@/services/notificationServices'
import { format } from 'date-fns'
import { Platform } from 'react-native'
import { usePeopleStore } from './People'
import type { Person } from '@/types/people'
import { getDeviceCalendarEvents, convertToAppCalendarEvents } from '@/services/calendarService'

export interface CalendarEvent {
  id: string
  date: string
  time?: string  
  title: string
  description?: string
  type?: 'birthday' | 'personal' | 'work' | 'family' | 'wealth' | 'health' | 'bill' | 'nba' | 'holiday' | 'task'
  personId?: string
  teamCode?: string 
  taskId?: string 
  notifyOnDay?: boolean
  notifyBefore?: boolean
  notifyBeforeTime?: string
  createdAt: string
  updatedAt: string
  holidayColor?: string
  priority?: 'high' | 'medium' | 'low'
  holidayIcon?: string
}

interface CalendarState {
  events: CalendarEvent[]
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void
  addEvents: (events: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>[]) => void
  updateEvent: (id: string, eventUpdate: Partial<Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>>) => void
  deleteEvent: (id: string) => void
  getEventsForDate: (date: string) => CalendarEvent[]
  clearAllEvents: () => void
  syncBirthdays: (newContactId?: string) => void
  syncDeviceCalendarEvents: (startDate: Date, endDate: Date) => Promise<void>
  scheduleNotification: (date: Date, title: string, body: string, identifier?: string) => Promise<string>
  scheduleEventNotifications: (event: CalendarEvent) => Promise<void>
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [] as CalendarEvent[],

      addEvent: (eventData) =>
        set((state) => {
          const newEvent: CalendarEvent = {
            ...eventData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          return { events: [...state.events, newEvent] }
        }),

      addEvents: (eventsData) =>
        set((state) => {
          const newEvents: CalendarEvent[] = eventsData.map(eventData => ({
            ...eventData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          return { events: [...state.events, ...newEvents] }
        }),

      updateEvent: (id, eventUpdate) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...eventUpdate, updatedAt: new Date().toISOString() } : event
          ),
        })),

      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        })),

      getEventsForDate: (date: string) => {
        const state = get()
        const eventsForDate = state.events
          .filter((event) => event.date === date)
          .sort((a, b) => {
            // Events without time come last in descending order
            if (!a.time && !b.time) return 0
            if (!a.time) return 1 // Events without time come last
            if (!b.time) return -1 // Events without time come last
            
            // Sort by time descending (latest to earliest)
            return b.time!.localeCompare(a.time!) // Reversed comparison for descending order
          })
        return eventsForDate
      },

      clearAllEvents: () => set({ events: [] }),
      
      syncDeviceCalendarEvents: async (startDate: Date, endDate: Date) => {
        if (Platform.OS === 'web') return;
        
        try {
          
          // Get device calendar events
          const deviceEvents = await getDeviceCalendarEvents(startDate, endDate);
          
          // Convert to app format
          const appEvents = convertToAppCalendarEvents(deviceEvents);
          
          // Update store
          set((state) => {
            // Filter out existing device events to avoid duplicates
            const nonDeviceEvents = state.events.filter(
              (event) => !event.id.startsWith('device-')
            );
            
            return {
              events: [...nonDeviceEvents, ...appEvents],
            };
          });
        } catch (error) {
          console.error('Failed to sync device calendar events:', error);
        }
      },

      scheduleNotification: async (date, title, body, identifier) => {
        try {
          return await scheduleEventNotification(date, title, body, identifier);
        } catch (error) {
          console.error('Failed to schedule notification:', error);
          return 'error';
        }
      },
      
      scheduleEventNotifications: async (event: CalendarEvent) => {
        if (Platform.OS === 'web') return;
        
        try {
          const { date, time, title, notifyOnDay, notifyBefore, notifyBeforeTime } = event;
          
          // Parse the event date and time
          const eventDate = new Date(`${date}T${time || '12:00:00'}`);
          
          // Schedule notification for the day of the event
          if (notifyOnDay) {
            // Set notification for 9 AM on the day of the event
            const dayOfNotificationDate = new Date(eventDate);
            dayOfNotificationDate.setHours(9, 0, 0, 0);
            
            // Only schedule if it's in the future
            if (dayOfNotificationDate > new Date()) {
              await scheduleEventNotification(
                dayOfNotificationDate,
                `Event Today: ${title}`,
                `You have "${title}" scheduled today${time ? ` at ${time}` : ''}.`,
                `event-day-${event.id}`
              );
            }
          }
          
          // Schedule notification before the event
          if (notifyBefore && notifyBeforeTime) {
            const beforeNotificationDate = new Date(eventDate);
            
            // Parse the notifyBeforeTime (e.g., '30m', '1h', '1d')
            const timeValue = parseInt(notifyBeforeTime.match(/\d+/)?.[0] || '0', 10);
            const timeUnit = notifyBeforeTime.match(/[a-z]/i)?.[0] || 'm';
            
            if (timeValue > 0) {
              if (timeUnit === 'm') {
                beforeNotificationDate.setMinutes(beforeNotificationDate.getMinutes() - timeValue);
              } else if (timeUnit === 'h') {
                beforeNotificationDate.setHours(beforeNotificationDate.getHours() - timeValue);
              } else if (timeUnit === 'd') {
                beforeNotificationDate.setDate(beforeNotificationDate.getDate() - timeValue);
              }
              
              // Only schedule if it's in the future
              if (beforeNotificationDate > new Date()) {
                await scheduleEventNotification(
                  beforeNotificationDate,
                  `Upcoming Event: ${title}`,
                  `Your event "${title}" is coming up in ${timeValue} ${
                    timeUnit === 'm' ? 'minutes' : timeUnit === 'h' ? 'hours' : 'days'
                  }.`,
                  `event-before-${event.id}`
                );
              }
            }
          }
        } catch (error) {
          console.error('Failed to schedule event notifications:', error);
        }
      },

      syncBirthdays: (newContactId) => {
        console.log('🔍 [CalendarStore] syncBirthdays start:', new Date().toISOString());
        console.log(`🔍 [CalendarStore] syncBirthdays for ${newContactId ? 'single contact' : 'all contacts'}`);
        const startTime = performance.now();
        
        return set((state) => {
          try {
            console.log(`🔍 [CalendarStore] getting contacts from store`);
            const getContactsStart = performance.now();
            const contacts = usePeopleStore.getState().contacts as Record<string, Person>;
            console.log(`🔍 [CalendarStore] got ${Object.keys(contacts).length} contacts (${performance.now() - getContactsStart}ms)`);
            
            const currentYear = new Date().getFullYear();
            const addTask = useProjectStore.getState().addTask;
            const scheduleNotification = get().scheduleNotification;
  
            const contactsToSync = newContactId ? { [newContactId]: contacts[newContactId] } : contacts;
            console.log(`🔍 [CalendarStore] syncing ${Object.keys(contactsToSync).length} contacts`);
  
            const existingEvents = state.events;
            console.log(`🔍 [CalendarStore] filtering ${existingEvents.length} existing events`);
            const filterStart = performance.now();
            const nonBirthdayEvents = existingEvents.filter(
              (event) => event.type !== 'birthday' || (newContactId && event.personId !== newContactId)
            );
            console.log(`🔍 [CalendarStore] filtered to ${nonBirthdayEvents.length} non-birthday events (${performance.now() - filterStart}ms)`);

            console.log('🔍 [CalendarStore] generating birthday events for next 10 years');
            const generateStart = performance.now();
            const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
            
            console.log('🔍 [CalendarStore] finding contacts with birthdays');
            const contactsWithBirthdays = Object.values(contactsToSync).filter((person: Person) => person.birthday);
            console.log(`🔍 [CalendarStore] found ${contactsWithBirthdays.length} contacts with birthdays`);
            
            const birthdayEvents: CalendarEvent[] = [];
            let notificationsCreated = 0;
            let tasksCreated = 0;
            
            contactsWithBirthdays.forEach((person: Person) => {
              years.forEach((year) => {
                const [birthYear, month, day] = person.birthday.split('-');
                const eventDate = new Date(Date.UTC(year, parseInt(month) - 1, parseInt(day)));
                eventDate.setUTCHours(14, 0, 0, 0); // Set 14:00 UTC first!
                const age = year - parseInt(birthYear);
                const birthdayEvent: CalendarEvent = {
                  id: `birthday-${person.id}-${year}`,
                  type: 'birthday',
                  personId: person.id,
                  date: format(eventDate, 'yyyy-MM-dd'), // Now this will be the same date as notification
                  title: `🎂 ${person.name}'s Birthday`,
                  description: `${person.name} turns ${age} today!`,
                  notifyOnDay: true, // Always notify on birthdays
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                
                birthdayEvents.push(birthdayEvent);
                
                const now = new Date();
                const birthdayDate = new Date(eventDate); // This will already be 14:00 UTC
                const twoWeeksBefore = new Date(birthdayDate);
                twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14);
                
                if (birthdayDate > now) {
                  scheduleNotification(
                    birthdayDate,
                    `🎂 ${person.name}'s Birthday Today!`,
                    `Don't forget to wish ${person.name} a happy ${age}th birthday!`,
                    `birthday-${person.id}-${year}-day`
                  );
                  notificationsCreated++;
                }
                
                if (person.priority && twoWeeksBefore > now) {
                  scheduleNotification(
                    twoWeeksBefore,
                    `🎁 ${person.name}'s Birthday in 2 Weeks`,
                    `Time to get a birthday present for ${person.name}!`,
                    `birthday-${person.id}-${year}-reminder`
                  );
                  notificationsCreated++;
                  
                  const reminderDay = twoWeeksBefore.getDay();
                  const weekDays: WeekDay[] = [
                    'sunday',
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                  ];
                  const taskName = `Get ${person.name}'s birthday present (birthday in 2 weeks)`;
                  addTask({
                    name: taskName,
                    schedule: [weekDays[reminderDay]],
                    priority: 'medium',
                    category: 'personal',
                    scheduledDate: twoWeeksBefore.toISOString(),
                    recurrencePattern: 'one-time'
                  });
                  tasksCreated++;
                }
                
                if (birthdayDate >= now) {
                  const birthdayDay = birthdayDate.getDay();
                  const weekDays: WeekDay[] = [
                    'sunday',
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                  ];
                  const taskName = `Wish ${person.name} a happy birthday! 🎂`;
                  addTask({
                    name: taskName,
                    schedule: [weekDays[birthdayDay]],
                    priority: 'high',
                    category: 'personal',
                    scheduledDate: birthdayDate.toISOString(),
                    recurrencePattern: 'one-time'
                  });
                  tasksCreated++;
                }
              });
            });
            
            console.log(`🔍 [CalendarStore] created ${birthdayEvents.length} events, ${notificationsCreated} notifications, ${tasksCreated} tasks (${performance.now() - generateStart}ms)`);
            
            console.log(`✅ [CalendarStore] syncBirthdays complete (${performance.now() - startTime}ms)`);
            return { events: [...nonBirthdayEvents, ...birthdayEvents] };
          } catch (error) {
            console.error('🔴 [CalendarStore] Error in syncBirthdays:', error);
            // Return current state if there's an error
            return state;
          }
        });
      },
    }),
    {
      name: 'calendar-storage',
      storage: createPersistStorage<CalendarState>(),
    }
  )
)
