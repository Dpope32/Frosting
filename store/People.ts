// store/People.ts
import { create } from 'zustand'
import { StorageUtils } from '@/store/AsyncStorage'
import type { Person } from '@/types'

const STORAGE_KEY = 'contacts-store'

type PeopleStore = {
  contacts: Record<string, Person>
  addPerson: (person: Person) => Promise<Person>
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
      console.log('🔍 [PeopleStore] addPerson start:', new Date().toISOString())
      const startTime = performance.now()
      
      // Create person object with ID and timestamps
      const personWithId = {
        ...person,
        id: person.id || Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      console.log(`🔍 [PeopleStore] created person object (${performance.now() - startTime}ms)`)
      
      try {
        // Optimistic update - update UI immediately
        const contacts = get().contacts
        const newContacts = { ...contacts, [personWithId.id]: personWithId }
        set({ contacts: newContacts })
        console.log(`🔍 [PeopleStore] state updated optimistically (${performance.now() - startTime}ms)`)
        
        // Save to AsyncStorage in background
        StorageUtils.set(STORAGE_KEY, newContacts)
          .then(() => {
            console.log(`🔍 [PeopleStore] AsyncStorage save complete (background) (${performance.now() - startTime}ms)`)
          })
          .catch((error: Error) => {
            console.error('🔴 [PeopleStore] Error saving to AsyncStorage:', error)
            // Could implement rollback of optimistic update here if needed
          })

        // Handle birthday sync in background if needed
        if (personWithId.birthday) {
          console.log('🔍 [PeopleStore] birthday detected, will sync in background')
          
          // Use setTimeout to move this completely off the main thread
          setTimeout(() => {
            try {
              console.log('🔍 [PeopleStore] starting birthday sync')
              const birthdaySyncStart = performance.now()
              const { syncBirthdays } = require('./CalendarStore').useCalendarStore.getState()
              
              // Run sync in background without assuming it returns a Promise
              syncBirthdays(personWithId.id)
              
              // Log completion after a short delay to avoid blocking
              setTimeout(() => {
                console.log(`🔍 [PeopleStore] birthday sync completed (${performance.now() - birthdaySyncStart}ms)`)
              }, 100)
            } catch (err: unknown) {
              console.error('🔴 [PeopleStore] birthday sync setup error:', err)
            }
          }, 500) // Increased delay to ensure UI is responsive first
        }
        
        console.log(`✅ [PeopleStore] addPerson complete (${performance.now() - startTime}ms)`)
        return personWithId
      } catch (error) {
        console.error('🔴 [PeopleStore] Error in addPerson:', error)
        throw error
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
        
        // Optimistic update
        set({ contacts: newContacts })
        
        // Save to AsyncStorage in background
        StorageUtils.set(STORAGE_KEY, newContacts)
          .catch((error: Error) => {
            console.error('🔴 [PeopleStore] Error saving updated contact:', error)
          })
      }
    },
    
    deletePerson: async (id) => {
      const contacts = { ...get().contacts }
      delete contacts[id]
      
      // Optimistic update
      set({ contacts })
      
      // Save to AsyncStorage in background
      StorageUtils.set(STORAGE_KEY, contacts)
        .catch((error: Error) => {
          console.error('🔴 [PeopleStore] Error deleting contact from storage:', error)
        })
    },
    
    clearContacts: async () => {
      // Optimistic update
      set({ contacts: {} })
      
      // Save empty object to AsyncStorage in background
      StorageUtils.set(STORAGE_KEY, {})
        .catch((error: Error) => {
          console.error('🔴 [PeopleStore] Error clearing contacts from storage:', error)
        })
    },
  }
})
