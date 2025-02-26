// hooks/usePeople.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { StorageUtils } from '@/store/AsyncStorage'
import { usePeopleStore } from '@/store/People'
import type { Person } from '@/types/people'

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
      await usePeopleStore.getState().addPerson(person)
      return person
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
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