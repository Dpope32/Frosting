import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { useUserStore } from './UserStore';
import { createPersistStorage } from './AsyncStorage';

export interface CustomCategory {
  id: string;
  name: string;
  icon: string;
}

interface CustomCategoryState {
  categories: CustomCategory[];
  addCategory: (name: string) => CustomCategory;
  removeCategory: (id: string) => void;
  getCategoryByName: (name: string) => CustomCategory | undefined;
}

export const useCustomCategoryStore = create<CustomCategoryState>()(
  persist(
    (set, get) => ({
      categories: [],
      addCategory: (name: string) => {
        // We'll get a random icon from styleUtils in the UI, so just use a placeholder here
        const icon = 'custom';
        const newCategory: CustomCategory = {
          id: nanoid(),
          name,
          icon,
        };
        set((state) => ({ categories: [...state.categories, newCategory] }));
        return newCategory;
      },
      removeCategory: (id: string) => {
        set((state) => ({ categories: state.categories.filter((cat) => cat.id !== id) }));
      },
      getCategoryByName: (name: string) => {
        return get().categories.find((cat) => cat.name === name);
      },
    }),
    {
      name: 'custom-category-store',
      storage: createPersistStorage<CustomCategoryState>(),
    }
  )
); 