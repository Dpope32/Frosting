import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';
import { Project } from '@/types';

// New: Dynamically import addSyncLog
const getAddSyncLog = () => require('@/components/sync/syncUtils').addSyncLog;

interface ProjectStoreState {
  projects: Project[];
  isSyncEnabled: boolean; // New: Flag for enabling/disabling project sync
  addProject: (project: Project) => void;
  updateProject: (id: string, updated: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjects: () => Project[];
  clearProjects: () => void;
  toggleProjectSync: () => void; // New: Action to toggle sync
  hydrateFromSync?: (syncedData: { projects?: Project[] }) => void; // New: Hydration method
}

export const useProjectStore = create<ProjectStoreState>()(
  persist(
    (set, get) => ({
      projects: [],
      isSyncEnabled: false, // Default to false
      addProject: (project: Project) => {
        set((state: ProjectStoreState) => ({ projects: [...state.projects, project] }));
        try {
          getAddSyncLog()(`Project added locally: ${project.name}`, 'info');
        } catch (e) { /* ignore */ }
      },
      updateProject: (id: string, updated: Partial<Project>) => {
        set((state: ProjectStoreState) => ({ projects: state.projects.map((p) =>
          p.id === id ? { ...p, ...updated } : p
        ) }));
        try {
          getAddSyncLog()(`Project updated locally: ID ${id}`, 'info');
        } catch (e) { /* ignore */ }
      },
      deleteProject: (id: string) => {
        set((state: ProjectStoreState) => ({ projects: state.projects.filter((p) => p.id !== id) }));
        try {
          getAddSyncLog()(`Project deleted locally: ID ${id}`, 'info');
        } catch (e) { /* ignore */ }
      },
      getProjectById: (id: string) => get().projects.find((p) => p.id === id),
      getProjects: () => get().projects,
      clearProjects: () => {
        set({ projects: [] });
        try {
          getAddSyncLog()('Projects cleared locally', 'info');
        } catch (e) { /* ignore */ }
      },
      toggleProjectSync: () => {
        set((state) => {
          const newSyncState = !state.isSyncEnabled;
          try {
            getAddSyncLog()(`Project sync ${newSyncState ? 'enabled' : 'disabled'}`, 'info');
          } catch (e) { /* ignore */ }
          return { isSyncEnabled: newSyncState };
        });
      },
      hydrateFromSync: (syncedData: { projects?: Project[] }) => {
        const addSyncLog = getAddSyncLog();
        const currentSyncEnabledState = get().isSyncEnabled;
        addSyncLog(`[Hydrate Attempt] ProjectStore sync is currently ${currentSyncEnabledState ? 'ENABLED' : 'DISABLED'}.`, 'verbose');

        if (!currentSyncEnabledState) {
          addSyncLog('Project sync is disabled, skipping hydration for ProjectStore.', 'info');
          return;
        }

        if (!syncedData.projects || !Array.isArray(syncedData.projects)) {
          addSyncLog('No projects data in snapshot for ProjectStore, or items are not an array.', 'info');
          return;
        }

        addSyncLog('🔄 Hydrating ProjectStore from sync...', 'info');
        let itemsMergedCount = 0;
        let itemsAddedCount = 0;

        set((state) => {
          const existingItemsMap = new Map(state.projects.map(item => [item.id, item]));
          const newItemsArray = [...state.projects]; // Start with existing items

          for (const incomingItem of syncedData.projects!) { // We've checked projects is an array
            if (existingItemsMap.has(incomingItem.id)) {
              const existingItemIndex = newItemsArray.findIndex(item => item.id === incomingItem.id);
              if (existingItemIndex !== -1) {
                newItemsArray[existingItemIndex] = { ...newItemsArray[existingItemIndex], ...incomingItem }; // Merge existing with incoming
                itemsMergedCount++;
              }
            } else {
              newItemsArray.push(incomingItem);
              itemsAddedCount++;
            }
          }
          
          addSyncLog(`Projects hydrated: ${itemsAddedCount} added, ${itemsMergedCount} merged. Total projects: ${newItemsArray.length}`, 'success');
          return { projects: newItemsArray };
        });
      },
    }),
    {
      name: 'projects',
      storage: createPersistStorage<ProjectStoreState>(),
    }
  )
);
    