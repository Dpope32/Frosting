import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
        // Generate a unique id for the category (similar to ToDo.ts approach)
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        const newCategory: CustomCategory = {
          id,
          name,
          icon: 'custom', // This will be overridden by the component
        };
        
        try {
          // Update the store
          set((state) => ({ 
            categories: [...state.categories, newCategory] 
          }));
          return newCategory;
        } catch (error) {
          console.error('Error adding category:', error);
          // Return a safely constructed object in case of error
          return newCategory;
        }
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
