// store/People.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { StorageUtils, createPersistStorage } from '@/store/AsyncStorage'
import type { Person } from '@/types'
import { addSyncLog } from '@/components/sync/syncUtils'

const STORAGE_KEY = 'contacts-store'

// Temporary flag to test if birthday sync is causing the freeze
const SKIP_BIRTHDAY_SYNC = false // Set to true to temporarily disable birthday sync for testing

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

export const usePeopleStore = create<PeopleStore>()(
  persist(
    (set, get) => {
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
          const startTime = performance.now()
          
          // Create person object with ID and timestamps
          const personWithId = {
            ...person,
            id: person.id || Math.random().toString(36).substring(2, 11),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          try {
            const contacts = get().contacts
            const newContacts = { ...contacts, [personWithId.id]: personWithId }
            set({ contacts: newContacts })
            StorageUtils.set(STORAGE_KEY, newContacts)
              .then(() => {
              })
              .catch((error: Error) => {
                console.error('🔴 [PeopleStore] Error saving to AsyncStorage:', error)
              })

            if (personWithId.birthday && !SKIP_BIRTHDAY_SYNC) {
              addSyncLog(`[PeopleStore] Person has birthday: ${personWithId.name} (${personWithId.birthday}), scheduling birthday sync`, 'info')
              
              // Use longer delay to ensure UI has time to update smoothly
              setTimeout(() => {
                try {
                  const syncStartTime = performance.now()
                  addSyncLog('[PeopleStore] Calling syncBirthdays from CalendarStore', 'info')
                  
                  const { syncBirthdays } = require('./CalendarStore').useCalendarStore.getState()
                  syncBirthdays(personWithId.id)
                  
                  const syncEndTime = performance.now()
                  addSyncLog(`[PeopleStore] ✅ syncBirthdays call completed in ${(syncEndTime - syncStartTime).toFixed(2)}ms`, 'success')
                  
                } catch (err: unknown) {
                  addSyncLog(`🔴 [PeopleStore] birthday sync setup failed: ${err}`, 'error')
                  console.error('🔴 [PeopleStore] birthday sync setup error:', err)
                }
              }, 800) // Increased from 500ms to 800ms for smoother UI
            } else if (personWithId.birthday && SKIP_BIRTHDAY_SYNC) {
              addSyncLog(`[PeopleStore] Birthday sync skipped for ${personWithId.name} (SKIP_BIRTHDAY_SYNC=true)`, 'warning')
            }
            
            addSyncLog(`[PeopleStore] Person added locally: ${personWithId.name}`, 'info')
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
          set({ contacts })
          StorageUtils.set(STORAGE_KEY, contacts)
            .catch((error: Error) => {
              console.error('🔴 [PeopleStore] Error deleting contact from storage:', error)
            })

          addSyncLog(`[PeopleStore] Person deleted locally: ${personName} (ID ${id})`, 'info')
        },
        
        clearContacts: async () => {
          set({ contacts: {} })
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
          if (!localStore.isSyncEnabled) {
            addSyncLog('[PeopleStore] Local contacts sync is OFF. Skipping hydration.', 'info')
            return
          }

          if (syncedData.isSyncEnabled === false) {
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
                // 🔧 SELECTIVE MERGE: Preserve local profilePicture if incoming doesn't have one
                const mergedContact = {
                  ...incomingContact,
                  // Preserve local profilePicture if it exists and incoming doesn't have one
                  profilePicture: incomingContact.profilePicture || localContact.profilePicture
                }
                currentContacts[id] = mergedContact
                itemsMergedCount++
                
                // Log when we preserve an image
                if (localContact.profilePicture && !incomingContact.profilePicture) {
                  addSyncLog(`[PeopleStore] Preserved local profile picture for ${localContact.name} during sync merge`, 'info')
                }
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
    },
    {
      name: 'people-sync-storage',
      storage: createPersistStorage<PeopleStore>(),
    }
  )
)
