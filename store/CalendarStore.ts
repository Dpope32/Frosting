// store/CalendarStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createPersistStorage } from './AsyncStorage'
import { useProjectStore } from './ToDo'
import { scheduleEventNotification } from '@/services/notificationServices'
import { format } from 'date-fns'
import { Platform } from 'react-native'
import { usePeopleStore } from './People'
import type { Person, WeekDay } from '@/types'
import { getDeviceCalendarEvents, convertToAppCalendarEvents } from '@/services'
import { addSyncLog } from '@/components/sync'
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
  isSyncEnabled: boolean
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
  toggleCalendarSync: () => void
  hydrateFromSync?: (syncedData: { events?: CalendarEvent[] }) => void
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [] as CalendarEvent[],
      isSyncEnabled: false,

      addEvent: (eventData) => {
        const newEvent: CalendarEvent = {
          ...eventData,
          id: Math.random().toString(36).substring(2, 11),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ events: [...state.events, newEvent] }))
        try {
          addSyncLog(`Calendar event added locally: ${newEvent.title}`, 'info')
        } catch(e) {/* ignore */}
      },

      addEvents: (eventsData) => {
        const newEvents: CalendarEvent[] = eventsData.map(eventData => ({
          ...eventData,
          id: Math.random().toString(36).substring(2, 11),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))
        set((state) => ({ events: [...state.events, ...newEvents] }))
        try {
          addSyncLog(`Added ${newEvents.length} calendar events locally.`, 'info')
        } catch(e) {/* ignore */}
      },

      updateEvent: (id, eventUpdate) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...eventUpdate, updatedAt: new Date().toISOString() } : event
          ),
        }))
        try {
          addSyncLog(`Calendar event updated locally: ID ${id}`, 'info')
        } catch(e) {/* ignore */}
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }))
        try {
          addSyncLog(`Calendar event deleted locally: ID ${id}`, 'info')
        } catch(e) {/* ignore */}
      },

      getEventsForDate: (date: string) => {
        const state = get()
        const eventsForDate = state.events
          .filter((event) => event.date === date)
          .sort((a, b) => {
            if (!a.time && !b.time) return 0
            if (!a.time) return 1
            if (!b.time) return -1
            return b.time!.localeCompare(a.time!)
          })
        return eventsForDate
      },

      clearAllEvents: () => {
        set({ events: [] })
        try {
          addSyncLog('All calendar events cleared locally', 'info')
        } catch(e) {/* ignore */}
      },
      
      syncDeviceCalendarEvents: async (startDate: Date, endDate: Date) => {
        if (Platform.OS === 'web') return
        
        try {
          const deviceEvents = await getDeviceCalendarEvents(startDate, endDate)
          const appEvents = convertToAppCalendarEvents(deviceEvents)
          set((state) => {
            const nonDeviceEvents = state.events.filter(
              (event) => !event.id.startsWith('device-')
            )
            addSyncLog(`Synced ${appEvents.length} device calendar events.`, 'info')
            return {
              events: [...nonDeviceEvents, ...appEvents],
            }
          })
        } catch (error) {
          console.error('Failed to sync device calendar events:', error)
            addSyncLog('Failed to sync device calendar events', 'error')
        }
      },

      scheduleNotification: async (date, title, body, identifier) => {
        try {
          return await scheduleEventNotification(date, title, body, identifier)
        } catch (error) {
          console.error('Failed to schedule notification:', error)
          return 'error'
        }
      },
      
      scheduleEventNotifications: async (event: CalendarEvent) => {
        if (Platform.OS === 'web') return
        
        try {
          const { date, time, title, notifyOnDay, notifyBefore, notifyBeforeTime } = event
          
          const eventDate = new Date(`${date}T${time || '12:00:00'}`)
          
          if (notifyOnDay) {
            const dayOfNotificationDate = new Date(eventDate)
            dayOfNotificationDate.setHours(9, 0, 0, 0)
            
            if (dayOfNotificationDate > new Date()) {
              await scheduleEventNotification(
                dayOfNotificationDate,
                `Event Today: ${title}`,
                `You have "${title}" scheduled today${time ? ` at ${time}` : ''}`,
                `event-day-${event.id}`
              )
            }
          }
          
          if (notifyBefore && notifyBeforeTime) {
            const beforeNotificationDate = new Date(eventDate)
            
            const timeValue = parseInt(notifyBeforeTime.match(/\d+/)?.[0] || '0', 10)
            const timeUnit = notifyBeforeTime.match(/[a-z]/i)?.[0] || 'm'
            
            if (timeValue > 0) {
              if (timeUnit === 'm') {
                beforeNotificationDate.setMinutes(beforeNotificationDate.getMinutes() - timeValue)
              } else if (timeUnit === 'h') {
                beforeNotificationDate.setHours(beforeNotificationDate.getHours() - timeValue)
              } else if (timeUnit === 'd') {
                beforeNotificationDate.setDate(beforeNotificationDate.getDate() - timeValue)
              }
              
              if (beforeNotificationDate > new Date()) {
                await scheduleEventNotification(
                  beforeNotificationDate,
                  `Upcoming Event: ${title}`,
                  `Your event "${title}" is coming up in ${timeValue} ${
                    timeUnit === 'm' ? 'minutes' : timeUnit === 'h' ? 'hours' : 'days'
                  }`,
                  `event-before-${event.id}`
                )
              }
            }
          }
        } catch (error) {
          console.error('Failed to schedule event notifications:', error)
        }
      },

      syncBirthdays: (newContactId) => {
        const startTime = performance.now()
        addSyncLog('🔍 [CalendarStore] syncBirthdays start', 'verbose')
        
        // First, do the fast synchronous work to update events immediately
        const syncResult = set((state) => {
          try {
            const contacts = usePeopleStore.getState().contacts as Record<string, Person>
            const currentYear = new Date().getFullYear()
            const contactsToSync = newContactId ? { [newContactId]: contacts[newContactId] } : contacts
            
            addSyncLog(`[CalendarStore] Processing ${Object.keys(contactsToSync).length} contacts for birthday sync`, 'info')
            
            const nonBirthdayEvents = state.events.filter(
              (event) => event.type !== 'birthday' || (newContactId && event.personId !== newContactId)
            )
            
            const years = Array.from({ length: 10 }, (_, i) => currentYear + i)
            const contactsWithBirthdays = Object.values(contactsToSync).filter((person: Person) => person.birthday)
            const birthdayEvents: CalendarEvent[] = []
            
            addSyncLog(`[CalendarStore] Found ${contactsWithBirthdays.length} contacts with birthdays`, 'info')
            
            // Generate birthday events (this is fast)
            contactsWithBirthdays.forEach((person: Person) => {
              years.forEach((year) => {
                const [birthYear, month, day] = person.birthday.split('-')
                const eventDate = new Date(Date.UTC(year, parseInt(month) - 1, parseInt(day)))
                eventDate.setUTCHours(14, 0, 0, 0)
                const age = year - parseInt(birthYear)
                const birthdayEvent: CalendarEvent = {
                  id: `birthday-${person.id}-${year}`,
                  type: 'birthday',
                  personId: person.id,
                  date: format(eventDate, 'yyyy-MM-dd'),
                  title: `🎂 ${person.name}'s Birthday`,
                  description: `${person.name} turns ${age} today!`,
                  notifyOnDay: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
                
                birthdayEvents.push(birthdayEvent)
              })
            })
            
            const eventsTime = performance.now()
            addSyncLog(`[CalendarStore] Generated ${birthdayEvents.length} birthday events in ${(eventsTime - startTime).toFixed(2)}ms`, 'info')
            
            // Store contacts with birthdays for async processing
            ;(globalThis as any).__birthdayContactsToProcess = contactsWithBirthdays
            
            return { events: [...nonBirthdayEvents, ...birthdayEvents] }
          } catch (error) {
            addSyncLog(`🔴 [CalendarStore] Error in syncBirthdays: ${error}`, 'error')
            return state
          }
        })
        
        // Now do the expensive async operations (notifications and tasks) without blocking UI
        setTimeout(async () => {
          const asyncStartTime = performance.now()
          let notificationCount = 0
          let taskCount = 0
          
          try {
            const contactsWithBirthdays = (globalThis as any).__birthdayContactsToProcess || []
            delete (globalThis as any).__birthdayContactsToProcess
            
            if (contactsWithBirthdays.length === 0) {
              addSyncLog('[CalendarStore] No contacts with birthdays to process async tasks', 'info')
              return
            }
            
            addSyncLog(`[CalendarStore] Starting async birthday notifications and tasks for ${contactsWithBirthdays.length} contacts`, 'info')
            
            const addTask = useProjectStore.getState().addTask
            const scheduleNotification = get().scheduleNotification
            const currentYear = new Date().getFullYear()
            const years = Array.from({ length: 10 }, (_, i) => currentYear + i)
            
            for (const person of contactsWithBirthdays) {
              for (const year of years) {
                const [birthYear, month, day] = person.birthday.split('-')
                const eventDate = new Date(Date.UTC(year, parseInt(month) - 1, parseInt(day)))
                eventDate.setUTCHours(14, 0, 0, 0)
                const age = year - parseInt(birthYear)
                
                const now = new Date()
                const birthdayDate = new Date(eventDate)
                const twoWeeksBefore = new Date(birthdayDate)
                twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14)
                
                // Schedule notifications
                if (birthdayDate > now) {
                  try {
                    await scheduleNotification(
                      birthdayDate,
                      `🎂 ${person.name}'s Birthday Today!`,
                      `Don't forget to wish ${person.name} a happy ${age}th birthday!`,
                      `birthday-${person.id}-${year}-day`
                    )
                    notificationCount++
                  } catch (error) {
                    addSyncLog(`Failed to schedule birthday notification for ${person.name}`, 'error')
                  }
                }
                
                if (person.priority && twoWeeksBefore > now) {
                  try {
                    await scheduleNotification(
                      twoWeeksBefore,
                      `🎁 ${person.name}'s Birthday in 2 Weeks`,
                      `Time to get a birthday present for ${person.name}!`,
                      `birthday-${person.id}-${year}-reminder`
                    )
                    notificationCount++
                    
                    // Add reminder task
                    const reminderDay = twoWeeksBefore.getDay()
                    const weekDays: WeekDay[] = [
                      'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
                    ]
                    addTask({
                      name: `Get ${person.name}'s birthday present (birthday in 2 weeks)`,
                      schedule: [weekDays[reminderDay]],
                      priority: 'medium',
                      category: 'personal',
                      scheduledDate: twoWeeksBefore.toISOString(),
                      recurrencePattern: 'one-time'
                    })
                    taskCount++
                  } catch (error) {
                    addSyncLog(`Failed to schedule 2-week reminder for ${person.name}`, 'error')
                  }
                }
                
                if (birthdayDate >= now) {
                  try {
                    const birthdayDay = birthdayDate.getDay()
                    const weekDays: WeekDay[] = [
                      'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
                    ]
                    addTask({
                      name: `Wish ${person.name} a happy birthday! 🎂`,
                      schedule: [weekDays[birthdayDay]],
                      priority: 'high',
                      category: 'personal',
                      scheduledDate: birthdayDate.toISOString(),
                      recurrencePattern: 'one-time'
                    })
                    taskCount++
                  } catch (error) {
                    addSyncLog(`Failed to add birthday task for ${person.name}`, 'error')
                  }
                }
              }
              
              // Add small delays every few contacts to prevent overwhelming the system
              if (contactsWithBirthdays.indexOf(person) % 3 === 2) {
                await new Promise(resolve => setTimeout(resolve, 5))
              }
            }
            
            const asyncEndTime = performance.now()
            const totalTime = asyncEndTime - startTime
            const asyncTime = asyncEndTime - asyncStartTime
            
            addSyncLog(`[CalendarStore] ✅ Birthday sync complete: ${notificationCount} notifications, ${taskCount} tasks in ${asyncTime.toFixed(2)}ms (total: ${totalTime.toFixed(2)}ms)`, 'success')
          } catch (error) {
            const errorTime = performance.now()
            addSyncLog(`🔴 [CalendarStore] Error in async birthday processing: ${error}`, 'error')
            console.error('🔴 [CalendarStore] async birthday processing error:', error)
          }
        }, 10) // Small delay to let UI update first
        
        return syncResult
      },

      toggleCalendarSync: () => {
        set((state) => {
          const newSyncState = !state.isSyncEnabled
          try {
            addSyncLog(`Calendar sync ${newSyncState ? 'enabled' : 'disabled'}`, 'info')
          } catch (e) {/* ignore */}
          return { isSyncEnabled: newSyncState }
        })
      },

      hydrateFromSync: (syncedData: { events?: CalendarEvent[] }) => {
        const currentSyncEnabledState = get().isSyncEnabled
        if (!currentSyncEnabledState) {
          addSyncLog('Calendar sync is disabled, skipping hydration for CalendarStore.', 'info')
          return
        }

        if (!syncedData.events || !Array.isArray(syncedData.events)) {
          addSyncLog('No events data in snapshot for CalendarStore, or events are not an array.', 'info')
          return
        }

        let itemsMergedCount = 0
        let itemsAddedCount = 0
        let itemsSkippedDevice = 0

        set((state) => {
          const localEventsMap = new Map(state.events.map(event => [event.id, event]))
          let mergedEventsArray = [...state.events] // Start with all local events

          for (const incomingEvent of syncedData.events!) {
            // Skip birthday events - they're generated locally
            if (incomingEvent.type === 'birthday') {
              continue;
            }
            
            // Skip device-specific events if they come from snapshot
            if (incomingEvent.id.startsWith('device-')) {
              itemsSkippedDevice++
              continue
            }

            const localEvent = localEventsMap.get(incomingEvent.id)

            if (localEvent) {
              // Event exists, check updatedAt for merge strategy (last write wins)
              const localUpdatedAt = new Date(localEvent.updatedAt).getTime()
              const incomingUpdatedAt = new Date(incomingEvent.updatedAt).getTime()

              if (incomingUpdatedAt > localUpdatedAt) {
                // Incoming is newer, find index and replace
                const index = mergedEventsArray.findIndex(e => e.id === incomingEvent.id)
                if (index !== -1) {
                  mergedEventsArray[index] = incomingEvent
                  itemsMergedCount++
                }
              } // Else, local is newer or same, keep local (already in mergedEventsArray)
            } else {
              // New event, add it
              mergedEventsArray.push(incomingEvent)
              itemsAddedCount++
            }
          }
          
          addSyncLog(`Calendar events hydrated: ${itemsAddedCount} added, ${itemsMergedCount} merged, ${itemsSkippedDevice} device events skipped. Total events: ${mergedEventsArray.length}`, 'success')
          return { events: mergedEventsArray }
        })
      },
    }),
    {
      name: 'calendar-storage',
      storage: createPersistStorage<CalendarState>(),
    }
  )
)
