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

        addSyncLog('🔄 Hydrating TagStore from sync...', 'info');
        
        const { tags: localTags } = get();
        const incomingTags = syncedData.tags;
        
        // Create a map of existing tags by name for efficient lookup
        const localTagsByName = new Map(localTags.map(tag => [tag.name.toLowerCase(), tag]));
        const mergedTags: Tag[] = [...localTags];
        
        let addedCount = 0;
        let updatedCount = 0;
        
        // Process incoming tags
        for (const incomingTag of incomingTags) {
          const normalizedName = incomingTag.name.toLowerCase();
          const existingTag = localTagsByName.get(normalizedName);
          
          if (existingTag) {
            // Tag exists locally, update it if incoming has newer/better data
            const existingIndex = mergedTags.findIndex(tag => tag.id === existingTag.id);
            if (existingIndex !== -1) {
              // Merge the tags, preferring incoming data for color if it exists
              mergedTags[existingIndex] = {
                ...existingTag,
                color: incomingTag.color || existingTag.color,
                // Keep the original local ID to maintain consistency
              };
              updatedCount++;
            }
          } else {
            // New tag from sync, add it
            mergedTags.push(incomingTag);
            localTagsByName.set(normalizedName, incomingTag);
            addedCount++;
          }
        }
        
        set({ tags: mergedTags });
        addSyncLog(`Tags hydrated: ${addedCount} added, ${updatedCount} updated. Total tags: ${mergedTags.length}`, 'success');
      },
    }),
    {
      name: 'tag-store',
      storage: createPersistStorage<TagStoreState>(),
    }
  )
);