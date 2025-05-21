// store/People.ts
import { create } from 'zustand'
import { StorageUtils } from '@/store/AsyncStorage'
import type { Person } from '@/types'
import { addSyncLog } from '@/components/sync/syncUtils'

const STORAGE_KEY = 'contacts-store'

type PeopleStore = {
  contacts: Record<string, Person>
  isSyncEnabled: boolean
  addPerson: (person: Person) => Promise<Person>
  updatePerson: (id: string, updates: Partial<Person>) => void
  deletePerson: (id: string) => void
  clearContacts: () => void
  togglePeopleSync: () => void
  hydrateFromSync?: (syncedData: { contacts?: Record<string, Person>, isSyncEnabled?: boolean }) => void
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
    isSyncEnabled: false,
    
    addPerson: async (person) => {
      console.log('🔍 [PeopleStore] addPerson start:', new Date().toISOString())
      const startTime = performance.now()
      
      // Create person object with ID and timestamps
      const personWithId = {
        ...person,
        id: person.id || Math.random().toString(36).substring(2, 11),
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
        
        addSyncLog(`[PeopleStore] Person added locally: ${personWithId.name}`, 'info')
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

        addSyncLog(`[PeopleStore] Person updated locally: ID ${id}`, 'info')
      }
    },
    
    deletePerson: async (id) => {
      const contacts = { ...get().contacts }
      const personName = contacts[id]?.name || 'Unknown'
      delete contacts[id]
      
      // Optimistic update
      set({ contacts })
      
      // Save to AsyncStorage in background
      StorageUtils.set(STORAGE_KEY, contacts)
        .catch((error: Error) => {
          console.error('🔴 [PeopleStore] Error deleting contact from storage:', error)
        })

      addSyncLog(`[PeopleStore] Person deleted locally: ${personName} (ID ${id})`, 'info')
    },
    
    clearContacts: async () => {
      // Optimistic update
      set({ contacts: {} })
      
      // Save empty object to AsyncStorage in background
      StorageUtils.set(STORAGE_KEY, {})
        .catch((error: Error) => {
          console.error('🔴 [PeopleStore] Error clearing contacts from storage:', error)
        })

      addSyncLog('[PeopleStore] All contacts cleared locally.', 'info')
    },

    togglePeopleSync: () => {
      set((state) => {
        const newSyncState = !state.isSyncEnabled
        addSyncLog(`[PeopleStore] Contacts sync ${newSyncState ? 'enabled' : 'disabled'}.`, 'info')
        return { isSyncEnabled: newSyncState }
      })
    },

    hydrateFromSync: (syncedData: { contacts?: Record<string, Person>, isSyncEnabled?: boolean }) => {
      const localStore = get()
      addSyncLog(`[Hydrate Attempt] PeopleStore (Contacts) sync is currently ${localStore.isSyncEnabled ? 'ENABLED' : 'DISABLED'}.`, 'verbose')

      // Check local setting first. If local sync is off, don't hydrate from snapshot.
      if (!localStore.isSyncEnabled) {
        addSyncLog('[PeopleStore] Local contacts sync is OFF. Skipping hydration.', 'info')
        return
      }

      // Then check if the incoming snapshot part for contacts has sync enabled.
      // This is a crucial check to prevent an empty list from a device with sync OFF from wiping data.
      // The `isSyncEnabled` in `syncedData` comes from the *other* device's setting when it created the snapshot.
      if (syncedData.isSyncEnabled === false) { // Explicitly check for false
        addSyncLog('[PeopleStore] Incoming snapshot for contacts has sync turned OFF. Skipping hydration to prevent data overwrite.', 'warning')
        return
      }

      if (!syncedData.contacts || typeof syncedData.contacts !== 'object') {
        addSyncLog('[PeopleStore] No contacts data in snapshot or data is malformed. Skipping hydration.', 'info')
        return
      }

      addSyncLog('[PeopleStore] 🔄 Hydrating contacts from sync...', 'info')
      let itemsMergedCount = 0
      let itemsAddedCount = 0

      const currentContacts = { ...localStore.contacts } // Work with a copy
      const incomingContacts = syncedData.contacts

      for (const id in incomingContacts) {
        const incomingContact = incomingContacts[id]
        const localContact = currentContacts[id]

        if (localContact) {
          // Contact exists, check updatedAt for merge strategy (last write wins)
          const localUpdatedAt = new Date(localContact.updatedAt || 0).getTime()
          const incomingUpdatedAt = new Date(incomingContact.updatedAt || 0).getTime()

          if (incomingUpdatedAt > localUpdatedAt) {
            currentContacts[id] = incomingContact
            itemsMergedCount++
          }
        } else {
          // New contact, add it
          currentContacts[id] = incomingContact
          itemsAddedCount++
        }
      }
      
      set({ contacts: currentContacts })
      StorageUtils.set(STORAGE_KEY, currentContacts)
        .catch((error: Error) => {
          console.error('🔴 [PeopleStore] Error saving hydrated contacts to AsyncStorage:', error)
        })

      addSyncLog(`[PeopleStore] Contacts hydrated: ${itemsAddedCount} added, ${itemsMergedCount} merged. Total contacts: ${Object.keys(currentContacts).length}.`, 'success')
      addSyncLog('[PeopleStore] ✅ Contacts hydration complete.', 'success')
    },
  }
})
