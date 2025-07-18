// hooks/usePeople.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { StorageUtils } from '@/store/AsyncStorage'
import { usePeopleStore } from '@/store'
import type { Person } from '@/types'

const STORAGE_KEY = 'contacts-store'

export const useContacts = () => {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const contacts = await StorageUtils.get<Record<string, Person>>(STORAGE_KEY, {})
      
      // Filter out deleted contacts
      const activeContacts: Record<string, Person> = {};
      Object.entries(contacts || {}).forEach(([id, contact]) => {
        if (!contact.deletedAt) {
          activeContacts[id] = contact;
        }
      });
      
      return activeContacts;
    },
    initialData: {},
  })
}

export const useContactById = (id: string) => {
  const { data, ...rest } = useContacts()
  const contact = data ? data[id] : undefined;
  
  // Double-check that we're not returning a deleted contact
  if (contact && contact.deletedAt) {
    return { ...rest, data: undefined };
  }
  
  return { ...rest, data: contact };
}

export const useAddPerson = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (person: Person) => {
      try {
        await usePeopleStore.getState().addPerson(person)
        return person
      } catch (error) {
        console.error('🔴 [useAddPerson] Error in mutation function:', error)
        throw error
      }
    },
    onSuccess: (_, variables) => {
      try {
        const { showToast } = require('@/store/ToastStore').useToastStore.getState()
        showToast(`${variables.name} added successfully`, 'success', { duration: 3000 })
        
        queryClient.invalidateQueries({ queryKey: ['contacts'] })
      } catch (error) {
        console.error('🔴 [useAddPerson] Error in onSuccess:', error)
      }
    },
    onError: (error) => {
      console.error('🔴 [useAddPerson] Mutation error:', error)
    }
  })
}

export const useUpdatePerson = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Person>
    }) => {
      await usePeopleStore.getState().updatePerson(id, updates)
      return updates
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

export const useDeletePerson = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await usePeopleStore.getState().deletePerson(id)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}
