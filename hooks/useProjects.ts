import { useState, useCallback } from 'react';
import { useProjectStore } from '@/store';
import type { Project, Tag } from '@/types';

// Hook to manage project list and add/edit modal state
export function useProjects() {
  // Store actions only - no state subscriptions to prevent infinite loops

  const addProject = useProjectStore((state) => state.addProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  const deleteProject = useProjectStore((state) => state.deleteProject);

  // Local modal and edit state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editPriority, setEditPriority] = useState<Project['priority']>('medium');
  const [editTags, setEditTags] = useState<Tag[]>([]);

  // Open modal for new project
  const handleAddProject = useCallback(() => {
    setSelectedProject(null);
    setEditName('');
    setEditDescription('');
    setEditDeadline('');
    setEditPriority('medium');
    setEditTags([]);
    setIsModalOpen(true);
  }, []);

  // Open modal to edit existing project
  const handleSelectProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setEditName(project.name);
    setEditDescription(project.description);
    setEditDeadline(project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '');
    setEditPriority(project.priority);
    setEditTags(project.tags);
    setIsModalOpen(true);
  }, []);

  // Save new or update existing project
  const handleSaveProject = useCallback(() => {
    if (!editName.trim()) return;
    if (selectedProject) {
      updateProject(selectedProject.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        deadline: editDeadline ? new Date(editDeadline) : undefined,
        priority: editPriority,
        tags: editTags,
      });
    } else {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 9);
      const newProject: Project = {
        id,
        name: editName.trim(),
        description: editDescription.trim(),
        createdAt: new Date(),
        deadline: editDeadline ? new Date(editDeadline) : undefined,
        status: 'pending',
        priority: editPriority,
        tags: editTags,
        isArchived: false,
        isDeleted: false,
        isPinned: false,
        tasks: [],
        people: [],
        notes: [],

      };
      addProject(newProject);
    }
    setIsModalOpen(false);
    setSelectedProject(null);
  }, [selectedProject, editName, editDescription, editDeadline, editPriority, editTags, updateProject, addProject]);

  // Delete project
  const handleDeleteProject = useCallback(() => {
    if (selectedProject) {
      deleteProject(selectedProject.id);
      setIsModalOpen(false);
      setSelectedProject(null);
    }
  }, [selectedProject, deleteProject]);

  // Handle modal open/close changes
  const handleCloseModal = useCallback((open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedProject(null);
    }
  }, []);

  // Handle tag changes
  const handleTagsChange = useCallback((tags: Tag[]) => {
    setEditTags(tags);
  }, []);

  return {
    // Removed projects from return - ProjectsScreen gets them directly
    selectedProject,
    isModalOpen,
    editName,
    setEditName,
    editDescription,
    setEditDescription,
    editDeadline,
    setEditDeadline,
    editPriority,
    setEditPriority,
    editTags,
    setEditTags,
    handleAddProject,
    handleSelectProject,
    handleSaveProject,
    handleDeleteProject,
    handleCloseModal,
    handleTagsChange,
  };
}