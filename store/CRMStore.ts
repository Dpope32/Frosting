import { create } from 'zustand';
import type { Person } from '@/types';

interface CRMStoreState {
  expandedPersonId: string | null;
  isEditModalOpen: boolean;
  selectedPerson: Person | null;
  expandPersonCard: (personId: string) => void;
  collapsePersonCard: () => void;
  openEditModal: (person: Person) => void;
  closeEditModal: () => void;
}

export const useCRMStore = create<CRMStoreState>()((set) => ({
  expandedPersonId: null,
  isEditModalOpen: false,
  selectedPerson: null,
  expandPersonCard: (personId) => set({ expandedPersonId: personId }),
  collapsePersonCard: () => set({ expandedPersonId: null }),
  openEditModal: (person) => set({ 
    isEditModalOpen: true,
    selectedPerson: person,
    expandedPersonId: null 
  }),
  closeEditModal: () => set({ 
    isEditModalOpen: false,
    selectedPerson: null 
  }),
}));
