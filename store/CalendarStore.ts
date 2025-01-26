import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { storage } from './MMKV';

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
}

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
    }),
    {
      name: 'calendar-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);