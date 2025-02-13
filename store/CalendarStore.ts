// store/CalendarStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'
import { storage } from './MMKV'
import { useProjectStore } from './ToDo'
import { WeekDay } from './ToDo'
import * as Notifications from 'expo-notifications'
import { SchedulableTriggerInputTypes } from 'expo-notifications'
import { format } from 'date-fns'
import { Platform } from 'react-native'
import { usePeopleStore } from './People'
import type { Person } from '@/types/people'

const mmkvStorage: StateStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name)
    return value ?? null
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value)
  },
  removeItem: (name: string) => {
    storage.delete(name)
  },
}

export interface CalendarEvent {
  id: string
  date: string
  title: string
  description: string
  type?: 'birthday' | 'regular' | 'bill'
  personId?: string
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
          console.log('[CalendarStore] Added event:', newEvent.title, newEvent.date)
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
        console.log('[CalendarStore] Events for date', date, eventsForDate)
        return eventsForDate
      },

      clearAllEvents: () => set({ events: [] }),

      scheduleNotification: async (date, title, body, identifier) => {
        try {
          const { status } = await Notifications.getPermissionsAsync()
          console.log('[CalendarStore] Current notification permission status:', status)
          if (status !== 'granted') {
            const { status: reqStatus } = await Notifications.requestPermissionsAsync()
            console.log('[CalendarStore] Requested notification permissions, new status:', reqStatus)
            if (reqStatus !== 'granted') {
              throw new Error('Notification permissions not granted')
            }
          }
          console.log('[CalendarStore] Scheduling notification:', {
            title,
            body,
            date: date.toISOString(),
          })
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
          console.log('[CalendarStore] Notification scheduled with id:', notifId)
          return notifId
        } catch (error) {
          console.error('[CalendarStore] Failed to schedule notification:', error)
          throw error
        }
      },

      syncBirthdays: (newContactId) =>
        set((state) => {
          const contacts = usePeopleStore.getState().contacts as Record<string, Person>
          const currentYear = new Date().getFullYear()
          const addTask = useProjectStore.getState().addTask
          const scheduleNotification = get().scheduleNotification

          const contactsToSync = newContactId ? { [newContactId]: contacts[newContactId] } : contacts
          console.log('[CalendarStore] Starting birthday sync for', Object.keys(contactsToSync).length, 'contacts')

          const existingEvents = state.events
          const nonBirthdayEvents = existingEvents.filter(
            (event) => event.type !== 'birthday' || (newContactId && event.personId !== newContactId)
          )
          console.log('[CalendarStore] Non-birthday events count:', nonBirthdayEvents.length)

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
                console.log('[CalendarStore] Processing birthday for', person.name, 'year', year, {
                  birthdayDate: birthdayDate.toISOString(),
                  twoWeeksBefore: twoWeeksBefore.toISOString(),
                })
                if (birthdayDate > now) {
                  console.log('[CalendarStore] Scheduling birthday notification for', person.name)
                  scheduleNotification(
                    birthdayDate,
                    `🎂 ${person.name}'s Birthday Today!`,
                    `Don't forget to wish ${person.name} a happy ${age}th birthday!`,
                    `birthday-${person.id}-${year}-day`
                  )
                } else {
                  console.log('[CalendarStore] Skipped birthday notification for', person.name, 'as date is in the past')
                }
                if (person.priority && twoWeeksBefore > now) {
                  console.log('[CalendarStore] Scheduling 2-week reminder for', person.name)
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
                  console.log('[CalendarStore] Creating task for reminder:', taskName)
                  addTask({
                    name: taskName,
                    schedule: [weekDays[reminderDay]],
                    priority: 'medium',
                    category: 'personal',
                    isOneTime: true,
                    scheduledDate: twoWeeksBefore.toISOString(),
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
                  console.log('[CalendarStore] Creating birthday task:', taskName)
                  addTask({
                    name: taskName,
                    schedule: [weekDays[birthdayDay]],
                    priority: 'high',
                    category: 'personal',
                    isOneTime: true,
                    scheduledDate: birthdayDate.toISOString(),
                  })
                }
                return birthdayEvent
              })
            })
          console.log('[CalendarStore] Sync complete. New birthday events:', birthdayEvents.length)
          return { events: [...nonBirthdayEvents, ...birthdayEvents] }
        }),
    }),
    {
      name: 'calendar-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
)
