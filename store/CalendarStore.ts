// store/CalendarStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createPersistStorage } from './AsyncStorage'
import { useProjectStore } from './ToDo'
import { WeekDay } from './ToDo'
import { scheduleEventNotification } from '@/services/notificationServices'
import { format } from 'date-fns'
import { Platform } from 'react-native'
import { usePeopleStore } from './People'
import type { Person } from '@/types/people'

export interface CalendarEvent {
  id: string
  date: string
  time?: string  
  title: string
  description?: string
  type?: 'birthday' | 'personal' | 'work' | 'family' | 'bill' | 'nba'
  personId?: string
  teamCode?: string // For NBA games
  notifyOnDay?: boolean // Whether to send notification on the day of event
  notifyBefore?: boolean // Whether to send notification before the event
  notifyBeforeTime?: string // How long before the event to send notification (e.g., '1h', '30m', '1d')
  createdAt: string
  updatedAt: string
}

interface CalendarState {
  events: CalendarEvent[]
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateEvent: (id: string, eventUpdate: Partial<Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>>) => void
  deleteEvent: (id: string) => void
  getEventsForDate: (date: string) => CalendarEvent[]
  clearAllEvents: () => void
  syncBirthdays: (newContactId?: string) => void
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
        const eventsForDate = state.events.filter((event) => event.date === date)
        return eventsForDate
      },

      clearAllEvents: () => set({ events: [] }),

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

      syncBirthdays: (newContactId) =>
        set((state) => {
          const contacts = usePeopleStore.getState().contacts as Record<string, Person>
          const currentYear = new Date().getFullYear()
          const addTask = useProjectStore.getState().addTask
          const scheduleNotification = get().scheduleNotification

          const contactsToSync = newContactId ? { [newContactId]: contacts[newContactId] } : contacts

          const existingEvents = state.events
          const nonBirthdayEvents = existingEvents.filter(
            (event) => event.type !== 'birthday' || (newContactId && event.personId !== newContactId)
          )

          const years = [currentYear, currentYear + 1, currentYear + 2]
          const birthdayEvents = Object.values(contactsToSync)
            .filter((person: Person) => person.birthday)
            .flatMap((person: Person) => {
              return years.map((year) => {
                const [birthYear, month, day] = person.birthday.split('-')
                const eventDate = new Date(Date.UTC(year, parseInt(month) - 1, parseInt(day)))
                eventDate.setUTCHours(14, 0, 0, 0) // Set 14:00 UTC first!
                const age = year - parseInt(birthYear)
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
                }
                const now = new Date()
                const birthdayDate = new Date(eventDate) // This will already be 14:00 UTC
                const twoWeeksBefore = new Date(birthdayDate)
                twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14)
                if (birthdayDate > now) {
                  scheduleNotification(
                    birthdayDate,
                    `🎂 ${person.name}'s Birthday Today!`,
                    `Don't forget to wish ${person.name} a happy ${age}th birthday!`,
                    `birthday-${person.id}-${year}-day`
                  )
                } else {
                }
                if (person.priority && twoWeeksBefore > now) {
                  scheduleNotification(
                    twoWeeksBefore,
                    `🎁 ${person.name}'s Birthday in 2 Weeks`,
                    `Time to get a birthday present for ${person.name}!`,
                    `birthday-${person.id}-${year}-reminder`
                  )
                  const reminderDay = twoWeeksBefore.getDay()
                  const weekDays: WeekDay[] = [
                    'sunday',
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                  ]
                  const taskName = `Get ${person.name}'s birthday present (birthday in 2 weeks)`
                  addTask({
                    name: taskName,
                    schedule: [weekDays[reminderDay]],
                    priority: 'medium',
                    category: 'personal',
                    scheduledDate: twoWeeksBefore.toISOString(),
                    recurrencePattern: 'one-time'
                  })
                }
                if (birthdayDate >= now) {
                  const birthdayDay = birthdayDate.getDay()
                  const weekDays: WeekDay[] = [
                    'sunday',
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                  ]
                  const taskName = `Wish ${person.name} a happy birthday! 🎂`
                  addTask({
                    name: taskName,
                    schedule: [weekDays[birthdayDay]],
                    priority: 'high',
                    category: 'personal',
                    scheduledDate: birthdayDate.toISOString(),
                    recurrencePattern: 'one-time'
                  })
                }
                return birthdayEvent
              })
            })
          return { events: [...nonBirthdayEvents, ...birthdayEvents] }
        }),
    }),
    {
      name: 'calendar-storage',
      storage: createPersistStorage<CalendarState>(),
    }
  )
)
