import { TaskPriority } from "@/types"

export const getDaysUntilDeadline = (deadline?: Date | string): string => {
  if (!deadline) return '-'
  const date = typeof deadline === 'string' ? new Date(deadline) : deadline
  if (!(date instanceof Date) || isNaN(date.getTime())) return '-'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadlineDate = new Date(date)
  deadlineDate.setHours(0, 0, 0, 0)
  
  const diffTime = deadlineDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
  if (diffDays === 0) return 'Due today'
  return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`
}

export const getTaskBackgroundColor = (taskPriority: TaskPriority, isCompleted: boolean, isDark: boolean) => {
    if (isCompleted) {
      return isDark ? '#000' : '#777';
    }
    if (taskPriority === 'high') {
      return isDark ? 'rgba(255, 0, 0, 0.08)' : 'rgba(255, 0, 0, 0.05)';
    }
    if (taskPriority === 'medium') {
      return isDark ? 'rgba(255, 255, 0, 0.06)' : 'rgba(255, 255, 0, 0.06)';
    }
    if (taskPriority === 'low') {
      return isDark ? 'rgba(0, 255, 0, 0.04)' : 'rgba(0, 255, 0, 0.05)';
    }
    
    return isDark ? '#151515' : '#999';
  };
