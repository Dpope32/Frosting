import { create } from 'zustand';
import { StorageUtils } from './MMKV';
import type { Person, Family } from '@/types/people';

// Storage keys
const STORAGE_KEYS = {
  PEOPLE: 'people-store',
  FAMILIES: 'families-store',
};

type PeopleStore = {
  people: Record<string, Person>;
  families: Record<string, Family>;
  setPeople: (people: Record<string, Person>) => void;
  setFamilies: (families: Record<string, Family>) => void;
  addPerson: (person: Person) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  addFamily: (family: Family) => void;
  updateFamily: (id: string, updates: Partial<Family>) => void;
  deleteFamily: (id: string) => void;
};

// Create store with persistence
export const usePeopleStore = create<PeopleStore>((set, get) => ({
  people: StorageUtils.get<Record<string, Person>>(STORAGE_KEYS.PEOPLE, {}) ?? {},
  families: StorageUtils.get<Record<string, Family>>(STORAGE_KEYS.FAMILIES, {}) ?? {},
  
  setPeople: (people) => {
    StorageUtils.set(STORAGE_KEYS.PEOPLE, people);
    set({ people });
  },
  
  setFamilies: (families) => {
    StorageUtils.set(STORAGE_KEYS.FAMILIES, families);
    set({ families });
  },
  
  addPerson: (person) => {
    const people = get().people;
    people[person.id] = {
      ...person,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    StorageUtils.set(STORAGE_KEYS.PEOPLE, people);
    set({ people });
  },
  
  updatePerson: (id, updates) => {
    const people = get().people;
    if (people[id]) {
      people[id] = {
        ...people[id],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      StorageUtils.set(STORAGE_KEYS.PEOPLE, people);
      set({ people });
    }
  },
  
  deletePerson: (id) => {
    const people = get().people;
    delete people[id];
    StorageUtils.set(STORAGE_KEYS.PEOPLE, people);
    set({ people });
  },
  
  addFamily: (family) => {
    const families = get().families;
    families[family.id] = {
      ...family,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    StorageUtils.set(STORAGE_KEYS.FAMILIES, families);
    set({ families });
  },
  
  updateFamily: (id, updates) => {
    const families = get().families;
    if (families[id]) {
      families[id] = {
        ...families[id],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      StorageUtils.set(STORAGE_KEYS.FAMILIES, families);
      set({ families });
    }
  },
  
  deleteFamily: (id) => {
    const families = get().families;
    delete families[id];
    StorageUtils.set(STORAGE_KEYS.FAMILIES, families);
    set({ families });
  },
}));
