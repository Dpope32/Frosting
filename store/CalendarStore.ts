// store/CalendarStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createPersistStorage } from './AsyncStorage'
import { useProjectStore } from './ToDo'
import { WeekDay } from './ToDo'
import * as Notifications from 'expo-notifications'
import { SchedulableTriggerInputTypes } from 'expo-notifications'
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
        // Skip notification scheduling on web platforms
        if (Platform.OS === 'web') {
          return identifier || 'web-notification-not-supported';
        }
        
        try {
          const { status } = await Notifications.getPermissionsAsync()
          if (status !== 'granted') {
            const { status: reqStatus } = await Notifications.requestPermissionsAsync()
            if (reqStatus !== 'granted') {
              throw new Error('Notification permissions not granted')
            }
          }
          const notifId = await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body,
              sound: 'default',
              priority: Notifications.AndroidNotificationPriority.MAX,
            },
            trigger: {
              type: SchedulableTriggerInputTypes.DATE,
              date: date,
              channelId: Platform.OS === 'android' ? 'birthdays' : undefined,
            },
            identifier,
          })
          return notifId
        } catch (error) {
          throw new Error(`Failed to schedule notification: ${error}`)
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
