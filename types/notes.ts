// types/notes.ts
import { Tag } from './tag';
  export type Attachment = {
    id: string
    name: string
    url: string
    type: string
    size?: number
  }
  
  
  export type Note = {
    id: string
    title: string
    content: string
    isPinned?: boolean
    isExpanded?: boolean
    color?: string
    tags?: Tag[]
    attachments?: Attachment[]
    orderIndex?: number
    archived?: boolean
    createdAt: string
    deletedAt?: string
    updatedAt: string
  }