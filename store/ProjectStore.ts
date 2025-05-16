import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';
import { Project } from '@/types';

interface ProjectStore {
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (id: string, updated: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjects: () => Project[];
  clearProjects: () => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      addProject: (project: Project) => set((state: ProjectStore) => ({ projects: [...state.projects, project] })),
      updateProject: (id: string, updated: Partial<Project>) => set((state: ProjectStore) => ({ projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updated } : p
      ) })),
      deleteProject: (id: string) => set((state: ProjectStore) => ({ projects: state.projects.filter((p) => p.id !== id) })),
      getProjectById: (id: string) => get().projects.find((p) => p.id === id),
      getProjects: () => get().projects,
      clearProjects: () => set({ projects: [] }),
    }),
    {
      name: 'projects',
      storage: createPersistStorage(),
    }
  )
);
    