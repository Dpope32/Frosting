// store/People.ts
import { create } from 'zustand'
import { StorageUtils } from '@/store/AsyncStorage'
import type { Person } from '@/types/people'

const STORAGE_KEY = 'contacts-store'

type PeopleStore = {
  contacts: Record<string, Person>
  addPerson: (person: Person) => void
  updatePerson: (id: string, updates: Partial<Person>) => void
  deletePerson: (id: string) => void
  clearContacts: () => void
}

export const usePeopleStore = create<PeopleStore>((set, get) => {
  // Initialize with empty contacts, then load from storage
  const initialContacts = {}
  
  // Load contacts from AsyncStorage (this occurs asynchronously)
  StorageUtils.get<Record<string, Person>>(STORAGE_KEY, {})
    .then(storedContacts => {
      if (storedContacts && Object.keys(storedContacts).length > 0) {
        set({ contacts: storedContacts })
      }
    })
    .catch(error => {
      console.error('Error loading contacts:', error)
    })

  return {
    contacts: initialContacts,
    
    addPerson: async (person) => {
      const contacts = get().contacts
      const personWithId = {
        ...person,
        id: person.id || Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const newContacts = { ...contacts, [personWithId.id]: personWithId }
      
      // Save to AsyncStorage
      await StorageUtils.set(STORAGE_KEY, newContacts)
      set({ contacts: newContacts })

      // Import the store function only when needed
      if (personWithId.birthday) {
        const { syncBirthdays } = require('./CalendarStore').useCalendarStore.getState()
        syncBirthdays(personWithId.id)
      }
    },
    
    updatePerson: async (id, updates) => {
      const contacts = get().contacts
      if (contacts[id]) {
        const updatedContact = {
          ...contacts[id],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        // Create a new contacts object to ensure state update
        const newContacts = { ...contacts, [id]: updatedContact }
        
        // Save to AsyncStorage
        await StorageUtils.set(STORAGE_KEY, newContacts)
        set({ contacts: newContacts })
      }
    },
    
    deletePerson: async (id) => {
      const contacts = { ...get().contacts }
      delete contacts[id]
      
      // Save to AsyncStorage
      await StorageUtils.set(STORAGE_KEY, contacts)
      set({ contacts })
    },
    
    clearContacts: async () => {
      // Save empty object to AsyncStorage
      await StorageUtils.set(STORAGE_KEY, {})
      set({ contacts: {} })
    },
  }
})