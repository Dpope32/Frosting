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
    contacts[person.id] = {
      ...person,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    StorageUtils.set(STORAGE_KEY, contacts)
    set({ contacts })
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
