import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';
import type { Tag } from '@/types';

// New: Dynamically import addSyncLog
const getAddSyncLog = () => require('@/components/sync/syncUtils').addSyncLog;

interface TagStoreState {
  tags: Tag[];
  addTag: (name: string, color?: string) => Tag;
  removeTag: (id: string) => void;
  getTagByName: (name: string) => Tag | undefined;
  hydrateFromSync?: (syncedData: { tags?: Tag[] }) => void; // New: Hydration method
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
        const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
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
        
        try {
          getAddSyncLog()(`Tag added locally: ${name}`, 'info');
        } catch (e) { /* ignore */ }
        
        return newTag;
      },
      
      removeTag: (id: string) => {
        const tag = get().tags.find(t => t.id === id);
        set((state) => ({ tags: state.tags.filter((tag) => tag.id !== id) }));
        
        try {
          getAddSyncLog()(`Tag deleted locally: ${tag?.name || id}`, 'info');
        } catch (e) { /* ignore */ }
      },
      
      getTagByName: (name: string) => {
        return get().tags.find((tag) => tag.name === name);
      },
      
      hydrateFromSync: (syncedData: { tags?: Tag[] }) => {
        const addSyncLog = getAddSyncLog();

        if (!syncedData.tags || !Array.isArray(syncedData.tags)) {
          addSyncLog('No tags data in snapshot for TagStore, or tags are not an array.', 'info');
          return;
        }

        addSyncLog('🔄 Hydrating TagStore from sync...', 'info');
        let itemsMergedCount = 0;
        let itemsAddedCount = 0;

        set((state) => {
          const existingItemsMap = new Map(state.tags.map(tag => [tag.id, tag]));
          const newItemsArray = [...state.tags]; // Start with existing tags

          for (const incomingTag of syncedData.tags!) {
            if (existingItemsMap.has(incomingTag.id)) {
              const existingItemIndex = newItemsArray.findIndex(tag => tag.id === incomingTag.id);
              if (existingItemIndex !== -1) {
                newItemsArray[existingItemIndex] = { ...newItemsArray[existingItemIndex], ...incomingTag }; // Merge existing with incoming
                itemsMergedCount++;
              }
            } else {
              // Check for duplicate names before adding
              const duplicateNameIndex = newItemsArray.findIndex(tag => tag.name === incomingTag.name);
              if (duplicateNameIndex !== -1) {
                // Replace the existing tag with same name
                newItemsArray[duplicateNameIndex] = incomingTag;
                itemsMergedCount++;
              } else {
                newItemsArray.push(incomingTag);
                itemsAddedCount++;
              }
            }
          }
          
          addSyncLog(`Tags hydrated: ${itemsAddedCount} added, ${itemsMergedCount} merged. Total tags: ${newItemsArray.length}`, 'success');
          return { tags: newItemsArray };
        });
      },
    }),
    {
      name: 'tag-store',
      storage: createPersistStorage<TagStoreState>(),
    }
  )
);