// Enhanced ProjectStore with sophisticated completion syncing for both project status and task completion
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';
import { Project } from '@/types';
import { format } from 'date-fns';

// Note: We use `as any` casting for task completion fields because Project tasks 
// may have extended Task properties not in the base Project type definition
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
        let completionConflictsResolved = 0;

        set((state) => {
          const existingItemsMap = new Map(state.projects.map(item => [item.id, item]));
          const newItemsArray = [...state.projects]; // Start with existing items
          const today = format(new Date(), 'yyyy-MM-dd');

          for (const incomingProject of syncedData.projects!) {
            if (existingItemsMap.has(incomingProject.id)) {
              const existingProjectIndex = newItemsArray.findIndex(item => item.id === incomingProject.id);
              if (existingProjectIndex !== -1) {
                const existingProject = newItemsArray[existingProjectIndex];
                
                // Enhanced merging with completion status handling
                const mergedProject = { ...existingProject };
                
                // Handle project-level completion via status field
                if (existingProject.status || incomingProject.status) {
                  const localCompleted = existingProject.status === 'completed';
                  const syncCompleted = incomingProject.status === 'completed';
                  
                  // Status resolution logic - prefer completed status when in conflict
                  let resolvedStatus = incomingProject.status || existingProject.status;
                  
                  if (localCompleted || syncCompleted) {
                    // If either is completed, prefer completed unless there's a clear reason not to
                    if (localCompleted && syncCompleted) {
                      resolvedStatus = 'completed';
                    } else if (localCompleted && !syncCompleted) {
                      // Local is completed, sync is not - prefer completed unless sync shows past_deadline
                      resolvedStatus = incomingProject.status === 'past_deadline' ? 'past_deadline' : 'completed';
                    } else if (!localCompleted && syncCompleted) {
                      // Sync is completed, local is not - prefer completed
                      resolvedStatus = 'completed';
                    }
                  }
                  
                  if (existingProject.status !== incomingProject.status) {
                    addSyncLog(
                      `[Project Status] '${incomingProject.name?.slice(0, 24)}': local=${existingProject.status}, sync=${incomingProject.status}, resolved=${resolvedStatus}`, 
                      'info'
                    );
                    completionConflictsResolved++;
                  }
                  
                  mergedProject.status = resolvedStatus;
                }

                // Handle task-level completion if project has tasks
                if (existingProject.tasks && incomingProject.tasks && Array.isArray(existingProject.tasks) && Array.isArray(incomingProject.tasks)) {
                  const existingTasksMap = new Map(existingProject.tasks.map((task: any) => [task.id, task]));
                  const mergedTasks = [...existingProject.tasks];

                  for (const incomingTask of incomingProject.tasks) {
                    const existingTaskIndex = mergedTasks.findIndex((task: any) => task.id === incomingTask.id);
                    
                    if (existingTaskIndex !== -1) {
                      const existingTask = mergedTasks[existingTaskIndex];
                      const mergedTask = { ...existingTask, ...incomingTask };
                      
                      // Handle task completion history if it exists
                      if ((existingTask as any).completionHistory && (incomingTask as any).completionHistory) {
                        const mergedHistory: Record<string, boolean> = { ...(existingTask as any).completionHistory };
                        
                        // Merge incoming task history with conflict resolution
                        Object.entries((incomingTask as any).completionHistory || {}).forEach(([date, value]) => {
                          const hasLocalEntry = (existingTask as any).completionHistory[date] !== undefined;
                          const localValue = (existingTask as any).completionHistory[date];
                          
                          if (!hasLocalEntry) {
                            // No local entry, safe to add incoming
                            mergedHistory[date] = value as boolean;
                          } else if (value === false && localValue === true) {
                            // Incoming is an untoggle (false), always respect this
                            mergedHistory[date] = false;
                            addSyncLog(`[Task History] '${(incomingTask as any).name?.slice(0, 20)}': untoggle on ${date}`, 'verbose');
                          } else {
                            // For other cases, prefer the incoming value (last write wins for simplicity)
                            mergedHistory[date] = value as boolean;
                            addSyncLog(`[Task History] '${(incomingTask as any).name?.slice(0, 20)}': updated on ${date} (${value})`, 'verbose');
                          }
                        });
                        
                        (mergedTask as any).completionHistory = mergedHistory;
                        
                        // Resolve task completion status based on history and current state
                        const localTaskCompleted = (existingTask as any).completed || false;
                        const syncTaskCompleted = (incomingTask as any).completed || false;
                        const historyCompleted = mergedHistory[today] || false;
                        
                        // For tasks, prefer completion history for today if available
                        const resolvedTaskCompleted = historyCompleted || localTaskCompleted || syncTaskCompleted;
                        
                        if (localTaskCompleted !== syncTaskCompleted) {
                          addSyncLog(
                            `[Task Completion] '${(incomingTask as any).name?.slice(0, 20)}': local=${localTaskCompleted}, sync=${syncTaskCompleted}, resolved=${resolvedTaskCompleted}`,
                            'verbose'
                          );
                          completionConflictsResolved++;
                        }
                        
                        (mergedTask as any).completed = resolvedTaskCompleted;
                      } else if (typeof (existingTask as any).completed === 'boolean' || typeof (incomingTask as any).completed === 'boolean') {
                        // Simple task completion without history
                        const localTaskCompleted = (existingTask as any).completed || false;
                        const syncTaskCompleted = (incomingTask as any).completed || false;
                        const resolvedTaskCompleted = localTaskCompleted || syncTaskCompleted;
                        
                        if (localTaskCompleted !== syncTaskCompleted) {
                          addSyncLog(
                            `[Task Completion Simple] '${(incomingTask as any).name?.slice(0, 20)}': local=${localTaskCompleted}, sync=${syncTaskCompleted}, resolved=${resolvedTaskCompleted}`,
                            'verbose'
                          );
                          completionConflictsResolved++;
                        }
                        
                        (mergedTask as any).completed = resolvedTaskCompleted;
                      }
                      
                      mergedTasks[existingTaskIndex] = mergedTask;
                    } else {
                      // New task from sync
                      mergedTasks.push(incomingTask);
                    }
                  }
                  
                  mergedProject.tasks = mergedTasks;
                } else if (incomingProject.tasks) {
                  // No existing tasks, use incoming tasks
                  mergedProject.tasks = incomingProject.tasks;
                }

                // Merge other project fields (excluding special handled fields)
                Object.keys(incomingProject).forEach(key => {
                  if (key !== 'status' && key !== 'tasks' && key !== 'id') {
                    (mergedProject as any)[key] = (incomingProject as any)[key];
                  }
                });

                newItemsArray[existingProjectIndex] = mergedProject;
                itemsMergedCount++;
              }
            } else {
              // New project from sync
              newItemsArray.push(incomingProject);
              itemsAddedCount++;
            }
          }
          
          const logMessage = `Projects hydrated: ${itemsAddedCount} added, ${itemsMergedCount} merged, ${completionConflictsResolved} completion conflicts resolved. Total: ${newItemsArray.length}`;
          addSyncLog(logMessage, 'success');
          
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