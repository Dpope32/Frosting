// store/People.ts
import { create } from 'zustand'
import { StorageUtils } from '@/store/MMKV'
import type { Person } from '@/types/people'

const STORAGE_KEY = 'contacts-store'

type PeopleStore = {
  contacts: Record<string, Person>
  addPerson: (person: Person) => void
  updatePerson: (id: string, updates: Partial<Person>) => void
  deletePerson: (id: string) => void
}

export const usePeopleStore = create<PeopleStore>((set, get) => ({
  contacts: StorageUtils.get<Record<string, Person>>(STORAGE_KEY, {}) ?? {},
  addPerson: (person) => {
    const contacts = get().contacts
    const personWithId = {
      ...person,
      id: person.id || Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    contacts[personWithId.id] = personWithId
    StorageUtils.set(STORAGE_KEY, contacts)
    set({ contacts })

    // Import the store function only when needed
    if (personWithId.birthday) {
      const { syncBirthdays } = require('./CalendarStore').useCalendarStore.getState()
      syncBirthdays(personWithId.id)
    }
  },
  updatePerson: (id, updates) => {
    const contacts = get().contacts
    if (contacts[id]) {
      contacts[id] = {
        ...contacts[id],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      StorageUtils.set(STORAGE_KEY, contacts)
      set({ contacts })
    }
  },
  deletePerson: (id) => {
    const contacts = get().contacts
    delete contacts[id]
    StorageUtils.set(STORAGE_KEY, contacts)
    set({ contacts })
  },
}))