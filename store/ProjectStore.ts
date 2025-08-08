// Enhanced ProjectStore with robust completion syncingMore actions
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';
import { Project } from '@/types';
import { format } from 'date-fns';
import { mergeProjectTasks, resolveProjectStatus } from '@/sync/projectSyncUtils';

const getAddSyncLog = () => require('@/components/sync/syncUtils').addSyncLog;

interface ProjectStoreState {
  projects: Project[];
  isSyncEnabled: boolean;
  addProject: (project: Project) => void;
  updateProject: (id: string, updated: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjects: () => Project[];
  clearProjects: () => void;
  toggleProjectSync: () => void;
  hydrateFromSync?: (syncedData: { projects?: Project[] }) => void;
}

export const useProjectStore = create<ProjectStoreState>()(
  persist(
    (set, get) => ({
      projects: [],
      isSyncEnabled: false,

      addProject: (project: Project) => {
        const projectWithTimestamp = {
          ...project,
          updatedAt: (project as any).updatedAt || new Date().toISOString(),
          createdAt: (project as any).createdAt || new Date().toISOString(),
        };

        set((state: ProjectStoreState) => ({ projects: [...state.projects, projectWithTimestamp] }));
        try {
        } catch (e) { /* ignore */ }
      },

      updateProject: (id: string, updated: Partial<Project>) => {
        set((state: ProjectStoreState) => ({ 
          projects: state.projects.map((p) =>
            p.id === id ? { 
              ...p, 
              ...updated, 
              ...(({ updatedAt: new Date().toISOString() } as any))
            } : p
          ) 
        }));
        try {
          getAddSyncLog()(`Project updated locally: ID ${id}`, 'info');
        } catch (e) { /* ignore */ }
      },

      deleteProject: (id: string) => {
        set((state: ProjectStoreState) => ({ 
          projects: state.projects.map((p) =>
            p.id === id ? { 
              ...p, 
              isDeleted: true, 
              updatedAt: new Date().toISOString() 
            } : p
          ) 
        }));
        try {
          getAddSyncLog()(`Project marked as deleted locally: ID ${id}`, 'info');
        } catch (e) { /* ignore */ }
      },

      getProjectById: (id: string) => get().projects.find((p) => p.id === id && !p.isDeleted),
      getProjects: () => get().projects.filter((p) => !p.isDeleted),

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

        if (!currentSyncEnabledState) {
          addSyncLog('Project sync is disabled, skipping hydration for ProjectStore.', 'info');
          return;
        }

        if (!syncedData.projects || !Array.isArray(syncedData.projects)) {
          addSyncLog('No projects data in snapshot for ProjectStore, or items are not an array.', 'info');
          return;
        }

        let itemsMergedCount = 0;
        let itemsAddedCount = 0;
        let completionConflictsResolved = 0;

        set((state) => {
          const existingProjectsMap = new Map(state.projects.map(item => [item.id, item]));
          const newProjectsArray = [...state.projects];
          const today = format(new Date(), 'yyyy-MM-dd');

          for (const incomingProject of syncedData.projects!) {
            if (existingProjectsMap.has(incomingProject.id)) {
              const existingProjectIndex = newProjectsArray.findIndex(item => item.id === incomingProject.id);
              if (existingProjectIndex !== -1) {
                const existingProject = newProjectsArray[existingProjectIndex];

                // Use timestamp-based merging for the base project
                const existingTimestamp = new Date((existingProject as any).updatedAt || (existingProject as any).createdAt || Date.now()).getTime();
                const incomingTimestamp = new Date((incomingProject as any).updatedAt || (incomingProject as any).createdAt || Date.now()).getTime();

                let mergedProject = { ...existingProject };

                // If incoming is newer, merge most fields
                if (incomingTimestamp >= existingTimestamp) {
                  mergedProject = { ...existingProject, ...incomingProject };
                }

                // SMART PROJECT STATUS RESOLUTION (always resolve conflicts regardless of timestamp)
                const resolvedStatus = resolveProjectStatus(
                  existingProject.status,
                  incomingProject.status,
                  existingTimestamp,
                  incomingTimestamp,
                  incomingProject.name || 'Unknown'
                );

                if (existingProject.status !== incomingProject.status) {
                  addSyncLog(
                    `[Project Status] '${(incomingProject.name || 'Unknown').slice(0, 24)}': local=${existingProject.status}, sync=${incomingProject.status}, resolved=${resolvedStatus}`,
                    'info'
                  );
                  completionConflictsResolved++;
                }

                mergedProject.status = resolvedStatus as any;

                // SMART TASK COMPLETION RESOLUTION
                if (existingProject.tasks && incomingProject.tasks && Array.isArray(existingProject.tasks) && Array.isArray(incomingProject.tasks)) {
                  const mergedTasks = mergeProjectTasks(
                    existingProject.tasks,
                    incomingProject.tasks,
                    today,
                    addSyncLog
                  );
                  mergedProject.tasks = mergedTasks;
                } else if (incomingProject.tasks) {
                  // No existing tasks, use incoming tasks
                  mergedProject.tasks = incomingProject.tasks;
                }

                newProjectsArray[existingProjectIndex] = mergedProject;
                itemsMergedCount++;
              }
            } else {
              // New project from sync
              newProjectsArray.push(incomingProject);
              itemsAddedCount++;
            }
          }

          const logMessage = `Projects hydrated: ${itemsAddedCount} added, ${itemsMergedCount} merged, ${completionConflictsResolved} completion conflicts resolved. Total: ${newProjectsArray.length}`;
          addSyncLog(logMessage, 'success');

          return { projects: newProjectsArray };
        });
      },
    }),
    {
      name: 'projects',
      storage: createPersistStorage<ProjectStoreState>(),
    }
  )
);

