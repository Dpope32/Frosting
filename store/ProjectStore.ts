// Enhanced ProjectStore with robust completion syncing
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';
import { Project } from '@/types';
import { format } from 'date-fns';

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
        // Ensure the project has proper timestamps
        const projectWithTimestamp = {
          ...project,
          updatedAt: (project as any).updatedAt || new Date().toISOString(),
          createdAt: (project as any).createdAt || new Date().toISOString(),
        };
        
        set((state: ProjectStoreState) => ({ projects: [...state.projects, projectWithTimestamp] }));
        try {
          getAddSyncLog()(`Project added locally: ${project.name}`, 'info');
        } catch (e) { /* ignore */ }
      },
      
      updateProject: (id: string, updated: Partial<Project>) => {
        set((state: ProjectStoreState) => ({ 
          projects: state.projects.map((p) =>
            p.id === id ? { 
              ...p, 
              ...updated, 
              ...(({ updatedAt: new Date().toISOString() } as any)) // Always update timestamp
            } : p
          ) 
        }));
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

// Helper function to resolve project status conflicts
function resolveProjectStatus(
  localStatus: any,
  syncStatus: any,
  localTimestamp: number,
  syncTimestamp: number,
  projectName: string
): any {
  // If only one has a status, use that
  if (!localStatus && syncStatus) return syncStatus;
  if (localStatus && !syncStatus) return localStatus;
  if (!localStatus && !syncStatus) return undefined;
  
  // If they're the same, no conflict
  if (localStatus === syncStatus) return localStatus;
  
  // Smart resolution rules for status conflicts:
  
  // 1. "completed" always wins over other statuses (except when overridden by much newer timestamp)
  if (localStatus === 'completed' && syncStatus !== 'completed') {
    const timeDiff = syncTimestamp - localTimestamp;
    if (timeDiff > 300000) { // 5 minutes
      return syncStatus; // Sync is significantly newer, trust it
    }
    return 'completed'; // Keep completed status
  }
  
  if (syncStatus === 'completed' && localStatus !== 'completed') {
    const timeDiff = localTimestamp - syncTimestamp;
    if (timeDiff > 300000) { // 5 minutes
      return localStatus; // Local is significantly newer, trust it
    }
    return 'completed'; // Prefer completed status
  }
  
  // 2. "past_deadline" has priority over "in_progress" and "not_started"
  if ((localStatus === 'past_deadline' && ['in_progress', 'not_started'].includes(syncStatus!)) ||
      (syncStatus === 'past_deadline' && ['in_progress', 'not_started'].includes(localStatus!))) {
    return 'past_deadline';
  }
  
  // 3. "in_progress" has priority over "not_started"
  if ((localStatus === 'in_progress' && syncStatus === 'not_started') ||
      (syncStatus === 'in_progress' && localStatus === 'not_started')) {
    return 'in_progress';
  }
  
  // 4. For other conflicts, use timestamp (newer wins)
  return syncTimestamp >= localTimestamp ? syncStatus : localStatus;
}

// Helper function to merge project tasks with completion conflict resolution
function mergeProjectTasks(
  existingTasks: any[],
  incomingTasks: any[],
  today: string,
  addSyncLog: (message: string, level: string, details?: string) => void
): any[] {
  const existingTasksMap = new Map(existingTasks.map((task: any) => [task.id, task]));
  const mergedTasks = [...existingTasks];

  for (const incomingTask of incomingTasks) {
    const existingTaskIndex = mergedTasks.findIndex((task: any) => task.id === incomingTask.id);
    
    if (existingTaskIndex !== -1) {
      const existingTask = mergedTasks[existingTaskIndex];
      
      // Use timestamp-based merging for most task fields
      const existingTimestamp = new Date((existingTask as any).updatedAt || (existingTask as any).createdAt || Date.now()).getTime();
      const incomingTimestamp = new Date((incomingTask as any).updatedAt || (incomingTask as any).createdAt || Date.now()).getTime();
      
      let mergedTask = { ...existingTask };
      
      // If incoming is newer, merge most fields
      if (incomingTimestamp >= existingTimestamp) {
        mergedTask = { ...existingTask, ...incomingTask };
      }
      
      // SMART COMPLETION RESOLUTION (always resolve regardless of timestamp)
      if (existingTask.completionHistory && incomingTask.completionHistory) {
        // Merge completion history with conflict resolution
        const mergedHistory = mergeCompletionHistory(
          existingTask.completionHistory,
          incomingTask.completionHistory,
          addSyncLog,
          incomingTask.name || 'Unknown Task'
        );
        
        mergedTask.completionHistory = mergedHistory;
        
        // Resolve task completion based on today's history and overall completion state
        const resolvedCompleted = resolveTaskCompletion(
          existingTask.completed || false,
          incomingTask.completed || false,
          mergedHistory[today] || false,
          existingTimestamp,
          incomingTimestamp
        );
        
        if ((existingTask.completed || false) !== (incomingTask.completed || false)) {
          addSyncLog(
            `[Task Completion] '${(incomingTask.name || 'Unknown').slice(0, 20)}': local=${existingTask.completed}, sync=${incomingTask.completed}, resolved=${resolvedCompleted}`,
            'verbose'
          );
        }
        
        mergedTask.completed = resolvedCompleted;
      } else {
        // Simple completion without history
        const resolvedCompleted = resolveTaskCompletion(
          existingTask.completed || false,
          incomingTask.completed || false,
          false, // No history
          existingTimestamp,
          incomingTimestamp
        );
        
        if ((existingTask.completed || false) !== (incomingTask.completed || false)) {
          addSyncLog(
            `[Task Completion Simple] '${(incomingTask.name || 'Unknown').slice(0, 20)}': local=${existingTask.completed}, sync=${incomingTask.completed}, resolved=${resolvedCompleted}`,
            'verbose'
          );
        }
        
        mergedTask.completed = resolvedCompleted;
      }
      
      mergedTasks[existingTaskIndex] = mergedTask;
    } else {
      // New task from sync
      mergedTasks.push(incomingTask);
    }
  }
  
  return mergedTasks;
}

// Helper function to merge completion history
function mergeCompletionHistory(
  localHistory: Record<string, boolean>,
  syncHistory: Record<string, boolean>,
  addSyncLog: (message: string, level: string, details?: string) => void,
  taskName: string
): Record<string, boolean> {
  const mergedHistory: Record<string, boolean> = { ...localHistory };
  
  Object.entries(syncHistory).forEach(([date, value]) => {
    const hasLocalEntry = localHistory[date] !== undefined;
    const localValue = localHistory[date];
    
    if (!hasLocalEntry) {
      // No local entry, safe to add incoming
      mergedHistory[date] = value;
    } else if (value === false && localValue === true) {
      // Incoming is an untoggle (false), always respect this
      mergedHistory[date] = false;
      addSyncLog(`[History Merge] '${taskName.slice(0, 20)}': untoggle on ${date}`, 'verbose');
    } else if (value === true && localValue === false) {
      // Incoming is a completion (true), prefer this over false
      mergedHistory[date] = true;
      addSyncLog(`[History Merge] '${taskName.slice(0, 20)}': completion on ${date}`, 'verbose');
    }
    // Otherwise keep local value (same as incoming)
  });
  
  return mergedHistory;
}

// Helper function to resolve task completion conflicts
function resolveTaskCompletion(
  localCompleted: boolean,
  syncCompleted: boolean,
  historyCompleted: boolean,
  localTimestamp: number,
  syncTimestamp: number
): boolean {
  // If history says completed for today, trust that
  if (historyCompleted) return true;
  
  // If no conflict, return either (they're the same)
  if (localCompleted === syncCompleted) return localCompleted;
  
  // Prefer completion over non-completion, unless timestamps show clear intentional change
  if (localCompleted && !syncCompleted) {
    // Local is completed, sync is not - prefer completed unless sync is significantly newer
    const timeDiff = syncTimestamp - localTimestamp;
    if (timeDiff > 300000) { // 5 minutes
      return false; // Sync is much newer, trust the un-completion
    }
    return true; // Keep completed
  }
  
  if (!localCompleted && syncCompleted) {
    // Sync is completed, local is not - prefer completed unless local is significantly newer
    const timeDiff = localTimestamp - syncTimestamp;
    if (timeDiff > 300000) { // 5 minutes
      return false; // Local is much newer, trust the non-completion
    }
    return true; // Prefer completed
  }
  
  // Fallback to timestamp-based resolution
  return syncTimestamp >= localTimestamp ? syncCompleted : localCompleted;
}