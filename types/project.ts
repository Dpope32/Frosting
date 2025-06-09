import { Tag } from "./tag";
import { Task } from "./task";
import { Person } from "./people";
import { Note } from "./notes";

export type Project = {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    deadline?: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'past_deadline';
    priority: 'low' | 'medium' | 'high';
    tags: Tag[];
    isArchived: boolean;
    isDeleted: boolean;
    tasks: Task[];
    people: Person[];
    notes: Note[];
    isPinned: boolean;
}