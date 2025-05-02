import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';
import type { Tag } from '@/types/notes';

interface TagStoreState {
  tags: Tag[];
  addTag: (name: string, color?: string) => Tag;
  removeTag: (id: string) => void;
  getTagByName: (name: string) => Tag | undefined;
}

export const useTagStore = create<TagStoreState>()(
  persist(
    (set, get) => ({
      tags: [],
      addTag: (name: string, color?: string) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        const newTag: Tag = {
          id,
          name,
          color,
        };
        set((state) => ({ tags: [...state.tags, newTag] }));
        return newTag;
      },
      removeTag: (id: string) => {
        set((state) => ({ tags: state.tags.filter((tag) => tag.id !== id) }));
      },
      getTagByName: (name: string) => {
        return get().tags.find((tag) => tag.name === name);
      },
    }),
    {
      name: 'tag-store',
      storage: createPersistStorage<TagStoreState>(),
    }
  )
); 