import React from 'react'
import { isWeb } from 'tamagui'
import { Project } from '@/types'
import { ProjectCardWebView } from './ProjectCard/ProjectCardWebView';
import { ProjectCardMobile } from './ProjectCardMobile'

interface ProjectCardProps {
  project: Project
  isDark: boolean
  primaryColor: string
  onOpenAddTaskModal?: (projectId: string) => void;
  onToggleTaskCompleted?: (taskId: string, completed: boolean) => void;
  onEdit?: (projectId: string) => void;
  onArchive?: (projectId: string) => void;
  onImagePress?: (url: string) => void;
  hideCompletedOverlay?: boolean;
}

export const ProjectCard = ({ 
  project, 
  isDark, 
  primaryColor, 
  onOpenAddTaskModal, 
  onToggleTaskCompleted, 
  onEdit, 
  onArchive, 
  onImagePress,
  hideCompletedOverlay
}: ProjectCardProps) => {
  
  // Wrap the onImagePress callback to add logging
  const handleImagePress = (url: string) => {
    if (onImagePress) {
      onImagePress(url);
    } else {
    }
  };
  return isWeb ? (
    <ProjectCardWebView 
      project={project}
      isDark={isDark}
      primaryColor={primaryColor}
      onOpenAddTaskModal={onOpenAddTaskModal}
      onToggleTaskCompleted={onToggleTaskCompleted}
      onEdit={onEdit}
      onArchive={onArchive}
      onImagePress={handleImagePress}
      hideCompletedOverlay={hideCompletedOverlay}
    />
  ) : (
    <ProjectCardMobile
      project={project}
      isDark={isDark}
      onOpenAddTaskModal={onOpenAddTaskModal}
      onToggleTaskCompleted={onToggleTaskCompleted}
      onEdit={onEdit}
      onArchive={onArchive}
      onImagePress={handleImagePress}
      hideCompletedOverlay={hideCompletedOverlay}
    />
  )
}

export default ProjectCard;
