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
  getActiveContacts: () => Person[]
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
            set((state) => ({ ...state, contacts: storedContacts }))
          }
        })
        .catch(error => {
          console.error('Error loading contacts:', error)
        })
        StorageUtils.get<boolean>('people-sync-enabled', false)
        .then(savedSyncState => {
          set((state) => ({ ...state, isSyncEnabled: savedSyncState }))
          addSyncLog(`[PeopleStore] Loaded sync state from storage: ${savedSyncState ? 'ON' : 'OFF'}`, 'info')
        })
        .catch(error => {
          console.error('Error loading sync state:', error)
          addSyncLog('[PeopleStore] Error loading sync state, defaulting to OFF', 'error')
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
                }
              }, 200) 
            } else if (personWithId.birthday && SKIP_BIRTHDAY_SYNC) {
              addSyncLog(`[PeopleStore] Birthday sync skipped for ${personWithId.name} (SKIP_BIRTHDAY_SYNC=true)`, 'warning')
            }
            
            addSyncLog(`${personWithId.name} Person added locally and it only took: ${(performance.now() - startTime).toFixed(2)}ms`, 'info')
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
            
            // Optimistic update - immediately update the UI
            set({ contacts: newContacts })
            
            try {
              // Save to AsyncStorage
               await StorageUtils.set(STORAGE_KEY, newContacts)
            } catch (error) {
              console.error('🔴 [PeopleStore] Error saving updated contact:', error)
              addSyncLog(`[PeopleStore] Error saving updated contact: ${error}`, 'error')
            }
          } else {
            console.error(`🔴 [PeopleStore] Person with ID ${id} not found for update`)
            addSyncLog(`[PeopleStore] Person with ID ${id} not found for update`, 'error')
          }
        },
        
        deletePerson: async (id) => {
          const contacts = { ...get().contacts }
          const personToDelete = contacts[id]
          if (!personToDelete) {
            console.error(`❌ PeopleStore: Person with id ${id} not found`);
            return;
          }

          // Soft delete by setting deletedAt timestamp
          const deletedPerson = {
            ...personToDelete,
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          const newContacts = { ...contacts, [id]: deletedPerson };
          set({ contacts: newContacts });
          
          StorageUtils.set(STORAGE_KEY, newContacts)
            .catch((error: Error) => {
              console.error('🔴 [PeopleStore] Error saving deleted contact:', error);
            });
        },
        
        clearContacts: async () => {
          set({ contacts: {} })
          StorageUtils.set(STORAGE_KEY, {})
            .catch((error: Error) => {
              console.error('🔴 [PeopleStore] Error clearing contacts from storage:', error)
            })
        },

        togglePeopleSync: () => {
          set((state) => {
            const newSyncState = !state.isSyncEnabled
            StorageUtils.set('people-sync-enabled', newSyncState)
              .catch((error) => {
                console.error('🔴 [PeopleStore] Error saving sync state:', error)
              })
            
            return { isSyncEnabled: newSyncState }
          })
        },

        hydrateFromSync: (syncedData: { contacts?: Record<string, Person>, isSyncEnabled?: boolean }) => {
          const localStore = get()
          // Never let other devices override this
          const localSyncEnabled = localStore.isSyncEnabled
          
          if (!localSyncEnabled) return;
          if (!syncedData.contacts || typeof syncedData.contacts !== 'object') return;

          
          let itemsMergedCount = 0
          let itemsAddedCount = 0
          let deletionsAppliedCount = 0

          const currentContacts = { ...localStore.contacts } 
          const incomingContacts = syncedData.contacts

          for (const id in incomingContacts) {
            const incomingContact = incomingContacts[id]
            const localContact = currentContacts[id]

            if (localContact) {
              const localUpdatedAt = new Date(localContact.updatedAt || 0).getTime()
              const incomingUpdatedAt = new Date(incomingContact.updatedAt || 0).getTime()

              if (incomingUpdatedAt >= localUpdatedAt) {
                if (incomingContact.deletedAt && !localContact.deletedAt) deletionsAppliedCount++;

                const mergedContact = {
                  ...incomingContact,
                  profilePicture: incomingContact.profilePicture || localContact.profilePicture
                }
                currentContacts[id] = mergedContact
                itemsMergedCount++
              }
            } else {
              currentContacts[id] = incomingContact
              itemsAddedCount++
            }
          }

          const activeContacts = Object.values(currentContacts).filter(person => !person.deletedAt);
          
          // Only update contacts, preserve local isSyncEnabled setting
          set({ 
            contacts: currentContacts,
            isSyncEnabled: localSyncEnabled
          })
          
          StorageUtils.set(STORAGE_KEY, currentContacts)
            .catch((error: Error) => {
              console.error('🔴 [PeopleStore] Error saving hydrated contacts to AsyncStorage:', error)
            })
        },

        getActiveContacts: () => {
          const allContacts = Object.values(get().contacts);
          const activeContacts = allContacts.filter(person => !person.deletedAt);
          return activeContacts;
        },
      }
    },
    {
      name: 'people-sync-storage',
      storage: createPersistStorage<PeopleStore>(),
    }
  )
)