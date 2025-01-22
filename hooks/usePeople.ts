import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StorageUtils } from '@/store/MMKV';
import { usePeopleStore } from '@/store/People';
import type { Person, Family } from '@/types/people';

// Storage keys
const STORAGE_KEYS = {
  PEOPLE: 'people-store',
  FAMILIES: 'families-store',
};

// Query Hooks
export const usePeople = () => {
  return useQuery({
    queryKey: ['people'],
    queryFn: () => StorageUtils.get<Record<string, Person>>(STORAGE_KEYS.PEOPLE, {}),
    initialData: {},
  });
};

export const useFamilies = () => {
  return useQuery({
    queryKey: ['families'],
    queryFn: () => StorageUtils.get<Record<string, Family>>(STORAGE_KEYS.FAMILIES, {}),
    initialData: {},
  });
};

export const usePersonById = (id: string) => {
  const people = usePeople();
  return {
    ...people,
    data: people.data ? people.data[id] : undefined,
  };
};

export const useFamilyById = (id: string) => {
  const families = useFamilies();
  return {
    ...families,
    data: families.data ? families.data[id] : undefined,
  };
};

export const usePeopleByFamilyId = (familyId: string) => {
  const people = usePeople();
  return {
    ...people,
    data: Object.values(people.data || {}).filter(
      (person: Person) => person.familyId === familyId
    ),
  };
};

// Mutation Hooks
export const useAddPerson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (person: Person) => {
      usePeopleStore.getState().addPerson(person);
      return Promise.resolve(person);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
};

export const useUpdatePerson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Person> }) => {
      usePeopleStore.getState().updatePerson(id, updates);
      return Promise.resolve(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
};

export const useDeletePerson = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      usePeopleStore.getState().deletePerson(id);
      return Promise.resolve(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
};

export const useAddFamily = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (family: Family) => {
      usePeopleStore.getState().addFamily(family);
      return Promise.resolve(family);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
    },
  });
};

export const useUpdateFamily = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Family> }) => {
      usePeopleStore.getState().updateFamily(id, updates);
      return Promise.resolve(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
    },
  });
};

export const useDeleteFamily = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      usePeopleStore.getState().deleteFamily(id);
      return Promise.resolve(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
    },
  });
};
