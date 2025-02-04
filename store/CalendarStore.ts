import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { storage } from './MMKV';
import { useProjectStore } from './ToDo';
import { WeekDay } from './ToDo';

const mmkvStorage: StateStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type?: 'birthday' | 'regular';
  personId?: string;
  createdAt: string; 
  updatedAt: string; 
}

interface CalendarState {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, eventUpdate: Partial<Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteEvent: (id: string) => void;
  getEventsForDate: (date: string) => CalendarEvent[];
  clearAllEvents: () => void;
  syncBirthdays: () => void;
}

import { usePeopleStore } from './People';
import type { Person } from '@/types/people';

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [],
      
      addEvent: (eventData) => set((state) => {
        const newEvent: CalendarEvent = {
          ...eventData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { events: [...state.events, newEvent] };
      }),

      updateEvent: (id, eventUpdate) => set((state) => ({
        events: state.events.map(event => 
          event.id === id
            ? {
                ...event,
                ...eventUpdate,
                updatedAt: new Date().toISOString(),
              }
            : event
        ),
      })),

      deleteEvent: (id) => set((state) => ({
        events: state.events.filter(event => event.id !== id),
      })),

      getEventsForDate: (date) => {
        const state = get();
        return state.events.filter(event => event.date === date);
      },

      clearAllEvents: () => set({ events: [] }),

      syncBirthdays: () => set((state) => {
        const contacts = usePeopleStore.getState().contacts;
        const currentYear = new Date().getFullYear();
        const addTask = useProjectStore.getState().addTask;
        
        // Filter out existing birthday events
        const nonBirthdayEvents = state.events.filter(event => event.type !== 'birthday');
        
        // Create new birthday events for the current year
        const birthdayEvents = Object.values(contacts)
          .filter((person: Person) => person.birthday)
          .map((person: Person) => {
            const [_, month, day] = person.birthday.split('-');
            const eventDate = `${currentYear}-${month}-${day}`;
            const age = currentYear - parseInt(person.birthday.split('-')[0]);
            
            // Create birthday event
            const birthdayEvent = {
              id: `birthday-${person.id}-${currentYear}`,
              type: 'birthday' as const,
              personId: person.id,
              date: eventDate,
              title: `🎂 ${person.name}'s Birthday`,
              description: `${person.name} turns ${age} today!`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            // Calculate dates for tasks
            const birthdayDate = new Date(eventDate);
            const twoWeeksBefore = new Date(birthdayDate);
            twoWeeksBefore.setDate(birthdayDate.getDate() - 14);

            // Only create tasks if the dates are in the future
            const now = new Date();
            if (twoWeeksBefore >= now) {
              // Create "Get present" task
              const reminderDay = twoWeeksBefore.getDay();
              const weekDays: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              addTask({
                name: `Get ${person.name}'s birthday present (birthday in 2 weeks)`,
                schedule: [weekDays[reminderDay]],
                priority: 'medium',
                category: 'personal',
                isOneTime: true,
                scheduledDate: twoWeeksBefore.toISOString()
              });
            }

            if (birthdayDate >= now) {
              // Create "Say happy birthday" task
              const birthdayDay = birthdayDate.getDay();
              const weekDays: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              addTask({
                name: `Wish ${person.name} a happy birthday! 🎂`,
                schedule: [weekDays[birthdayDay]],
                priority: 'high',
                category: 'personal',
                isOneTime: true,
                scheduledDate: birthdayDate.toISOString()
              });
            }

            return birthdayEvent;
          });

        return { events: [...nonBirthdayEvents, ...birthdayEvents] };
      }),
    }),
    {
      name: 'calendar-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
