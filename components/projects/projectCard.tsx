import React from 'react'
import { isWeb } from 'tamagui'
import { Project } from '@/types/project'
import { ProjectCardWebView } from './ProjectCard/ProjectCardWebView';
import { ProjectCardMobile } from './ProjectCardMobile'

interface ProjectCardProps {
  project: Project
  isDark: boolean
  primaryColor: string
  onOpenAddTaskModal?: (projectId: string) => void;
  onToggleTaskCompleted?: (taskId: string, completed: boolean) => void;
  onEdit?: (projectId: string) => void;
}

export const ProjectCard = ({ project, isDark, primaryColor, onOpenAddTaskModal, onToggleTaskCompleted, onEdit }: ProjectCardProps) => {
    return isWeb ? (
      <ProjectCardWebView
        project={project}
        isDark={isDark}
        primaryColor={primaryColor}
        onOpenAddTaskModal={onOpenAddTaskModal}
        onToggleTaskCompleted={onToggleTaskCompleted}
        onEdit={onEdit}
      />
    ) : (
      <ProjectCardMobile
        project={project}
        isDark={isDark}
        primaryColor={primaryColor}
        onOpenAddTaskModal={onOpenAddTaskModal}
        onToggleTaskCompleted={onToggleTaskCompleted}
        onEdit={onEdit}
      />
    )
}

export default ProjectCard;
