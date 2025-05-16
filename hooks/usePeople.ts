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
      return contacts || {}
    },
    initialData: {},
  })
}

export const useContactById = (id: string) => {
  const { data, ...rest } = useContacts()
  return {
    ...rest,
    data: data ? data[id] : undefined,
  }
}

export const useAddPerson = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (person: Person) => {
      console.log('🔍 [useAddPerson] mutation function start:', new Date().toISOString())
      const startTime = performance.now()
      
      try {
        await usePeopleStore.getState().addPerson(person)
        console.log(`🔍 [useAddPerson] store.addPerson completed (${performance.now() - startTime}ms)`)
        return person
      } catch (error) {
        console.error('🔴 [useAddPerson] Error in mutation function:', error)
        throw error
      }
    },
    onSuccess: (_, variables) => {
      console.log('🔍 [useAddPerson] onSuccess triggered:', new Date().toISOString())
      const invalidateStart = performance.now()
      
      try {
        // Show toast notification
        const { showToast } = require('@/store/ToastStore').useToastStore.getState()
        showToast(`${variables.name} added successfully`, 'success', { duration: 3000 })
        
        queryClient.invalidateQueries({ queryKey: ['contacts'] })
        console.log(`🔍 [useAddPerson] query invalidation completed (${performance.now() - invalidateStart}ms)`)
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
