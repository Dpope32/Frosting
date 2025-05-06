import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';
import type { Tag } from '@/types/tag';

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
    // Check if a tag with this name already exists
    const existingTag = get().getTagByName(name);
    if (existingTag) {
      return existingTag;
    }
    
    // Create new tag if it doesn't exist
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const newTag: Tag = {
      id,
      name,
      color,
    };
    set((state) => {
      // Filter out any duplicates by name before adding new tag
      const uniqueTags = state.tags.filter(tag => tag.name !== name);
      return { tags: [...uniqueTags, newTag] };
    });
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
