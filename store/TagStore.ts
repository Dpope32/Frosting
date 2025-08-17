import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';
import type { Tag } from '@/types';
import { addSyncLog } from '@/components/sync/syncUtils';

interface TagStoreState {
  tags: Tag[];
  addTag: (name: string, color?: string) => Tag;
  removeTag: (id: string) => void;
  getTagByName: (name: string) => Tag | undefined;
  hydrateFromSync: (syncedData: { tags?: Tag[] }) => void;
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
          const newTags = [...uniqueTags, newTag];
          try {
            addSyncLog(`Tag added locally: ${name}`, 'info');
          } catch (e) { /* ignore */ }
          return { tags: newTags };
        });
        return newTag;
      },
      removeTag: (id: string) => {
        set((state) => {
          const tagToRemove = state.tags.find(tag => tag.id === id);
          try {
            if (tagToRemove) {
              addSyncLog(`Tag removed locally: ${tagToRemove.name}`, 'info');
            }
          } catch (e) { /* ignore */ }
          return { tags: state.tags.filter((tag) => tag.id !== id) };
        });
      },
      getTagByName: (name: string) => {
        return get().tags.find((tag) => tag.name === name);
      },
      hydrateFromSync: (syncedData: { tags?: Tag[] }) => {
        if (!syncedData.tags || !Array.isArray(syncedData.tags)) {
          addSyncLog('No tags data in snapshot for TagStore, or tags are not an array.', 'info');
          return;
        }
        const { tags: localTags } = get();
        const incomingTags = syncedData.tags;
        
        // Simple merge strategy: combine all tags and deduplicate by name
        const allTags: Tag[] = [...localTags];
        const existingNames = new Set(localTags.map(tag => tag.name.toLowerCase()));
        
        let addedCount = 0;
        let updatedCount = 0;
        
        // Add any new tags from sync that don't exist locally
        for (const incomingTag of incomingTags) {
          const normalizedName = incomingTag.name.toLowerCase();
          
          if (!existingNames.has(normalizedName)) {
            allTags.push(incomingTag);
            existingNames.add(normalizedName);
            addedCount++;
          } else {
            // Tag exists - check if we should update color
            const localTagIndex = allTags.findIndex(tag => tag.name.toLowerCase() === normalizedName);
            if (localTagIndex !== -1 && incomingTag.color && !allTags[localTagIndex].color) {
              allTags[localTagIndex] = { ...allTags[localTagIndex], color: incomingTag.color };
              updatedCount++;
            }
          }
        }
        set({ tags: allTags });
      },
    }),
    {
      name: 'tag-store',
      storage: createPersistStorage<TagStoreState>(),
    }
  )
);